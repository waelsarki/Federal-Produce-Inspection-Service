/**
 * The approval engine.
 *
 * PROTOTYPE ONLY. Decisions are appended to the application record in browser
 * storage and nothing is enforced server-side, so any of it can be edited with
 * devtools. The trail is append-only in the UI but is not tamper-evident.
 *
 * Rules, in one place:
 *  - Applications walk the configured levels in order. A level marked
 *    `required` must reach its quota before the next opens; a level that is not
 *    required is optional and never blocks completion.
 *  - One account holds at most one decision per level, so a quota above 1 needs
 *    genuinely different people. That is the segregation of duties the Service
 *    would want.
 *  - Super Admin is deliberately exempt: it may decide any level regardless of
 *    the role bound to it, and a single Super Admin approval satisfies the level
 *    outright. That is what lets one person carry an application end to end. It
 *    is an administrative shortcut with no segregation of duties, which is
 *    exactly why a real deployment must move this to a server and record who
 *    acted.
 */

import type { ApprovalDecision, ExportApplication } from "@/lib/portal";
import { ApprovalLevel, StaffAccount, SUPERADMIN_ROLE_ID, can } from "@/lib/staff";

export type ApprovalStage = "awaiting" | "approved" | "rejected";

export type LevelProgress = {
  level: ApprovalLevel;
  approvals: ApprovalDecision[];
  rejections: ApprovalDecision[];
  /** Approvals still needed; 0 once satisfied. */
  remaining: number;
  satisfied: boolean;
  /** The level currently open for a decision. */
  isCurrent: boolean;
  /** Optional levels nobody decided are skipped, not blocked. */
  optional: boolean;
};

export type ApprovalState = {
  stage: ApprovalStage;
  levels: LevelProgress[];
  current: ApprovalLevel | null;
  rejections: ApprovalDecision[];
  /** True when the stage came from the legacy free-text status, not decisions. */
  legacy: boolean;
};

export const MAX_NOTE_LENGTH = 500;

function decisionsOf(application: ExportApplication): ApprovalDecision[] {
  return application.approvals ?? [];
}

export function isSuperAdmin(account: StaffAccount | null): boolean {
  return account?.roleId === SUPERADMIN_ROLE_ID;
}

/** Quota actually required at a level; a Super Admin approval needs no colleagues. */
export function effectiveQuota(level: ApprovalLevel, approvals: ApprovalDecision[]): number {
  if (approvals.some((entry) => entry.staffRoleId === SUPERADMIN_ROLE_ID)) return 0;
  return Math.max(1, level.requiredApprovals);
}

/**
 * Where the application stands. Records created before the engine existed have
 * no decisions, so their free-text status is honoured instead - otherwise an
 * already-issued certificate would still be offering approval buttons.
 */
export function deriveApprovalState(application: ExportApplication, levels: ApprovalLevel[]): ApprovalState {
  const decisions = decisionsOf(application);
  const rejections = decisions.filter((entry) => entry.decision === "rejected");

  if (decisions.length === 0) {
    const status = (application.status ?? "").trim();
    if (/issued|approved/i.test(status)) {
      return { stage: "approved", levels: [], current: null, rejections: [], legacy: true };
    }
    if (/reject/i.test(status)) {
      return { stage: "rejected", levels: [], current: null, rejections: [], legacy: true };
    }
  }

  let current: ApprovalLevel | null = null;
  const progress: LevelProgress[] = levels.map((level) => {
    const atLevel = decisions.filter((entry) => entry.levelId === level.id);
    const approvals = atLevel.filter((entry) => entry.decision === "approved");
    const levelRejections = atLevel.filter((entry) => entry.decision === "rejected");
    const quota = effectiveQuota(level, approvals);
    const satisfied = quota === 0 || approvals.length >= quota;
    // Optional levels never hold the application open.
    const isCurrent = !satisfied && level.required && !current && rejections.length === 0;
    if (isCurrent) current = level;
    return {
      level,
      approvals,
      rejections: levelRejections,
      remaining: satisfied ? 0 : Math.max(0, quota - approvals.length),
      satisfied,
      isCurrent,
      optional: !level.required,
    };
  });

  if (rejections.length > 0) return { stage: "rejected", levels: progress, current: null, rejections, legacy: false };
  if (current) return { stage: "awaiting", levels: progress, current, rejections: [], legacy: false };
  return { stage: "approved", levels: progress, current: null, rejections: [], legacy: false };
}

/** Why the account cannot act, or "" when it can decide the open level. */
export function decideBlocker(application: ExportApplication, account: StaffAccount | null, levels: ApprovalLevel[]): string {
  if (!account) return "Sign in to decide.";
  if (!can(account, "applications.decide")) return "Your role cannot decide approvals.";
  const state = deriveApprovalState(application, levels);
  if (state.stage !== "awaiting") {
    return state.stage === "rejected" ? "This application was rejected." : "This application has cleared every level.";
  }
  const level = state.current;
  if (!level) return "There is no open approval level.";
  if (decisionsOf(application).some((entry) => entry.levelId === level.id && entry.staffId === account.id)) {
    return "You have already decided this level.";
  }
  if (!isSuperAdmin(account) && level.roleId !== account.roleId) return "This level is signed off by another role.";
  return "";
}

export function canDecide(application: ExportApplication, account: StaffAccount | null, levels: ApprovalLevel[]): boolean {
  return decideBlocker(application, account, levels) === "";
}

/**
 * Appends a decision and moves the free-text status to match. Pure: returns a
 * new record. The authorisation check lives here and not only in the UI, so no
 * caller can write a decision the engine would refuse to recognise.
 */
export function recordDecision(
  application: ExportApplication,
  account: StaffAccount,
  levels: ApprovalLevel[],
  decision: ApprovalDecision["decision"],
  note = "",
): ExportApplication {
  const blocker = decideBlocker(application, account, levels);
  if (blocker) throw new Error(blocker);

  const state = deriveApprovalState(application, levels);
  const level = state.current;
  if (!level) throw new Error("No approval level is open for this application.");

  const entry: ApprovalDecision = {
    id: `dec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    levelId: level.id,
    levelLabel: level.label,
    levelOrder: level.order,
    decision,
    staffId: account.id,
    staffName: account.fullName,
    staffRoleId: account.roleId,
    decidedAt: new Date().toISOString(),
    note: note.trim().slice(0, MAX_NOTE_LENGTH),
  };

  const next: ExportApplication = { ...application, approvals: [...decisionsOf(application), entry] };
  const stage = deriveApprovalState(next, levels).stage;
  next.status = stage === "approved" ? "Approved" : decision === "rejected" ? "Rejected" : "Pending review";
  return next;
}

/** One-line summary for the queue, e.g. "Level 2 of 3 - 1 of 2 approvals". */
export function describeProgress(state: ApprovalState): string {
  if (state.legacy) return state.stage === "approved" ? "Approved before the approval engine" : "Rejected";
  if (state.stage === "rejected") return `Rejected at ${state.rejections[0].levelLabel}`;
  if (state.stage === "approved") return "All levels cleared";
  const level = state.current;
  if (!level) return "No open level";
  const step = state.levels.find((entry) => entry.level.id === level.id);
  const quota = Math.max(1, level.requiredApprovals);
  return `Level ${level.order} of ${state.levels.length} - ${step?.approvals.length ?? 0} of ${quota} approvals`;
}
