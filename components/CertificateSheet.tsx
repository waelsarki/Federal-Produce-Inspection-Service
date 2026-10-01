import CertificateBarcode from "@/components/CertificateBarcode";
import { CertificateDocument, CertificateRow, certificateGroups, formatOrdinalDate } from "@/lib/certificate";
import { CertificateFieldConfig, certificateFieldEnabled } from "@/lib/certificate-config";

function CertificateRowLine({ row }: { row: CertificateRow }) {
  if (row.kind === "note") return <p className="cert-note">{row.text}</p>;
  if (row.kind === "continuation") return <p className="cert-line"><span className="cert-value">{row.value}</span></p>;
  return <p className="cert-line"><span className="cert-label">{row.label}</span>{row.value ? <strong className="cert-value">{row.value}</strong> : null}{row.tails?.map((tail) => <span className="cert-tail" key={tail.label}><span className="cert-label">{tail.label}</span><strong className="cert-value">{tail.value}</strong></span>)}</p>;
}

export default function CertificateSheet({ certificate, config }: { certificate: CertificateDocument; config?: CertificateFieldConfig[] }) {
  const issued = formatOrdinalDate(certificate.issueDate);
  const groups = certificateGroups(certificate, config);
  const fieldEnabled = (id: Parameters<typeof certificateFieldEnabled>[1]) => certificateFieldEnabled(config, id);

  return (
    <article className="cert-sheet cert-modern" aria-label="FPIS certificate of quality, fumigation, good packaging materials and weight">
      <div className="cert-paper" aria-hidden="true" />
      <div className="cert-watermark" aria-hidden="true"><img src="/images/fpis-logo.png" alt="" /></div>
      <header className="cert-modern-header">
        <img className="cert-modern-crest" src="/images/fpis-crest.png" alt="Coat of arms of the Federal Republic of Nigeria" />
        <div className="cert-modern-heading"><p>FEDERAL MINISTRY OF INDUSTRY, TRADE &amp; INVESTMENT</p><strong>FEDERAL PRODUCE INSPECTION SERVICE</strong><span>Ijora - Olopa, Lagos Nigeria</span></div>
        <img className="cert-modern-logo" src="/images/fpis-logo.png" alt="Federal Produce Inspection Service official logo" />
      </header>
      <div className="cert-modern-meta"><div><span>REFERENCE</span><strong>{certificate.reference}</strong></div><div><span>ISSUE DATE</span><strong>{issued.day}<sup>{issued.ordinal}</sup> {issued.month} {issued.year}</strong></div><div className="cert-modern-serial"><span>CERTIFICATE NO.</span><strong>{certificate.serialNumber}</strong></div></div>
      <div className="cert-modern-title"><p>EXPORT INSPECTION &amp; COMPLIANCE</p><h1>Certificate of Quality, Fumigation,<br />Good Packaging Materials &amp; Weight</h1></div>
      <div className="cert-modern-rule" />
      <div className="cert-modern-body">
        {groups.map((group) => <section className="cert-modern-group" key={group.marker}><span className="cert-modern-marker">{group.marker}</span><div><h2>{group.marker === "(1)" ? "Parties and commodity" : group.marker === "(4)" ? "Treatment and inspection" : group.marker === "(11)" ? "Shipment traceability" : "Export details"}</h2>{group.rows.map((row, index) => <CertificateRowLine key={index} row={row} />)}</div></section>)}
      </div>
      <footer className="cert-modern-footer">
        {fieldEnabled("qualityAnalysis") ? <div className="cert-verdict-box"><span>QUALITY ANALYSIS OF EXPORT</span><strong>{certificate.qualityAnalysis}</strong></div> : null}
        <div className="cert-modern-footer-grid">
          {fieldEnabled("circulation") ? <div><span className="cert-footer-label">CIRCULATION</span><ol><li>Exporter</li><li>Director FPIS</li><li>Issuing Station</li></ol></div> : null}
          {fieldEnabled("signature") ? <div className="cert-modern-signature"><span>AUTHORIZED BY</span><strong>For: Director</strong><p>Federal Produce Inspection Service</p></div> : null}
          {fieldEnabled("barcode") ? <CertificateBarcode value={certificate.verificationCode} issued={Boolean(certificate.verificationCode)} /> : null}
        </div>
        <p className="cert-security-note">
          {certificate.verificationCode
            ? "Digitally generated FPIS record · Verify this certificate at fpis.gov.ng/verify using the code above"
            : "Digitally generated FPIS record · Save the certificate fields to issue it and assign its verification code"}
        </p>
      </footer>
    </article>
  );
}