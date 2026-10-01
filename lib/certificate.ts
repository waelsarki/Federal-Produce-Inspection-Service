import type { ApplicantProfile, ExportApplication } from "./portal";
import { certificateFieldEnabled, certificateFieldLabel, CertificateFieldConfig } from "./certificate-config";

export const CERTIFICATE_FUMIGATION_NOTE = "Fumigation should be repeated after expiration of 21 days";
export const CERTIFICATE_DEFAULT_GRADE = "EXPORTABLE QUALITY";
export const CERTIFICATE_DEFAULT_FUMIGANT = "ALUMINIUM PHOSPHIDE";

export const CERTIFICATE_PORT_OPTIONS = ["APAPA LAGOS, NIGERIA", "APAPA NIGERIA", "TINCAN/LAGOS", "LEKKI LAGOS", "IJORA, LAGOS"];

const ROMAN_VOLUMES = ["I", "II", "III", "IV", "V"];

// Widths in characters, matched to the printable column of the sheet so a wrapped
// line never has to break a second time in the browser.
const CERTIFICATE_ADDRESS_WIDTH = 70;
const CERTIFICATE_COMMODITY_WIDTH = 76;

const STATION_CODES: { pattern: RegExp; code: string }[] = [
  { pattern: /APAPA/i, code: "AP" },
  { pattern: /TINCAN/i, code: "TC" },
  { pattern: /LEKKI/i, code: "LK" },
  { pattern: /IJORA/i, code: "IJ" },
  { pattern: /BADAGRY/i, code: "BG" },
];

export type CertificateTail = { label: string; value: string };

export type CertificateRow =
  | { kind: "field"; label: string; value: string; tails?: CertificateTail[] }
  | { kind: "continuation"; value: string }
  | { kind: "note"; text: string };

export type CertificateGroup = { marker: string; indent?: boolean; rows: CertificateRow[] };

export type CertificateDocument = {
  serialNumber: string;
  reference: string;
  issueDate: Date;
  qualityAnalysis: string;
  exporterLines: string[];
  consigneeLines: string[];
  commodityLines: string[];
  fumigationDate: string;
  fumigant: string;
  standardPack: string;
  grossWeight: string;
  netWeight: string;
  shipmentDate: string;
  grade: string;
  packagingCondition: string;
  nxpNumber: string;
  estimatedValue: string;
  moistureContent: string;
  vessel: string;
  voyage: string;
  destination: string;
  billOfLadingNumber: string;
  billOfLadingDate: string;
  portOfLoading: string;
};

function fnv1a(value: string, seed = 2166136261): number {
  let hash = seed >>> 0;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

function toRoman(value: number): string {
  return ROMAN_VOLUMES[value] ?? ROMAN_VOLUMES[0];
}

export function stationCodeFor(portOfLoading: string): string {
  const match = STATION_CODES.find((entry) => entry.pattern.test(portOfLoading));
  return match ? match.code : "HQ";
}

export function wrapText(value: string, width = 86): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (!line) {
      line = word;
      continue;
    }
    if (`${line} ${word}`.length <= width) {
      line = `${line} ${word}`;
      continue;
    }
    lines.push(line);
    line = word;
  }
  if (line) lines.push(line);
  return lines;
}

function addressLines(name: string, address: string): string[] {
  return [name.trim(), ...wrapText(address, CERTIFICATE_ADDRESS_WIDTH)].filter(Boolean);
}

function commodityLines(description: string, hsCode: string): string[] {
  const lines = wrapText(description, CERTIFICATE_COMMODITY_WIDTH);
  const code = hsCode.trim();
  if (!code || lines.length === 0) return lines;
  const entry = `HS CODE: ${code}`;
  const last = lines.length - 1;
  // The paper keeps the code on the closing line when it fits, and on a line of
  // its own when it does not.
  if (`${lines[last]}  ${entry}`.length <= CERTIFICATE_COMMODITY_WIDTH + 24) {
    lines[last] = `${lines[last]}  ${entry}`;
  } else {
    lines.push(entry);
  }
  return lines;
}

