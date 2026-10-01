/**
 * GET  /api/roles - roles and their permissions. Requires roles.manage.
 * POST /api/roles - creates a role. Requires roles.manage.
 *
 * Permissions are validated against STAFF_PERMISSIONS on the server. The old
 * console stored whatever the browser sent, so a tampered request could grant
 * a permission that does not exist, or leave a role holding nothing.
 */

import { prisma } from "@/lib/server/db";
import { encodePermissions, recordEvent } from "@/lib/server/auth";
import { toStaffRole } from "@/lib/server/serialise";
import { route, ok, fail, guard, readJson } from "@/lib/server/http";
import { STAFF_PERMISSIONS, type StaffPermission } from "@/lib/staff";

export const dynamic = "force-dynamic";

const VALID = new Set<string>(STAFF_PERMISSIONS.map((permission) => permission.id));

function cleanPermissions(input: unknown): StaffPermission[] | null {
  if (!Array.isArray(input)) return null;
  const kept = input.filter((id): id is StaffPermission => typeof id === "string" && VALID.has(id));
  return [...new Set(kept)];
}

export const GET = route(async () => {
  await guard("roles.manage");
  const rows = await prisma.staffRole.findMany({ orderBy: { label: "asc" } });
  return ok(rows.map(toStaffRole));
});

type Body = { label?: string; description?: string; permissions?: string[] };

export const POST = route(async (request: Request) => {
  const user = await guard("roles.manage");
  const body = await readJson<Body>(request);
  if (!body) return fail(400, "Send a JSON body with the role details.");

  const label = (body.label ?? "").trim();
  if (!label) return fail(400, "Give the role a name.");
  const permissions = cleanPermissions(body.permissions);
  if (!permissions) return fail(400, "Send the role's permissions as a list.");

  // Same slug rule as lib/staff.ts, so ids stay comparable with the old data.
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "role";
  const existing = await prisma.staffRole.findMany({ select: { id: true } });
  const id = existing.some((role) => role.id === base) ? `${base}-${existing.length + 1}` : base;

  const row = await prisma.staffRole.create({
    data: {
      id,
      label,
      description: (body.description ?? "").trim(),
      permissions: encodePermissions(permissions),
      system: 0,
    },
  });

  await recordEvent({
    actor: user,
    action: "role.create",
    entity: "role",
    entityId: row.id,
    detail: `${label} (${permissions.length} permission(s))`,
  });

  return ok(toStaffRole(row), 201);
});
