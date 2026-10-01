"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Award, CheckCircle2, CircleAlert, Plus, Search } from "lucide-react";
import {
  configuredCertificateInputs,
  missingRequiredFields,
  resolveCertificateData,
} from "@/lib/certificate-fields";
import type { CertificateFieldConfig } from "@/lib/certificate-config";
import { createCertificateDraft, type ApplicantProfile, type ExportApplication } from "@/lib/portal";

type Filter = "all" | "incomplete" | "ready" | "issued";

const FILTERS: [Filter, string][] = [
  ["all", "All"],
  ["incomplete", "Needs fields"],
  ["ready", "Ready"],
  ["issued", "Issued"],
];

/**
 * Creates new certificates and moves between the ones already made.
 *
 * The certificate page itself shows a single sheet, so without this an officer
 * who had issued twenty certificates had no way back to the other nineteen
 * except editing the URL. This panel is the way out: create another, or search
 * and filter the list to find the one to reopen.
 *
 * Completeness is judged against the configured template, exactly as
 * CertificateGenerator does, so a field switched off stops counting here too.
 */
export default function CertificateSwitcher({
  applications,
  current,
  config,
  applicant,
  canIssue,
}: {
  applications: ExportApplication[];
  current: string;
  config: CertificateFieldConfig[];
  applicant: ApplicantProfile | null;
  canIssue: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const exporter = { organization: applicant?.organization, address: applicant?.address };

  // The template is the same for every row, so resolve the inputs it asks for
  // once rather than once per certificate.
  const inputs = useMemo(() => configuredCertificateInputs(config), [config]);

  const rows = useMemo(() => applications.map((application) => {
    const values = resolveCertificateData(application, exporter);
    const missing = missingRequiredFields(application, config, exporter);
    return {
      application,
      missing: missing.length,
      ready: missing.length === 0,
      issued: Boolean(application.certificateData?.issuedAt),
      filled: inputs.filter((field) => (values[field.id] ?? "").trim()).length,
      total: inputs.length,
    };
  }), [applications, config, inputs, exporter.organization, exporter.address]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows
      .filter((row) => {
        if (filter === "incomplete" && row.ready) return false;
        if (filter === "ready" && !row.ready) return false;
        if (filter === "issued" && !row.issued) return false;
        if (!needle) return true;
        const a = row.application;
        return [a.applicationNumber, a.commodity, a.consigneeName, a.destination]
          .some((value) => (value ?? "").toLowerCase().includes(needle));
      })
      // Newest reference first, so the most recently created certificate is the
      // easiest to find again.
      .sort((a, b) => b.application.applicationNumber.localeCompare(a.application.applicationNumber));
  }, [rows, query, filter]);

  const [browse, setBrowse] = useState(false);

  /**
   * Opening a certificate means adding a blank application record and going to
   * its page to complete the fields, so the new reference is generated here and
   * the router moves straight to it. Unlimited: each press takes the next free
   * number from nextApplicationNumber.
   */
  function createNew() {
    const draft = createCertificateDraft();
    router.push(`/certificate/${draft.applicationNumber}`);
  }

  return (
    <section className="cert-switcher" aria-label="Certificate list">
      <div className="generate-toolbar">
        {canIssue ? (
          <button className="button admin-button-primary" type="button" onClick={createNew}>
            <Plus size={15} aria-hidden="true" /> New certificate
          </button>
        ) : null}
        <button
          type="button"
          className="button button-outline button-small"
          aria-expanded={browse}
          onClick={() => setBrowse((open) => !open)}
        >
          {browse ? "Hide certificates" : `Browse certificates (${applications.length})`}
        </button>
      </div>

      {!browse ? null : (
        <>
          <div className="generate-toolbar">
            <div className="generate-search">
              <Search size={15} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search reference, commodity, consignee or destination"
                aria-label="Search certificates"
              />
            </div>
            <div className="generate-filters" role="group" aria-label="Filter certificates">
              {FILTERS.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`generate-filter ${filter === id ? "is-active" : ""}`}
                  aria-pressed={filter === id}
                  onClick={() => setFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="empty-state">
              <span className="empty-symbol">—</span>
              <h2>No matches</h2>
              <p>
                No certificate matches that search{filter === "all" ? "" : " in this filter"}.
              </p>
            </div>
          ) : (
            <div className="generate-list">
              {visible.map(({ application, missing, ready: isReady, filled, total }) => {
                const isCurrent = application.applicationNumber === current;
                return (
                  <article className="generate-card" key={application.applicationNumber}>
                    <div className="generate-card-main">
                      <div className="generate-card-titles">
                        <strong>{application.applicationNumber}</strong>
                        <span className="status-pill">{application.status}</span>
                        {isCurrent ? <span className="cert-switcher-here">Open</span> : null}
                      </div>
                      <p className="generate-card-detail">
                        {application.commodity || "Agricultural produce"} · {application.destination || "no destination"} ·{" "}
                        {application.consigneeName || "no consignee"}
                      </p>
                      <p className="generate-card-progress">
                        {filled} of {total} printed {total === 1 ? "field" : "fields"} filled ·{" "}
                        {application.certificateData?.issuedAt ? "issued" : "not yet issued"}
                      </p>
                    </div>
                    <div className="generate-card-side">
                      {isReady ? (
                        <span className="generate-flag is-ready">
                          <CheckCircle2 size={14} aria-hidden="true" /> Ready to issue
                        </span>
                      ) : (
                        <span className="generate-flag">
                          <CircleAlert size={14} aria-hidden="true" />
                          {missing} {missing === 1 ? "field" : "fields"} to complete
                        </span>
                      )}
                      {isCurrent ? (
                        <span className="generate-card-here">Currently open</span>
                      ) : (
                        <Link
                          className="button button-small admin-button-primary"
                          href={`/certificate/${application.applicationNumber}`}
                        >
                          <Award size={14} aria-hidden="true" /> Open
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
