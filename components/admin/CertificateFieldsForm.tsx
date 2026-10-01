"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  CERTIFICATE_INPUT_FIELDS,
  CERTIFICATE_SECTIONS,
  issuedAtFor,
  missingRequiredFields,
  resolveCertificateData,
  type CertificateInputField,
} from "@/lib/certificate-fields";
import type { CertificateFieldConfig } from "@/lib/certificate-config";
import type { ApplicantProfile, ExportApplication } from "@/lib/portal";

/**
 * Lets a staff member complete the values only an inspector knows, and save
 * them against the application. Fields already supplied by the applicant are
 * shown so they can be corrected, but nothing is overwritten on the application
 * itself - the values land in `certificateData`.
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
  const [values, setValues] = useState<Record<string, string>>(() => {
    const resolved = resolveCertificateData(application, {
      organization: applicant?.organization,
      address: applicant?.address,
    });
    const seed: Record<string, string> = {};
    for (const field of CERTIFICATE_INPUT_FIELDS) seed[field.id] = (resolved[field.id] ?? "").trim();
    return seed;
  });
  const [saved, setSaved] = useState(false);

  const hidden = new Set(
    config.filter((entry) => !entry.enabled).map((entry) => entry.id),
  );
  const visible = CERTIFICATE_INPUT_FIELDS.filter((field) => !hidden.has(field.certificateField));
  const missing = missingRequiredFields(application, config, {
    organization: applicant?.organization,
    address: applicant?.address,
  });

  function save() {
    const next: ExportApplication = {
      ...application,
      certificateData: {
        ...application.certificateData,
        ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])),
        // Fixed on first save so the printed issue date does not drift.
        issuedAt: application.certificateData?.issuedAt ?? new Date().toISOString(),
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
            Values the applicant supplied are pre-filled. Anything the Service measures or observes is entered here and
            saved against this application.
          </p>
        </div>
        <span className={`cert-completeness ${missing.length === 0 ? "is-complete" : ""}`}>
          {missing.length === 0
            ? <><CheckCircle2 size={13} aria-hidden="true" /> All required fields complete</>
            : <><AlertTriangle size={13} aria-hidden="true" /> {missing.length} required {missing.length === 1 ? "field" : "fields"} still blank</>}
        </span>
      </div>

      {CERTIFICATE_SECTIONS.map((section) => {
        const fields = visible.filter((field) => field.section === section.id);
        if (fields.length === 0) return null;
        return (
          <fieldset className="cert-fields-group" key={section.id}>
            <legend>{section.label}</legend>
            <div className="cert-fields-grid">
              {fields.map((field) => (
                <Field key={field.id} field={field} value={values[field.id] ?? ""} disabled={!canIssue} onChange={(value) => {
                  setSaved(false);
                  setValues((current) => ({ ...current, [field.id]: value }));
                }} />
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
        Prototype only: these values live in this browser's local storage. Issuing date is fixed at{" "}
        {issuedAtFor(application, new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}.
      </p>
    </section>
  );
}

function Field({
  field,
  value,
  disabled,
  onChange,
}: {
  field: CertificateInputField;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  const id = `cert-field-${field.id}`;
  const blank = !value.trim();
  const type = field.kind === "date" ? "date" : field.kind === "number" ? "number" : "text";
  return (
    <div className={`field cert-field ${blank && field.required ? "is-blank" : ""}`}>
      <label htmlFor={id}>
        {field.label}
        {field.required ? <span aria-hidden="true" className="cert-field-required"> *</span> : null}
      </label>
      {field.kind === "long" ? (
        <textarea id={id} rows={2} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input id={id} type={type} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
      )}
      {blank && field.required ? <small className="cert-field-hint">Required</small> : null}
    </div>
  );
}
