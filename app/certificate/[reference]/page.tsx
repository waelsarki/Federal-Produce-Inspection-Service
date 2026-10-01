"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import CertificateSheet from "@/components/CertificateSheet";
import { buildCertificate } from "@/lib/certificate";
import { CertificateFieldConfig, readCertificateConfig } from "@/lib/certificate-config";
import { ExportApplication, readApplications } from "@/lib/portal";
import { can, readStaffSession } from "@/lib/staff";

const SHEET_WIDTH_PX = 794;
const SHEET_HEIGHT_PX = 1123;

export default function CertificatePage() {
  const params = useParams<{ reference: string | string[] }>();
  const reference = Array.isArray(params?.reference) ? params.reference[0] : (params?.reference ?? "");
  const [record, setRecord] = useState<{ application: ExportApplication } | null>(null);
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<CertificateFieldConfig[]>([]);
  const [scale, setScale] = useState(1);
  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const staff = readStaffSession();
    setConfig(readCertificateConfig());
    const application = readApplications().find((entry) => entry.applicationNumber.toLowerCase() === reference.trim().toLowerCase());
    if (application && can(staff, "applications.view")) setRecord({ application });
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

  const certificate = useMemo(() => (record ? buildCertificate(record.application, null, new Date()) : null), [record]);

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
      <div className="prototype-notice"><strong>Generated certificate</strong><span>Review the configured fields before printing or saving this document.</span></div>
      <section className="cert-page">
        <div className="cert-page-head">
          <div>
            <h1>Generated certificate</h1>
            <p>FPIS digital certificate with the configured inspection fields, official identity, watermark and unique security barcode. Printed at A4.</p>
          </div>
          <div className="cert-actions">
            <Link className="button button-outline button-small" href="/staff">Back to staff portal</Link>
            <button className="button button-small" type="button" onClick={() => window.print()}>Print or save as PDF</button>
          </div>
        </div>
        <div className="cert-viewport" ref={viewport}>
          <div className="cert-scale" style={{ transform: `scale(${scale})`, height: Math.round(SHEET_HEIGHT_PX * scale) }}>
            <CertificateSheet certificate={certificate} config={config} />
          </div>
        </div>
      </section>
    </>
  );
}
