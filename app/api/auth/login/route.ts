/**
 * POST /api/auth/login - verifies credentials and opens a server session.
 *
 * The password is checked against a bcrypt hash here, on the server. The
 * response carries the account and its permissions so the console can render,
 * but no password hash and no session token: the cookie is httpOnly, so
 * JavaScript cannot read it.
 */

import { prisma } from "@/lib/server/db";
import { createSession, verifyPassword, recordEvent } from "@/lib/server/auth";
import { toStaffRole, toStaffAccount } from "@/lib/server/serialise";
import { route, ok, fail, readJson } from "@/lib/server/http";

type Body = { email?: string; password?: string };

export const POST = route(async (request: Request) => {
  const body = await readJson<Body>(request);
  if (!body) return fail(400, "Send a JSON body with an email and password.");

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) return fail(400, "Enter your email address and password.");

  const account = await prisma.staffAccount.findUnique({
    where: { email },
    include: { role: true },
  });

  // Same message and the same work for an unknown email and a wrong password,
  // so the response cannot be used to discover which accounts exist.
  const invalid = fail(401, "That email address and password do not match.");
  if (!account || !account.active) {
    // Still spend the time a real comparison would, to avoid a timing tell.
    await verifyPassword(password, "$2a$12$0000000000000000000000000000000000000000000000000000");
    return invalid;
  }

  if (!(await verifyPassword(password, account.passwordHash))) {
    await recordEvent({
      actor: { kind: "system", name: email },
      action: "login.failed",
      entity: "staff",
      entityId: account.id,
      detail: "Incorrect password",
    });
    return invalid;
  }

  await createSession(account.id);
  await recordEvent({
    actor: { kind: "staff", id: account.id, name: account.fullName },
    action: "login",
    entity: "staff",
    entityId: account.id,
  });

  return ok({
    account: toStaffAccount({ ...account, role: account.role }),
    permissions: toStaffRole(account.role).permissions,
  });
});
