// End-to-end check of the new API against a running dev server.
// Run with: node_modules\.bin\tsx.cmd scripts\api-check.ts
//
// Verifies the things that matter: that a request without a session is
// rejected, that a real sign-in works, that the cookie is httpOnly, and that
// the seeded account can read data the browser no longer stores.

// Trimming the base URL, so a stray space in BASE_URL cannot produce an invalid
// URL further down.
//
// export {} marks this file as a module, keeping its top-level names local so
// they do not collide with the other script in this folder.
export {};

const BASE = (process.env.BASE_URL ?? "http://localhost:3001").trim().replace(/\/+$/, "");

let failures = 0;
function check(label: string, pass: boolean, extra = "") {
  if (!pass) failures += 1;
  console.log(`${pass ? "PASS" : "FAIL"}  ${label}${extra ? `  ${extra}` : ""}`);
}

async function call(
  path: string,
  init: RequestInit & { jar?: string } = {},
): Promise<{ status: number; body: any; setCookie: string; jar: string }> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set("content-type", "application/json");
  if (init.jar) headers.set("cookie", init.jar);
  const res = await fetch(`${BASE}${path}`, { ...init, headers, redirect: "manual" });
  const setCookie = res.headers.get("set-cookie") ?? "";
  const jar = init.jar
    ? [init.jar, ...(setCookie ? [setCookie.split(";")[0]] : [])].filter(Boolean).join("; ")
    : setCookie.split(";")[0];
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body, setCookie, jar };
}

const results: string[] = [];
const log = (line: string) => {
  results.push(line);
  console.log(line);
};

// Wrapped in a function because tsx compiles this file as CommonJS, where
// top-level await is not allowed.
async function main() {
log(`\nAPI check against ${BASE}\n${"=".repeat(60)}`);

  // The real sign-in cannot be tested without the seeded password. Without this
  // guard a missing variable would surface as a confusing 400 from the login
  // route, rather than as the environment problem it actually is.
  if (!process.env.SEED_SUPERADMIN_PASSWORD) {
    check("SEED_SUPERADMIN_PASSWORD is set in this shell", false, "set it to the password you seeded with");
    return;
  }

// 1. Anonymous access must be refused.
const anonApps = await call("/api/applications");
check("anonymous GET /api/applications is 401", anonApps.status === 401, `got ${anonApps.status}`);
check(
  "  and explains why",
  typeof anonApps.body?.error === "string",
  JSON.stringify(anonApps.body),
);

const anonMe = await call("/api/auth/me");
check("anonymous GET /api/auth/me reports no user", anonMe.body?.data?.user === null);

// 2. A wrong password must be refused, and must not create a session.
const badLogin = await call("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email: "waelsarki@gmail.com", password: "wrong-password" }),
});
check("login with a wrong password is 401", badLogin.status === 401, `got ${badLogin.status}`);
check("  and sets no session cookie", badLogin.setCookie === "");

// 3. The real sign-in.
const login = await call("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email: "waelsarki@gmail.com", password: process.env.SEED_SUPERADMIN_PASSWORD }),
});
check("login with correct credentials is 200", login.status === 200, `got ${login.status} ${JSON.stringify(login.body)}`);
const cookieIsHttpOnly = /HttpOnly/i.test(login.setCookie);
check("  session cookie is HttpOnly", cookieIsHttpOnly, login.setCookie.slice(0, 60));
check("  response carries no password hash", JSON.stringify(login.body).indexOf("passwordHash") === -1);
check("  super admin permissions are returned",
  Array.isArray(login.body?.data?.permissions) && login.body.data.permissions.length > 0,
  JSON.stringify(login.body?.data?.permissions));

const jar = login.jar;
check("  a session cookie was issued", jar.length > 0);

// 4. The same route that refused an anonymous caller now succeeds.
const authedApps = await call("/api/applications", { jar });
check("authenticated GET /api/applications is 200", authedApps.status === 200, `got ${authedApps.status}`);
check("  returns a list", Array.isArray(authedApps.body?.data), `${authedApps.body?.data?.length} rows`);

// 5. The forged session from the old prototype must not work.
const forged = await call("/api/applications", { jar: "fpis_staff_session=staff-waelsarki@gmail.com" });
check("forged cookie value is rejected", forged.status === 401, `got ${forged.status}`);

// 6. Audit events were actually written.
const auditRes = await call("/api/activity", { jar });
check("GET /api/activity is 200", auditRes.status === 200, `got ${auditRes.status}`);
const events = auditRes.body?.data ?? [];
check("  events were recorded in the audit log", events.length > 0, `${events.length} event(s)`);
const loginEvent = events.find((e: any) => e.action === "login");
check("  a sign-in was recorded", Boolean(loginEvent), loginEvent ? `${loginEvent.actorName} at ${loginEvent.at}` : "none");
if (loginEvent) {
  check("  it names the acting account", loginEvent.actorName === "FPIS Super Admin", loginEvent.actorName);
  check("  it records a real timestamp", !Number.isNaN(new Date(loginEvent.at).getTime()), loginEvent.at);
}

// 7. Signing out invalidates the session.
const logout = await call("/api/auth/logout", { method: "POST", jar });
check("logout is 200", logout.status === 200, `got ${logout.status}`);
const afterLogout = await call("/api/applications", { jar: logout.jar || jar });
check("  the old cookie no longer works", afterLogout.status === 401, `got ${afterLogout.status}`);

log(`${"=".repeat(60)}\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);

process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("\nThe check could not finish:", error);
  process.exit(1);
});
