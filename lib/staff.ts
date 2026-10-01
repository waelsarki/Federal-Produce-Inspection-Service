/**
 * Staff accounts, configurable roles and the approval workflow.
 *
 * PROTOTYPE ONLY. Like the applicant portal in lib/portal.ts, everything lives in
 * this browser's local storage and is not real authentication or enforcement.
 * The seeded super admin is a known default: rotate its password from the
 * console, and move accounts, roles and workflow to a trusted server before any
 * real deployment.
 */

import { hashPassword } from "@/lib/portal";

export type StaffPermission =
  | "applications.view"
  | "applications.review"
  | "applications.decide"
  | "certificates.issue"
  | "roles.manage"
  | "workflow.manage";

export const STAFF_PERMISSIONS: { id: StaffPermission; label: string; description: string }[] = [
  { id: "applications.view", label: "View applications", description: "Open the application queue and applicant details." },
  { id: "applications.review", label: "Review applications", description: "Record inspection findings and check-test results." },
  { id: "applications.decide", label: "Decide approvals", description: "Approve or reject an application at an assigned approval level." },
  { id: "certificates.issue", label: "Issue certificates", description: "Issue and revoke official certificates." },
  { id: "roles.manage", label: "Manage staff and roles", description: "Create staff accounts and configure roles and permissions." },
  { id: "workflow.manage", label: "Configure approval workflow", description: "Change approval levels, order and service-level targets." },
];

export type StaffRole = {
  id: string;
  label: string;
  description: string;
  permissions: StaffPermission[];
  /** System roles cannot be deleted. */
  system: boolean;
};

export type StaffAccount = {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  passwordHash: string;
  createdAt: string;
};

export type ApprovalLevel = {
  id: string;
  label: string;
  roleId: string;
  order: number;
  /** How many staff of this role must sign off. */
  requiredApprovals: number;
  slaDays: number;
  /** A required level must pass before the application can advance. */
  required: boolean;
};

export const STAFF_KEY = "fpis.staffAccounts";
export const STAFF_SESSION_KEY = "fpis.staffSession";
export const STAFF_ROLES_KEY = "fpis.staffRoles";
export const STAFF_WORKFLOW_KEY = "fpis.staffApprovalWorkflow";

export const SUPERADMIN_EMAIL = "waelsarki@gmail.com";
export const SUPERADMIN_ROLE_ID = "super-admin";
const SUPERADMIN_PASSWORD_HASH = "aa0de7d01d4a33078fbb63277dcf245ba89612a1a50340768c2d47bc70d0f501";
const SUPERADMIN_NAME = "FPIS Super Admin";

const DEFAULT_ROLES: StaffRole[] = [
  {
    id: SUPERADMIN_ROLE_ID,
    label: "Super Admin",
    description: "Full access, including staff accounts, roles and the approval workflow.",
    permissions: STAFF_PERMISSIONS.map((permission) => permission.id),
    system: true,
  },
  {
    id: "inspector",
    label: "Inspector",
    description: "Conducts inspection and records quality and fumigation findings.",
    permissions: ["applications.view", "applications.review"],
    system: false,
  },
  {
    id: "reviewer",
    label: "Reviewer",
    description: "Checks inspection findings and signs off quality and certification.",
    permissions: ["applications.view", "applications.review", "applications.decide"],
    system: false,
  },
];

const DEFAULT_WORKFLOW: ApprovalLevel[] = [
  { id: "level-inspection", label: "Inspection review", roleId: "inspector", order: 1, requiredApprovals: 1, slaDays: 3, required: true },
  { id: "level-quality", label: "Quality and certification sign-off", roleId: "reviewer", order: 2, requiredApprovals: 1, slaDays: 2, required: true },
  { id: "level-final", label: "Final approval", roleId: SUPERADMIN_ROLE_ID, order: 3, requiredApprovals: 1, slaDays: 1, required: true },
];

const isBrowser = () => typeof window !== "undefined";

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "role";

const timestamp = () => new Date().toISOString();
/* ------------------------------- roles ---------------------------------- */

