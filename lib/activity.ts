/**
 * Recent activity for the staff console.
 *
 * PROTOTYPE ONLY. There is no audit trail in this project: nothing records who
 * did what and when. These entries are therefore derived from the application
 * records themselves, and the time shown is the application's submission date -
 * the only timestamp the data actually carries. It is deliberately not dressed
 * up as a real event log; when actions are performed server-side, replace this
 * with genuine recorded events.
 *
 * Status is free text on the record, so classification matches the same
 * loose patterns the console's own counts use.
 */

import type { ExportApplication } from "@/lib/portal";

export type ActivityKind = "issued" | "approved" | "awaiting" | "rejected";

export type ActivityEntry = {
  applicationNumber: string;
  kind: ActivityKind;
  /** Short headline, e.g. "Certificate issued". */
  title: string;
  /** Supporting line: commodity and destination. */
  detail: string;
  /** The record's status, verbatim, so nothing is hidden from staff. */
  status: string;
  /** Epoch milliseconds of the submission, used for ordering. */
  at: number;
  /** Human-readable age, e.g. "3 hr ago". */
  ago: string;
  href: string;
};

const ACTIVITY_COPY: Record<ActivityKind, string> = {
  issued: "Certificate issued",
  approved: "Application approved",
  awaiting: "Awaiting approval",
  rejected: "Application rejected",
};

export function activityKindFor(status: string): ActivityKind {
  const value = status.trim();
  if (/issued/i.test(value)) return "issued";
  if (/approved/i.test(value)) return "approved";
  if (/reject/i.test(value)) return "rejected";
  return "awaiting";
}

function parseTime(value: string): number {
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Compact age for the feed. Falls back to a date once it stops being useful. */
export function formatActivityAge(timestamp: number, now: number): string {
  if (!timestamp) return "date unknown";
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days <= 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(timestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function describe(application: ExportApplication): string {
  const commodity = (application.commodity || application.goodsDescription || "").trim();
  const destination = (application.destination || "").trim();
  if (commodity && destination) return `${commodity} · ${destination}`;
  return commodity || destination || "No commodity recorded";
}

/** Newest first. Records with an unreadable date sort last rather than first. */
export function buildActivityFeed(applications: ExportApplication[], now: number, limit = 6): ActivityEntry[] {
  return applications
    .map((application) => {
      const kind = activityKindFor(application.status ?? "");
      const at = parseTime(application.submittedAt ?? "");
      return {
        applicationNumber: application.applicationNumber,
        kind,
        title: ACTIVITY_COPY[kind],
        detail: describe(application),
        status: (application.status ?? "").trim() || "Pending review",
        at,
        ago: formatActivityAge(at, now),
        href: `/certificate/${application.applicationNumber}`,
      };
    })
    .sort((a, b) => b.at - a.at)
    .slice(0, limit);
}
