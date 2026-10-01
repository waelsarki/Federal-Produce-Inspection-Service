"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { APPLICATIONS_KEY, ExportApplication, writeApplications } from "@/lib/portal";
import { ApprovalLevel, StaffAccount, StaffPermission, can, changeStaffPassword, readRoles, readStaffSession, readWorkflow, roleLabel, signOutStaff, updateStaffProfile } from "@/lib/staff";
import PasswordField from "@/components/PasswordField";
import RoleManager from "@/components/admin/RoleManager";
import ApprovalLevelManager from "@/components/admin/ApprovalLevelManager";
import ActivityFeed from "@/components/admin/ActivityFeed";
import ApprovalPanel from "@/components/admin/ApprovalPanel";
import CertificateTemplateManager from "@/components/admin/CertificateTemplateManager";
import {
  Award,
  ClipboardList,
  FileCog,
  KeyRound,
  LayoutDashboard,
  UserCog,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

type StaffPanel = "overview" | "applications" | "generated" | "certificate-template" | "workflow" | "roles" | "profile" | "password";

/**
 * The sidebar is the only navigation in this workspace, so each entry maps to
 * exactly one section of the main area and the main area shows that section
 * alone. Entries the signed-in account may not use are dropped, and the icons
 * are picked per section so the rail can be scanned without reading the labels.
 */
const STAFF_PANELS: { id: StaffPanel; label: string; icon: LucideIcon; permission?: StaffPermission }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "applications", label: "Review applications", icon: ClipboardList },
  { id: "generated", label: "Generate certificates", icon: Award },
  { id: "certificate-template", label: "Configure certificate", icon: FileCog, permission: "certificates.issue" },
  { id: "workflow", label: "Approval workflow", icon: Workflow, permission: "workflow.manage" },
  { id: "roles", label: "Create user roles", icon: Users, permission: "roles.manage" },
  { id: "profile", label: "Admin profile", icon: UserCog },
  { id: "password", label: "Change password", icon: KeyRound },
];

