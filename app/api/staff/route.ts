/**
 * GET  /api/staff - staff accounts, with roles loaded. Requires roles.manage.
 * POST /api/staff - creates an account. The password is hashed here and is
 *      never echoed back.
 *
 * Password rules are enforced on the server, not just in the form. The browser
 * check in createStaffAccount() is a convenience; this is the one that counts.
 */

import { prisma } from "@/lib/server/db";
import { hashPassword, recordEvent, HttpError } from "@/lib/server/auth";
import { toStaffAccount, toStaffRole } from "@/lib/server/serialise";
import { route, ok, fail, guard, readJson, newId } from "@/lib/server/http";
import { MIN_PASSWORD_LENGTH } from "@/lib/staff";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export const GET = route(async () => {
  await guard("roles.manage");
  const rows = await prisma.staffAccount.findMany({
    include: { role: true },
    orderBy: { fullName: "asc" },
  });
  return ok(rows.map(toStaffAccount));
});

type Body = { fullName?: string; email?: string; roleId?: string; password?: string };

export const POST = route(async (request: Request) => {
  const user = await guard("roles.manage");
  const body = await readJson<Body>(request);
  if (!body) return fail(400, "Send a JSON body with the account details.");

  const fullName = (body.fullName ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const roleId = body.roleId ?? "";
  const password = body.password ?? "";

  if (!fullName) return fail(400, "Enter the name of the person who will sign in.");
  if (!EMAIL_PATTERN.test(email)) return fail(400, "Enter a valid email address for the sign-in.");
  if (password.length < MIN_PASSWORD_LENGTH) {
    return fail(400, `Choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const role = await prisma.staffRole.findUnique({ where: { id: roleId } });
  if (!role) return fail(400, "That role no longer exists. Create it again and retry.");

  const existing = await prisma.staffAccount.findUnique({ where: { email } });
  if (existing) return fail(409, "A staff account already uses that email address.");

  const row = await prisma.staffAccount.create({
    data: {
      id: newId("staff"),
      email,
      fullName,
      roleId,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
      active: 1,
    },
    include: { role: true },
  });

  await recordEvent({
    actor: user,
    action: "staff.create",
    entity: "staff",
    entityId: row.id,
    detail: `${fullName} <${email}> as ${role.label}`,
  });

  return ok(toStaffAccount(row), 201);
});

