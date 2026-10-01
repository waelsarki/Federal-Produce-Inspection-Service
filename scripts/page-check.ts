// Confirms the existing pages still render after the API was added.
// Run with: node_modules\.bin\tsx.cmd scripts\page-check.ts
//
// The API work should be purely additive: the certificate pages must keep
// working exactly as before, so this checks the same routes the README lists.

// Marks the file as a module, so its top-level names stay local to it and do not
// collide with the other script in this folder.
export {};

const BASE = (process.env.BASE_URL ?? "http://localhost:3001").trim().replace(/\/+$/, "");

const PAGES = [
  "/",
  "/staff",
  "/staff/login",
  "/verify",
  "/certificate/FPIS-2026-0001",
];

async function main() {
  let failures = 0;
  for (const path of PAGES) {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    // 307 is the expected redirect from "/" to the staff sign-in.
    const expected = path === "/" ? [307, 200] : [200];
    const pass = expected.includes(res.status);
    if (!pass) failures += 1;
    console.log(`${pass ? "PASS" : "FAIL"}  ${res.status}  ${path}`);
  }
  console.log(`\n${failures === 0 ? "ALL PAGES OK" : `${failures} PAGE(S) FAILED`}`);
  if (failures > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