/** Seeds the default roles once. Existing configuration is never overwritten. */
export function seedRoles(): StaffRole[] {
  if (!isBrowser()) return DEFAULT_ROLES;
  const roles = readJson<StaffRole[]>(STAFF_ROLES_KEY, []);
  if (roles.length > 0) return roles;
  writeJson(STAFF_ROLES_KEY, DEFAULT_ROLES);
  return DEFAULT_ROLES;
}

export function readRoles(): StaffRole[] {
  return seedRoles();
}

export function findRole(roleId: string): StaffRole | undefined {
  return readRoles().find((role) => role.id === roleId);
}

export function roleLabel(roleId: string): string {
  return findRole(roleId)?.label ?? "Unknown role";
}

export function createRole(label: string, description: string, permissions: StaffPermission[]): StaffRole[] {
  const roles = readRoles();
  const base = slugify(label);
  const id = roles.some((role) => role.id === base) ? `${base}-${roles.length + 1}` : base;
  writeJson(STAFF_ROLES_KEY, [...roles, { id, label, description, permissions, system: false }]);
  return readRoles();
}

export function updateRole(roleId: string, changes: Partial<Omit<StaffRole, "id">>): StaffRole[] {
  const roles = readRoles();
  writeJson(STAFF_ROLES_KEY, roles.map((role) => (role.id === roleId ? { ...role, ...changes } : role)));
  return readRoles();
}

/**
 * Removes a role when nothing depends on it. Returns an error message when the
 * role is a system role or is still referenced by an account or approval level.
 */
export function deleteRole(roleId: string): { roles: StaffRole[]; error?: string } {
  const roles = readRoles();
  const role = roles.find((entry) => entry.id === roleId);
  if (!role) return { roles, error: "Role not found." };
  if (role.system) return { roles, error: `${role.label} is a system role and cannot be deleted.` };
  if (readStaff().some((account) => account.roleId === roleId)) {
    return { roles, error: `${role.label} is still assigned to a staff account.` };
  }
  if (readWorkflow().some((level) => level.roleId === roleId)) {
    return { roles, error: `${role.label} is still used by an approval level.` };
  }
  writeJson(STAFF_ROLES_KEY, roles.filter((entry) => entry.id !== roleId));
  return { roles: readRoles() };
}

/* ----------------------------- accounts --------------------------------- */

export function readStaff(): StaffAccount[] {
  return readJson<StaffAccount[]>(STAFF_KEY, []);
}

/**
 * Creates the super admin on first use. Idempotent: an existing account with
 * the same email is never overwritten, so a rotated password survives.
 * Safe to call while rendering, because it no-ops during server rendering.
 */
export function seedSuperAdmin(): StaffAccount[] {
  if (!isBrowser()) return [];
  const accounts = readStaff();
  if (accounts.some((account) => account.email === SUPERADMIN_EMAIL)) return accounts;
  const seeded: StaffAccount = {
    id: `staff-${SUPERADMIN_EMAIL}`,
    email: SUPERADMIN_EMAIL,
    fullName: SUPERADMIN_NAME,
    roleId: SUPERADMIN_ROLE_ID,
    passwordHash: SUPERADMIN_PASSWORD_HASH,
    createdAt: timestamp(),
  };
  writeJson(STAFF_KEY, [...accounts, seeded]);
  return readStaff();
}

export function findStaff(email: string): StaffAccount | undefined {
  return seedSuperAdmin().find((account) => account.email === email.trim().toLowerCase());
}

/** Verifies credentials and opens a session for the matching account. */
export async function authenticateStaff(email: string, password: string): Promise<StaffAccount | null> {
  const account = findStaff(email);
  if (!account) return null;
  const attempt = await hashPassword(password);
  if (attempt !== account.passwordHash) return null;
  if (!isBrowser()) return account;
  sessionStorage.setItem(STAFF_SESSION_KEY, account.id);
  return account;
}

export function readStaffSession(): StaffAccount | null {
  if (!isBrowser()) return null;
  const id = sessionStorage.getItem(STAFF_SESSION_KEY);
  if (!id) return null;
  return seedSuperAdmin().find((account) => account.id === id) ?? null;
}

