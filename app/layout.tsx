import type { Metadata } from "next";
import Link from "next/link";
import { AtSign, Camera, Play, Share2 } from "lucide-react";
import QuickLinkItem from "@/components/QuickLinkItem";
import QuickLinksMenu from "@/components/QuickLinksMenu";
import { FPIS_ESERVICES, FPIS_FOOTER_LINK_GROUPS } from "@/lib/quicklinks";
import "./globals.css";
import "./hero-overrides.css";
import "./quicklinks.css";
import "./information.css";
import "./certificate.css";
import "./footer-overrides.css";

export const metadata: Metadata = {
  title: "FPIS | Produce Export Certification",
  description: "Apply for produce inspection and manage export certification with FPIS.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/" aria-label="FPIS home">
            <img className="brand-logo" src="/images/fpis-logo.png" alt="" />
            <span className="brand-copy"><strong>FPIS</strong><small>Federal Produce Inspection Service</small></span>
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            <ul>
              <li><Link href="/">Overview</Link></li>
              <li><a href="/#services">Services</a></li>
              <li><a href="/#process">Application process</a></li>
              <QuickLinksMenu />
            </ul>
          </nav>
          <div className="header-actions">
            <Link className="text-link" href="/login">Applicant login</Link>
            <Link className="button button-small" href="/register">Start an application <span aria-hidden="true">↗</span></Link>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-directory" aria-labelledby="quick-links-heading">
          <div className="directory-intro">
            <p className="eyebrow">FEDERAL PRODUCE INSPECTION SERVICE</p>
            <h2 id="quick-links-heading">Quick links</h2>
            <p>About the service, what it does, and the procedures, levies and standards that apply to your export.</p>
            <ul className="eservice-list">
              {FPIS_ESERVICES.map((link) => (
                <li key={link.label}><QuickLinkItem link={link} showDescription /></li>
              ))}
            </ul>
            <div className="directory-actions">
              <Link className="text-link" href="/information">Information centre →</Link>
              <Link className="text-link" href="/quick-links">View all quick links →</Link>
            </div>
          </div>
          <div className="directory-groups">
            {FPIS_FOOTER_LINK_GROUPS.map((group) => (
              <div className="directory-group" key={group.label}>
                <h3>{group.label}</h3>
                <ul>
                  {group.links.map((link) => <li key={link.label}><QuickLinkItem link={link} /></li>)}
                </ul>
                {group.sections.map((section) => (
                  <div className="directory-subsection" key={section.label}>
                    <h4>{section.label}</h4>
                    <ul>
                      {section.links.map((link) => <li key={link.label}><QuickLinkItem link={link} /></li>)}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="directory-contact">
            <div>
              <span>National Administrative Headquarter</span>
              <p>Federal Ministry of Industry, Trade &amp; Investment, Block C, Old Garki, Abuja, Federal Capital Territory.</p>
              <p><a href="tel:+2348033358961">+234 803 335 8961</a><a href="tel:+2348033352974">+234 803 335 2974</a><a href="mailto:info@fpis.com">info@fpis.com</a></p>
            </div>
            <div>
              <span>National Operational Headquarter</span>
              <p>No. 1, NEPA / PHCN Road, Ijora-Olopa, Lagos, Lagos State.</p>
              <p><a href="tel:+2348032324786">+234 803 232 4786</a><a href="mailto:info@fpis.com">info@fpis.com</a></p>
            </div>
            <div>
              <span>Guidance on applications</span>
              <p>Federal Produce Inspection Service, Ijora-Olopa, Lagos.</p>
              <p><a href="tel:+2348032324786">0803 232 4786</a><a href="tel:+2348023167442">0802 316 7442</a><a href="mailto:jimhya22@yahoo.com">jimhya22@yahoo.com</a></p>
            </div>
          </div>
        </footer>
        <footer className="site-footer">
          <span>Federal Produce Inspection Service</span>
          <span>Federal Ministry of Industry, Trade &amp; Investment</span>
          <span><Link href="/information">Information centre</Link></span>
          <span><Link href="/staff/login">Staff login</Link></span>
          <nav className="social-links" aria-label="FPIS social media">
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="FPIS on Facebook" title="Facebook"><Share2 aria-hidden="true" size={16} strokeWidth={1.8} /></a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="FPIS on Instagram" title="Instagram"><Camera aria-hidden="true" size={16} strokeWidth={1.8} /></a>
            <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer" aria-label="FPIS on LinkedIn" title="LinkedIn"><AtSign aria-hidden="true" size={16} strokeWidth={1.8} /></a>
            <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="FPIS on YouTube" title="YouTube"><Play aria-hidden="true" size={16} strokeWidth={1.8} /></a>
          </nav>
        </footer>
      </body>
    </html>
  );
}