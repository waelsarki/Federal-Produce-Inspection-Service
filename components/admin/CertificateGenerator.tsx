"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Award, CheckCircle2, CircleAlert, FileSearch, Search } from "lucide-react";
import { readCertificateConfig } from "@/lib/certificate-config";
import { configuredCertificateInputs, missingRequiredFields, resolveCertificateData } from "@/lib/certificate-fields";
import { ApplicantProfile, ExportApplication, readApplicant } from "@/lib/portal";

type Filter = "all" | "ready" | "incomplete";

/**
 * Certificate production. Each row is an application that could be certified;
 * picking one opens the generator for that reference, where the configured
 * fields are completed and the sheet is printed.
 *
 * The fields counted here are the ones the template actually prints, so a field
 * switched off under "Configure certificate" stops counting without any change
 * to this file.
 */
export default function CertificateGenerator({
  applications,
  canIssue,
}: {
  applications: ExportApplication[];
  canIssue: boolean;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  // Read once: the template is configuration rather than per-application state,
  // and re-reading it on every keystroke would recount the whole queue.
  const config = useMemo(() => readCertificateConfig(), []);
  const applicant = useMemo<ApplicantProfile | null>(() => readApplicant(), []);
  const exporter = { organization: applicant?.organization, address: applicant?.address };

  const rows = useMemo(() => applications.map((application) => {
    const values = resolveCertificateData(application, exporter);
    const missing = missingRequiredFields(application, config, exporter);
    return {
      application,
      missing,
      ready: missing.length === 0,
      // How much of the printed sheet the saved values already cover, so an
      // officer can tell "nothing entered" from "nearly finished".
      filled: configuredCertificateInputs(config).filter((field) => (values[field.id] ?? "").trim()).length,
      total: configuredCertificateInputs(config).length,
    };
  }), [applications, config, exporter.organization, exporter.address]);

  const ready = rows.filter((row) => row.ready).length;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows
      .filter((row) => {
        if (filter === "ready" && !row.ready) return false;
        if (filter === "incomplete" && row.ready) return false;
        if (!needle) return true;
        const { application } = row;
        return [application.applicationNumber, application.commodity, application.consigneeName, application.destination]
          .some((value) => (value ?? "").toLowerCase().includes(needle));
      })
      // Work that still needs doing first, then by reference so the order is
      // stable between renders rather than following the storage order.
      .sort((a, b) => Number(a.ready) - Number(b.ready)
        || a.application.applicationNumber.localeCompare(b.application.applicationNumber));
  }, [rows, query, filter]);

  return (
    <section className="staff-panel generated-panel staff-panel-flush">
      <div className="staff-panel-head">
        <div>
          <p className="eyebrow">CERTIFICATE PRODUCTION</p>
          <h3>Generate a certificate</h3>
        </div>
        <span className="panel-count">{ready} of {rows.length} ready</span>
      </div>

      <p className="panel-description">
        Pick an application to open its certificate. The generator asks for every field the configured template
        prints, with the answers the applicant already gave filled in, then shows the sheet to print or save as PDF.
      </p>

      {rows.length === 0 ? (
        <div className="empty-state staff-empty">
          <span className="empty-symbol">—</span>
          <h2>Nothing to certify</h2>
          <p>Applications appear here once they have been submitted, so there is nothing to generate a certificate from.</p>
        </div>
      ) : (
        <>
          <div className="generate-toolbar">
            <div className="generate-search">
              <Search size={15} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search reference, commodity, consignee or destination"
                aria-label="Search applications to certify"
              />
            </div>
            <div className="generate-filters" role="group" aria-label="Filter certificates">
              {([["all", "All"], ["incomplete", "Needs fields"], ["ready", "Ready"]] as [Filter, string][]).map(([id, label]) => (
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
            <div className="empty-state staff-empty">
              <span className="empty-symbol">—</span>
              <h2>No matches</h2>
              <p>No application matches that search{filter === "all" ? "" : " in this filter"}.</p>
            </div>
          ) : (
            <div className="generate-list">
              {visible.map(({ application, missing, ready: isReady, filled, total }) => (
                <article className="generate-card" key={application.applicationNumber}>
                  <div className="generate-card-main">
                    <div className="generate-card-titles">
                      <strong>{application.applicationNumber}</strong>
                      <span className="status-pill">{application.status}</span>
                    </div>
                    <p className="generate-card-detail">
                      {application.commodity || "Agricultural produce"} · {application.destination} · {application.consigneeName}
                    </p>
                    <p className="generate-card-progress">
                      {filled} of {total} printed {total === 1 ? "field" : "fields"} filled · {application.certificateData?.issuedAt ? "issued" : "not yet issued"}
                    </p>
                  </div>
                  <div className="generate-card-side">
                    {isReady ? (
                      <span className="generate-flag is-ready"><CheckCircle2 size={14} aria-hidden="true" /> Ready to issue</span>
                    ) : (
                      <span className="generate-flag">
                        <CircleAlert size={14} aria-hidden="true" />
                        {missing.length} {missing.length === 1 ? "field" : "fields"} to complete
                      </span>
                    )}
                    {canIssue ? (
                      <Link className="button button-small admin-button-primary" href={`/certificate/${application.applicationNumber}`}>
                        <Award size={14} aria-hidden="true" /> Generate certificate
                      </Link>
                    ) : (
                      <Link className="button button-small button-outline" href={`/certificate/${application.applicationNumber}`}>
                        <FileSearch size={14} aria-hidden="true" /> View certificate
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}