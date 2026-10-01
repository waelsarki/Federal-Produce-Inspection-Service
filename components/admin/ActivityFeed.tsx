"use client";

import Link from "next/link";
import { ActivityEntry, buildActivityFeed } from "@/lib/activity";
import type { ExportApplication } from "@/lib/portal";

const KIND_GLYPH: Record<ActivityEntry["kind"], string> = {
  issued: "✓",
  approved: "✓",
  awaiting: "◷",
  rejected: "×",
};

/**
 * Recent activity beneath the Overview cards. Entries are derived from the
 * application records - see lib/activity.ts for what that does and does not
 * represent.
 */
export default function ActivityFeed({
  applications,
  now,
  onOpenQueue,
}: {
  applications: ExportApplication[];
  now: number;
  onOpenQueue: () => void;
}) {
  const entries = buildActivityFeed(applications, now);

  return (
    <section className="staff-panel activity-panel" aria-labelledby="activity-heading">
      <div className="staff-panel-head">
        <div>
          <p className="eyebrow">RECENT ACTIVITY</p>
          <h3 id="activity-heading">Latest movement</h3>
        </div>
        <button className="admin-button" type="button" onClick={onOpenQueue}>Open work queue</button>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state staff-empty">
          <span className="empty-symbol">—</span>
          <h2>No activity yet</h2>
          <p>Applications submitted to the portal will appear here with their current standing.</p>
        </div>
      ) : (
        <ol className="activity-list">
          {entries.map((entry) => (
            <li className={`activity-row activity-${entry.kind}`} key={entry.applicationNumber}>
              <span className="activity-glyph" aria-hidden="true">{KIND_GLYPH[entry.kind]}</span>
              <div className="activity-body">
                <strong>{entry.title}</strong>
                <span className="activity-ref">{entry.applicationNumber}</span>
                <small>{entry.detail}</small>
              </div>
              <div className="activity-meta">
                <span className="status-pill">{entry.status}</span>
                <time dateTime={entry.at ? new Date(entry.at).toISOString() : undefined}>{entry.ago}</time>
              </div>
              <Link className="admin-button activity-open" href={entry.href}>Open</Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
