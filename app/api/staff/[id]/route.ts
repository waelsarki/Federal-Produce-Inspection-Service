/**
 * PATCH  /api/staff/[id] - rename, reassign role, or set active/inactive.
 * DELETE /api/staff/[id] - removes an account.
 *
 * Two things the browser version could not do:
 *  - An inactive account is refused at sign-in and at every permission check,
 *    because `active` lives on the server row rather than in storage.
 *  - Deleting an account invalidates its sessions immediately, via the cascade
 *    on Session.staffId. The old session id in sessionStorage just kept working.
 *
 * The super admin account is protected: it cannot be deleted, demoted or
 * deactivated, so a console cannot lock every administrator out of the system.
 */

import { prisma } from "@/lib/server/db";
import { recordEvent } from "@/lib/server/auth";
import { toStaffAccount } from "@/lib/server/serialise";
import { route, ok, fail, guard, readJson } from "@/lib/server/http";
import { SUPERADMIN_ROLE_ID } from "@/lib/staff";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };
type Body = { fullName?: string; email?: string; roleId?: string; active?: boolean };

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export const PATCH = route(async (request: Request, { params }: Params) => {
  const user = await guard("roles.manage");
  const { id } = await params;
  const body = await readJson<Body>(request);
  if (!body) return fail(400, "Send a JSON body with the changes.");

  const account = await prisma.staffAccount.findUnique({ where: { id } });
  if (!account) return fail(404, "That staff account no longer exists.");

  const isSuperAdminAccount = account.roleId === SUPERADMIN_ROLE_ID;
  if (isSuperAdminAccount && ((body.roleId && body.roleId !== SUPERADMIN_ROLE_ID) || body.active === false)) {
    return fail(403, "The super admin account cannot be demoted or deactivated.");
  }

  const data: Record<string, unknown> = {};
  if (typeof body.fullName === "string") {
    const fullName = body.fullName.trim();
    if (!fullName) return fail(400, "Name cannot be blank.");
    data.fullName = fullName;
  }
  if (typeof body.email === "string") {
    const email = body.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) return fail(400, "Enter a valid email address.");
    const clash = await prisma.staffAccount.findUnique({ where: { email } });
    if (clash && clash.id !== id) return fail(409, "That email is already assigned to another staff account.");
    data.email = email;
  }
  if (typeof body.roleId === "string") {
    const role = await prisma.staffRole.findUnique({ where: { id: body.roleId } });
    if (!role) return fail(400, "That role no longer exists.");
    data.roleId = body.roleId;
  }
  if (typeof body.active === "boolean") data.active = body.active ? 1 : 0;

  const row = await prisma.staffAccount.update({
    where: { id },
    data,
    include: { role: true },
  });

  // Deactivating someone ends their sessions now, not when the cookie expires.
  if (data.active === 0) {
    await prisma.session.deleteMany({ where: { staffId: id } });
  }

  await recordEvent({
    actor: user,
    action: "staff.update",
    entity: "staff",
    entityId: id,
    detail: Object.keys(data).join(", ") || "no changes",
  });

  return ok(toStaffAccount(row));
});

export const DELETE = route(async (_request: Request, { params }: Params) => {
  const user = await guard("roles.manage");
  const { id } = await params;

  const account = await prisma.staffAccount.findUnique({ where: { id } });
  if (!account) return fail(404, "That staff account no longer exists.");
  if (account.roleId === SUPERADMIN_ROLE_ID) return fail(403, "The super admin account cannot be removed.");
  if (id === user.id) return fail(403, "You cannot remove your own account.");

  await prisma.staffAccount.delete({ where: { id } });

  await recordEvent({
    actor: user,
    action: "staff.delete",
    entity: "staff",
    entityId: id,
    detail: `${account.fullName} <${account.email}>`,
  });

  return ok({ deleted: true });
});
