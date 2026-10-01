/**
 * PATCH  /api/roles/[id] - rename, re-describe, or change permissions.
 * DELETE /api/roles/[id] - removes a role.
 *
 * The delete checks are the browser's checks, but now they are real: a role
 * still assigned to an account or still used by an approval level cannot be
 * removed, because the foreign key would otherwise be violated. System roles
 * are refused outright, which protects the super admin.
 */

import { prisma } from "@/lib/server/db";
import { encodePermissions, recordEvent } from "@/lib/server/auth";
import { toStaffRole } from "@/lib/server/serialise";
import { route, ok, fail, guard, readJson } from "@/lib/server/http";
import { STAFF_PERMISSIONS, type StaffPermission } from "@/lib/staff";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };
type Body = { label?: string; description?: string; permissions?: string[] };

const VALID = new Set<string>(STAFF_PERMISSIONS.map((permission) => permission.id));

export const PATCH = route(async (request: Request, { params }: Params) => {
  const user = await guard("roles.manage");
  const { id } = await params;
  const body = await readJson<Body>(request);
  if (!body) return fail(400, "Send a JSON body with the changes.");

  const role = await prisma.staffRole.findUnique({ where: { id } });
  if (!role) return fail(404, "That role no longer exists.");

  const data: Record<string, unknown> = {};
  if (typeof body.label === "string") {
    const label = body.label.trim();
    if (!label) return fail(400, "Give the role a name.");
    data.label = label;
  }
  if (typeof body.description === "string") data.description = body.description.trim();
  if (body.permissions !== undefined) {
    if (!Array.isArray(body.permissions)) return fail(400, "Send the permissions as a list.");
    const kept = body.permissions.filter(
      (entry): entry is StaffPermission => typeof entry === "string" && VALID.has(entry),
    );
    data.permissions = encodePermissions([...new Set(kept)]);
  }

  const row = await prisma.staffRole.update({ where: { id }, data });
  await recordEvent({
    actor: user,
    action: "role.update",
    entity: "role",
    entityId: id,
    detail: Object.keys(data).join(", ") || "no changes",
  });
  return ok(toStaffRole(row));
});

export const DELETE = route(async (_request: Request, { params }: Params) => {
  const user = await guard("roles.manage");
  const { id } = await params;

  const role = await prisma.staffRole.findUnique({ where: { id } });
  if (!role) return fail(404, "That role no longer exists.");
  if (role.system === 1) return fail(403, `${role.label} is a system role and cannot be deleted.`);

  const accounts = await prisma.staffAccount.count({ where: { roleId: id } });
  if (accounts > 0) return fail(409, `${role.label} is still assigned to a staff account.`);

  const levels = await prisma.approvalLevel.count({ where: { roleId: id } });
  if (levels > 0) return fail(409, `${role.label} is still used by an approval level.`);

  await prisma.staffRole.delete({ where: { id } });
  await recordEvent({ actor: user, action: "role.delete", entity: "role", entityId: id, detail: role.label });
  return ok({ deleted: true });
});
