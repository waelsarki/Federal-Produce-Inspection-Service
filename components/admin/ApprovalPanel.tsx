"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, XCircle } from "lucide-react";
import {
  MAX_NOTE_LENGTH,
  decideBlocker,
  deriveApprovalState,
  describeProgress,
  recordDecision,
} from "@/lib/approvals";
import type { ExportApplication } from "@/lib/portal";
import { ApprovalLevel, StaffAccount } from "@/lib/staff";

function stamp(iso: string): string {
  const date = new Date(iso);
  return Number.isFinite(date.getTime())
    ? date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "unknown date";
}

/**
 * Approval panel for one application: level progress, the decide controls for
 * the open level, and the append-only decision trail. Prototype only - the
 * trail lives in browser storage and is not tamper-evident.
 */
export default function ApprovalPanel({
  application,
  levels,
  account,
  onDecide,
}: {
  application: ExportApplication;
  levels: ApprovalLevel[];
  account: StaffAccount;
  onDecide: (next: ExportApplication) => void;
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const state = deriveApprovalState(application, levels);
  const blocker = decideBlocker(application, account, levels);
  const decisions = application.approvals ?? [];

  function decide(kind: "approved" | "rejected") {
    setError("");
    try {
      onDecide(recordDecision(application, account, levels, kind, note));
      setNote("");
      setOpen(false);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "That decision could not be recorded.");
    }
  }

  return (
    <div className="approval-panel">
      <div className="approval-head">
        <span className={`approval-stage approval-stage-${state.stage}`}>
          {state.stage === "approved" ? <CheckCircle2 size={13} aria-hidden="true" />
            : state.stage === "rejected" ? <XCircle size={13} aria-hidden="true" />
            : <span className="approval-stage-dot" aria-hidden="true" />}
          {describeProgress(state)}
        </span>
        {blocker ? "" : (
          <button className="admin-button" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            {open ? <ChevronDown size={13} aria-hidden="true" /> : <ChevronRight size={13} aria-hidden="true" />}
            Decide
          </button>
        )}
      </div>

      {blocker ? <p className="approval-blocked">{blocker}</p> : null}

      {open && !blocker ? (
        <div className="approval-decide">
          <div className="field">
            <label htmlFor={`note-${application.applicationNumber}`}>Note for the record (optional)</label>
            <textarea
              id={`note-${application.applicationNumber}`}
              rows={2}
              maxLength={MAX_NOTE_LENGTH}
              value={note}
              placeholder="Findings, moisture result, or reason for rejection"
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <div className="approval-decide-actions">
            <button className="admin-button admin-button-primary" type="button" onClick={() => decide("approved")}>
              <CheckCircle2 size={13} aria-hidden="true" /> Approve {state.current?.label}
            </button>
            <button className="admin-button admin-button-danger" type="button" onClick={() => decide("rejected")}>
              <XCircle size={13} aria-hidden="true" /> Reject
            </button>
          </div>
          {error ? <p className="admin-message admin-message-error" role="alert">{error}</p> : null}
        </div>
      ) : null}

      {decisions.length > 0 ? (
        <details className="approval-trail">
          <summary>Decision trail ({decisions.length})</summary>
          <ol>
            {[...decisions].reverse().map((entry) => (
              <li key={entry.id} className={`approval-event approval-event-${entry.decision}`}>
                <strong>{entry.decision === "approved" ? "Approved" : "Rejected"}</strong>
                <span>{entry.levelLabel} · {entry.staffName}</span>
                <small>{stamp(entry.decidedAt)}</small>
                {entry.note ? <p>{entry.note}</p> : null}
              </li>
            ))}
          </ol>
        </details>
      ) : null}
    </div>
  );
}
