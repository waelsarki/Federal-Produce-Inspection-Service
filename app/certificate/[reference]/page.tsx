"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CertificateSheet from "@/components/CertificateSheet";
import CertificateFieldsForm from "@/components/admin/CertificateFieldsForm";
import { buildCertificate } from "@/lib/certificate";
import { formatVerificationCode } from "@/lib/certificate-code";
import { issuedAtFor, resolveCertificateData } from "@/lib/certificate-fields";
import { CertificateFieldConfig, readCertificateConfig } from "@/lib/certificate-config";
import {
  ApplicantProfile,
  ExportApplication,
  readApplicant,
  readApplications,
  writeApplications,
} from "@/lib/portal";
import { can, readStaffSession } from "@/lib/staff";

const SHEET_WIDTH_PX = 794;
const SHEET_HEIGHT_PX = 1123;

export default function CertificatePage() {
  const params = useParams<{ reference: string | string[] }>();
  const reference = Array.isArray(params?.reference) ? params.reference[0] : (params?.reference ?? "");
  const [record, setRecord] = useState<ExportApplication | null>(null);
  const [applicant, setApplicant] = useState<ApplicantProfile | null>(null);
  const [canIssue, setCanIssue] = useState(false);
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<CertificateFieldConfig[]>([]);
  const [scale, setScale] = useState(1);
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const staff = readStaffSession();
    setConfig(readCertificateConfig());
    setApplicant(readApplicant());
    setCanIssue(can(staff, "certificates.issue"));
    const application = readApplications().find(
      (entry) => entry.applicationNumber.toLowerCase() === reference.trim().toLowerCase(),
    );
    if (application && can(staff, "applications.view")) setRecord(application);
    setReady(true);
  }, [reference]);

  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    const update = () => setScale(Math.min(1, node.clientWidth / SHEET_WIDTH_PX));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ready]);

  const persist = useCallback((next: ExportApplication) => {
    writeApplications(readApplications().map((entry) => (entry.applicationNumber === next.applicationNumber ? next : entry)));
    setRecord(next);
  }, []);

  const certificate = useMemo(() => {
    if (!record) return null;
    const resolved = resolveCertificateData(record, {
      organization: applicant?.organization,
      address: applicant?.address,
    });
    // buildCertificate reads application fields, so feed it the merged values
    // and the resolved exporter instead of changing its signature.
    const source = { ...record, ...resolved } as ExportApplication;
    return buildCertificate(
      source,
      { organization: resolved.exporterOrganization, address: resolved.exporterAddress },
      issuedAtFor(record, new Date()),
      record.certificateData?.verificationCode ?? "",
    );
  }, [record, applicant]);

  if (!ready) return <div className="page-loading" aria-label="Loading certificate" />;

  if (!record || !certificate) {
    return (
      <>
        <div className="prototype-notice"><strong>Development preview</strong><span>Certificates are generated from applications stored in this browser only.</span></div>
        <section className="cert-page">
          <div className="cert-page-head"><div><h1>Certificate not found</h1><p>No application in this browser matches that reference, so there is nothing to certify.</p></div></div>
          <div className="empty-state"><span className="empty-symbol">—</span><h2>Unknown reference</h2><p>Check the reference, or return to the staff certificate portal.</p><Link className="text-link" href="/staff">Go to staff portal →</Link></div>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="prototype-notice"><strong>Generated certificate</strong><span>Complete the required fields below, save, then print or save this document as PDF.</span></div>
      <section className="cert-page">
        <div className="cert-page-head">
          <div>
            <h1>Certificate for {record.applicationNumber}</h1>
            <p>FPIS digital certificate with the configured inspection fields, official identity, watermark and unique security barcode. Printed at A4.</p>
          </div>
          <div className="cert-actions">
            <Link className="button button-outline button-small" href="/staff">Back to staff portal</Link>
            <button className="button button-small" type="button" onClick={() => window.print()}>Print or save as PDF</button>
          </div>
        </div>

        <CertificateFieldsForm
          application={record}
          config={config}
          applicant={applicant}
          canIssue={canIssue}
          onSave={persist}
        />
        {record.certificateData?.verificationCode ? (
          <div className="cert-identity">
            <div>
              <span className="cert-identity-label">VERIFICATION CODE</span>
              <strong className="cert-identity-code">{formatVerificationCode(record.certificateData.verificationCode)}</strong>
            </div>
            <p className="cert-identity-note">
              This code is what the security barcode on the sheet encodes, and it is what a third party enters at{" "}
              <Link href="/verify">the verify page</Link>. It was assigned when the certificate was issued and does
              not change if the fields are corrected or the sheet is reprinted.
            </p>
          </div>
        ) : null}

        <div className="cert-viewport" ref={viewport}>
          <div className="cert-scale" style={{ transform: `scale(${scale})`, height: Math.round(SHEET_HEIGHT_PX * scale) }}>
            <CertificateSheet certificate={certificate} config={config} />
          </div>
        </div>
      </section>
    </>
  );
}
