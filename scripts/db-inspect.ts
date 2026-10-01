// Prints what is actually stored, straight from the database.
//
// Run with: node_modules\.bin\tsx.cmd scripts\db-inspect.ts
//
// This exists to confirm the data is really on disk and not in the check's
// memory: it opens a fresh Prisma client, exactly as a new server process
// would, and reads the rows back.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [roles, levels, staff, applicants, applications, decisions, events] = await Promise.all([
    prisma.staffRole.findMany({ orderBy: { id: "asc" } }),
    prisma.approvalLevel.findMany({ orderBy: { order: "asc" } }),
    prisma.staffAccount.findMany(),
    prisma.applicant.findMany(),
    prisma.exportApplication.findMany(),
    prisma.approvalDecision.findMany(),
    prisma.auditEvent.findMany({ orderBy: { at: "desc" } }),
  ]);

  console.log(`roles:      ${roles.length}`);
  for (const role of roles) {
    const perms = JSON.parse(role.permissions) as string[];
    console.log(`  ${role.id.padEnd(12)} system=${role.system}  ${perms.length} permission(s)`);
  }

  console.log(`\nworkflow:   ${levels.length} level(s)`);
  for (const level of levels) {
    console.log(`  ${level.order}. ${level.label} -> ${level.roleId} (${level.requiredApprovals} approval(s), ${level.slaDays}d)`);
  }

  console.log(`\nstaff:      ${staff.length}`);
  for (const account of staff) {
    // Only the prefix, so the full bcrypt hash is not printed to a log file.
    console.log(`  ${account.email}  role=${account.roleId}  hash=${account.passwordHash.slice(0, 7)}...`);
    if (!account.passwordHash.startsWith("$2")) {
      throw new Error(`Password for ${account.email} is not a bcrypt hash.`);
    }
  }

  console.log(`\napplicants: ${applicants.length}`);
  console.log(`applications: ${applications.length}`);
  console.log(`decisions:   ${decisions.length}`);
  console.log(`audit events: ${events.length}`);
  for (const event of events.slice(0, 5)) {
    console.log(`  ${event.at}  ${event.actorType.padEnd(8)} ${event.action.padEnd(20)} ${event.entityId ?? ""}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
