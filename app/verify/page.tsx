"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ExportApplication, readApplications } from "@/lib/portal";

export default function VerifyPage() {
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<{ found: boolean; application?: ExportApplication; searched: boolean }>({ found: false, searched: false });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = reference.trim().toLowerCase();
    if (!query) {
      setResult({ found: false, searched: true });
      return;
    }
    const application = readApplications().find((entry) => entry.applicationNumber.toLowerCase() === query);
    setResult({ found: Boolean(application), application, searched: true });
  }

  return (
    <>
      <div className="prototype-notice"><strong>Development preview</strong><span>Verification checks records in this browser only. Official FPIS certificate verification is not connected.</span></div>
      <section className="login-page">
        <div className="login-heading">
          <p className="eyebrow">APPLICANT PORTAL</p>
          <h1>Verify <em>a certificate.</em></h1>
          <p>Enter the application or certificate reference you were given to see the current status of the record held for it.</p>
          <div className="form-aside"><span className="aside-mark">i</span><span>FPIS issues certificates of quality, fumigation, weight and good packaging once a shipment has sailed and the Bill of Lading is ready. Certificate numbers carry a unique verification code.</span></div>
        </div>
        <form className="form-panel login-panel" onSubmit={handleSubmit}>
          <div className="field"><label htmlFor="certificate-reference">Application or certificate reference</label><input id="certificate-reference" name="certificate-reference" value={reference} onChange={(event) => setReference(event.target.value)} required placeholder="FPIS-..." /></div>
          <button className="button form-submit" type="submit">Check reference <span aria-hidden="true">→</span></button>
          {result.searched && !result.found ? (
            <div className="empty-state" style={{ marginTop: 18 }}>
              <span className="empty-symbol">—</span>
              <h2>No matching record</h2>
              <p>No application in this browser matches that reference. Check the reference, or sign in to your dashboard to see the applications you submitted.</p>
              <Link className="text-link" href="/staff/login">Open staff portal →</Link>
            </div>
          ) : null}
          {result.searched && result.found && result.application ? (
            <div className="verify-result" style={{ marginTop: 18 }}>
              <span className="eyebrow">RECORD FOUND</span>
              <strong className="verify-reference">{result.application.applicationNumber}</strong>
              <dl className="info-definitions">
                <div><dt>Applicant</dt><dd>{result.application.commodity}</dd></div>
                <div><dt>Destination</dt><dd>{result.application.destination}</dd></div>
                <div><dt>Shipment date</dt><dd>{result.application.shipmentDate}</dd></div>
                <div><dt>Status</dt><dd>{result.application.status}</dd></div>
              </dl>
              <p className="info-note"><strong>Not an official certificate</strong><span>This is an application record from your own browser. No official FPIS certificate has been issued for it.</span></p>
            </div>
          ) : null}
          <p className="form-footnote">Only authorized FPIS staff can verify certificate records.</p>
        </form>
      </section>
    </>
  );
}
