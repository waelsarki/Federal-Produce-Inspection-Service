import Link from "next/link";
import type { Metadata } from "next";
import QuickLinkItem from "@/components/QuickLinkItem";
import { FPIS_ESERVICES, FPIS_QUICK_LINKS, FPIS_QUICK_LINK_GROUPS } from "@/lib/quicklinks";

export const metadata: Metadata = {
  title: "Quick links | FPIS",
  description: "Every service, procedure, publication and unit of the Federal Produce Inspection Service.",
};

export default function QuickLinksPage() {
  return (
    <>
      <section className="quicklinks-page">
        <div className="quicklinks-top"><div><p className="eyebrow">SITE DIRECTORY</p><h1>Quick <em>links.</em></h1><p>All {FPIS_QUICK_LINKS.length} sections of the Federal Produce Inspection Service portal, grouped as on the agency's website. Every link opens a page inside this portal.</p></div><Link className="button button-outline" href="/information">Open the information centre</Link></div>
        <div className="eservice-strip">{FPIS_ESERVICES.map((link) => <article className="eservice-card" key={link.label}><span className="eservice-index">e</span><QuickLinkItem link={link} showDescription /></article>)}</div>
        <div className="quicklinks-grid">{FPIS_QUICK_LINK_GROUPS.map((group) => <article className="quicklink-group" key={group.label}><h2>{group.label}</h2><ul>{group.links.map((link) => <li key={link.label}><QuickLinkItem link={link} /></li>)}</ul>{group.sections.map((section) => <div className="quicklink-subgroup" key={section.label}><h3>{section.label}</h3><ul>{section.links.map((link) => <li key={link.label}><QuickLinkItem link={link} /></li>)}</ul></div>)}</article>)}</div>
        <p className="quicklinks-note">Looking to apply through this portal instead? <Link href="/register">Register and start an application</Link> or <Link href="/login">sign in to your applicant dashboard</Link>.</p>
      </section>
    </>
  );
}
