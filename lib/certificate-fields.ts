/**
 * Certificate fields a staff member can complete and save.
 *
 * The applicant submits what they know; an inspector supplies the rest at
 * issuance (fumigation, weights, grade, moisture, bill of lading). Values are
 * stored per application as `certificateData` overrides, so the applicant"s
 * original submission is never overwritten and the overrides stay tellable apart
 * from it.
 */

import type { CertificateData, ExportApplication } from "@/lib/portal";
import type { CertificateFieldConfig, CertificateFieldId } from "@/lib/certificate-config";

export type CertificateInputId = keyof CertificateData;

export type CertificateInputField = {
  id: CertificateInputId;
  label: string;
  section: "shipment" | "inspection" | "export";
  kind: "text" | "date" | "number" | "long";
  /** Cannot be blank on a legitimate certificate. */
  required: boolean;
  /** The printable field this feeds, so a hidden field is not offered. */
  certificateField: CertificateFieldId;
};

export const CERTIFICATE_INPUT_FIELDS: CertificateInputField[] = [
  { id: "exporterOrganization", label: "Exporter name", section: "shipment", kind: "text", required: true, certificateField: "exporter" },
  { id: "exporterAddress", label: "Exporter address", section: "shipment", kind: "long", required: true, certificateField: "exporter" },
  { id: "consigneeName", label: "Consignee name", section: "shipment", kind: "text", required: true, certificateField: "consignee" },
  { id: "consigneeAddress", label: "Consignee address", section: "shipment", kind: "long", required: false, certificateField: "consignee" },
  { id: "goodsDescription", label: "Description of commodity", section: "shipment", kind: "long", required: true, certificateField: "commodity" },
  { id: "hsCode", label: "HS code", section: "shipment", kind: "text", required: false, certificateField: "commodity" },
  { id: "fumigationDate", label: "Date of fumigation", section: "inspection", kind: "date", required: true, certificateField: "fumigationDate" },
  { id: "fumigant", label: "Fumigant applied", section: "inspection", kind: "text", required: true, certificateField: "fumigant" },
  { id: "standardPack", label: "Standard pack / weight per bag", section: "inspection", kind: "text", required: false, certificateField: "standardPack" },
  { id: "grossWeight", label: "Gross weight (kg)", section: "inspection", kind: "number", required: true, certificateField: "grossWeight" },
  { id: "netWeight", label: "Net weight (kg)", section: "inspection", kind: "number", required: true, certificateField: "netWeight" },
  { id: "grade", label: "Quality / grade", section: "inspection", kind: "text", required: true, certificateField: "grade" },
  { id: "moistureContent", label: "Moisture content", section: "inspection", kind: "text", required: false, certificateField: "moistureContent" },
  { id: "packagingCondition", label: "Condition of packaging materials", section: "export", kind: "text", required: false, certificateField: "packagingCondition" },
  { id: "shipmentDate", label: "Date of shipment", section: "export", kind: "date", required: true, certificateField: "shipmentDate" },
  { id: "vessel", label: "Name of vessel", section: "export", kind: "text", required: true, certificateField: "vessel" },
  { id: "voyage", label: "Voyage", section: "export", kind: "text", required: true, certificateField: "voyage" },
  { id: "portOfLoading", label: "Port of loading", section: "export", kind: "text", required: true, certificateField: "portOfLoading" },
  { id: "destination", label: "Destination", section: "export", kind: "text", required: true, certificateField: "destination" },
  { id: "billOfLadingNumber", label: "Bill of lading number", section: "export", kind: "text", required: false, certificateField: "billOfLadingNumber" },
  { id: "billOfLadingDate", label: "Bill of lading date", section: "export", kind: "date", required: false, certificateField: "billOfLadingDate" },
  { id: "nxpNumber", label: "NXP form number", section: "export", kind: "text", required: true, certificateField: "nxpNumber" },
  { id: "estimatedValue", label: "Estimated value of export", section: "export", kind: "text", required: false, certificateField: "estimatedValue" },
];

export const CERTIFICATE_SECTIONS: { id: CertificateInputField["section"]; label: string }[] = [
  { id: "shipment", label: "Shipment parties and goods" },
  { id: "inspection", label: "Inspection findings" },
  { id: "export", label: "Export and logistics" },
];

/** Values already on the application, before any staff override. */
export function applicationValues(application: ExportApplication): CertificateData {
  return {
    exporterOrganization: "",
    consigneeName: application.consigneeName,
    consigneeAddress: application.consigneeAddress,
    goodsDescription: application.goodsDescription,
    hsCode: application.hsCode,
    fumigationDate: application.fumigationDate,
    fumigant: application.fumigant,
    standardPack: application.standardPack,
    grossWeight: application.grossWeight,
    netWeight: application.netWeight,
    grade: application.grade,
    moistureContent: application.moistureContent,
    packagingCondition: application.packagingCondition,
    shipmentDate: application.shipmentDate,
    vessel: application.vessel,
    voyage: application.voyage,
    portOfLoading: application.portOfLoading,
    destination: application.destination,
    billOfLadingNumber: application.billOfLadingNumber,
    billOfLadingDate: application.billOfLadingDate,
    nxpNumber: application.nxpNumber,
    estimatedValue: application.estimatedValue,
  };
}

/** Staff overrides win. A blank override does not erase a submitted value. */
export function resolveCertificateData(
  application: ExportApplication,
  exporter?: { organization?: string; address?: string },
): CertificateData {
  const merged: Record<string, string | undefined> = { ...applicationValues(application) };
  const override = application.certificateData ?? {};
  for (const [key, value] of Object.entries(override)) {
    if (key === "issuedAt" || key === "issuedBy") continue;
    if (typeof value === "string" && value.trim()) merged[key] = value;
  }
  merged.exporterOrganization = merged.exporterOrganization || exporter?.organization || "";
  merged.exporterAddress = merged.exporterAddress || exporter?.address || "";
  return merged as CertificateData;
}

/** The fixed issue date once staff have saved one, otherwise the given date. */
export function issuedAtFor(application: ExportApplication, fallback: Date): Date {
  const stored = application.certificateData?.issuedAt;
  if (!stored) return fallback;
  const parsed = new Date(stored);
  return Number.isFinite(parsed.getTime()) ? parsed : fallback;
}

/** Required fields still blank, in section order. */
export function missingRequiredFields(
  application: ExportApplication,
  config?: CertificateFieldConfig[],
  exporter?: { organization?: string; address?: string },
): CertificateInputField[] {
  const values = resolveCertificateData(application, exporter);
  return CERTIFICATE_INPUT_FIELDS.filter((field) => {
    if (!field.required) return false;
    if (config && !config.find((entry) => entry.id === field.certificateField)?.enabled) return false;
    return !(values[field.id] ?? "").trim();
  });
}
