/**
 * GET  /api/applications/[reference] - one application, for the certificate page.
 * PATCH /api/applications/[reference] - staff save the certificate fields.
 *
 * PATCH requires certificates.issue. The issuedAt date is set once and never
 * changed, matching issuedAtFor() in lib/certificate-fields.ts, so a certificate
 * cannot be silently backdated by re-saving.
 */

import { prisma } from "@/lib/server/db";
import { recordEvent, HttpError } from "@/lib/server/auth";
import { toExportApplication, APPLICATION_INCLUDE } from "@/lib/server/serialise";
import { route, ok, fail, guard, readJson } from "@/lib/server/http";
import { CERTIFICATE_INPUT_FIELDS } from "@/lib/certificate-fields";
import type { CertificateData } from "@/lib/portal";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ reference: string }> };

export const GET = route(async (_request: Request, { params }: Params) => {
  await guard("applications.view");
  const { reference } = await params;
  const row = await prisma.exportApplication.findUnique({
    where: { applicationNumber: decodeURIComponent(reference) },
    include: APPLICATION_INCLUDE,
  });
  if (!row) return fail(404, "No application matches that reference.");
  return ok(toExportApplication(row));
});

type Body = { certificateData?: CertificateData };

/** Only these keys are writable, so a caller cannot post arbitrary columns. */
const WRITABLE = new Set<string>([
  ...CERTIFICATE_INPUT_FIELDS.map((field) => field.id),
  "issuedBy",
]);

export const PATCH = route(async (request: Request, { params }: Params) => {
  const user = await guard("certificates.issue");
  const { reference } = await params;
  const applicationNumber = decodeURIComponent(reference);
  const body = await readJson<Body>(request);
  if (!body?.certificateData) return fail(400, "Send the certificate fields to save.");

  const existing = await prisma.exportApplication.findUnique({
    where: { applicationNumber },
    include: { certificate: true },
  });
  if (!existing) return fail(404, "No application matches that reference.");

  const submitted: Record<string, string> = {};
  for (const [key, value] of Object.entries(body.certificateData)) {
    if (!WRITABLE.has(key)) continue;
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) submitted[key] = trimmed;
  }

  // issuedAt is fixed on first save and thereafter left alone, so re-saving a
  // certificate cannot move its issue date.
  const issuedAt = existing.certificate?.issuedAt ?? new Date().toISOString();

  // A nested write rather than a separate create/update pair, so the row and
  // its overrides move together in one statement.
  const row = await prisma.exportApplication.update({
    where: { applicationNumber },
    data: {
      certificate: {
        upsert: {
          create: { ...submitted, issuedAt, issuedBy: user.fullName },
          update: { ...submitted, issuedAt },
        },
      },
    },
    include: APPLICATION_INCLUDE,
  });

  await recordEvent({
    actor: user,
    action: "certificate.save",
    entity: "application",
    entityId: applicationNumber,
    detail: `${Object.keys(submitted).length} field(s) saved`,
  });

  return ok(toExportApplication(row));
});
