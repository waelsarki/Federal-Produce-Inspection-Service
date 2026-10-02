"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { History, Lock, RefreshCw, Search, ShieldCheck } from "lucide-react";
import PasswordField from "@/components/PasswordField";

type AuditEvent = {
  id: string;
  at: string;
  actorName: string;
  actorType: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  detail: string;
};

/**
 * Who did what, to which record, and when - every action the server carried out.
 *
 * This is deliberately not the Overview's activity feed. That one (see
 * lib/activity.ts) is derived from the application records themselves, so it can
 * only show the current standing of recent work and never names a person. Every
 * row here was written at the moment it happened, by the route that did it, so
 * it is a record of who was responsible rather than an inference from current data.
 *
 * Rows are never updated or deleted, so the order is stable and an entry cannot
 * be quietly rewritten. This view only reads; the trail is append-only at source.
 */

/** The cap the route enforces, so this asks for everything it is allowed. */
const LIMIT = 100;

export default function AuditTrail() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  /** The console's own sign-in is a browser flag, so the server may not know us. */
  const [signedIn, setSignedIn] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/activity?limit=${LIMIT}`, { cache: "no-store" });
      if (response.status === 401) {
        setSignedIn(false);
        setEvents([]);
        return;
      }
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "The event log could not be read.");
        return;
      }
      setSignedIn(true);
      setEvents(payload.data as AuditEvent[]);
    } catch {
      setError("The server could not be reached.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const actors = useMemo(
    () => [...new Set(events.map((event) => event.actorName))].sort((a, b) => a.localeCompare(b)),
    [events],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return events.filter((event) => {
      if (actor !== "all" && event.actorName !== actor) return false;
      if (!needle) return true;
      return [event.actorName, event.action, event.entity, event.entityId, event.detail]
        .some((value) => (value ?? "").toLowerCase().includes(needle));
    });
  }, [events, query, actor]);

  if (!signedIn) return <ServerSignIn onSignedIn={load} />;

  return (
    <section className="staff-panel staff-panel-flush" aria-labelledby="audit-heading">
      <div className="staff-panel-head">
        <div>
          <p className="eyebrow">ACCOUNTABILITY</p>
          <h3 id="audit-heading">Audit trail</h3>
        </div>
        <div className="audit-head-actions">
          <span className="panel-count">{events.length} of the last {LIMIT} events</span>
          <button className="admin-button" type="button" onClick={load} disabled={loading}>
            <RefreshCw size={13} aria-hidden="true" /> {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      <p className="panel-description">
        Every action the server carried out, newest first. Each entry was written at the moment it happened and is
        never edited or removed, so the record still names the responsible account after it has been renamed or deleted.
      </p>
      <div className="generate-toolbar">
        <div className="generate-search">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search person, action, reference or detail"
            aria-label="Search the audit trail"
          />
        </div>
        <div className="generate-filters" role="group" aria-label="Filter by person">
          <button
            type="button"
            className={`generate-filter ${actor === "all" ? "is-active" : ""}`}
            aria-pressed={actor === "all"}
            onClick={() => setActor("all")}
          >
            Everyone
          </button>
          {actors.map((name) => (
            <button
              key={name}
              type="button"
              className={`generate-filter ${actor === name ? "is-active" : ""}`}
              aria-pressed={actor === name}
              onClick={() => setActor(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="admin-message admin-message-error" role="alert">{error}</p> : null}

      {loading && events.length === 0 ? (
        <div className="empty-state staff-empty"><span className="empty-symbol">—</span><h2>Reading the log</h2></div>
      ) : visible.length === 0 ? (
        <div className="empty-state staff-empty">
          <span className="empty-symbol">—</span>
          <h2>No matching activity</h2>
          <p>Nothing recorded matches that search{actor === "all" ? "" : " for that person"}.</p>
        </div>
      ) : (
        <ol className="audit-list">
          {visible.map((event) => (
            <li className="audit-row" key={event.id}>
              <span className="audit-glyph" aria-hidden="true"><History size={14} /></span>
              <div className="audit-body">
                <strong>{describe(event)}</strong>
                <small>
                  {event.actorName}
                  {event.actorType !== "staff" ? ` (${event.actorType})` : ""}
                  {event.detail ? ` — ${event.detail}` : ""}
                </small>
              </div>
              <div className="audit-meta">
                <span className="audit-action">{event.action}</span>
                <time dateTime={event.at}>{formatStamp(event.at)}</time>
              </div>
              {event.entityId && event.entity === "application" ? (
                <Link className="admin-button" href={`/certificate/${encodeURIComponent(event.entityId)}`}>Open</Link>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
/** Turns a stored action into a sentence a reader does not have to decode. */
function describe(event: AuditEvent): string {
  const subject = event.entityId ? ` ${event.entityId}` : "";
  switch (event.action) {
    case "login": return "Signed in to the console";
    case "login.failed": return "Failed to sign in";
    case "logout": return "Signed out of the console";
    case "certificate.create": return `Created certificate${subject}`;
    case "certificate.save": return `Saved certificate fields on${subject || " a certificate"}`;
    case "application.approve": return `Approved application${subject}`;
    case "application.reject": return `Rejected application${subject}`;
    case "role.create": return `Created the role${event.detail ? ` ${event.detail}` : ""}`;
    case "role.update": return `Updated a role${event.detail ? ` (${event.detail})` : ""}`;
    case "role.delete": return `Deleted the role${event.detail ? ` ${event.detail}` : ""}`;
    case "staff.create": return `Created a staff account${event.detail ? ` ${event.detail}` : ""}`;
    case "staff.update": return `Updated a staff account${event.detail ? ` (${event.detail})` : ""}`;
    case "staff.delete": return `Deleted a staff account${event.detail ? ` ${event.detail}` : ""}`;
    case "workflow.update": return "Changed the approval workflow";
    default: return `${event.action.replace(/[._]/g, " ")}${subject}`;
  }
}

function formatStamp(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

/**
 * The console signs in against browser storage, which the server cannot see, so
 * an officer can be inside the workspace with no server session behind them. The
 * event log has no prototype fallback to offer - there would be nothing to show -
 * so it asks for real credentials rather than quietly rendering an empty page.
 */
function ServerSignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: String(data.get("email")), password: String(data.get("password")) }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Those credentials were not accepted.");
        setBusy(false);
        return;
      }
      setBusy(false);
      onSignedIn();
    } catch {
      setError("The server could not be reached.");
      setBusy(false);
    }
  }

  return (
    <section className="staff-panel staff-panel-flush" aria-labelledby="audit-signin-heading">
      <div className="staff-panel-head">
        <div>
          <p className="eyebrow">ACCOUNTABILITY</p>
          <h3 id="audit-signin-heading">Audit trail</h3>
        </div>
      </div>

      <div className="audit-gate">
        <span className="audit-gate-icon" aria-hidden="true"><Lock size={20} /></span>
        <div>
          <h4>This log lives on the server</h4>
          <p>
            The audit trail is recorded server-side, so it is only readable with a server session. Signing in to
            the console in this browser is not the same thing. Use your FPIS staff account below to open the log -
            the sign-in is remembered for eight hours.
          </p>
        </div>
      </div>

      <form className="settings-form audit-signin" onSubmit={submit}>
        <div className="field">
          <label htmlFor="audit-email">Staff email address</label>
          <input id="audit-email" name="email" type="email" autoComplete="username" required maxLength={254} />
        </div>
        <PasswordField id="audit-password" name="password" label="Password" autoComplete="current-password" />
        {error ? <p className="admin-message admin-message-error" role="alert">{error}</p> : null}
        <button className="button button-small admin-button-primary" type="submit" disabled={busy}>
          <ShieldCheck size={14} aria-hidden="true" /> {busy ? "Signing in…" : "Open the audit trail"}
        </button>
      </form>
    </section>
  );
}