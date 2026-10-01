import Link from "next/link";
import { MANDATE, MISSION, VISION } from "@/lib/fpis-content";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> EXPORT CERTIFICATION PORTAL</p>
          <h1>Trusted produce.<br /><em>Ready for the world.</em></h1>
          <p className="hero-intro">Apply for inspection, track every requirement, and receive your verified export certificate through one secure service.</p>
          <div className="hero-actions">
            <Link className="button" href="/register">Register &amp; start application <span aria-hidden="true">→</span></Link>
            <Link className="button button-outline" href="/login">Go to applicant dashboard</Link>
          </div>
          <div className="hero-note"><span className="note-icon">01</span><span>Register once. Continue directly to your application.</span></div>
        </div>
        <div className="certificate-preview" aria-label="Illustration of a digitally verifiable FPIS quality certificate">
          <div className="certificate-topline"><span>FEDERAL REPUBLIC OF NIGERIA</span><span>FPIS / EXPORT</span></div>
          <div className="certificate-seal"><img src="/images/fpis-logo.png" alt="FPIS official seal" /></div>
          <p className="certificate-ministry">FEDERAL MINISTRY OF INDUSTRY, TRADE &amp; INVESTMENT</p>
          <h2>Certificate of Quality</h2>
          <p className="certificate-subtitle">Fumigation, packaging materials &amp; weight</p>
          <div className="certificate-rule" />
          <div className="certificate-fields"><span>EXPORTER</span><strong>Verified applicant</strong><span>COMMODITY</span><strong>Agricultural produce</strong><span>STATUS</span><strong className="verified"><i /> Digitally verifiable</strong></div>
          <div className="certificate-bottom"><span>AUTHORIZED ISSUE</span><span className="qr-placeholder" aria-hidden="true"><b /><b /><b /><b /><b /><b /><b /><b /><b /></span></div>
          <div className="watermark" aria-hidden="true">FPIS</div>
        </div>
        <div className="hero-index"><span>01</span><span className="index-line" /><span>03</span></div>
      </section>
      <section className="process-strip" id="process" aria-label="Application stages">
        <div><span className="step-number">01</span><span><strong>Register</strong><small>Create your applicant profile</small></span></div><span className="step-arrow" aria-hidden="true">→</span>
        <div><span className="step-number">02</span><span><strong>Apply &amp; pay</strong><small>Submit shipment details and evidence</small></span></div><span className="step-arrow" aria-hidden="true">→</span>
        <div><span className="step-number">03</span><span><strong>Get certified</strong><small>Track review and retrieve certificate</small></span></div>
      </section>
      <section className="services-section" id="services">
        <div className="section-heading"><p className="eyebrow">WHAT FPIS DOES</p><h2>One accountable path<br />from inspection to export.</h2></div>
        <div className="service-list">
          <article><span className="service-index">A</span><div><h3>Quality inspection</h3><p>Quality, grade, packaging and weight checks against export standards.</p></div><span className="service-arrow">↗</span></article>
          <article><span className="service-index">B</span><div><h3>Fumigation &amp; disinfestation</h3><p>Documented treatment of produce, stores and export containers.</p></div><span className="service-arrow">↗</span></article>
          <article><span className="service-index">C</span><div><h3>Digital certification</h3><p>Issued certificates with unique verification codes and scannable QR.</p></div><span className="service-arrow">↗</span></article>
        </div>
      </section>
      <section className="mandate-section" id="mandate" aria-labelledby="mandate-heading">
        <div className="section-heading"><p className="eyebrow">VISION &amp; MISSION</p><h2 id="mandate-heading">What the service is<br />accountable for.</h2><p className="section-note">FPIS is a uniformed regulatory agency under the Federal Ministry of Industry, Trade and Investment, established by the Produce Enforcement of Export Standard Law.</p><div className="mandate-more"><Link className="button button-outline button-small" href="/information/vision-mission-mandate">Full mandate <span aria-hidden="true">→</span></Link><Link className="text-link" href="/information/about-us">About the service</Link></div></div>
        <div className="mandate-cards">
          <article className="mandate-card"><h3>Vision <span>01</span></h3><p>{VISION}</p></article>
          <article className="mandate-card"><h3>Mission <span>02</span></h3><p>{MISSION}</p></article>
          <article className="mandate-card mandate-card-wide"><h3>Statutory mandate <span>03</span></h3><ul className="info-list">{MANDATE.map((item) => <li key={item}>{item}</li>)}</ul></article>
        </div>
      </section>
    </>
  );
}