export default function StaffPage() {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<StaffPanel>("overview");
  const [account, setAccount] = useState<StaffAccount | null>(null);
  const [applications, setApplications] = useState<ExportApplication[]>([]);
  const [levels, setLevels] = useState<ApprovalLevel[]>([]);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    const session = readStaffSession();
    if (!session) { router.replace("/staff/login"); return; }
    setAccount(session);
    const raw = localStorage.getItem(APPLICATIONS_KEY);
    setApplications(raw ? (JSON.parse(raw) as ExportApplication[]) : []);
    setLevels(readWorkflow());
  }, [router]);

  // Replaces one record with the decided version and persists the whole list,
  // so the queue, the Overview counts and the activity feed all agree.
  function applyDecision(next: ExportApplication) {
    setApplications((current) => {
      const updated = current.map((entry) => (entry.applicationNumber === next.applicationNumber ? next : entry));
      writeApplications(updated);
      return updated;
    });
  }

  function handleSignOut(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    signOutStaff();
    router.push("/staff/login");
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const problem = await changeStaffPassword(account.id, String(data.get("currentPassword")), String(data.get("newPassword")));
    setPasswordMessage(problem ?? "Password updated for this browser.");
    if (!problem) form.reset();
  }

  function handleProfileUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;
    const data = new FormData(event.currentTarget);
    const problem = updateStaffProfile(account.id, String(data.get("fullName")), String(data.get("email")));
    setProfileMessage(problem ?? "Administrator profile updated.");
    if (!problem) {
      const next = readStaffSession();
      if (next) setAccount(next);
    }
  }

  // A single timestamp for the whole render, so every "x min ago" in the feed
  // agrees with the others instead of drifting between renders. Declared above
  // the early return below so hooks always run in the same order.
  const now = useMemo(() => Date.now(), [applications]);

  if (!account) return <div className="page-loading" aria-label="Loading console" />;

  const pending = applications.filter((application) => !/issued|approved/i.test(application.status)).length;
  const issued = applications.filter((application) => /issued|approved/i.test(application.status)).length;
  const roles = readRoles();

  // An account may lack the permission behind the open panel - a role can be
  // narrowed while the console is open - so fall back to Overview rather than
  // rendering a section the account can no longer use.
  const availablePanels = STAFF_PANELS.filter((panel) => !panel.permission || can(account, panel.permission));
  const current = availablePanels.some((panel) => panel.id === activePanel) ? activePanel : "overview";

  return (
    <>
      <div className="prototype-notice"><strong>Certificate operations</strong><span>Local prototype data only. Connect server-side identity and storage before production use.</span></div>
      <section className="staff-workspace">
        <aside className="staff-sidebar" aria-label="Staff console navigation">
          <div className="sidebar-heading"><span className="sidebar-kicker">FPIS / CONTROL ROOM</span><h1>Admin<br /><em>workspace.</em></h1></div>
          <nav className="sidebar-nav">
            {availablePanels.map((panel) => {
              const Icon = panel.icon;
              return (
                <button
                  key={panel.id}
                  className={`sidebar-link ${current === panel.id ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setActivePanel(panel.id)}
                  aria-current={current === panel.id ? "page" : undefined}
                >
                  <Icon className="sidebar-icon" size={16} strokeWidth={1.75} aria-hidden="true" />
                  {panel.label}
                </button>
              );
            })}
          </nav>
          <div className="sidebar-account"><span className="sidebar-avatar">{account.fullName.slice(0, 1).toUpperCase()}</span><div><strong>{account.fullName}</strong><small>{roleLabel(account.roleId)}</small></div><form onSubmit={handleSignOut}><button type="submit" aria-label="Sign out" title="Sign out">↗</button></form></div>
        </aside>
        <div className="staff-main">
          {current === "overview" ? (
            <>
              <header className="staff-main-header"><div><p className="eyebrow">STAFF CONSOLE / TODAY</p><h2>Good day, <em>{account.fullName}.</em></h2><p>Manage inspection review, certificate issuance and access controls from one workspace.</p></div><span className="staff-date">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span></header>

              <section className="analytics-grid" aria-label="Certificate portal analytics">
                <article className="analytics-card analytics-card-primary"><span>ALL APPLICATIONS</span><strong>{String(applications.length).padStart(2, "0")}</strong><small>Submitted to the portal</small><i>↗</i></article>
                <article className="analytics-card"><span>PENDING REVIEW</span><strong>{String(pending).padStart(2, "0")}</strong><small>Need a staff action</small><i>◷</i></article>
                <article className="analytics-card"><span>CERTIFICATES ISSUED</span><strong>{String(issued).padStart(2, "0")}</strong><small>Approved records</small><i>✓</i></article>
                <article className="analytics-card"><span>ACTIVE ROLES</span><strong>{String(roles.length).padStart(2, "0")}</strong><small>Configured access profiles</small><i>◎</i></article>
              </section>

              <ActivityFeed applications={applications} now={now} onOpenQueue={() => setActivePanel("applications")} />
            </>
          ) : null}

          {current === "applications" ? (
            <section className="staff-panel staff-panel-flush">
              <div className="staff-panel-head"><div><p className="eyebrow">WORK QUEUE</p><h3>Applications in review</h3></div><span className="panel-count">{applications.length} records</span></div>
              {applications.length === 0 ? (
                <div className="empty-state staff-empty"><span className="empty-symbol">—</span><h2>No applications yet</h2><p>Submitted applications will appear here for inspection review and certificate issuance.</p></div>
              ) : (
                <div className="review-list">
                  {applications.map((application) => (
                    <article className="review-card review-card-stacked" key={application.applicationNumber}>
                      <div className="review-summary">
                        <div className="review-number"><span>{application.applicationNumber}</span><small>{new Date(application.submittedAt).toLocaleDateString("en-GB")}</small></div>
                        <div><strong>{application.commodity || "Agricultural produce"}</strong><small>{application.destination} · {application.consigneeName}</small></div>
                        <span className="status-pill">{application.status}</span>
                        <div className="review-actions">
                          {can(account, "applications.view") ? <Link className="admin-button" href={`/certificate/${application.applicationNumber}`}>Review</Link> : null}
                          <Link className="admin-button admin-button-primary" href={`/certificate/${application.applicationNumber}`}>Print certificate</Link>
                        </div>
                      </div>
                      {can(account, "applications.decide") ? (
                        <ApprovalPanel application={application} levels={levels} account={account} onDecide={applyDecision} />
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {current === "generated" ? (
            <section className="staff-panel generated-panel staff-panel-flush">
              <div className="staff-panel-head"><div><p className="eyebrow">CERTIFICATE PRODUCTION</p><h3>Generate and print</h3></div></div><p className="panel-description">Open a reviewed application to generate its configured FPIS certificate. Use the print control on the document page to print or save it as PDF.</p>
              <div className="generated-actions"><button className="admin-button" type="button" onClick={() => setActivePanel("applications")}>Open the work queue</button></div>
            </section>
          ) : null}

          {current === "certificate-template" && can(account, "certificates.issue") ? <CertificateTemplateManager /> : null}
          {current === "workflow" && can(account, "workflow.manage") ? <ApprovalLevelManager /> : null}
          {current === "roles" && can(account, "roles.manage") ? <RoleManager /> : null}

          {current === "profile" ? (
            <section className="staff-panel staff-panel-flush">
              <div className="staff-panel-head"><div><p className="eyebrow">SETTINGS / PROFILE</p><h3>Administrator profile</h3></div></div>
              <form className="settings-form" onSubmit={handleProfileUpdate}><div className="field"><label htmlFor="profile-full-name">Full name</label><input id="profile-full-name" name="fullName" defaultValue={account.fullName} required maxLength={120} /></div><div className="field"><label htmlFor="profile-email">Email address</label><input id="profile-email" name="email" type="email" defaultValue={account.email} required maxLength={254} /></div><button className="button button-small" type="submit">Save profile</button>{profileMessage ? <p className="admin-message" role="status">{profileMessage}</p> : null}</form>
            </section>
          ) : null}

          {current === "password" ? (
            <section className="staff-panel staff-panel-flush">
              <div className="staff-panel-head"><div><p className="eyebrow">SETTINGS / SECURITY</p><h3>Change password</h3></div></div>
              <form className="settings-form" onSubmit={handlePasswordChange}><PasswordField id="currentPassword" name="currentPassword" label="Current password" autoComplete="current-password" /><PasswordField id="newPassword" name="newPassword" label="New password (12 characters minimum)" autoComplete="new-password" minLength={12} maxLength={100} /><button className="button button-small" type="submit">Update password</button>{passwordMessage ? <p className="admin-message" role="status">{passwordMessage}</p> : null}</form>
            </section>
          ) : null}
        </div>
      </section>
    </>
  );
}