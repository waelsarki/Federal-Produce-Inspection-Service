"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { checkVerificationCode, formatVerificationCode } from "@/lib/certificate-code";
import { resolveCertificateData } from "@/lib/certificate-fields";
import { ExportApplication, readApplicant, readApplications } from "@/lib/portal";

type Outcome =
  | { kind: "idle" }
  | { kind: "empty" }
  | { kind: "malformed"; reason: "length" | "alphabet" | "check"; normalized: string }
  | { kind: "not-issued"; code: string }
  | { kind: "unknown"; code: string }
  | {
      kind: "valid";
      code: string;
      application: ExportApplication;
      summary: { label: string; value: string }[];
    };

/**
 * Certificate verification.
 *
 * The lookup is by the certificate's verification code, which is the only thing
 * a third party can be assumed to have: the number printed under the barcode.
 * The register reference is accepted as a convenience, but it is derived from
 * the application number, so it identifies a record without evidencing that the
 * Service issued the certificate - which is the distinction the page draws.
 */
export default function VerifyPage() {
  const [query, setQuery] = useState("");
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw = query.trim();
    if (!raw) {
      setOutcome({ kind: "empty" });
      return;
    }

    const applications = readApplications();
    const applicant = readApplicant();

    // A verification code is tried first, because that is what the barcode
    // carries and the only value that means anything as proof.
    const check = checkVerificationCode(raw);
    if (check.ok) {
      const match = applications.find(
        (entry) => (entry.certificateData?.verificationCode ?? "").toUpperCase() === check.code,
      );
      if (!match) {
        setOutcome({ kind: "unknown", code: check.code });
        return;
      }
      if (!match.certificateData?.issuedAt) {
        setOutcome({ kind: "not-issued", code: check.code });
        return;
      }
      const values = resolveCertificateData(match, {
        organization: applicant?.organization,
        address: applicant?.address,
      });
      setOutcome({
        kind: "valid",
        code: check.code,
        application: match,
        summary: [
          { label: "Reference", value: match.applicationNumber },
          { label: "Exporter", value: values.exporterOrganization || "Not recorded" },
          { label: "Commodity", value: values.goodsDescription || "Not recorded" },
          { label: "Destination", value: values.destination || "Not recorded" },
          { label: "Gross weight", value: values.grossWeight ? `${values.grossWeight} kg` : "Not recorded" },
          { label: "Net weight", value: values.netWeight ? `${values.netWeight} kg` : "Not recorded" },
          { label: "Grade", value: values.grade || "Not recorded" },
          { label: "Issued on", value: new Date(match.certificateData.issuedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) },
        ],
      });
      return;
    }

    // Fall back to the register reference, and say plainly what that proves.
    const reference = applications.find(
      (entry) => entry.applicationNumber.toLowerCase() === raw.toLowerCase(),
    );
    if (reference) {
      setOutcome({
        kind: "valid",
        code: "",
        application: reference,
        summary: [
          { label: "Reference", value: reference.applicationNumber },
          { label: "Commodity", value: reference.commodity || "Not recorded" },
          { label: "Destination", value: reference.destination || "Not recorded" },
          { label: "Status", value: reference.status },
        ],
      });
      return;
    }

    setOutcome({ kind: "malformed", reason: check.reason === "empty" ? "length" : check.reason, normalized: raw });
  }

  const malformed = outcome.kind === "malformed";

  return (
    <>
      <div className="prototype-notice"><strong>Development preview</strong><span>Verification reads records held in this browser. The register of issued certificates is not connected, so a valid code proves only that this browser holds a matching record.</span></div>
      <section className="login-page">
        <div className="login-heading">
          <p className="eyebrow">APPLICANT PORTAL</p>
          <h1>Verify <em>a certificate.</em></h1>
          <p>Scan the barcode on the certificate, or type the code printed under it, to check that the Service issued it.</p>
          <div className="form-aside"><span className="aside-mark">i</span><span>Every issued certificate carries a 17-character verification code. Each certificate has its own, and a code that is not recognised is reported as a mistake rather than a match.</span></div>
        </div>
        <form className="form-panel login-panel" onSubmit={handleSubmit}>
          <div className="field"><label htmlFor="certificate-reference">Verification code</label><input id="certificate-reference" name="certificate-reference" value={query} onChange={(event) => setQuery(event.target.value)} required placeholder="XXXX-XXXX-XXXX-XXXX-C" autoComplete="off" spellCheck={false} /></div>
          <button className="button form-submit" type="submit">Verify code <span aria-hidden="true">&rarr;</span></button>
          {outcome.kind === "empty" ? (
            <p className="verify-outcome is-empty" role="alert">Enter the code printed under the barcode on the certificate.</p>
          ) : null}

          {malformed ? (
            <div className="verify-outcome is-invalid" role="alert">
              <XCircle size={20} aria-hidden="true" />
              <div>
                <strong>This is not a valid verification code</strong>
                <p>
                  {outcome.kind === "malformed" && outcome.reason === "check"
                    ? "The last character does not match the rest of the code, so this is most likely a typing or scanning mistake."
                    : outcome.kind === "malformed" && outcome.reason === "alphabet"
                      ? "The code contains characters the FPIS code does not use. Codes use the digits and the letters except I, L, O and U."
                      : "A verification code is 17 characters, printed in groups of four with a final check character."}
                </p>
              </div>
            </div>
          ) : null}

          {outcome.kind === "not-issued" ? (
            <div className="verify-outcome is-unissued" role="alert">
              <AlertTriangle size={20} aria-hidden="true" />
              <div>
                <strong>Code recognised, but the certificate is not issued</strong>
                <p>A record holds this code, but it has not been completed and issued, so there is no certificate to verify.</p>
              </div>
            </div>
          ) : null}

          {outcome.kind === "unknown" ? (
            <div className="verify-outcome is-invalid" role="alert">
              <XCircle size={20} aria-hidden="true" />
              <div>
                <strong>No certificate matches this code</strong>
                <p>The code is well formed, so it was read correctly, but no issued certificate in this browser carries it.</p>
              </div>
            </div>
          ) : null}

          {outcome.kind === "valid" ? (
            <div className="verify-outcome is-valid" role="status">
              <CheckCircle2 size={20} aria-hidden="true" />
              <div>
                <strong>{outcome.code ? "Certificate code recognised" : "Application record found"}</strong>
                {outcome.code ? <p className="verify-code-readback">{formatVerificationCode(outcome.code)}</p> : null}
                <dl className="info-definitions">
                  {outcome.summary.map((entry) => <div key={entry.label}><dt>{entry.label}</dt><dd>{entry.value}</dd></div>)}
                </dl>
                {outcome.code ? (
                  <p className="info-note"><strong>Not an official verification</strong><span>This browser holds a matching record. The Service&apos;s register of issued certificates is not connected to this prototype, so this cannot confirm authenticity with FPIS.</span></p>
                ) : (
                  <p className="info-note"><strong>Matched on the reference, not the code</strong><span>The register reference is derived from the application number, so it locates the record but does not evidence that the Service issued the certificate. Verify the code printed under the barcode for that.</span></p>
                )}
              </div>
            </div>
          ) : null}

          <p className="form-footnote">Only authorized FPIS staff can verify certificate records.</p>
        </form>
      </section>
    </>
  );
}