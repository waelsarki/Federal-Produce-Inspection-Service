"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { APPLICATIONS_KEY, ExportApplication } from "@/lib/portal";
import { StaffAccount, can, changeStaffPassword, readStaffSession, roleLabel, signOutStaff } from "@/lib/staff";
import PasswordField from "@/components/PasswordField";
import RoleManager from "@/components/admin/RoleManager";
import ApprovalLevelManager from "@/components/admin/ApprovalLevelManager";

export default function StaffPage() {
  const router = useRouter();
  const [account, setAccount] = useState<StaffAccount | null>(null);
  const [applications, setApplications] = useState<ExportApplication[]>([]);
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    const session = readStaffSession();
    if (!session) {
      router.replace("/staff/login");
      return;
    }
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
    form.reset();
  }

  if (!account) return <div className="page-loading" aria-label="Loading console" />;

  return (
    <>
      <div className="prototype-notice"><strong>Development preview</strong><span>Review actions, staff roles and certificate issuance are not yet connected to this console.</span></div>
      <section className="dashboard-page">
        <div className="dashboard-top">
          <div><p className="eyebrow">STAFF CONSOLE</p><h1>Super admin <em>console.</em></h1><p>{account.fullName} <span className="separator">/</span> {account.email}</p></div>
          <form onSubmit={handleSignOut}><button className="button button-outline" type="submit">Sign out</button></form>
        </div>

        <div className="dashboard-toolbar">
          <div><span className="eyebrow">ACCOUNT</span><strong>{roleLabel(account.roleId)}</strong></div>
          <div className="lookup-form"><span>Seeded {new Date(account.createdAt).toLocaleDateString()}</span></div>
        </div>

        <div className="quicklinks-grid" style={{ marginTop: 24 }}>
          <article className="quicklink-group"><h2>Applications in review</h2>
            {applications.length === 0 ? (
              <div className="empty-state" style={{ boxShadow: "none", border: 0, padding: "30px 10px" }}><span className="empty-symbol">—</span><h2>No applications yet</h2><p>Applications submitted through this portal appear here for inspection review and approval.</p></div>
            ) : (
              <ul>{applications.map((application) => (
                <li key={application.applicationNumber}>
                  <span className="quicklink-label">{application.applicationNumber}</span>
                  <small>{application.commodity} · {application.destination} · {application.status}</small>
                </li>
              ))}</ul>
            )}
          </article>

          <article className="quicklink-group"><h2>Not yet connected</h2>
            <ul>{[
              "Executing approval decisions against the configured levels",
              "Creating and editing staff accounts",
              "Payment evidence and receipt verification",
              "Official certificate issuance and QR verification",
            ].map((item) => <li key={item}><span className="quicklink-label">{item}</span></li>)}</ul>
          </article>

          <article className="quicklink-group"><h2>Change password</h2>
            <p className="info-note" style={{ marginBottom: 14 }}><strong>Rotate the default</strong><span>The seeded account uses a known default password. Change it before this prototype is shared.</span></p>
            <form onSubmit={handlePasswordChange}>
              <PasswordField id="currentPassword" name="currentPassword" label="Current password" autoComplete="current-password" />
              <PasswordField className="field-spaced" id="newPassword" name="newPassword" label="New password (12 characters minimum)" autoComplete="new-password" minLength={12} maxLength={100} />
              {passwordMessage ? <p className="info-note" style={{ marginTop: 12 }} role="status"><span>{passwordMessage}</span></p> : null}
              <button className="button form-submit" type="submit">Update password</button>
            </form>
          </article>
        </div>

        {can(account, "roles.manage") ? <RoleManager /> : null}
        {can(account, "workflow.manage") ? <ApprovalLevelManager /> : null}

        <p className="quicklinks-note">Looking for the public information pages? <Link href="/information">Information centre</Link> · <Link href="/quick-links">Quick links</Link></p>
      </section>
    </>
  );
}