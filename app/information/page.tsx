import type { Metadata } from "next";
import Link from "next/link";
import { INFO_GROUPS, getInfoPage } from "@/lib/fpis-content";

export const metadata: Metadata = {
  title: "Information | FPIS",
  description: "About the service, export procedures, statutory functions, FPIS units and publications.",
};

export default function InformationIndexPage() {
  return (
    <section className="quicklinks-page">
      <div className="quicklinks-top">
        <div>
          <p className="eyebrow">REFERENCE LIBRARY</p>
          <h1>Information <em>centre.</em></h1>
          <p>Everything published by the Federal Produce Inspection Service — the agency, export procedures, statutory functions, operational units and publications — available here without leaving this portal.</p>
        </div>
        <Link className="button button-outline" href="/">Return to overview</Link>
      </div>
      <div className="quicklinks-grid">
        {INFO_GROUPS.map((group) => (
          <article className="quicklink-group" key={group.label}>
            <h2>{group.label}</h2>
            <ul>
              {group.slugs.map((slug) => {
                const page = getInfoPage(slug);
                if (!page) return null;
                return (
                  <li key={slug}>
                    <Link className="quicklink" href={`/information/${slug}`}>
                      <span className="quicklink-label">{page.title}<i aria-hidden="true">↗</i></span>
                      <small>{page.summary}</small>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
