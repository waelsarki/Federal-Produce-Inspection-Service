"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { SUPERADMIN_EMAIL, authenticateStaff, seedSuperAdmin } from "@/lib/staff";
import PasswordField from "@/components/PasswordField";

export default function StaffLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [seededCount, setSeededCount] = useState<number | null>(null);

  useEffect(() => {
    setSeededCount(seedSuperAdmin().length);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    const account = await authenticateStaff(email, password);
    if (!account) {
      setError("The email or password is incorrect.");
      return;
    }
    router.push("/staff");
  }

  return (
    <>
      <div className="prototype-notice"><strong>Development preview</strong><span>Staff accounts are stored in this browser only and are not production authentication.</span></div>
      <section className="login-page">
        <div className="login-heading">
          <p className="eyebrow">STAFF PORTAL</p>
          <h1>Staff <em>sign in.</em></h1>
          <p>Sign in to reach the super admin console, the inspection review queue and official certificate issuance.</p>
          <div className="form-aside"><span className="aside-mark">i</span><span>Staff access is separate from an applicant account. Applicants sign in from the applicant dashboard.</span></div>
        </div>
        <form className="form-panel login-panel" onSubmit={handleSubmit}>
          <div className="form-heading"><span>STAFF ACCESS</span><span>{SUPERADMIN_EMAIL}</span></div>
          <div className="field"><label htmlFor="staff-email">Staff email address</label><input id="staff-email" name="email" type="email" autoComplete="username" maxLength={254} required placeholder="name@fpis.gov.ng" /></div>
          <PasswordField id="staff-password" name="password" label="Password" autoComplete="current-password" placeholder="Your password" />
          {error ? <p className="validation-summary" role="alert">{error}</p> : null}
          <button className="button form-submit" type="submit">Sign in <span aria-hidden="true">→</span></button>
          <p className="form-footnote">Seeded accounts this browser: <strong>{seededCount ?? "…"}</strong></p>
          <p className="form-footnote">An applicant instead? <Link href="/login">Sign in to the applicant dashboard</Link></p>
        </form>
      </section>
    </>
  );
}