/**
 * Converts Prisma rows into the shapes the existing UI already uses.
 *
 * The client components and lib/certificate.ts, lib/approvals.ts and
 * lib/activity.ts all speak the types in lib/portal.ts and lib/staff.ts. Rather
 * than rewrite them, rows are mapped back into those shapes here. That keeps the
 * front end unchanged while the source of truth moves to the database.
 *
 * Password hashes are never included in anything this file returns.
 */

import "server-only";
import type { Prisma } from "@prisma/client";
import type {
  ApplicantProfile,
  ApprovalDecision,
  CertificateData,
  ExportApplication,
} from "@/lib/portal";
import type { ApprovalLevel, StaffAccount, StaffRole, StaffPermission } from "@/lib/staff";
import { parsePermissions } from "@/lib/server/auth";

type ApplicationRow = Prisma.ExportApplicationGetPayload<{
  include: { decisions: true; certificate: true };
}>;

/** Drops the applicationNumber key so the rest spreads cleanly. */
function certificateData(row: ApplicationRow["certificate"]): CertificateData | undefined {
  if (!row) return undefined;
  const { applicationNumber: _ignored, ...rest } = row;
  const clean = Object.fromEntries(
    Object.entries(rest).filter(([, value]) => value !== null),
  ) as CertificateData;
  return Object.keys(clean).length > 0 ? clean : undefined;
}

export function toExportApplication(row: ApplicationRow): ExportApplication {
  return {
    applicationNumber: row.applicationNumber,
    applicantId: row.applicantId,
    submittedAt: row.submittedAt,
    status: row.status,
    consigneeName: row.consigneeName,
    consigneeAddress: row.consigneeAddress,
    commodity: row.commodity,
    hsCode: row.hsCode,
    goodsDescription: row.goodsDescription,
    grossWeight: row.grossWeight,
    netWeight: row.netWeight,
    vesselAndVoyage: row.vesselAndVoyage,
    destination: row.destination,
    nxpNumber: row.nxpNumber,
    shipmentDate: row.shipmentDate,
    fumigationDate: row.fumigationDate ?? undefined,
    fumigant: row.fumigant ?? undefined,
    standardPack: row.standardPack ?? undefined,
    packagingCondition: row.packagingCondition ?? undefined,
    moistureContent: row.moistureContent ?? undefined,
    grade: row.grade ?? undefined,
    estimatedValue: row.estimatedValue ?? undefined,
    vessel: row.vessel ?? undefined,
    voyage: row.voyage ?? undefined,
    billOfLadingNumber: row.billOfLadingNumber ?? undefined,
    billOfLadingDate: row.billOfLadingDate ?? undefined,
    portOfLoading: row.portOfLoading ?? undefined,
    approvals: [...row.decisions]
      .sort((a, b) => a.decidedAt.localeCompare(b.decidedAt))
      .map((entry) => ({
        id: entry.id,
        levelId: entry.levelId,
        levelLabel: entry.levelLabel,
        levelOrder: entry.levelOrder,
        decision: entry.decision as ApprovalDecision["decision"],
        staffId: entry.staffId,
        staffName: entry.staffName,
        staffRoleId: entry.staffRoleId,
        decidedAt: entry.decidedAt,
        note: entry.note,
      })),
    certificateData: certificateData(row.certificate),
  };
}

type ApplicantRow = Prisma.ApplicantGetPayload<Record<string, never>>;

export function toApplicantProfile(row: ApplicantRow): Omit<ApplicantProfile, "passwordHash"> {
  return {
    id: row.id,
    fullName: row.fullName,
    organization: row.organization,
    address: row.address ?? undefined,
    email: row.email,
    phoneNumber: row.phoneNumber,
  };
}

type RoleRow = Prisma.StaffRoleGetPayload<Record<string, never>>;

export function toStaffRole(row: RoleRow): StaffRole {
  return {
    id: row.id,
    label: row.label,
    description: row.description,
    permissions: parsePermissions(row.permissions) as StaffPermission[],
    system: row.system === 1,
  };
}

type AccountRow = Prisma.StaffAccountGetPayload<{ include: { role: true } }>;

/**
 * The account as sent to the browser, with no passwordHash key at all.
 *
 * An earlier version set `passwordHash: ""` to satisfy the StaffAccount type.
 * That leaked nothing useful, but it still put the field name in the response
 * and invited someone to reuse it. The field is now simply absent.
 */
export function toStaffAccount(row: AccountRow): Omit<StaffAccount, "passwordHash"> {
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    roleId: row.roleId,
    createdAt: row.createdAt,
  };
}

type LevelRow = Prisma.ApprovalLevelGetPayload<Record<string, never>>;

export function toApprovalLevel(row: LevelRow): ApprovalLevel {
  return {
    id: row.id,
    label: row.label,
    roleId: row.roleId,
    order: row.order,
    requiredApprovals: row.requiredApprovals,
    slaDays: row.slaDays,
    required: row.required === 1,
  };
}

type FieldRow = Prisma.CertificateFieldConfigGetPayload<Record<string, never>>;

export function toCertificateFieldConfig(row: FieldRow) {
  return {
    id: row.id as never,
    label: row.label,
    section: row.section as never,
    enabled: row.enabled === 1,
    order: row.order,
  };
}

/** The include that every application read needs: decisions and overrides. */
export const APPLICATION_INCLUDE = {
  decisions: { orderBy: { decidedAt: "asc" as const } },
  certificate: true,
} as const;
