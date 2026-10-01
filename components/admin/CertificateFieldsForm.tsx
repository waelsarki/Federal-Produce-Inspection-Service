"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  CERTIFICATE_SECTIONS,
  configuredCertificateInputs,
  issuanceFor,
  issuedAtFor,
  missingRequiredFields,
  resolveCertificateData,
  type ConfiguredCertificateInput,
} from "@/lib/certificate-fields";
import type { CertificateFieldConfig } from "@/lib/certificate-config";
import { ApplicantProfile, ExportApplication, readApplicant, readApplications } from "@/lib/portal";

/**
 * Lets a staff member complete the values only an inspector knows, and save
 * them against the application. Fields already supplied by the applicant are
 * shown so they can be corrected, but nothing is overwritten on the application
 * itself - the values land in `certificateData`.
 *
 * What gets asked for is not written down here. It comes from the certificate
 * template configured under "Configure certificate", so switching a field off
 * or renaming it there changes this form with no edit to this file.
 */
export default function CertificateFieldsForm({
  application,
  config,
  applicant,
  canIssue,
  onSave,
}: {
  application: ExportApplication;
  config: CertificateFieldConfig[];
  applicant: ApplicantProfile | null;
  canIssue: boolean;
  onSave: (next: ExportApplication) => void;
}) {
  const exporter = { organization: applicant?.organization, address: applicant?.address };

  // The template decides which inputs exist, in what order, and what they are
  // called, so a field disabled in the template is never rendered here.
  const inputs = useMemo(() => configuredCertificateInputs(config), [config]);

  const [values, setValues] = useState<Record<string, string>>(() => {
    const resolved = resolveCertificateData(application, exporter);
    const seed: Record<string, string> = {};
    for (const field of inputs) seed[field.id] = (resolved[field.id] ?? "").trim();
    return seed;
  });
  const [saved, setSaved] = useState(false);

  // Counted against what the officer can still see, so a field removed from
  // the template cannot leave the form permanently "incomplete".
  const missing = missingRequiredFields(application, config, exporter);
  const missingIds = new Set(missing.map((field) => field.id));

  function save() {
    const next: ExportApplication = {
      ...application,
      certificateData: {
        ...application.certificateData,
        ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])),
        // Issue date and verification code are fixed together on the first
        // save, so a corrected re-save or a reprint keeps both.
        ...issuanceFor(application, readApplications()),
      },
    };
    onSave(next);
    setSaved(true);
  }

  return (
    <section className="cert-fields" aria-labelledby="cert-fields-heading">
      <div className="cert-fields-head">
        <div>
          <p className="eyebrow">COMPLETE BEFORE PRINTING</p>
          <h2 id="cert-fields-heading">Certificate fields</h2>
          <p className="panel-description">
            These are the fields the configured certificate prints. Values the applicant supplied are pre-filled;
            anything the Service measures or observes is entered here and saved against this application.
          </p>
        </div>
        <span className={`cert-completeness ${missing.length === 0 ? "is-complete" : ""}`}>
          {missing.length === 0
            ? <><CheckCircle2 size={13} aria-hidden="true" /> All required fields complete</>
            : <><AlertTriangle size={13} aria-hidden="true" /> {missing.length} required {missing.length === 1 ? "field" : "fields"} still blank</>}
        </span>
      </div>

      {CERTIFICATE_SECTIONS.map((section) => {
        const fields = inputs.filter((field) => field.section === section.id);
        if (fields.length === 0) return null;
        return (
          <fieldset className="cert-fields-group" key={section.id}>
            <legend>{section.label}</legend>
            <div className="cert-fields-grid">
              {fields.map((field) => (
                <Field
                  key={field.id}
                  field={field}
                  value={values[field.id] ?? ""}
                  blank={missingIds.has(field.id)}
                  disabled={!canIssue}
                  onChange={(value) => {
                    setSaved(false);
                    setValues((current) => ({ ...current, [field.id]: value }));
                  }}
                />
              ))}
            </div>
          </fieldset>
        );
      })}

      {canIssue ? (
        <div className="cert-fields-actions">
          <button className="button button-small" type="button" onClick={save}>Save certificate fields</button>
          {saved ? <p className="admin-message" role="status">Saved. The sheet below now uses these values.</p> : null}
        </div>
      ) : (
        <p className="panel-description">
          Your role cannot complete certificate fields. The values below are what the certificate is generated from.
        </p>
      )}

      <p className="cert-fields-note">
        Prototype only: these values live in this browser&apos;s local storage. Issuing date is fixed at{" "}
        {issuedAtFor(application, new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}.
      </p>
    </section>
  );
}

function Field({
  field,
  value,
  blank,
  disabled,
  onChange,
}: {
  field: ConfiguredCertificateInput;
  value: string;
  blank: boolean;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const id = `cert-field-${field.id}`;
  const type = field.kind === "date" ? "date" : field.kind === "number" ? "number" : "text";
  // A printable field captured by one value is simply renamed on the form, so
  // the template's label is the label. One captured by several values keeps the
  // template's label as a small caption above its individual values.
  const caption = !field.isOnlyInput ? <small className="cert-field-group">{field.groupLabel}</small> : null;
  return (
    <div className={`field cert-field ${blank ? "is-blank" : ""}`}>
      <label htmlFor={id}>
        {field.label}
        {field.required ? <span aria-hidden="true" className="cert-field-required"> *</span> : null}
      </label>
      {caption}
      {field.kind === "long" ? (
        <textarea id={id} rows={2} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input id={id} type={type} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
      )}
      {blank ? <small className="cert-field-hint">Required</small> : null}
    </div>
  );
}