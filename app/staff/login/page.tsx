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
      <section className="portal-login-page">
        <div className="portal-login-intro">
          <div className="portal-login-mark"><img src="/images/fpis-logo.png" alt="Federal Produce Inspection Service" /></div>
          <p className="eyebrow">CERTIFICATE OPERATIONS / STAFF ACCESS</p>
          <h1>Issue with<br /><em>confidence.</em></h1>
          <p>Review applications, configure the official certificate template and release secure documents from one controlled workspace.</p>
          <div className="login-capabilities"><span><b>01</b> Review and approve</span><span><b>02</b> Generate and print</span><span><b>03</b> Manage access roles</span></div>
        </div>
        <form className="form-panel portal-login-panel" onSubmit={handleSubmit}>
          <div className="form-heading"><span>AUTHORIZED STAFF</span><span><i className="secure-dot" /> SECURE ENTRY</span></div>
          <h2>Welcome back</h2><p className="login-panel-copy">Use your FPIS staff credentials to continue.</p>
          <div className="field"><label htmlFor="staff-email">Staff email address</label><input id="staff-email" name="email" type="email" autoComplete="username" maxLength={254} required placeholder="name@fpis.gov.ng" /></div>
          <PasswordField id="staff-password" name="password" label="Password" autoComplete="current-password" placeholder="Your password" />
          {error ? <p className="validation-summary" role="alert">{error}</p> : null}
          <button className="button form-submit" type="submit">Enter certificate portal <span aria-hidden="true">→</span></button>
          <p className="form-footnote">Seeded accounts this browser: <strong>{seededCount ?? "…"}</strong></p>
          <p className="form-footnote">Only authorized FPIS staff accounts can enter this portal.</p>
        </form>
      </section>
    </>
  );
}