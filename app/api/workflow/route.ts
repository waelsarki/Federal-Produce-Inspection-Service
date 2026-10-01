/**
 * GET  /api/workflow - the approval levels, in order. Requires applications.view,
 *      because the queue shows the progress of each application through them.
 * PUT  /api/workflow - replaces the whole list. Requires workflow.manage.
 *
 * PUT renumbers `order` to match the array, exactly as saveWorkflow does in
 * lib/staff.ts, so the numbering the UI shows always matches reality.
 *
 * Changing the workflow does not rewrite history: existing decisions keep the
 * level label and order snapshotted on the row, so a past trail still reads
 * correctly after a level is renamed or removed.
 */

import { prisma } from "@/lib/server/db";
import { recordEvent } from "@/lib/server/auth";
import { toApprovalLevel } from "@/lib/server/serialise";
import { route, ok, fail, guard, readJson } from "@/lib/server/http";
import type { ApprovalLevel } from "@/lib/staff";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  await guard("applications.view");
  const rows = await prisma.approvalLevel.findMany({ orderBy: { order: "asc" } });
  return ok(rows.map(toApprovalLevel));
});

type Body = { levels?: ApprovalLevel[] };

export const PUT = route(async (request: Request) => {
  const user = await guard("workflow.manage");
  const body = await readJson<Body>(request);
  if (!body || !Array.isArray(body.levels)) return fail(400, "Send the full list of approval levels.");

  if (body.levels.length === 0) return fail(400, "The workflow must keep at least one level.");

  // Every level must name a role that exists, or approvals could be routed to
  // nobody and stall.
  const roles = await prisma.staffRole.findMany({ select: { id: true } });
  const knownRoles = new Set(roles.map((role) => role.id));
  for (const level of body.levels) {
    if (!level.id || !level.label) return fail(400, "Every level needs an id and a label.");
    if (!knownRoles.has(level.roleId)) {
      return fail(400, `The level "${level.label}" names a role that does not exist.`);
    }
  }

  // Replace the set inside a transaction: a half-applied workflow would be
  // worse than a rejected one.
  await prisma.$transaction(async (tx) => {
    await tx.approvalLevel.deleteMany({});
    for (const [index, level] of body.levels!.entries()) {
      await tx.approvalLevel.create({
        data: {
          id: level.id,
          label: level.label,
          roleId: level.roleId,
          order: index + 1,
          requiredApprovals: Math.max(1, Math.trunc(level.requiredApprovals ?? 1)),
          slaDays: Math.max(0, Math.trunc(level.slaDays ?? 0)),
          required: level.required ? 1 : 0,
        },
      });
    }
  });

  await recordEvent({
    actor: user,
    action: "workflow.update",
    entity: "workflow",
    entityId: "default",
    detail: `${body.levels.length} level(s)`,
  });

  const rows = await prisma.approvalLevel.findMany({ orderBy: { order: "asc" } });
  return ok(rows.map(toApprovalLevel));
});
