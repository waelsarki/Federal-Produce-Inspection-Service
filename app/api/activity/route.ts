/**
 * GET /api/activity - the real event log, newest first.
 *
 * This replaces the feed in lib/activity.ts, which had to invent timestamps
 * from application submission dates because nothing recorded what staff did.
 * Every row here was written at the moment it happened, by the route that did
 * it, naming the account responsible.
 *
 * Requires applications.view. The limit is capped so the log cannot be used to
 * page through the whole history in one request.
 */

import { prisma } from "@/lib/server/db";
import { route, ok, guard } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const MAX_LIMIT = 100;

export const GET = route(async (request: Request) => {
  await guard("applications.view");

  const url = new URL(request.url);
  const requested = Number(url.searchParams.get("limit") ?? "20");
  const limit = Number.isFinite(requested) ? Math.min(Math.max(1, Math.trunc(requested)), MAX_LIMIT) : 20;
  const entityId = url.searchParams.get("entityId") ?? undefined;

  const rows = await prisma.auditEvent.findMany({
    where: entityId ? { entityId } : {},
    orderBy: { at: "desc" },
    take: limit,
  });

  return ok(
    rows.map((row) => ({
      id: row.id,
      at: row.at,
      actorName: row.actorName,
      actorType: row.actorType,
      action: row.action,
      entity: row.entity,
      entityId: row.entityId,
      detail: row.detail,
    })),
  );
});
