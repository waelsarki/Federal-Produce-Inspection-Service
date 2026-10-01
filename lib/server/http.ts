/**
 * Shared plumbing for the API routes: JSON responses, error handling and a
 * permission guard, so each route file stays a short list of actual work.
 */

import "server-only";
import { NextResponse } from "next/server";
import { HttpError, requirePermission, currentUser, type SessionUser } from "@/lib/server/auth";
import type { StaffPermission } from "@/lib/staff";

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(status: number, message: string): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/**
 * Wraps a handler so every route fails the same way. Without this, a thrown
 * HttpError would surface as a 500 with a stack trace, and a genuine bug would
 * be indistinguishable from a rejected permission.
 */
export function route<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof HttpError) return fail(error.status, error.message);
      console.error("[api] unhandled error", error);
      return fail(500, "Something went wrong on the server.");
    }
  };
}

/** Signs the user in or throws 401/403. Use at the top of every staff route. */
export async function guard(permission: StaffPermission): Promise<SessionUser> {
  return requirePermission(permission);
}

/** For routes that may be anonymous but behave differently when signed in. */
export async function optionalUser(): Promise<SessionUser | null> {
  return currentUser();
}

/** Parses a JSON body, returning null rather than throwing on malformed input. */
export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/** A short, collision-resistant id for rows created by the server. */
export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
