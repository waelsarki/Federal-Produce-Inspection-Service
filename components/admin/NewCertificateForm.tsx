"use client";

import { FormEvent, useMemo, useState } from "react";
import { AlertTriangle, FilePlus2, X } from "lucide-react";
import {
  CERTIFICATE_SECTIONS,
  configuredCertificateInputs,
  type ConfiguredCertificateInput,
} from "@/lib/certificate-fields";
import type { CertificateFieldConfig } from "@/lib/certificate-config";
import type { ExportApplication } from "@/lib/portal";

/**
 * Raises a certificate that has no applicant submission behind it.
 *
 * Every other route into a certificate starts from an application the applicant
 * filled in. This one starts from nothing: a walk-in exporter at the counter, or
 * a record rebuilt after a data loss, where waiting for a submission would mean
 * the officer retyped the whole certificate into a form that then refused to
 * issue it.
 *
 * Which fields are asked for is not written down here. It comes from the
 * certificate template configured under "Configure certificate", through the same
 * configuredCertificateInputs() the completion form uses, so switching a field
 * off or renaming it there changes this form with no edit to this file.
 *
 * The submission goes to the server rather than to browser storage, because a
 * certificate is an official record: it has to outlive the browser it was typed
 * in, and creating one has to leave a trace in the audit trail.
 */
export default function NewCertificateForm({
  config,
  onCreated,
  onCancel,
}: {
  config: CertificateFieldConfig[];
  onCreated: (application: ExportApplication) => void;
  onCancel: () => void;
}) {
  const inputs = useMemo(() => configuredCertificateInputs(config), [config]);

  const [values, setValues] = useState<Record<string, string>>({});
  // Short label the queue shows next to the reference. The long description is
  // a sentence, which reads badly in a one-line list, so it is asked for
  // separately and falls back to the description.
  const [commodity, setCommodity] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const filled = inputs.filter((field) => (values[field.id] ?? "").trim()).length;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ commodity, certificateData: values }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "The certificate could not be created.");
        setBusy(false);
        return;
      }
      onCreated(payload.data as ExportApplication);
    } catch {
      setError("The server could not be reached, so nothing was created.");
      setBusy(false);
    }
  }
  return (
    <section className="new-cert" aria-labelledby="new-cert-heading">
      <div className="new-cert-head">
        <div>
          <p className="eyebrow">NEW CERTIFICATE</p>
          <h2 id="new-cert-heading">Create a certificate at the counter</h2>
          <p className="panel-description">
            For an exporter with no application on file. Enter the certificate in one pass; it is saved to the
            record and written to the audit trail under your name. Only the exporter, the consignee and the
            commodity description are needed to create it - the rest can be completed on the certificate page.
          </p>
        </div>
        <button className="new-cert-close" type="button" onClick={onCancel} aria-label="Close the new certificate form">
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={submit}>
        <div className="new-cert-intake">
          <div className="field">
            <label htmlFor="new-cert-commodity">
              Commodity<span aria-hidden="true" className="cert-field-required"> *</span>
            </label>
            <input
              id="new-cert-commodity"
              value={commodity}
              onChange={(event) => setCommodity(event.target.value)}
              placeholder="Short label for the queue, e.g. Soya beans"
              maxLength={120}
              required
            />
            <small className="cert-field-hint">Required. Used to identify the certificate in lists and search.</small>
          </div>
          <span className="new-cert-progress" aria-live="polite">
            {filled} of {inputs.length} certificate {inputs.length === 1 ? "field" : "fields"} entered
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
                  <NewField
                    key={field.id}
                    field={field}
                    value={values[field.id] ?? ""}
                    onChange={(value) => setValues((current) => ({ ...current, [field.id]: value }))}
                  />
                ))}
              </div>
            </fieldset>
          );
        })}

        {error ? <p className="admin-message admin-message-error" role="alert">{error}</p> : null}

        <div className="cert-fields-actions">
          <button className="button button-small admin-button-primary" type="submit" disabled={busy}>
            <FilePlus2 size={14} aria-hidden="true" /> {busy ? "Creating…" : "Create certificate"}
          </button>
          <button className="button button-small button-outline" type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

function NewField({
  field,
  value,
  onChange,
}: {
  field: ConfiguredCertificateInput;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `new-cert-${field.id}`;
  const type = field.kind === "date" ? "date" : field.kind === "number" ? "number" : "text";
  // Same rule as the completion form: one value per printable field takes the
  // template's label, several keep their own under it.
  const caption = !field.isOnlyInput ? <small className="cert-field-group">{field.groupLabel}</small> : null;
  const blank = field.required && !value.trim();
  return (
    <div className={`field cert-field ${blank ? "is-blank" : ""}`}>
      <label htmlFor={id}>
        {field.label}
        {field.required ? <span aria-hidden="true" className="cert-field-required"> *</span> : null}
      </label>
      {caption}
      {field.kind === "long" ? (
        <textarea id={id} rows={2} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
      {blank ? (
        <small className="cert-field-hint">
          <AlertTriangle size={11} aria-hidden="true" /> Needed to issue, not to create
        </small>
      ) : null}
    </div>
  );
}