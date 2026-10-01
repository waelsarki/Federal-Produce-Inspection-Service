/**
 * Certificate fields a staff member can complete and save.
 *
 * The applicant submits what they know; an inspector supplies the rest at
 * issuance (fumigation, weights, grade, moisture, bill of lading). Values are
 * stored per application as `certificateData` overrides, so the applicant''s
 * original submission is never overwritten and the overrides stay tellable apart
 * from it.
 */

import type { CertificateData, ExportApplication } from "@/lib/portal";
import type { CertificateFieldConfig, CertificateFieldId } from "@/lib/certificate-config";
import { mintVerificationCode } from "@/lib/certificate-code";

export type CertificateInputId = keyof CertificateData;

export type CertificateInputField = {
  id: CertificateInputId;
  label: string;
  kind: "text" | "date" | "number" | "long";
  /** Cannot be blank on a legitimate certificate. */
  required: boolean;
};

/**
 * What each printable certificate field is captured by, in the order the
 * Service prints them. One printable field can need more than one value
 * (the exporter needs a name and an address), and some printable fields
 * need none because the Service derives them (the quality analysis repeats
 * the grade) or fixes them (the circulation list, the signature block).
 *
 * This list is the only place that mapping is written down. The certificate
 * template configured under "Configure certificate" decides which of these
 * are offered and what they are called, so the generator never has to restate
 * what a certificate needs.
 */
export const CERTIFICATE_FIELD_INPUTS: { certificateField: CertificateFieldId; inputs: CertificateInputField[] }[] = [
  { certificateField: "exporter", inputs: [
    { id: "exporterOrganization", label: "Name", kind: "text", required: true },
    { id: "exporterAddress", label: "Address", kind: "long", required: true },
  ] },
  { certificateField: "consignee", inputs: [
    { id: "consigneeName", label: "Name", kind: "text", required: true },
    { id: "consigneeAddress", label: "Address", kind: "long", required: false },
  ] },
  { certificateField: "commodity", inputs: [
    { id: "goodsDescription", label: "Description of commodity", kind: "long", required: true },
    { id: "hsCode", label: "HS code", kind: "text", required: false },
  ] },
  { certificateField: "fumigationDate", inputs: [
    { id: "fumigationDate", label: "Date of fumigation", kind: "date", required: true },
  ] },
  { certificateField: "fumigant", inputs: [
    { id: "fumigant", label: "Fumigant applied", kind: "text", required: true },
  ] },
  { certificateField: "standardPack", inputs: [
    { id: "standardPack", label: "Standard pack / weight per bag", kind: "text", required: false },
  ] },
  { certificateField: "grossWeight", inputs: [
    { id: "grossWeight", label: "Gross weight (kg)", kind: "number", required: true },
  ] },
  { certificateField: "netWeight", inputs: [
    { id: "netWeight", label: "Net weight (kg)", kind: "number", required: true },
  ] },
  { certificateField: "shipmentDate", inputs: [
    { id: "shipmentDate", label: "Date of shipment", kind: "date", required: true },
  ] },
  { certificateField: "grade", inputs: [
    { id: "grade", label: "Quality / grade", kind: "text", required: true },
  ] },
  { certificateField: "packagingCondition", inputs: [
    { id: "packagingCondition", label: "Condition of packaging materials", kind: "text", required: false },
  ] },
  { certificateField: "nxpNumber", inputs: [
    { id: "nxpNumber", label: "NXP form number", kind: "text", required: true },
  ] },
  { certificateField: "estimatedValue", inputs: [
    { id: "estimatedValue", label: "Estimated value of export", kind: "text", required: false },
  ] },
  { certificateField: "moistureContent", inputs: [
    { id: "moistureContent", label: "Moisture content of commodity", kind: "text", required: false },
  ] },
  { certificateField: "vessel", inputs: [
    { id: "vessel", label: "Name of vessel", kind: "text", required: true },
  ] },
  { certificateField: "voyage", inputs: [
    { id: "voyage", label: "Voyage", kind: "text", required: true },
  ] },
  { certificateField: "destination", inputs: [
    { id: "destination", label: "Destination", kind: "text", required: true },
  ] },
  { certificateField: "billOfLadingNumber", inputs: [
    { id: "billOfLadingNumber", label: "Bill of lading number", kind: "text", required: true },
  ] },
  { certificateField: "billOfLadingDate", inputs: [
    { id: "billOfLadingDate", label: "Bill of lading date", kind: "date", required: false },
  ] },
  { certificateField: "portOfLoading", inputs: [
    { id: "portOfLoading", label: "Port of loading", kind: "text", required: true },
  ] },
];
/** An input resolved against the configured template, ready to render. */
export type ConfiguredCertificateInput = CertificateInputField & {
  certificateField: CertificateFieldId;
  /** The template's label for the printable field this input belongs to. */
  groupLabel: string;
  section: CertificateFieldConfig["section"];
  /** True when the template captures this printable field with one value. */
  isOnlyInput: boolean;
};