export function signOutStaff(): void {
  if (!isBrowser()) return;
  sessionStorage.removeItem(STAFF_SESSION_KEY);
}

/** Replaces an account password with a new one, keeping the account active. */
export async function changeStaffPassword(accountId: string, currentPassword: string, newPassword: string): Promise<string | null> {
  const accounts = seedSuperAdmin();
  const account = accounts.find((entry) => entry.id === accountId);
  if (!account) return "Account not found.";
  if ((await hashPassword(currentPassword)) !== account.passwordHash) return "The current password is incorrect.";
  if (newPassword.length < 12) return "Choose a new password of at least 12 characters.";
  const passwordHash = await hashPassword(newPassword);
  writeJson(STAFF_KEY, accounts.map((entry) => (entry.id === accountId ? { ...entry, passwordHash } : entry)));
  return null;
}

/** True when the signed-in account's role grants the permission. */
export function can(account: StaffAccount | null, permission: StaffPermission): boolean {
  if (!account) return false;
  return findRole(account.roleId)?.permissions.includes(permission) ?? false;
}

/* -------------------------- approval workflow --------------------------- */

/** Seeds the default workflow once. Existing configuration is never overwritten. */
export function readWorkflow(): ApprovalLevel[] {
  if (!isBrowser()) return DEFAULT_WORKFLOW;
  const levels = readJson<ApprovalLevel[] | null>(STAFF_WORKFLOW_KEY, null);
  if (levels === null) {
    writeJson(STAFF_WORKFLOW_KEY, DEFAULT_WORKFLOW);
    return DEFAULT_WORKFLOW;
  }
  return [...levels].sort((a, b) => a.order - b.order);
}

/** Persists levels and renumbers them so order always matches the list. */
export function saveWorkflow(levels: ApprovalLevel[]): ApprovalLevel[] {
  const ordered = levels.map((level, index) => ({ ...level, order: index + 1 }));
  writeJson(STAFF_WORKFLOW_KEY, ordered);
  return readWorkflow();
}

export function addApprovalLevel(roleId: string): ApprovalLevel[] {
  const levels = readWorkflow();
  const next: ApprovalLevel = {
    id: `level-${Date.now().toString(36)}`,
    label: "New approval level",
    roleId,
    order: levels.length + 1,
    requiredApprovals: 1,
    slaDays: 2,
    required: true,
  };
  return saveWorkflow([...levels, next]);
}

export function updateApprovalLevel(levelId: string, changes: Partial<Omit<ApprovalLevel, "id">>): ApprovalLevel[] {
  return saveWorkflow(readWorkflow().map((level) => (level.id === levelId ? { ...level, ...changes } : level)));
}

export function removeApprovalLevel(levelId: string): ApprovalLevel[] {
  return saveWorkflow(readWorkflow().filter((level) => level.id !== levelId));
}

/** Moves a level one position earlier or later in the workflow. */
export function moveApprovalLevel(levelId: string, direction: -1 | 1): ApprovalLevel[] {
  const levels = readWorkflow();
  const index = levels.findIndex((level) => level.id === levelId);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= levels.length) return levels;
  const reordered = [...levels];
  const [moved] = reordered.splice(index, 1);
  reordered.splice(target, 0, moved);
  return saveWorkflow(reordered);
}

export function resetWorkflow(): ApprovalLevel[] {
  writeJson(STAFF_WORKFLOW_KEY, DEFAULT_WORKFLOW);
  return readWorkflow();
}

export function updateStaffProfile(accountId: string, fullName: string, email: string): string | null {
  const accounts = seedSuperAdmin();
  const normalizedEmail = email.trim().toLowerCase();
  if (!fullName.trim() || !normalizedEmail) return "Name and email are required.";
  if (accounts.some((account) => account.id !== accountId && account.email === normalizedEmail)) return "That email is already assigned to another staff account.";
  writeJson(STAFF_KEY, accounts.map((account) => account.id === accountId ? { ...account, fullName: fullName.trim(), email: normalizedEmail } : account));
  return null;
}