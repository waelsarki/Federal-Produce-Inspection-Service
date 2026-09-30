"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LAST_APPLICATION_KEY } from "@/lib/portal";

export default function SubmittedPage() {
  const [applicationNumber, setApplicationNumber] = useState("");

  useEffect(() => setApplicationNumber(sessionStorage.getItem(LAST_APPLICATION_KEY) ?? "PREVIEW"), []);

  return (
    <>
      <div className="prototype-notice"><strong>Development preview</strong><span>Displayed reference is not an official FPIS application number.</span></div>
      <section className="confirmation-page"><span className="confirmation-mark" aria-hidden="true">✓</span><p className="eyebrow">APPLICATION DRAFT / SAVED</p><h1>Your shipment details<br /><em>are in the draft queue.</em></h1><p className="confirmation-copy">Permanent records, verified online payment, staff review and official certificate issuance are not yet connected.</p><div className="reference-box"><span>PREVIEW REFERENCE</span><strong>{applicationNumber || "…"}</strong><small>Draft saved — payment step not enabled</small></div><div className="confirmation-actions"><Link className="button" href="/login">Sign in to applicant dashboard <span aria-hidden="true">→</span></Link><Link className="text-link" href="/">Return to overview</Link></div></section>
    </>
  );
}