export type ApplicantProfile = {
  id: string;
  fullName: string;
  organization: string;
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