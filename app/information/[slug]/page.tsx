import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { INFO_GROUPS, INFO_PAGES, InfoBlock, getInfoPage } from "@/lib/fpis-content";

export function generateStaticParams() {
  return INFO_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getInfoPage(slug);
  if (!page) return { title: "Information | FPIS" };
  return { title: `${page.title} | FPIS`, description: page.summary };
}

function renderBlock(block: InfoBlock, key: number) {
  switch (block.kind) {
    case "paragraph":
      return <p className="info-text" key={key}>{block.text}</p>;
    case "heading":
      return <h2 className="info-heading" key={key}>{block.text}</h2>;
    case "list": {
      const className = block.ordered ? "info-list info-list-ordered" : "info-list";
      return <ul className={className} key={key}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
    }
    case "steps":
      return (
        <ol className="info-steps" key={key}>
          {block.items.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.text}</span>
            </li>
          ))}
        </ol>
      );
    case "definitions":
      return (
        <dl className="info-definitions" key={key}>
          {block.items.map((item) => (
            <div key={item.term}>
              <dt>{item.term}</dt>
              <dd>{item.meaning}</dd>
            </div>
          ))}
        </dl>
      );
    case "table":
      return (
        <div className="info-table-wrap" key={key}>
          <table className="info-table">
            <thead><tr>{block.head.map((cell) => <th key={cell}>{cell}</th>)}</tr></thead>
            <tbody>{block.rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => <td key={index}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    case "note":
      return <p className="info-note" key={key}><strong>{block.label}</strong><span>{block.text}</span></p>;
    case "empty":
      return (
        <div className="empty-state" key={key}>
          <span className="empty-symbol">—</span>
          <h2>{block.title}</h2>
          <p>{block.text}</p>
        </div>
      );
    case "links":
      return (
        <div className="info-links" key={key}>
          {block.items.map((item) => (
            <Link className="info-link-card" href={item.href} key={item.label}>
              <strong>{item.label}</strong>
              <span>{item.note}</span>
            </Link>
          ))}
        </div>
      );
  }
}

export default async function InformationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getInfoPage(slug);
  if (!page) notFound();

  const group = INFO_GROUPS.find((entry) => entry.label === page.group);
  const siblings = (group?.slugs ?? []).map((entry) => getInfoPage(entry)).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const position = siblings.findIndex((entry) => entry.slug === page.slug);
  const previous = position > 0 ? siblings[position - 1] : undefined;
  const next = position < siblings.length - 1 ? siblings[position + 1] : undefined;

  return (
    <section className="info-page">
      <div className="info-header">
        <div className="info-intro">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="info-summary">{page.summary}</p>
        </div>
        {siblings.length > 1 ? (
          <nav className="info-group-nav" aria-label={`${page.group} sections`}>
            <span>{page.group}</span>
            <ul>
              {siblings.map((entry) => (
                <li key={entry.slug}>
                  <Link className={entry.slug === page.slug ? "is-current" : undefined} href={`/information/${entry.slug}`}>{entry.title}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
      <div className="info-body">{page.blocks.map(renderBlock)}</div>
      {previous || next ? (
        <nav className="info-pagination" aria-label="Section navigation">
          {previous ? <Link className="text-link" href={`/information/${previous.slug}`}>← {previous.title}</Link> : <span />}
          {next ? <Link className="text-link" href={`/information/${next.slug}`}>{next.title} →</Link> : <span />}
        </nav>
      ) : null}
    </section>
  );
}
