"use client";

import { useEffect, useState } from "react";
import { CertificateFieldConfig, certificateFieldLabel, DEFAULT_CERTIFICATE_FIELDS, readCertificateConfig, saveCertificateConfig } from "@/lib/certificate-config";

export default function CertificateTemplateManager() {
  const [fields, setFields] = useState<CertificateFieldConfig[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => setFields(readCertificateConfig()), []);

  function updateField(id: CertificateFieldConfig["id"], changes: Partial<CertificateFieldConfig>) {
    setFields((current) => current.map((field) => field.id === id ? { ...field, ...changes } : field));
    setMessage("");
  }

  function save() {
    setFields(saveCertificateConfig(fields));
    setMessage("Certificate template settings saved for this browser.");
  }

  function reset() {
    setFields(saveCertificateConfig(DEFAULT_CERTIFICATE_FIELDS));
    setMessage("Certificate template restored to the FPIS default.");
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <div><h2>Certificate template</h2><p>Configure the fields shown on the generated FPIS certificate. Hidden fields remain stored on the application.</p></div>
        <span className="admin-count">{fields.filter((field) => field.enabled).length} visible</span>
      </div>
      <div className="template-field-list">
        {fields.map((field) => (
          <div className="template-field-row" key={field.id}>
            <label className="permission-row">
              <input type="checkbox" checked={field.enabled} onChange={(event) => updateField(field.id, { enabled: event.target.checked })} />
              <span><strong>{field.label}</strong><small>{field.section} · {field.id}</small></span>
            </label>
            <input aria-label={`Certificate label for ${field.id}`} value={field.label} onChange={(event) => updateField(field.id, { label: event.target.value })} maxLength={90} />
          </div>
        ))}
      </div>
      <div className="admin-panel-actions"><button className="admin-button" type="button" onClick={reset}>Reset defaults</button><button className="button admin-button" type="button" onClick={save}>Save template</button></div>
      {message ? <p className="admin-message" role="status">{message}</p> : null}
    </section>
  );
}