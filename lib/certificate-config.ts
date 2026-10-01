export type CertificateFieldId =
  | "exporter"
  | "consignee"
  | "commodity"
  | "fumigationDate"
  | "fumigant"
  | "fumigationNote"
  | "standardPack"
  | "grossWeight"
  | "netWeight"
  | "shipmentDate"
  | "grade"
  | "packagingCondition"
  | "nxpNumber"
  | "estimatedValue"
  | "moistureContent"
  | "vessel"
  | "voyage"
  | "destination"
  | "billOfLadingNumber"
  | "billOfLadingDate"
  | "portOfLoading"
  | "qualityAnalysis"
  | "circulation"
  | "signature"
  | "barcode";

export type CertificateFieldConfig = {
  id: CertificateFieldId;
  label: string;
  section: "shipment" | "inspection" | "export" | "issuance";
  enabled: boolean;
  order: number;
};

export const CERTIFICATE_CONFIG_KEY = "fpis.certificateFieldConfig";

export const DEFAULT_CERTIFICATE_FIELDS: CertificateFieldConfig[] = [
  ["exporter", "Exporter name & address", "shipment"],
  ["consignee", "Consignee name & address", "shipment"],
  ["commodity", "Description of commodity", "shipment"],
  ["fumigationDate", "Date of fumigation", "inspection"],
  ["fumigant", "Fumigant applied", "inspection"],
  ["fumigationNote", "Fumigation repeat notice", "inspection"],
  ["standardPack", "Standard pack / weight per bag", "inspection"],
  ["grossWeight", "Gross weight", "export"],
  ["netWeight", "Net weight", "export"],
  ["shipmentDate", "Date of shipment", "export"],
  ["grade", "Quality / grade", "export"],
  ["packagingCondition", "Condition of packaging materials", "export"],
  ["nxpNumber", "NXP form number", "export"],
  ["estimatedValue", "Estimated value of export", "export"],
  ["moistureContent", "Moisture content of commodity", "export"],
  ["vessel", "Name of vessel", "export"],
  ["voyage", "Voyage", "export"],
  ["destination", "Destination", "export"],
  ["billOfLadingNumber", "Bill of lading number", "export"],
  ["billOfLadingDate", "Bill of lading date", "export"],
  ["portOfLoading", "Port of loading", "export"],
  ["qualityAnalysis", "Quality analysis", "issuance"],
  ["circulation", "Circulation list", "issuance"],
  ["signature", "Issuing authority", "issuance"],
  ["barcode", "Security barcode", "issuance"],
].map(([id, label, section], order) => ({ id: id as CertificateFieldId, label, section: section as CertificateFieldConfig["section"], enabled: true, order }));

const isBrowser = () => typeof window !== "undefined";

export function readCertificateConfig(): CertificateFieldConfig[] {
  if (!isBrowser()) return DEFAULT_CERTIFICATE_FIELDS;
  const raw = localStorage.getItem(CERTIFICATE_CONFIG_KEY);
  if (!raw) {
    localStorage.setItem(CERTIFICATE_CONFIG_KEY, JSON.stringify(DEFAULT_CERTIFICATE_FIELDS));
    return DEFAULT_CERTIFICATE_FIELDS;
  }
  try {
    const saved = JSON.parse(raw) as CertificateFieldConfig[];
    return DEFAULT_CERTIFICATE_FIELDS.map((field) => ({ ...field, ...saved.find((entry) => entry.id === field.id) }));
  } catch {
    return DEFAULT_CERTIFICATE_FIELDS;
  }
}

export function saveCertificateConfig(config: CertificateFieldConfig[]): CertificateFieldConfig[] {
  const ordered = config.map((field, order) => ({ ...field, order }));
  if (isBrowser()) localStorage.setItem(CERTIFICATE_CONFIG_KEY, JSON.stringify(ordered));
  return ordered;
}

export function certificateFieldEnabled(config: CertificateFieldConfig[] | undefined, id: CertificateFieldId): boolean {
  return config?.find((field) => field.id === id)?.enabled ?? true;
}

export function certificateFieldLabel(config: CertificateFieldConfig[] | undefined, id: CertificateFieldId, fallback: string): string {
  return config?.find((field) => field.id === id)?.label || fallback;
}