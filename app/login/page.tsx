"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { APPLICANT_KEY, AUTH_KEY, ApplicantProfile, hashPassword, readApplicant } from "@/lib/portal";
import PasswordField from "@/components/PasswordField";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const applicant = readApplicant() as ApplicantProfile | null;
    const email = String(data.get("email")).trim().toLowerCase();
    const passwordHash = await hashPassword(String(data.get("password")));
    if (!applicant || applicant.email !== email || applicant.passwordHash !== passwordHash) {
      setError("The email or password is incorrect. This prototype stores one applicant profile in this browser.");
      return;
    }
    sessionStorage.setItem(AUTH_KEY, applicant.id);
    router.push("/dashboard");
  }

  return (
    <>
      <div className="prototype-notice"><strong>Development preview</strong><span>Applicant accounts are stored in this browser only and are not production-secure.</span></div>
      <section className="login-page"><div className="login-heading"><p className="eyebrow">APPLICANT PORTAL</p><h1>Welcome <em>back.</em></h1><p>Sign in to find your application by its reference number and track its review.</p></div><form className="form-panel login-panel" onSubmit={handleSubmit}><div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required placeholder="name@company.com" /></div><PasswordField id="password" name="password" label="Password" autoComplete="current-password" placeholder="Your password" />{error && <p className="validation-summary" role="alert">{error}</p>}<button className="button form-submit" type="submit">Sign in <span aria-hidden="true">→</span></button><p className="form-footnote">New to FPIS? <Link href="/register">Register and start an application</Link></p></form></section>
    </>
  );
}