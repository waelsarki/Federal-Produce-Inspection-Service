"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { APPLICANT_KEY, APPLICATIONS_KEY, AUTH_KEY, ApplicantProfile, ExportApplication } from "@/lib/portal";

export default function DashboardPage() {
  const router = useRouter();
  const [applicant, setApplicant] = useState<ApplicantProfile | null>(null);
  const [applications, setApplications] = useState<ExportApplication[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const id = sessionStorage.getItem(AUTH_KEY);
    const profile = localStorage.getItem(APPLICANT_KEY);
    if (!id || !profile) {
      router.replace("/login");
      return;
    }
    const parsed = JSON.parse(profile) as ApplicantProfile;
    if (parsed.id !== id) {
      router.replace("/login");
      return;
    }
    const stored = JSON.parse(localStorage.getItem(APPLICATIONS_KEY) ?? "[]") as ExportApplication[];
    setApplicant(parsed);
    setApplications(stored.filter((application) => application.applicantId === parsed.id));
  }, [router]);

  function signOut(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sessionStorage.removeItem(AUTH_KEY);
    router.push("/");
  }

  const visibleApplications = applications.filter((application) => application.applicationNumber.toLowerCase().includes(query.trim().toLowerCase()));

  if (!applicant) return <div className="page-loading" aria-label="Loading dashboard" />;

  return (
    <>
      <div className="prototype-notice"><strong>Development preview</strong><span>Stored applications are local to this browser. No official certificate has been issued.</span></div>
      <section className="dashboard-page"><div className="dashboard-top"><div><p className="eyebrow">APPLICANT DASHBOARD</p><h1>Good day, <em>{applicant.fullName}.</em></h1><p>{applicant.organization} <span className="separator">/</span> {applicant.email}</p></div><form onSubmit={signOut}><button className="button button-outline" type="submit">Sign out</button></form></div>
        <div className="dashboard-toolbar"><div><span className="eyebrow">YOUR APPLICATIONS</span><strong>{String(visibleApplications.length).padStart(2, "0")} <small>total</small></strong></div><div className="lookup-form"><label htmlFor="application-number">Find by application number</label><div><input id="application-number" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="FPIS-..." /><span aria-hidden="true">⌕</span></div></div></div>
        {visibleApplications.length === 0 ? <div className="empty-state"><span className="empty-symbol">—</span><h2>{query ? "No matching application" : "No applications yet"}</h2><p>{query ? "Check the application number and try again." : "Applications you submit will appear here."}</p><Link className="text-link" href="/register">Start an application →</Link></div> : <div className="application-table-wrap"><table className="application-table"><thead><tr><th>Application</th><th>Commodity</th><th>Destination</th><th>Shipment date</th><th>Status</th><th>Certificate</th></tr></thead><tbody>{visibleApplications.map((application) => <tr key={application.applicationNumber}><td><strong>{application.applicationNumber}</strong><small>Submitted {new Date(application.submittedAt).toLocaleDateString()}</small></td><td>{application.commodity}</td><td>{application.destination}</td><td>{application.shipmentDate}</td><td><span className="status-pill">{application.status}</span></td><td><span className="not-issued">Not issued</span></td></tr>)}</tbody></table></div>}
      </section>
    </>
  );
}