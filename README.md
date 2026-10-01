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

## Site icon

The tab and home-screen icon is the Service emblem.

| File | Purpose |
|---|---|
| `app/favicon.ico` | Tab and bookmark icon, carrying 16, 32 and 48 px versions in one file |
| `app/apple-icon.png` | 180 × 180 icon for iOS home screens and bookmarks |

Both are generated from `public/images/fpis-logo.png`. That source scan still carries the certificate's security paper, so the artwork is separated from it by flood-filling inward from the image border — pale, low-saturation paper is made transparent, and because the fill only spreads from the outside, the white horses inside the laurel wreath are untouched. Emblem detail at 16 px is inevitably coarse; a tighter crop of the eagle and shield reads slightly better at that size, but it would need a second hand-made variant rather than a straight scale of the logo.

## Applicant flow

Applicants register before starting an application. Registration continues directly to shipment details without requiring a sign-in. Applicants sign in later to search their dashboard by application number.

## Certificate specimen

`/certificate/<application-number>` renders the certificate the Service issues for an approved export — **Certificate of Quality, Fumigation, Good Packaging Materials & Weight**. The dashboard links to it from the *Certificate* column as "Preview certificate". It is generated from the application stored in the same browser.

The sheet is laid out to match the Service's printed certificate:

- A4 (210 × 297 mm) on security paper, with the ministry letterhead, the national crest and the FPIS watermark.
- Certificate number (`NO: 20653`) and register reference (`REF : FP//AP/VOL..II/5753`) in the top right, above the issue date in the Service's format with its ordinal suffix: `25TH MAY, 2026`.
- The eleven numbered items in the Service's order: (1) exporter, (2) consignee, (3) description of commodity, (4) fumigation date, fumigant and the 21-day repetition note, (5) standard pack, (6) gross and net weight, (7) shipment date and grade, (8) packaging condition, (9) NXP form number and estimated value, (10) moisture content, (11) vessel and voyage, destination, bill of lading and port of loading.
- `QUALITY ANALYSIS OF EXPORT` with the grade, the circulation list (Exporter, Director FPIS, Issuing Station) and the `FOR: DIRECTOR,` signature block.
- Dotted leader rules run out to the right margin on every entry, and items without a value keep the empty rule, as the paper form does.

| Route | Purpose |
|---|---|
| `/certificate/<application-number>` | The certificate sheet for one application, with print output |

**Where the sheet comes from**

- `components/CertificateSheet.tsx` renders the entry layer; `app/certificate.css` positions it on the page in millimetres so screen and print match the paper.
- `components/CertificateBarcode.tsx` draws the register reference as a Code 39 symbol in the footer. `lib/barcode.ts` holds the encoder: Code 39 because it is self-checking, every ordinary scanner reads it, and its alphabet covers the digits, letters and separators in an FPIS reference. The symbol is sized in millimetres (0.25mm module, 9mm bar height) with the 10-module quiet zones the standard requires, so it scans the same on screen and on the printed A4. Anything outside the symbology is substituted for a hyphen, and `*` is reserved so encoded data cannot inject its own start/stop delimiters.
- `public/images/fpis-crest.png` and `public/images/fpis-logo.png` are the national crest and the Service emblem, taken from the letterhead of the supplied certificate and cleaned so that only the artwork is left. The security micro-text and the watermark are drawn by `app/certificate.css` around them, so the letterhead stays sharp at any zoom and in print.
- `lib/certificate.ts` turns an application into a certificate: kilogram weights become MTS to three decimals, dates become `DD/MM/YYYY`, the issue date takes its ordinal form, the certificate number and register reference are derived from the application number (so one application always shows the same pair), the station code in the reference comes from the port of loading, and `QUALITY ANALYSIS OF EXPORT` repeats the grade recorded on the application.
- Fields the application does not collect yet — bill of lading details after sailing, for example — print as the empty dotted rule the paper form carries until an officer fills them in.

**Printing.** "Print or save as PDF" prints the sheet on its own at A4 with the security paper intact; on screen the sheet scales down to fit narrow windows.

