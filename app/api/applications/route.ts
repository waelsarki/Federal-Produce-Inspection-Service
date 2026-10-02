/**
 * GET  /api/applications - the staff queue.
 * POST /api/applications - staff raise a certificate outright.
 *
 * GET requires applications.view on the server. The browser used to read the
 * whole application list straight out of localStorage, which meant any applicant
 * could open devtools and read every other applicant's data.
 */
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/server/db";
import { hashPassword, recordEvent } from "@/lib/server/auth";
import { toExportApplication, APPLICATION_INCLUDE } from "@/lib/server/serialise";
import { route, ok, fail, guard, readJson } from "@/lib/server/http";
import { CERTIFICATE_INPUT_FIELDS } from "@/lib/certificate-fields";

export const dynamic = "force-dynamic";

export const GET = route(async (request: Request) => {
  await guard("applications.view");

  const url = new URL(request.url);
  const applicantId = url.searchParams.get("applicantId") ?? undefined;
  const search = url.searchParams.get("q")?.trim() ?? "";

  const rows = await prisma.exportApplication.findMany({
    where: {
      ...(applicantId ? { applicantId } : {}),
      ...(search
        ? {
            OR: [
              { applicationNumber: { contains: search } },
              { commodity: { contains: search } },
              { consigneeName: { contains: search } },
              { destination: { contains: search } },
            ],
          }
        : {}),
    },
    include: APPLICATION_INCLUDE,
    orderBy: { submittedAt: "desc" },
  });

  return ok(rows.map(toExportApplication));
});

/* ------------------------------ POST: create ------------------------------ */

/**
 * A certificate raised at the counter has no online applicant behind it, but
 * ExportApplication requires one. This stands in for that relationship.
 *
 * It is deliberately not a login: the row exists only to satisfy the applicant
 * relation, and the password is a hash of a random value nobody holds, so the
 * account can never be signed into.
 */
const COUNTER_APPLICANT_ID = "fpis-counter-intake";

async function ensureCounterApplicant(organization: string, address: string): Promise<void> {
  const existing = await prisma.applicant.findUnique({ where: { id: COUNTER_APPLICANT_ID } });
  if (existing) return;
  const now = new Date().toISOString();
  await prisma.applicant.create({
    data: {
      id: COUNTER_APPLICANT_ID,
      fullName: organization || "FPIS counter intake",
      organization: organization || "Recorded at the counter",
      address: address || null,
      email: "counter-intake@fpis.invalid",
      phoneNumber: "",
      passwordHash: await hashPassword(randomBytes(32).toString("hex")),
      createdAt: now,
      updatedAt: now,
    },
  });
}

/**
 * The next free reference, e.g. FPIS-2026-0007.
 *
 * The same rule as nextApplicationNumber() in lib/portal.ts, read from the
 * database instead of browser storage so two officers creating certificates at
 * once cannot pick the same number.
 */
async function nextReference(): Promise<string> {
  const prefix = `FPIS-${new Date().getFullYear()}-`;
  const rows = await prisma.exportApplication.findMany({
    where: { applicationNumber: { startsWith: prefix } },
    select: { applicationNumber: true },
  });
  const highest = rows.reduce((max, row) => {
    const sequence = Number(row.applicationNumber.slice(prefix.length));
    return Number.isInteger(sequence) && sequence > max ? sequence : max;
  }, 0);
  return `${prefix}${String(highest + 1).padStart(4, "0")}`;
}

/** Only these keys are writable, so a caller cannot post arbitrary columns. */
const WRITABLE = new Set<string>(CERTIFICATE_INPUT_FIELDS.map((field) => field.id));

/**
 * Without these three a record is not a certificate: there is no exporter, no
 * recipient and nothing to certify. Everything else the template marks required
 * is left to the normal completeness check, so this route cannot fall behind the
 * template the way a hand-maintained list would.
 */
const REQUIRED = ["exporterOrganization", "consigneeName", "goodsDescription"];

type CreateBody = {
  commodity?: string;
  certificateData?: Record<string, unknown>;
};

/**
 * Raises a certificate without an applicant submission behind it - a walk-in
 * exporter at the counter, or a record rebuilt after a data loss. The officer
 * enters the whole certificate in one pass rather than first manufacturing an
 * empty application and then completing it on a second page.
 *
 * Requires certificates.issue and is written to the event log, so the creation
 * appears in the audit trail like every other change. It is recorded but not
 * issued: issuedAt stays unset, exactly as it would if the certificate were
 * opened from an application and completed later.
 */
export const POST = route(async (request: Request) => {
  const user = await guard("certificates.issue");
  const body = await readJson<CreateBody>(request);
  if (!body?.certificateData) return fail(400, "Send the certificate fields to create.");

  const certificate: Record<string, string> = {};
  for (const [key, value] of Object.entries(body.certificateData)) {
    if (!WRITABLE.has(key)) continue;
    if (typeof value !== "string") continue;
    certificate[key] = value.trim();
  }

  const missing = REQUIRED.filter((key) => !certificate[key]);
  if (missing.length > 0) {
    return fail(400, "Complete the exporter, the consignee and the commodity description before creating.");
  }

  await ensureCounterApplicant(certificate.exporterOrganization, certificate.exporterAddress);

  const applicationNumber = await nextReference();
  // Blank becomes "" rather than null on the required columns: a certificate
  // created at the counter simply has nothing in them yet.
  const text = (key: string) => certificate[key] ?? "";
  const optional = (key: string) => certificate[key] || null;
  const commodity = body.commodity?.trim() || text("goodsDescription");
  const now = new Date().toISOString();

  const row = await prisma.exportApplication.create({
    data: {
      applicationNumber,
      applicantId: COUNTER_APPLICANT_ID,
      submittedAt: now,
      status: "Draft",
      consigneeName: text("consigneeName"),
      consigneeAddress: text("consigneeAddress"),
      commodity,
      hsCode: text("hsCode"),
      goodsDescription: text("goodsDescription"),
      grossWeight: text("grossWeight"),
      netWeight: text("netWeight"),
      vesselAndVoyage: [text("vessel"), text("voyage")].filter(Boolean).join(" / "),
      destination: text("destination"),
      nxpNumber: text("nxpNumber"),
      shipmentDate: text("shipmentDate"),
      fumigationDate: optional("fumigationDate"),
      fumigant: optional("fumigant"),
      standardPack: optional("standardPack"),
      packagingCondition: optional("packagingCondition"),
      moistureContent: optional("moistureContent"),
      grade: optional("grade"),
      estimatedValue: optional("estimatedValue"),
      vessel: optional("vessel"),
      voyage: optional("voyage"),
      billOfLadingNumber: optional("billOfLadingNumber"),
      billOfLadingDate: optional("billOfLadingDate"),
      portOfLoading: optional("portOfLoading"),
      certificate: { create: certificate },
    },
    include: APPLICATION_INCLUDE,
  });

  await recordEvent({
    actor: user,
    action: "certificate.create",
    entity: "application",
    entityId: applicationNumber,
    detail: `${Object.values(certificate).filter(Boolean).length} field(s) entered at the counter`,
  });

  return ok(toExportApplication(row), 201);
});