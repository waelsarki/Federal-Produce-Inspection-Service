import { PrismaClient } from "@prisma/client";

/**
 * One Prisma client for the whole process.
 *
 * `next dev` reloads modules on every change, which would otherwise open a new
 * connection pool each time until SQLite runs out of handles. Caching on
 * globalThis keeps a single client across reloads; in production the same
 * instance is reused naturally.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
