export type ApplicantProfile = {
  id: string;
  fullName: string;
  organization: string;
  address?: string;
  email: string;
  phoneNumber: string;
  passwordHash: string;
};

export type ExportApplication = {
  applicationNumber: string;
  applicantId: string;
  submittedAt: string;
  status: string;
  consigneeName: string;
  consigneeAddress: string;
  commodity: string;
  hsCode: string;
  goodsDescription: string;
  grossWeight: string;
  netWeight: string;
  vesselAndVoyage: string;
  destination: string;
  nxpNumber: string;
  shipmentDate: string;
  fumigationDate?: string;
  fumigant?: string;
  standardPack?: string;
  packagingCondition?: string;
  moistureContent?: string;
  grade?: string;
  estimatedValue?: string;
  vessel?: string;
  voyage?: string;
  billOfLadingNumber?: string;
  billOfLadingDate?: string;
  portOfLoading?: string;
  /**
   * Append-only approval decisions, newest last. Optional because applications
   * seeded before the approval engine existed have none; those fall back to
   * their free-text status. See lib/approvals.ts.
   */
  approvals?: ApprovalDecision[];
  /**
   * Certificate values completed or corrected by staff at issuance. Kept apart
   * from the applicant's own submission so both remain readable. See
   * lib/certificate-fields.ts.
   */
  certificateData?: CertificateData;
};

/** Staff-editable certificate fields, plus the fixed issue date. */
export type CertificateData = {
  exporterOrganization?: string;
  exporterAddress?: string;
  consigneeName?: string;
  consigneeAddress?: string;
  goodsDescription?: string;
  hsCode?: string;
  fumigationDate?: string;
  fumigant?: string;
  standardPack?: string;
  grossWeight?: string;
  netWeight?: string;
  shipmentDate?: string;
  grade?: string;
  packagingCondition?: string;
  nxpNumber?: string;
  estimatedValue?: string;
  moistureContent?: string;
  vessel?: string;
  voyage?: string;
  destination?: string;
  billOfLadingNumber?: string;
  billOfLadingDate?: string;
  portOfLoading?: string;
  /** ISO date the certificate was issued, fixed on first save. */
  issuedAt?: string;
  issuedBy?: string;
  /**
   * The code the security barcode encodes, minted once when the certificate is
   * issued and read back on every later print. See lib/certificate-code.ts.
   */
  verificationCode?: string;
};

/**
 * One person's decision at one approval level. Level label, order and the
 * staff member's name and role are snapshotted so the trail still reads
 * correctly after the workflow or the account is renamed or deleted.
 */
export type ApprovalDecision = {
  id: string;
  levelId: string;
  levelLabel: string;
  levelOrder: number;
  decision: "approved" | "rejected";
  staffId: string;
  staffName: string;
  staffRoleId: string;
  decidedAt: string;
  note: string;
};

export const APPLICANT_KEY = "fpis.applicant";
export const INTAKE_KEY = "fpis.intakeApplicantId";
export const AUTH_KEY = "fpis.authenticatedApplicantId";
export const APPLICATIONS_KEY = "fpis.applications";
export const LAST_APPLICATION_KEY = "fpis.lastApplicationNumber";

export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function readApplicant(): ApplicantProfile | null {
  const raw = localStorage.getItem(APPLICANT_KEY);
  return raw ? (JSON.parse(raw) as ApplicantProfile) : null;
}

export function readApplications(): ExportApplication[] {
  const raw = localStorage.getItem(APPLICATIONS_KEY);
  return raw ? (JSON.parse(raw) as ExportApplication[]) : [];
}

/** Single place the console writes application records, so persistence and schema stay together. */
export function writeApplications(applications: ExportApplication[]): void {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
}

/**
 * The next free reference, e.g. FPIS-2026-0007.
 *
 * The sequence is taken from the applications already in storage rather than a
 * stored counter, so a reference can never collide with an existing record and
 * the numbering restarts cleanly on 1 January. The year is read from the clock,
 * which is why the sequence is compared against the current year only.
 */
export function nextApplicationNumber(applications: ExportApplication[]): string {
  const year = new Date().getFullYear();
  const prefix = `FPIS-${year}-`;
  const highest = applications.reduce((max, entry) => {
    const value = entry.applicationNumber?.trim() ?? "";
    if (!value.startsWith(prefix)) return max;
    const sequence = Number(value.slice(prefix.length));
    return Number.isInteger(sequence) && sequence > max ? sequence : max;
  }, 0);
  return `${prefix}${String(highest + 1).padStart(4, "0")}`;
}

/**
 * Opens a new application for a fresh certificate and returns it.
 *
 * A certificate is generated from an application, so creating one means adding a
 * blank record and letting the officer complete its fields on the certificate
 * page. Every field starts empty on purpose: the completed values are saved as
 * `certificateData` overrides, which keeps the applicant's own submission and the
 * officer's corrections readable side by side. See lib/certificate-fields.ts.
 */
export function createCertificateDraft(applicantId?: string): ExportApplication {
  const applications = readApplications();
  const applicationNumber = nextApplicationNumber(applications);
  const draft: ExportApplication = {
    applicationNumber,
    applicantId: applicantId ?? readApplicant()?.id ?? "staff-created",
    submittedAt: new Date().toISOString(),
    status: "Pending review",
    consigneeName: "",
    consigneeAddress: "",
    commodity: "",
    hsCode: "",
    goodsDescription: "",
    grossWeight: "",
    netWeight: "",
    vesselAndVoyage: "",
    destination: "",
    nxpNumber: "",
    shipmentDate: "",
  };
  writeApplications([...applications, draft]);
  return draft;
}