**This is a specimen, not an issuance.** The sheet carries a printed line saying so, and the prototype notice above it repeats it. Nothing is signed, registered, numbered from an official register or digitally verifiable — `/verify` still returns application records only.

## Staff access

A staff portal is the only signed-in surface in this project.

| Route | Purpose |
|---|---|
| `/staff/login` | Staff sign-in |
| `/staff` | Admin console (guarded, redirects to sign-in without a session) |

The console at `/staff` is a single-panel workspace. The sidebar is the only navigation: each control swaps the main area to exactly one section, and Overview is what opens by default. Sections are Overview, Review applications, Generate certificates, Configure certificate, Approval workflow, Create user roles, Admin profile and Change password; the last three configuration sections appear only when the signed-in role grants the matching permission, and the sidebar numbers itself from what it actually renders. The sidebar fills the full column and viewport height and stays put while the main area scrolls, and every control is a full-width button of identical height, so switching sections never shifts the layout.

`lib/staff.ts` seeds one **super admin** account (`waelsarki@gmail.com`) into browser storage on first use. Seeding is idempotent — an existing account with that email is never overwritten, so a rotated password survives a reload.

Reach it from the footer ("Staff login") or from the Quick links menu under **More → Staff login**.

**Handle the seeded credential carefully.**

- Only the SHA-256 hash of the password is stored in `lib/staff.ts`; the password itself is not in the repository or the server-rendered HTML. The hash does reach the client JavaScript bundle, so treat it as a published default, not a secret.
- Sign in and change the password from the console before sharing this build with anyone.
- Staff accounts live in one browser's local storage, exactly like applicant accounts. Anyone with browser devtools can read or edit them.

## Roles and approval levels

The super admin console can configure roles and the approval workflow. Both are stored in browser storage and seeded once, so existing configuration is never overwritten on reload.

**Roles** (`components/admin/RoleManager.tsx`, stored under `fpis.staffRoles`)

- Each role has a name, description and a set of permissions.
- Create roles from the console; new roles start with `applications.view` only, so grant permissions deliberately.
- Permissions come from a fixed catalogue in `lib/staff.ts` (`STAFF_PERMISSIONS`): view, review, decide approvals, issue certificates, manage staff and roles, and configure the workflow. The catalogue is fixed because arbitrary permission strings would need a server to evaluate.
- Super Admin is a system role: its permissions are locked and it cannot be deleted.
- A role is refused deletion while an account is assigned to it or an approval level still points at it, so configuration never breaks a reference.

**Approval levels** (`components/admin/ApprovalLevelManager.tsx`, stored under `fpis.staffApprovalWorkflow`)

- Applications advance through the levels in the order shown. Reorder with the ↑/↓ controls; `order` is renumbered on every save so it always matches the list.
- Each level binds to a role, a number of approvals needed, a target in days, and a **required** flag. An optional level can be skipped.
- Add levels, edit fields inline (text fields save on blur), remove levels, or **Reset** to the default three: inspection review → quality and certification sign-off → final approval.

Both panels only render for a signed-in account whose role grants `roles.manage` and `workflow.manage` respectively.

**What this does not do:** the workflow is configuration only. No application is actually advanced, approved or rejected against these levels yet — that remains listed under Prototype limits.

## Prototype limits

- This front-end prototype stores one applicant profile and application records in the current browser's local storage. It is not production authentication or durable storage.
- Staff sign-in has the same limits: seeded accounts are local to one browser, the session is a sessionStorage flag that is trivially forged, and role checks happen in the browser rather than on a server.
- Payment checkout and evidence review, creating and editing staff accounts, executing approval decisions against the configured levels, official certificate issuance (the certificate sheet is a specimen generated in the browser), and secure barcode verification are not connected.
- Generated references are preview identifiers, not official FPIS application or certificate numbers. The certificate number, register reference and station code on the specimen are derived from the application for display only.
- Do not enter real personal, financial, or shipment data into this prototype.

Production requires a trusted server-side backend, persistent database, secure identity/session management, payment-provider verification, protected document storage, auditable role-based approval, and signed certificate verification.