export function splitVesselVoyage(value: string): { vessel: string; voyage: string } {
  const text = value.trim();
  const match = /\bVOY\.?\s*:?\s*(.+)$/i.exec(text);
  if (match) {
    return { vessel: text.slice(0, match.index).replace(/[\s:,-]+$/, ""), voyage: match[1].trim() };
  }
  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return { vessel: parts.slice(0, -1).join(" "), voyage: parts[parts.length - 1] };
  }
  return { vessel: text, voyage: "" };
}

export function formatDayMonthYear(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return value.trim();
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function formatOrdinalDate(date: Date): { day: string; ordinal: string; month: string; year: string } {
  const day = date.getDate();
  const teens = day % 100 >= 11 && day % 100 <= 13;
  const ordinal = teens ? "TH" : (["ST", "ND", "RD"][day % 10 - 1] ?? "TH");
  return {
    day: String(day),
    ordinal,
    month: date.toLocaleDateString("en-GB", { month: "long" }).toUpperCase(),
    year: String(date.getFullYear()),
  };
}

export function formatWeightAsMts(value: string): string {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return value.trim();
  return `${(numeric / 1000).toFixed(3)} MTS`;
}


export function buildCertificate(
  application: ExportApplication,
  exporter: { organization?: string; address?: string } | null,
  issuedAt: Date,
): CertificateDocument {
  const seed = fnv1a(application.applicationNumber);
  const portOfLoading = application.portOfLoading?.trim() ?? "";
  const fallback = splitVesselVoyage(application.vesselAndVoyage ?? "");
  const vessel = application.vessel?.trim() || fallback.vessel;
  const voyage = application.voyage?.trim() || fallback.voyage;
  const description = application.goodsDescription ?? "";
  const grade = application.grade?.trim() || CERTIFICATE_DEFAULT_GRADE;

  return {
    serialNumber: String(10000 + (fnv1a(application.applicationNumber, seed ^ 0x85ebca6b) % 90000)),
    reference: `FP//${stationCodeFor(portOfLoading)}/VOL..${toRoman(seed % ROMAN_VOLUMES.length)}/${1000 + (fnv1a(application.applicationNumber, seed ^ 0x9e3779b9) % 9000)}`,
    issueDate: issuedAt,
    qualityAnalysis: grade.toUpperCase(),
    exporterLines: addressLines(exporter?.organization ?? "", exporter?.address ?? ""),
    consigneeLines: addressLines(application.consigneeName ?? "", application.consigneeAddress ?? ""),
    commodityLines: commodityLines(description, application.hsCode ?? ""),
    fumigationDate: formatDayMonthYear(application.fumigationDate ?? ""),
    fumigant: application.fumigant?.trim() || CERTIFICATE_DEFAULT_FUMIGANT,
    standardPack: application.standardPack?.trim() ?? "",
    grossWeight: formatWeightAsMts(application.grossWeight ?? ""),
    netWeight: formatWeightAsMts(application.netWeight ?? ""),
    shipmentDate: formatDayMonthYear(application.shipmentDate ?? ""),
    grade,
    packagingCondition: application.packagingCondition?.trim() ?? "",
    nxpNumber: application.nxpNumber?.trim() ?? "",
    estimatedValue: application.estimatedValue?.trim() ?? "",
    moistureContent: application.moistureContent?.trim() ?? "",
    vessel,
    voyage,
    destination: application.destination?.trim() ?? "",
    billOfLadingNumber: application.billOfLadingNumber?.trim() ?? "",
    billOfLadingDate: formatDayMonthYear(application.billOfLadingDate ?? ""),
    portOfLoading,
  };
}

export function certificateGroups(document: CertificateDocument, config?: CertificateFieldConfig[]): CertificateGroup[] {
  const enabled = (id: Parameters<typeof certificateFieldEnabled>[1]) => certificateFieldEnabled(config, id);
  const label = (id: Parameters<typeof certificateFieldLabel>[1], fallback: string) => certificateFieldLabel(config, id, fallback);
  const addressed = (lines: string[], label: string): CertificateRow[] =>
    lines.map((line, index) => (index === 0 ? { kind: "field" as const, label, value: line } : { kind: "continuation" as const, value: line }));

  return [
    enabled("exporter") ? { marker: "(1)", rows: addressed(document.exporterLines, `${label("exporter", "Exporter name & address")}:`) } : null,
    enabled("consignee") ? { marker: "(2)", rows: addressed(document.consigneeLines, `${label("consignee", "Consignee name & address")}:`) } : null,
    enabled("commodity") ? { marker: "(3)", rows: addressed(document.commodityLines, `${label("commodity", "Description of commodity")}:`) } : null,
    {
      marker: "(4)",
      indent: true,
      rows: [
        enabled("fumigationDate") ? { kind: "field", label: `(i) ${label("fumigationDate", "Date of fumigation")}:`, value: document.fumigationDate } : null,
        enabled("fumigant") ? { kind: "field", label: `(ii) ${label("fumigant", "Fumigant applied")}:`, value: document.fumigant } : null,
        enabled("fumigationNote") ? { kind: "note", text: label("fumigationNote", CERTIFICATE_FUMIGATION_NOTE) } : null,
      ].filter(Boolean) as CertificateRow[],
    },
    enabled("standardPack") ? { marker: "(5)", rows: [{ kind: "field", label: `${label("standardPack", "Standard pack / weight per bag")}:`, value: document.standardPack }] } : null,
    enabled("grossWeight") || enabled("netWeight") ? {
      marker: "(6)",
      rows: [{ kind: "field", label: "Total volume of export:", value: "", tails: [
        enabled("grossWeight") ? { label: `${label("grossWeight", "Gross weight")}:`, value: document.grossWeight } : null,
        enabled("netWeight") ? { label: `${label("netWeight", "Net weight")}:`, value: document.netWeight } : null,
      ].filter((tail): tail is CertificateTail => tail !== null) }],
    } : null,
    {
      marker: "(7)",
      rows: [
        enabled("shipmentDate") ? { kind: "field", label: `(a) ${label("shipmentDate", "Date of shipment")}:`, value: document.shipmentDate } : null,
        enabled("grade") ? { kind: "field", label: `(b) ${label("grade", "Quality / grade")}:`, value: document.grade } : null,
      ].filter(Boolean) as CertificateRow[],
    },
    enabled("packagingCondition") ? { marker: "(8)", rows: [{ kind: "field", label: `${label("packagingCondition", "Condition of packaging materials")}:`, value: document.packagingCondition }] } : null,
    {
      marker: "(9)",
      rows: [
        enabled("nxpNumber") ? { kind: "field", label: `(a) ${label("nxpNumber", "NXP form number")}:`, value: document.nxpNumber } : null,
        enabled("estimatedValue") ? { kind: "field", label: `(b) ${label("estimatedValue", "Estimated value of export")}:`, value: document.estimatedValue } : null,
      ].filter(Boolean) as CertificateRow[],
    },
    enabled("moistureContent") ? { marker: "(10)", rows: [{ kind: "field", label: `${label("moistureContent", "Moisture content of commodity")}:`, value: document.moistureContent }] } : null,
    {
      marker: "(11)",
      indent: true,
      rows: [
        enabled("vessel") ? { kind: "field", label: `(i) ${label("vessel", "Name of vessel")}:`, value: document.vessel, tails: enabled("voyage") && document.voyage ? [{ label: `${label("voyage", "Voyage")}:`, value: document.voyage }] : undefined } : null,
        enabled("destination") ? { kind: "field", label: `(ii) ${label("destination", "Destination")}:`, value: document.destination } : null,
        enabled("billOfLadingNumber") ? { kind: "field", label: `(iii) ${label("billOfLadingNumber", "Bill of lading number")}:`, value: document.billOfLadingNumber, tails: enabled("billOfLadingDate") && document.billOfLadingDate ? [{ label: `${label("billOfLadingDate", "Date")}:`, value: document.billOfLadingDate }] : undefined } : null,
        enabled("portOfLoading") ? { kind: "field", label: `(iv) ${label("portOfLoading", "Port of loading")}:`, value: document.portOfLoading } : null,
      ].filter(Boolean) as CertificateRow[],
    },
  ].filter(Boolean) as CertificateGroup[];
}

