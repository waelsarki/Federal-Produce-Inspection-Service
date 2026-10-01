/**
 * GET /api/auth/me - who am I, according to the server.
 *
 * The client calls this on load instead of reading a sessionStorage flag. A
 * forged sessionStorage value now buys nothing, because the answer here comes
 * from the session row and the httpOnly cookie.
 */
import { currentUser } from "@/lib/server/auth";
import { route, ok } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  const user = await currentUser();
  if (!user) return ok({ user: null });
  return ok({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleId: user.roleId,
      role: user.role,
      permissions: user.role.permissions,
    },
  });
});
