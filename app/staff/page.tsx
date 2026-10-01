"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { APPLICATIONS_KEY, ExportApplication } from "@/lib/portal";
import { StaffAccount, can, changeStaffPassword, readRoles, readStaffSession, roleLabel, signOutStaff, updateStaffProfile } from "@/lib/staff";
import PasswordField from "@/components/PasswordField";
import RoleManager from "@/components/admin/RoleManager";
import ApprovalLevelManager from "@/components/admin/ApprovalLevelManager";
import CertificateTemplateManager from "@/components/admin/CertificateTemplateManager";

export default function StaffPage() {
  const router = useRouter();
  const [account, setAccount] = useState<StaffAccount | null>(null);
  const [applications, setApplications] = useState<ExportApplication[]>([]);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  useEffect(() => {
    const session = readStaffSession();
    if (!session) { router.replace("/staff/login"); return; }
    setAccount(session);
    const raw = localStorage.getItem(APPLICATIONS_KEY);
    setApplications(raw ? (JSON.parse(raw) as ExportApplication[]) : []);
  }, [router]);

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

  if (!account) return <div className="page-loading" aria-label="Loading console" />;

  const pending = applications.filter((application) => !/issued|approved/i.test(application.status)).length;
  const issued = applications.filter((application) => /issued|approved/i.test(application.status)).length;
  const roles = readRoles();

  return (
    <>
      <div className="prototype-notice"><strong>Certificate operations</strong><span>Local prototype data only. Connect server-side identity and storage before production use.</span></div>
      <section className="staff-workspace">
        <aside className="staff-sidebar" aria-label="Staff console navigation">
          <div className="sidebar-heading"><span className="sidebar-kicker">FPIS / CONTROL ROOM</span><h1>Admin<br /><em>workspace.</em></h1></div>
          <nav className="sidebar-nav">
            <a className="sidebar-link is-active" href="#overview"><span>01</span>Overview</a>
            <a className="sidebar-link" href="#applications"><span>02</span>Review applications</a>
            <a className="sidebar-link" href="#generated"><span>03</span>Generate certificates</a>
            {can(account, "certificates.issue") ? <a className="sidebar-link" href="#certificate-template"><span>04</span>Configure certificate</a> : null}
            {can(account, "roles.manage") ? <a className="sidebar-link" href="#roles"><span>05</span>Create user roles</a> : null}
            <a className="sidebar-link" href="#profile"><span>06</span>Admin profile</a>
            <a className="sidebar-link" href="#password"><span>07</span>Change password</a>
          </nav>
          <div className="sidebar-account"><span className="sidebar-avatar">{account.fullName.slice(0, 1).toUpperCase()}</span><div><strong>{account.fullName}</strong><small>{roleLabel(account.roleId)}</small></div><form onSubmit={handleSignOut}><button type="submit" aria-label="Sign out" title="Sign out">↗</button></form></div>
        </aside>
        <div className="staff-main">
          <header className="staff-main-header" id="overview"><div><p className="eyebrow">STAFF CONSOLE / TODAY</p><h2>Good day, <em>{account.fullName}.</em></h2><p>Manage inspection review, certificate issuance and access controls from one workspace.</p></div><span className="staff-date">{new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span></header>

          <section className="analytics-grid" aria-label="Certificate portal analytics">
            <article className="analytics-card analytics-card-primary"><span>ALL APPLICATIONS</span><strong>{String(applications.length).padStart(2, "0")}</strong><small>Submitted to the portal</small><i>↗</i></article>
            <article className="analytics-card"><span>PENDING REVIEW</span><strong>{String(pending).padStart(2, "0")}</strong><small>Need a staff action</small><i>◷</i></article>
            <article className="analytics-card"><span>CERTIFICATES ISSUED</span><strong>{String(issued).padStart(2, "0")}</strong><small>Approved records</small><i>✓</i></article>
            <article className="analytics-card"><span>ACTIVE ROLES</span><strong>{String(roles.length).padStart(2, "0")}</strong><small>Configured access profiles</small><i>◎</i></article>
          </section>

          <section className="staff-panel" id="applications">
            <div className="staff-panel-head"><div><p className="eyebrow">WORK QUEUE</p><h3>Applications in review</h3></div><span className="panel-count">{applications.length} records</span></div>
            {applications.length === 0 ? <div className="empty-state staff-empty"><span className="empty-symbol">—</span><h2>No applications yet</h2><p>Submitted applications will appear here for inspection review and certificate issuance.</p></div> : <div className="review-list">{applications.map((application) => <article className="review-card" key={application.applicationNumber}><div className="review-number"><span>{application.applicationNumber}</span><small>{new Date(application.submittedAt).toLocaleDateString("en-GB")}</small></div><div><strong>{application.commodity || "Agricultural produce"}</strong><small>{application.destination} · {application.consigneeName}</small></div><span className="status-pill">{application.status}</span><div className="review-actions">{can(account, "applications.view") ? <Link className="admin-button" href={`/certificate/${application.applicationNumber}`}>Review</Link> : null}<Link className="admin-button admin-button-primary" href={`/certificate/${application.applicationNumber}`}>Print certificate</Link></div></article>)}</div>}
          </section>

          <section className="staff-panel generated-panel" id="generated"><div className="staff-panel-head"><div><p className="eyebrow">CERTIFICATE PRODUCTION</p><h3>Generate and print</h3></div></div><p className="panel-description">Open a reviewed application to generate its configured FPIS certificate. Use the print control on the document page to print or save it as PDF.</p></section>

          {can(account, "certificates.issue") ? <section id="certificate-template"><CertificateTemplateManager /></section> : null}
          {can(account, "workflow.manage") ? <section><ApprovalLevelManager /></section> : null}
          {can(account, "roles.manage") ? <section id="roles"><RoleManager /></section> : null}

          <section className="settings-grid" id="profile">
            <article className="staff-panel"><div className="staff-panel-head"><div><p className="eyebrow">SETTINGS / PROFILE</p><h3>Administrator profile</h3></div></div><form className="settings-form" onSubmit={handleProfileUpdate}><div className="field"><label htmlFor="profile-full-name">Full name</label><input id="profile-full-name" name="fullName" defaultValue={account.fullName} required maxLength={120} /></div><div className="field"><label htmlFor="profile-email">Email address</label><input id="profile-email" name="email" type="email" defaultValue={account.email} required maxLength={254} /></div><button className="button button-small" type="submit">Save profile</button>{profileMessage ? <p className="admin-message" role="status">{profileMessage}</p> : null}</form></article>
            <article className="staff-panel" id="password"><div className="staff-panel-head"><div><p className="eyebrow">SETTINGS / SECURITY</p><h3>Change password</h3></div></div><form className="settings-form" onSubmit={handlePasswordChange}><PasswordField id="currentPassword" name="currentPassword" label="Current password" autoComplete="current-password" /><PasswordField id="newPassword" name="newPassword" label="New password (12 characters minimum)" autoComplete="new-password" minLength={12} maxLength={100} /><button className="button button-small" type="submit">Update password</button>{passwordMessage ? <p className="admin-message" role="status">{passwordMessage}</p> : null}</form></article>
          </section>
        </div>
      </section>
    </>
  );
}