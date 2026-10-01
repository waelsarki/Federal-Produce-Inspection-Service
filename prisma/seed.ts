/**
 * Seeds the roles, the approval workflow, the certificate field config and the
 * first super admin.
 *
 * Run with: npx prisma db seed
 *
 * Idempotent: it never overwrites an existing row, so rotating a password or
 * editing a role and re-running the seed is safe.
 *
 * The super admin password is read from SEED_SUPERADMIN_PASSWORD. If that
 * variable is absent the account is created with a random password that is
 * printed once, rather than a default anyone could guess. This replaces the
 * hard-coded credential that used to sit in lib/staff.ts.
 */

import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const STAFF_PERMISSIONS = [
  "applications.view",
  "applications.review",
  "applications.decide",
  "certificates.issue",
  "roles.manage",
  "workflow.manage",
] as const;

const DEFAULT_ROLES = [
  {
    id: "super-admin",
    label: "Super Admin",
    description: "Full access, including staff accounts, roles and the approval workflow.",
    permissions: [...STAFF_PERMISSIONS],
    system: 1,
  },
  {
    id: "inspector",
    label: "Inspector",
    description: "Conducts inspection and records quality and fumigation findings.",
    permissions: ["applications.view", "applications.review"],
    system: 0,
  },
  {
    id: "reviewer",
    label: "Reviewer",
    description: "Checks inspection findings and signs off quality and certification.",
    permissions: ["applications.view", "applications.review", "applications.decide"],
    system: 0,
  },
];

const DEFAULT_WORKFLOW = [
  { id: "level-intake", label: "Intake check", roleId: "inspector", order: 1, requiredApprovals: 1, slaDays: 2, required: 1 },
  { id: "level-inspection", label: "Inspection review", roleId: "inspector", order: 2, requiredApprovals: 1, slaDays: 3, required: 1 },
  { id: "level-quality", label: "Quality and certification sign-off", roleId: "reviewer", order: 3, requiredApprovals: 1, slaDays: 2, required: 1 },
  { id: "level-final", label: "Final approval", roleId: "super-admin", order: 4, requiredApprovals: 1, slaDays: 1, required: 1 },
];

async function main() {
  for (const role of DEFAULT_ROLES) {
    await prisma.staffRole.upsert({
      where: { id: role.id },
      // create only: an existing role keeps whatever it was edited to
      create: {
        id: role.id,
        label: role.label,
        description: role.description,
        permissions: JSON.stringify(role.permissions),
        system: role.system,
      },
      update: {},
    });
  }
  console.log(`roles: ${DEFAULT_ROLES.length} available`);

  for (const level of DEFAULT_WORKFLOW) {
    await prisma.approvalLevel.upsert({
      where: { id: level.id },
      create: level,
      update: {},
    });
  }
  console.log(`workflow: ${DEFAULT_WORKFLOW.length} level(s) available`);

  const email = (process.env.SEED_SUPERADMIN_EMAIL ?? "waelsarki@gmail.com").trim().toLowerCase();
  const existing = await prisma.staffAccount.findUnique({ where: { email } });
  if (existing) {
    console.log(`super admin: already present (${email}), left untouched`);
    return;
  }

  // A random password is printed once. The alternative - a default anyone can
  // find in the source - is how the old prototype shipped a known credential.
  const generated = !process.env.SEED_SUPERADMIN_PASSWORD;
  const password = process.env.SEED_SUPERADMIN_PASSWORD ?? randomBytes(12).toString("base64url");

  await prisma.staffAccount.create({
    data: {
      id: `staff-${email}`,
      email,
      fullName: "FPIS Super Admin",
      roleId: "super-admin",
      passwordHash: await bcrypt.hash(password, 12),
      createdAt: new Date().toISOString(),
      active: 1,
    },
  });

  console.log(`super admin created: ${email}`);
  if (generated) {
    console.log(`one-time password: ${password}`);
    console.log("Sign in and change it, then remove this line from your notes.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
