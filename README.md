# Federal Produce Inspection Service

Next.js App Router starter for the FPIS applicant and certificate portal.

## Requirements

- Node.js 20.9 or later
- npm

## Run locally

```powershell
npm install
npm run dev
```

Open http://localhost:3000. To create a production build, run `npm run build` and then `npm start`.

## Troubleshooting

`next dev` and `next build` share the same `.next` folder. Building while the dev server is running overwrites its chunks, and the dev server then fails with `Cannot find module './<id>.js'` (require stack: `.next/server/webpack-runtime.js`). Stop the server, clear the cache and start again:

```powershell
# stop whatever is listening on port 3000
$connection = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($connection) { Stop-Process -Id $connection.OwningProcess -Force }
if (Test-Path .next) { Remove-Item .next -Recurse -Force }
npm run dev
```

The VS Code tasks "Stop FPIS Next.js development server" and "Clean FPIS Next.js build" perform the same two steps.

## Information pages

Every section of the Federal Produce Inspection Service is reproduced inside this portal. Nothing links back to an external website.

| Route | Purpose |
|---|---|
| `/information` | Index of all reference pages, grouped by section |
| `/information/<slug>` | The reference pages themselves (35 of them) |
| `/quick-links` | Full site directory, mirroring the agency's own menu |
| `/verify` | Check the status of a certificate or application reference |

Sections covered: About (including Vision, Mission & Mandate), Services, SOP (export guideline, statutory functions, operational areas, warehouse and port procedures, warehouse registration, costs, enforcement powers, offences, commodity and prohibited lists, glossary), Section of FPIS (all seven units), Publications (news, press releases, circulars, events, staff training, gallery) and History and Contact.

- `lib/fpis-content.ts` holds the page content, the Vision, Mission and Mandate text, and the head-office details. A single dynamic route (`app/information/[slug]/page.tsx`) renders every page and statically generates each one at build time.
- `lib/quicklinks.ts` holds the site directory. Every `href` is a local route: a reference page, an applicant-flow page, or this site. The footer directory, the `/quick-links` page and the header nav all read from it.

Vision, Mission and Mandate also appear on the home page and on `/information/vision-mission-mandate`.

To add or amend a page, edit `lib/fpis-content.ts` and add its slug to the relevant group in `INFO_GROUPS` and, if it should appear in the directory, to `lib/quicklinks.ts`.

Pages where FPIS has published no content yet (press releases, circulars, events, staff training, gallery) render the portal's standard empty state rather than placeholder text.

## Applicant flow

Applicants register before starting an application. Registration continues directly to shipment details without requiring a sign-in. Applicants sign in later to search their dashboard by application number.

## Prototype limits

- This front-end prototype stores one applicant profile and application records in the current browser's local storage. It is not production authentication or durable storage.
- Payment checkout and evidence review, staff roles and Super Admin, inspection review, final approval, official certificate issuance, and secure barcode verification are not connected.
- Generated references are preview identifiers, not official FPIS application or certificate numbers.
- Do not enter real personal, financial, or shipment data into this prototype.

Production requires a trusted server-side backend, persistent database, secure identity/session management, payment-provider verification, protected document storage, auditable role-based approval, and signed certificate verification.