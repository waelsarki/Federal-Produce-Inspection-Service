"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { APPLICANT_KEY, APPLICATIONS_KEY, INTAKE_KEY, LAST_APPLICATION_KEY, ApplicantProfile, ExportApplication, readApplications } from "@/lib/portal";
import { CERTIFICATE_PORT_OPTIONS } from "@/lib/certificate";

export default function ApplyPage() {
  const router = useRouter();
  const [applicant, setApplicant] = useState<ApplicantProfile | null>(null);

  useEffect(() => {
    const profile = localStorage.getItem(APPLICANT_KEY);
    const intakeId = sessionStorage.getItem(INTAKE_KEY);
    if (!profile || !intakeId) {
      router.replace("/register");
      return;
    }
    const parsed = JSON.parse(profile) as ApplicantProfile;
    if (parsed.id !== intakeId) {
      router.replace("/register");
      return;
    }
    setApplicant(parsed);
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!applicant) return;
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "").trim();
    const applicationNumber = `FPIS-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const application: ExportApplication = {
      applicationNumber,
      applicantId: applicant.id,
      submittedAt: new Date().toISOString(),
      status: "Draft saved - payment step not enabled",
      consigneeName: field("consigneeName"),
      consigneeAddress: field("consigneeAddress"),
      commodity: field("commodity"),
      hsCode: field("hsCode"),
      goodsDescription: field("goodsDescription"),
      grossWeight: field("grossWeight"),
      netWeight: field("netWeight"),
      vesselAndVoyage: [field("vessel"), field("voyage") ? `VOY: ${field("voyage")}` : ""].filter(Boolean).join(" "),
      destination: field("destination"),
      nxpNumber: field("nxpNumber"),
      shipmentDate: field("shipmentDate"),
      fumigationDate: field("fumigationDate"),
      fumigant: field("fumigant"),
      standardPack: field("standardPack"),
      packagingCondition: field("packagingCondition"),
      moistureContent: field("moistureContent"),
      grade: field("grade"),
      vessel: field("vessel"),
      voyage: field("voyage"),
      billOfLadingNumber: field("billOfLadingNumber"),
      billOfLadingDate: field("billOfLadingDate"),
      portOfLoading: field("portOfLoading"),
    };
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify([...readApplications(), application]));
    sessionStorage.setItem(LAST_APPLICATION_KEY, applicationNumber);
    sessionStorage.removeItem(INTAKE_KEY);
    router.push("/submitted");
  }

  if (!applicant) return <div className="page-loading" aria-label="Loading application" />;

  return (
    <>
      <div className="prototype-notice"><strong>Development preview</strong><span>Application records are stored in browser storage. Payment checkout is not connected.</span></div>
      <section className="application-page">
        <div className="application-header"><div><p className="eyebrow">NEW EXPORT APPLICATION / 02</p><h1>Shipment <em>details.</em></h1><p>Applicant: <strong>{applicant.organization}</strong> · {applicant.email}</p></div><div className="progress-track"><span className="progress-active" /><span /><span /><small>APPLICATION DETAILS</small><small>PAYMENT</small><small>REVIEW</small></div></div>
        <form className="application-form" onSubmit={handleSubmit}>
          <section className="form-section"><div className="form-section-title"><span>01</span><div><h2>Consignee &amp; commodity</h2><p>Enter the receiving party and produce being exported.</p></div></div><div className="field-grid">
            <div className="field"><label htmlFor="consigneeName">Consignee name</label><input id="consigneeName" name="consigneeName" required maxLength={200} placeholder="Consignee or buyer" /></div>
            <div className="field"><label htmlFor="hsCode">HS code</label><input id="hsCode" name="hsCode" required maxLength={30} placeholder="e.g. 1211.9090.99" /></div>
            <div className="field field-wide"><label htmlFor="consigneeAddress">Consignee address</label><input id="consigneeAddress" name="consigneeAddress" required maxLength={400} placeholder="Street, city, country" /></div>
            <div className="field"><label htmlFor="commodity">Commodity</label><input id="commodity" name="commodity" required maxLength={160} placeholder="e.g. Dried hibiscus flowers" /></div>
            <div className="field"><label htmlFor="goodsDescription">Goods and packaging description</label><input id="goodsDescription" name="goodsDescription" required maxLength={350} placeholder="Quantity, packaging and description" /></div>
            <div className="field"><label htmlFor="grossWeight">Gross weight (kg)</label><input id="grossWeight" name="grossWeight" inputMode="decimal" required pattern="[0-9]+([.][0-9]{1,3})?" placeholder="0.00" /></div>
            <div className="field"><label htmlFor="netWeight">Net weight (kg)</label><input id="netWeight" name="netWeight" inputMode="decimal" required pattern="[0-9]+([.][0-9]{1,3})?" placeholder="0.00" /></div>
          </div></section>
          <section className="form-section"><div className="form-section-title"><span>02</span><div><h2>Shipment information</h2><p>Details for inspection and certificate preparation.</p></div></div><div className="field-grid">
            <div className="field"><label htmlFor="vessel">Name of vessel</label><input id="vessel" name="vessel" required maxLength={120} placeholder="e.g. APL HOLLAND" /></div>
            <div className="field"><label htmlFor="voyage">Voyage</label><input id="voyage" name="voyage" maxLength={40} placeholder="e.g. 615E" /></div>
            <div className="field"><label htmlFor="destination">Destination</label><input id="destination" name="destination" required maxLength={160} placeholder="Port and destination country" /></div>
            <div className="field"><label htmlFor="nxpNumber">NXP form number</label><input id="nxpNumber" name="nxpNumber" required maxLength={80} placeholder="NXP reference" /></div>
            <div className="field"><label htmlFor="shipmentDate">Planned shipment date</label><input id="shipmentDate" name="shipmentDate" type="date" required min={new Date().toISOString().slice(0, 10)} /></div>
          </div></section>
          <section className="form-section"><div className="form-section-title"><span>03</span><div><h2>Inspection findings</h2><p>Recorded at inspection and carried onto the certificate.</p></div></div><div className="field-grid">
            <div className="field"><label htmlFor="fumigationDate">Date of fumigation</label><input id="fumigationDate" name="fumigationDate" type="date" required /></div>
            <div className="field"><label htmlFor="fumigant">Fumigant applied</label><input id="fumigant" name="fumigant" maxLength={80} defaultValue="ALUMINIUM PHOSPHIDE" /></div>
            <div className="field"><label htmlFor="standardPack">Standard pack (weight per bag)</label><input id="standardPack" name="standardPack" maxLength={60} placeholder="e.g. 80 KGS EACH" /></div>
            <div className="field"><label htmlFor="packagingCondition">Condition of packaging materials</label><input id="packagingCondition" name="packagingCondition" maxLength={160} placeholder="e.g. PACKED IN JUTE BAGS" /></div>
            <div className="field"><label htmlFor="moistureContent">Moisture content of commodity</label><input id="moistureContent" name="moistureContent" maxLength={30} placeholder="e.g. 8%" /></div>
            <div className="field"><label htmlFor="grade">Quality (grade)</label><select id="grade" name="grade" defaultValue="EXPORTABLE QUALITY"><option>EXPORTABLE QUALITY</option><option>EXPORTABLE QUALITY STANDARD</option><option>SUBSTANDARD</option></select></div>
            <div className="field"><label htmlFor="portOfLoading">Port of loading</label><select id="portOfLoading" name="portOfLoading" defaultValue="APAPA LAGOS, NIGERIA">{CERTIFICATE_PORT_OPTIONS.map((port) => <option key={port}>{port}</option>)}</select></div>
            <div className="field"><label htmlFor="billOfLadingNumber">Bill of lading number</label><input id="billOfLadingNumber" name="billOfLadingNumber" maxLength={80} placeholder="Available after sailing" /></div>
            <div className="field"><label htmlFor="billOfLadingDate">Bill of lading date</label><input id="billOfLadingDate" name="billOfLadingDate" type="date" /></div>
          </div></section>
          <div className="payment-next"><span className="payment-icon">₦</span><div><strong>Fees &amp; payment evidence</strong><p>Online checkout and receipt verification will be connected in a later development phase. No fee is charged by this preview.</p></div><span className="payment-tag">NEXT PHASE</span></div>
          <div className="application-actions"><Link className="text-link" href="/">Cancel</Link><button className="button" type="submit">Save application draft <span aria-hidden="true">→</span></button></div>
        </form>
      </section>
    </>
  );
}