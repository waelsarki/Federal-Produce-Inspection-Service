import { CertificateDocument, CertificateRow, certificateGroups, formatOrdinalDate } from "@/lib/certificate";

function CertificateRowLine({ row }: { row: CertificateRow }) {
  if (row.kind === "note") return <p className="cert-note">{row.text}</p>;
  if (row.kind === "continuation") {
    return (
      <p className="cert-line">
        <span className="cert-value">{row.value}</span>
        <span className="cert-fill" />
      </p>
    );
  }
  const tails = row.tails ?? [];
  return (
    <p className="cert-line">
      <span className="cert-label">{row.label}</span>
      <span className="cert-fill cert-fill-lead" />
      {row.value ? <span className="cert-value">{row.value}</span> : null}
      {tails.map((tail, index) => (
        <span className="cert-tail" key={tail.label}>
          {row.value || index > 0 ? <span className="cert-fill" /> : null}
          <span className="cert-label">{tail.label}</span> <span className="cert-value">{tail.value}</span>
        </span>
      ))}
      <span className="cert-fill" />
    </p>
  );
}

export default function CertificateSheet({ certificate }: { certificate: CertificateDocument }) {
  const issued = formatOrdinalDate(certificate.issueDate);
  const groups = certificateGroups(certificate);

  return (
    <article className="cert-sheet" aria-label="Certificate of quality, fumigation, good packaging materials and weight">
      <div className="cert-paper" aria-hidden="true" />
      <div className="cert-watermark" aria-hidden="true"><img src="/images/fpis-logo.png" alt="" /></div>
      <header className="cert-letterhead">
        <img className="cert-crest" src="/images/fpis-crest.png" alt="Coat of arms of the Federal Republic of Nigeria" />
        <p className="cert-ministry">FEDERAL MINISTRY OF INDUSTRY, TRADE &amp; INVESTMENT</p>
        <p className="cert-service">FEDERAL PRODUCE INSPECTION SERVICE</p>
        <p className="cert-address">Ijora - Olopa, Lagos Nigeria</p>
        <img className="cert-logo" src="/images/fpis-logo.png" alt="Federal Produce Inspection Service emblem" />
      </header>
      <p className="cert-serial">NO: {certificate.serialNumber}</p>
      <div className="cert-reference">
        <p className="cert-line"><span className="cert-reference-label">REF :</span><span className="cert-fill cert-fill-lead" /><span className="cert-value">{certificate.reference}</span><span className="cert-fill" /></p>
        <p className="cert-line"><span className="cert-reference-label">DATE:</span><span className="cert-fill cert-fill-lead" /><span className="cert-value">{issued.day}<sup>{issued.ordinal}</sup> {issued.month}, {issued.year}</span><span className="cert-fill" /></p>
      </div>
      <h1 className="cert-title">CERTIFICATE OF QUALITY, FUMIGATION, GOOD PACKAGING MATERIALS &amp; WEIGHT</h1>
      <div className="cert-flow">
        <div className="cert-body">
          {groups.map((group) => (
            <div className={group.indent ? "cert-group cert-group-indent" : "cert-group"} key={group.marker}>
              <span className="cert-marker">{group.marker}</span>
              <div className="cert-rows">{group.rows.map((row, index) => <CertificateRowLine key={index} row={row} />)}</div>
            </div>
          ))}
        </div>
        <footer className="cert-footer">
          <p className="cert-analysis">QUALITY ANALYSIS OF EXPORT</p>
          <p className="cert-verdict">{certificate.qualityAnalysis}</p>
          <div className="cert-footer-grid">
            <div className="cert-circulation">
              <strong>CIRCULATION:</strong>
              <ol>
                <li>Exporter</li>
                <li>Director FPIS</li>
                <li>Issuing Station</li>
              </ol>
            </div>
            <div className="cert-signature">
              <p>FOR: DIRECTOR,</p>
              <p>Federal Produce Inspection Service</p>
            </div>
          </div>
          <p className="cert-specimen">Specimen generated from local browser data - not an official FPIS certificate</p>
        </footer>
      </div>
    </article>
  );
}
