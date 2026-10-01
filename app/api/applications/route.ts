/**
 * GET /api/applications - the staff queue.
 *
 * Requires applications.view on the server. The browser used to read the whole
 * application list straight out of localStorage, which meant any applicant
 * could open devtools and read every other applicant's data.
 */
import { prisma } from "@/lib/server/db";
import { toExportApplication, APPLICATION_INCLUDE } from "@/lib/server/serialise";
import { route, ok, guard } from "@/lib/server/http";

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
