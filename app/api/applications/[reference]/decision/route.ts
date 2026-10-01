/**
 * POST /api/applications/[reference]/decision - record an approval decision.
 *
 * This is the route that makes the approval trail real. The rules come from
 * lib/approvals.ts, which stays the single description of the workflow:
 * `deriveApprovalState` is pure, so it runs unchanged here over levels loaded
 * from the database.
 *
 * The authorisation check is deliberately NOT reused from lib/approvals.ts,
 * because `decideBlocker` asks lib/staff.ts's `can()`, and that reads roles out
 * of browser storage. On the server the answer has to come from the signed-in
 * user's role in the database, so the check is restated below against
 * lib/server/auth.ts. Same rules, real source of truth.
 *
 * The decision row is inserted and never updated, and a unique constraint
 * stops one account recording two decisions at the same level.
 */

import { prisma } from "@/lib/server/db";
import { can, isSuperAdmin, recordEvent, HttpError, type SessionUser } from "@/lib/server/auth";
import { toExportApplication, toApprovalLevel, APPLICATION_INCLUDE } from "@/lib/server/serialise";
import { route, ok, fail, guard, readJson, newId } from "@/lib/server/http";
import { deriveApprovalState, MAX_NOTE_LENGTH } from "@/lib/approvals";
import { SUPERADMIN_ROLE_ID } from "@/lib/staff";
import type { ExportApplication } from "@/lib/portal";

type Params = { params: Promise<{ reference: string }> };
type Body = { decision?: "approved" | "rejected"; note?: string };

export const POST = route(async (request: Request, { params }: Params) => {
  const user = await guard("applications.decide");
  const { reference } = await params;
  const applicationNumber = decodeURIComponent(reference);
  const body = await readJson<Body>(request);

  if (body?.decision !== "approved" && body?.decision !== "rejected") {
    return fail(400, "Choose approve or reject.");
  }

  const [row, levelRows] = await Promise.all([
    prisma.exportApplication.findUnique({
      where: { applicationNumber },
      include: APPLICATION_INCLUDE,
    }),
    prisma.approvalLevel.findMany({ orderBy: { order: "asc" } }),
  ]);
  if (!row) return fail(404, "No application matches that reference.");

  const levels = levelRows.map(toApprovalLevel);
  const application = toExportApplication(row);

  // --- the same blocker rules as lib/approvals.ts, checked on the server ---
  if (!can(user, "applications.decide")) throw new HttpError(403, "Your role cannot decide approvals.");

  const state = deriveApprovalState(application, levels);
  if (state.stage !== "awaiting") {
    throw new HttpError(409, state.stage === "rejected"
      ? "This application was rejected."
      : "This application has cleared every level.");
  }
  const level = state.current;
  if (!level) throw new HttpError(409, "There is no open approval level.");
  if ((application.approvals ?? []).some((entry) => entry.levelId === level.id && entry.staffId === user.id)) {
    throw new HttpError(409, "You have already decided this level.");
  }
  if (!isSuperAdmin(user) && level.roleId !== user.roleId) {
    throw new HttpError(403, "This level is signed off by another role.");
  }

  // --- append the decision ---
  const note = (body.note ?? "").trim().slice(0, MAX_NOTE_LENGTH);
  try {
    await prisma.approvalDecision.create({
      data: {
        id: newId("dec"),
        applicationNumber,
        levelId: level.id,
        levelLabel: level.label,
        levelOrder: level.order,
        decision: body.decision,
        staffId: user.id,
        staffName: user.fullName,
        staffRoleId: user.roleId,
        decidedAt: new Date().toISOString(),
        note,
      },
    });
  } catch (error) {
    // The unique constraint is the real guarantee that an account cannot decide
    // the same level twice, even if two requests arrive at once.
    if (typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002") {
      throw new HttpError(409, "You have already decided this level.");
    }
    throw error;
  }

  // The free-text status is moved to match the decision, so the queue keeps
  // working for any code still reading `status`.
  const updated: ExportApplication = {
    ...application,
    approvals: [...(application.approvals ?? []), {
      id: "pending",
      levelId: level.id,
      levelLabel: level.label,
      levelOrder: level.order,
      decision: body.decision,
      staffId: user.id,
      staffName: user.fullName,
      staffRoleId: user.roleId,
      decidedAt: new Date().toISOString(),
      note,
    }],
  };
  const stage = deriveApprovalState(updated, levels).stage;
  const status = stage === "approved" ? "Approved" : body.decision === "rejected" ? "Rejected" : "Pending review";
  await prisma.exportApplication.update({ where: { applicationNumber }, data: { status } });

  await recordEvent({
    actor: user,
    action: body.decision === "approved" ? "application.approve" : "application.reject",
    entity: "application",
    entityId: applicationNumber,
    detail: `${level.label}${note ? ` - ${note}` : ""}`,
  });

  const finalRow = await prisma.exportApplication.findUniqueOrThrow({
    where: { applicationNumber },
    include: APPLICATION_INCLUDE,
  });
  return ok(toExportApplication(finalRow));
});
