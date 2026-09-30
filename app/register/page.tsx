"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { APPLICANT_KEY, INTAKE_KEY, ApplicantProfile, hashPassword, readApplicant } from "@/lib/portal";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email")).trim().toLowerCase();
    if (readApplicant()?.email === email) {
      setError("An account with this email already exists. Sign in to continue.");
      setBusy(false);
      return;
    }

    const profile: ApplicantProfile = {
      id: crypto.randomUUID(),
      fullName: String(data.get("fullName")).trim(),
      organization: String(data.get("organization")).trim(),
      email,
      phoneNumber: String(data.get("phoneNumber")).trim(),
      passwordHash: await hashPassword(String(data.get("password"))),
    };
    localStorage.setItem(APPLICANT_KEY, JSON.stringify(profile));
    sessionStorage.setItem(INTAKE_KEY, profile.id);
    router.push("/apply");
  }

  return (
    <>
      <div className="prototype-notice"><strong>Development preview</strong><span>Demo data is stored in this browser only. Accounts and applications are not secure or permanent.</span></div>
      <section className="form-page">
        <div className="form-intro"><p className="eyebrow">APPLICANT PORTAL / 01</p><h1>Start with your<br /><em>business profile.</em></h1><p>Register once, then continue directly to your export application. Sign in later to track progress and access issued certificates.</p><div className="form-aside"><span className="aside-mark">i</span><span>Registration takes you straight to the application. No sign-in is required between these steps.</span></div></div>
        <form className="form-panel" onSubmit={handleSubmit}>
          <div className="form-heading"><span>01 / PROFILE</span><span>All fields required</span></div>
          <div className="field-grid">
            <div className="field field-wide"><label htmlFor="fullName">Contact person&apos;s full name</label><input id="fullName" name="fullName" autoComplete="name" maxLength={120} required placeholder="e.g. Ada Okafor" /></div>
            <div className="field field-wide"><label htmlFor="organization">Business or exporter name</label><input id="organization" name="organization" autoComplete="organization" maxLength={180} required placeholder="Registered exporter or business name" /></div>
            <div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" maxLength={254} required placeholder="name@company.com" /></div>
            <div className="field"><label htmlFor="phoneNumber">Mobile number</label><input id="phoneNumber" name="phoneNumber" type="tel" autoComplete="tel" maxLength={30} required placeholder="+234" /></div>
            <div className="field field-wide"><label htmlFor="password">Create password (12 characters minimum)</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={100} required placeholder="At least 12 characters" /></div>
          </div>
          {error && <p className="validation-summary" role="alert">{error}</p>}
          <button className="button form-submit" type="submit" disabled={busy}>{busy ? "Creating profile…" : <>Continue to application <span aria-hidden="true">→</span></>}</button>
          <p className="form-footnote">Already registered? <Link href="/login">Sign in to your dashboard</Link></p>
        </form>
      </section>
    </>
  );
}