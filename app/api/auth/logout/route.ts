/** POST /api/auth/logout - ends the server session and clears the cookie. */
import { destroySession, currentUser, recordEvent } from "@/lib/server/auth";
import { route, ok } from "@/lib/server/http";

export const POST = route(async () => {
  const user = await currentUser();
  await destroySession();
  if (user) {
    await recordEvent({ actor: user, action: "logout", entity: "staff", entityId: user.id });
  }
  return ok({ signedOut: true });
});