/**
 * The inputs the current template asks for, in the template's own order.
 * A field switched off in "Configure certificate" is not offered here at all,
 * so an officer is never asked for something the sheet will not print. When a
 * printable field needs a single value its input takes the template label, so
 * renaming the field in the template renames it on the form; a field needing
 * several values keeps its own per-value labels under the template's label.
 */
export function configuredCertificateInputs(config: CertificateFieldConfig[]): ConfiguredCertificateInput[] {
  const catalogue = new Map(CERTIFICATE_FIELD_INPUTS.map((entry) => [entry.certificateField, entry]));
  return [...config]
    .filter((field) => field.enabled)
    .sort((a, b) => a.order - b.order)
    .flatMap((field) => {
      const inputs = catalogue.get(field.id)?.inputs ?? [];
      const isOnlyInput = inputs.length === 1;
      return inputs.map((input) => ({
        ...input,
        label: isOnlyInput ? field.label : input.label,
        certificateField: field.id,
        groupLabel: field.label,
        section: field.section,
        isOnlyInput,
      }));
    });
}

/** Every input across every printable field, template disregarded. */
export const CERTIFICATE_INPUT_FIELDS: CertificateInputField[] = CERTIFICATE_FIELD_INPUTS.flatMap((entry) => entry.inputs);

export const CERTIFICATE_SECTIONS: { id: CertificateFieldConfig["section"]; label: string }[] = [
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
    // Identity fields, not printable values: the sheet reads them from the
    // application directly rather than through the resolved field set.
    if (key === "issuedAt" || key === "issuedBy" || key === "verificationCode") continue;
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

/**
 * The identity a certificate carries once issued: when it was issued, and the
 * code its barcode encodes. Both are written on the first save and read back on
 * every print after it, so re-saving corrected values or reprinting cannot move
 * the date or change the code the first copy carried.
 *
 * `siblings` is every other application in the browser, so a freshly minted code
 * is checked against the codes already in use.
 */
export function issuanceFor(
  application: ExportApplication,
  siblings: ExportApplication[] = [],
  now: Date = new Date(),
): { issuedAt: string; verificationCode: string } {
  const existing = application.certificateData;
  return {
    issuedAt: existing?.issuedAt ?? now.toISOString(),
    verificationCode: existing?.verificationCode
      ?? mintVerificationCode(
        siblings
          .filter((entry) => entry.applicationNumber !== application.applicationNumber)
          .map((entry) => entry.certificateData?.verificationCode ?? ""),
      ),
  };
}

/** Required fields still blank, in section order. */
export function missingRequiredFields(
  application: ExportApplication,
  config: CertificateFieldConfig[],
  exporter?: { organization?: string; address?: string },
): ConfiguredCertificateInput[] {
  const values = resolveCertificateData(application, exporter);
  return configuredCertificateInputs(config).filter((field) => {
    if (!field.required) return false;
    return !(values[field.id] ?? "").trim();
  });
}
