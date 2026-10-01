/**
 * Server-side authentication and authorisation.
 *
 * This replaces the browser-storage approach in lib/staff.ts. Three things
 * change, and all three matter:
 *
 *  - Passwords are hashed with bcrypt (salted, deliberately slow) instead of the
 *    unsalted SHA-256 in lib/portal.ts, which is GPU-crackable and gives equal
 *    passwords equal hashes.
 *  - A session is a row here plus an httpOnly cookie holding an opaque id. The
 *    old session was the account id in sessionStorage, which anyone with
 *    devtools could type in to become any account, including super admin.
 *  - Permission checks run here, on the server, for every request. Checks in
 *    the browser are decoration: they hide buttons, they do not deny access.
 *
 * Nothing in this file may be imported by a client component.
 */

import "server-only";
import { cookies, headers } from "next/headers";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/server/db";
import type { StaffPermission } from "@/lib/staff";
import type { StaffRole } from "@/lib/staff";
import { SUPERADMIN_ROLE_ID } from "@/lib/staff";

export const SESSION_COOKIE = "fpis_staff_session";
const SESSION_HOURS = 8;
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

/** The signed-in staff member, with their role already loaded. */
export type SessionUser = {
  /** Discriminant, so this is a member of the Actor union below. */
  kind: "staff";
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  role: StaffRole;
};

/* ------------------------------ passwords ------------------------------- */

const BCRYPT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/* ------------------------------- sessions ------------------------------- */

function newSessionId(): string {
  return randomBytes(32).toString("hex");
}

/** Cookies are signed with a secret so a guessed id cannot be replayed. */
function sessionSecret(): string {
  return process.env.SESSION_SECRET ?? "fpis-development-secret-change-me";
}

function signSessionId(id: string): string {
  return createHash("sha256").update(`${id}:${sessionSecret()}`).digest("hex").slice(0, 32);
}

function cookieValue(id: string): string {
  return `${id}.${signSessionId(id)}`;
}

/** Accepts the id only if the signature matches and the session has not expired. */
function parseCookie(value: string | undefined): string | null {
  if (!value) return null;
  const [id, signature] = value.split(".");
  if (!id || !signature || signSessionId(id) !== signature) return null;
  return id;
}

export async function createSession(staffId: string): Promise<void> {
  const id = newSessionId();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_HOURS * 60 * 60 * 1000);
  await prisma.session.create({
    // A browser can hold only one staff session at a time.
    data: { id, staffId, createdAt: now.toISOString(), expiresAt: expires.toISOString() },
  });
  // Drop anything this account left behind, so a sign-in elsewhere cannot
  // leave a usable cookie behind on a shared machine.
  await prisma.session.deleteMany({ where: { staffId, id: { not: id } } });
  (await cookies()).set(SESSION_COOKIE, cookieValue(id), {
    ...SESSION_COOKIE_OPTIONS,
    expires,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const id = parseCookie(jar.get(SESSION_COOKIE)?.value);
  if (id) await prisma.session.deleteMany({ where: { id } });
  jar.set(SESSION_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
}

/** The current user, or null. Resolves the cookie to a live session row. */
export async function currentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const id = parseCookie(jar.get(SESSION_COOKIE)?.value);
  if (!id) return null;

  const session = await prisma.session.findUnique({
    where: { id },
    include: { staff: { include: { role: true } } },
  });
  if (!session) return null;

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id } }).catch(() => undefined);
    return null;
  }
  if (!session.staff.active) return null;

  const role = session.staff.role;
  return {
    kind: "staff",
    id: session.staff.id,
    email: session.staff.email,
    fullName: session.staff.fullName,
    roleId: session.staff.roleId,
    role: {
      id: role.id,
      label: role.label,
      description: role.description,
      permissions: parsePermissions(role.permissions),
      system: role.system === 1,
    },
  };
}

/* ---------------------------- permissions ------------------------------- */

/** SQLite has no arrays, so permissions live as a JSON string. */
export function parsePermissions(raw: string): StaffPermission[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StaffPermission[]) : [];
  } catch {
    return [];
  }
}

export function encodePermissions(permissions: StaffPermission[]): string {
  return JSON.stringify(permissions);
}

/**
 * The server's own permission check, mirroring the browser's `can()` in
 * lib/staff.ts. Every route calls this. A client-side check is not a second
 * opinion - it is not a check at all.
 */
export function can(user: SessionUser | null, permission: StaffPermission): boolean {
  return user?.role.permissions.includes(permission) ?? false;
}

export function isSuperAdmin(user: SessionUser | null): boolean {
  return user?.roleId === SUPERADMIN_ROLE_ID;
}

export async function requireUser(): Promise<SessionUser | null> {
  return currentUser();
}

/** Throws unless the user is signed in and holds the permission. */
export async function requirePermission(permission: StaffPermission): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new HttpError(401, "Sign in to continue.");
  if (!can(user, permission)) throw new HttpError(403, "Your role does not allow that action.");
  return user;
}

/* -------------------------------- errors -------------------------------- */

/** Carries an HTTP status so routes can fail without inventing their own codes. */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}

/* ------------------------------- auditing ------------------------------- */

export async function clientIp(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    ""
  );
}

/**
 * Who did something.
 *
 * A staff actor is a SessionUser straight from the signed-in cookie, or the
 * lighter shape used where only an id and name are to hand. An applicant or the
 * server itself has no staff account behind the event.
 */
export type Actor =
  | SessionUser
  | { kind: "staff"; id: string; name: string }
  | { kind: "applicant" | "system"; id?: string; name: string };

/**
 * Appends a row to the event log. This is the real audit trail the old activity
 * feed could only approximate: it records the actor, the action and the moment,
 * and nothing else ever writes to it.
 */
export async function recordEvent(input: {
  actor: Actor;
  action: string;
  entity?: string;
  entityId?: string;
  detail?: string;
}): Promise<void> {
  const actor = input.actor;
  const actorType = actor.kind ?? "staff";
  const actorId = "id" in actor ? actor.id : undefined;
  const actorName = "fullName" in actor ? actor.fullName : actor.name;

  await prisma.auditEvent.create({
    data: {
      id: newSessionId(),
      actorType,
      actorId: actorId ?? null,
      actorName,
      action: input.action,
      entity: input.entity ?? null,
      entityId: input.entityId ?? null,
      detail: input.detail ?? "",
      at: new Date().toISOString(),
      ip: await clientIp(),
    },
  });
}



