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

**Completing the fields before printing** (`components/admin/CertificateFieldsForm.tsx`, `lib/certificate-fields.ts`)

The applicant cannot know what the Service measured, so the certificate page carries an editor above the sheet for the values only an inspector has: fumigation date and fumigant, standard pack, gross and net weight, grade, moisture, packaging condition and the export and logistics details.

- Every input is **pre-filled** from the application and the applicant profile, so an officer is correcting and completing rather than retyping. The exporter name and address fall back to the applicant's own organisation and address when the application does not carry them.
- Saving writes to a separate `certificateData` override on the application. The applicant's original submission is **never overwritten**, and a blank override does not erase a submitted value.
- The header counts the required fields still blank. A field that is **disabled in the certificate template is not offered and is not counted**, so an officer is never asked for something the sheet will not print.
- The issue date is fixed on first save and reused afterwards, so re-opening or re-printing a certificate cannot silently change the date on a document that has already been issued.
- The sheet below re-renders immediately from the resolved values — kilogram weights still print as MTS to three decimals.
- A role without `certificates.issue` sees the same values read-only, with no save button.

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

### Recent activity

Below the Overview counts, `components/admin/ActivityFeed.tsx` lists the six most recent applications newest-first, each with a colour-coded marker (issued, approved, awaiting approval, rejected), the application number, commodity and destination, the status verbatim, and its age. Ages are relative for the last seven days ("40 min ago", "2 days ago") and fall back to a date beyond that.

**This is not an audit log.** Nothing in the project records who performed an action or when, so each row is derived from the application record itself: the marker comes from the free-text `status`, and the timestamp shown is the application's `submittedAt` — the only date the data actually carries. It answers "what is the current standing of my most recent work", not "who did what". The logic lives in `lib/activity.ts`; replacing it with genuinely recorded events needs the server-side work listed under Prototype limits.

`components/admin/ActivityFeed.tsx` renders it.

**Handle the seeded credential carefully.**

- Only the SHA-256 hash of the password is stored in `lib/staff.ts`; the password itself is not in the repository or the server-rendered HTML. The hash does reach the client JavaScript bundle, so treat it as a published default, not a secret.
- Sign in and change the password from the console before sharing this build with anyone.
- Staff accounts live in one browser's local storage, exactly like applicant accounts. Anyone with browser devtools can read or edit them.

## Roles and approval levels

The super admin console can configure roles and the approval workflow. Both are stored in browser storage and seeded once, so existing configuration is never overwritten on reload.

**Roles** (`components/admin/RoleManager.tsx`, stored under `fpis.staffRoles`)

- Each role has a name, description and a set of permissions.
- Create roles from the console; new roles start with `applications.view` only, so grant permissions deliberately.
- Role creation optionally collects a **sign-in** in the same form: staff name, email and an initial password. Leaving those three blank creates the role only, so a role can be defined before the person is known.
- The initial password is hashed with SHA-256 in the browser before it is stored and is never written anywhere in plain text. It must be at least 12 characters; an email already used by another account is refused.
- If the account cannot be created, the **role is kept** and the failure is reported — a role an admin has just configured is never silently discarded.
- Each role lists the sign-ins that use it, and any of them except the seeded super admin can be removed without deleting the role.
- Permissions come from a fixed catalogue in `lib/staff.ts` (`STAFF_PERMISSIONS`): view, review, decide approvals, issue certificates, manage staff and roles, and configure the workflow. The catalogue is fixed because arbitrary permission strings would need a server to evaluate.
- Super Admin is a system role: its permissions are locked and it cannot be deleted.
- A role is refused deletion while an account is assigned to it or an approval level still points at it, so configuration never breaks a reference.

**Approval levels** (`components/admin/ApprovalLevelManager.tsx`, stored under `fpis.staffApprovalWorkflow`)

- Applications advance through the levels in the order shown. Reorder with the ↑/↓ controls; `order` is renumbered on every save so it always matches the list.
- Each level binds to a role, a number of approvals needed, a target in days, and a **required** flag. An optional level can be skipped.
- Add levels, edit fields inline (text fields save on blur), remove levels, or **Reset** to the default three: inspection review → quality and certification sign-off → final approval.

Both panels only render for a signed-in account whose role grants `roles.manage` and `workflow.manage` respectively.

**How decisions are made.** `lib/approvals.ts` runs the workflow. An application walks the levels in order; a level marked *required* must reach its approval quota before the next one opens, and a level that is not required never blocks completion. One account holds at most one decision per level, so a quota above 1 genuinely needs different people. The work queue shows the open level, an optional note, Approve / Reject controls, and the decision trail; each entry records who decided, at which level, when, and the note. `recordDecision` runs the authorisation check itself rather than trusting the caller, and moves the record's free-text status to match.

**Super Admin is deliberately exempt.** It may decide any level regardless of the role bound to it, and a single Super Admin approval satisfies the level outright. That is what lets one person carry an application from end to end. It is an administrative shortcut with no segregation of duties, which is exactly why real use needs a server that records the actor and refuses the shortcut.

Two consequences of the shipped defaults worth knowing: the first level is bound to the Inspector role, but Inspector does not hold `applications.decide`, so in practice only Super Admin can clear it. And applications seeded before this engine existed carry no decisions, so the engine honours their free-text `status` instead — an already-issued certificate will not offer approval buttons.

**What this does not do:** decisions are stored in browser storage and the trail is append-only only in the UI. It is not tamper-evident, and anyone with devtools can rewrite or delete it.

## Responsive behaviour

`app/quicklinks.css` was written for the password field and the super-admin configuration panels, but nothing imported it, so those components rendered unstyled — the show/hide toggle fell back to browser defaults, and the roles, approval-level and certificate-template panels lost their card, border and button styling. The app shell now imports it, immediately after `globals.css` and before the `*-overrides.css` files so the overrides still win.

Control sizing follows the pointer, not the width alone. The console's sidebar links (34px) and admin buttons (31px) suit a mouse, so a `(hover: none), (pointer: coarse), (max-width: 820px)` block grows them to 44px on touch. Width is included in that query deliberately: a narrow desktop window is mouse-driven, and some touch laptops still report a fine pointer. Desktop layout is unchanged.

Verified with a headless sweep of all four routes (`/staff`, `/staff/login`, `/certificate/<ref>`, `/verify`) at 320, 390, 620, 700, 768, 1024, 1051 and 1440px, including the 620/700/1050 breakpoint edges, checking for horizontal overflow, clipped text, undersized tap targets and console errors. The certificate sheet is scaled to the viewport, so it stays within 320px.

## Prototype limits

- This front-end prototype stores one applicant profile and application records in the current browser's local storage. It is not production authentication or durable storage.
- Staff sign-in has the same limits: seeded accounts are local to one browser, the session is a sessionStorage flag that is trivially forged, and role checks happen in the browser rather than on a server.
- Payment checkout and evidence review, creating and editing staff accounts, official certificate issuance (the certificate sheet is a specimen generated in the browser), and secure barcode verification are not connected.
- Approval decisions run in the browser against browser storage. Super Admin is exempt from role binding and from the approval quota, so a single person can approve an application alone; and the decision trail is not tamper-evident. Both need a server before they mean anything.
- Generated references are preview identifiers, not official FPIS application or certificate numbers. The certificate number, register reference and station code on the specimen are derived from the application for display only.
- The Overview's Recent activity feed is derived from application records, not an event log. It shows each application's current status and its submission date; it cannot show who approved or issued anything, or when that happened. A real activity trail needs server-side event recording.
- Do not enter real personal, financial, or shipment data into this prototype.

Production requires a trusted server-side backend, persistent database, secure identity/session management, payment-provider verification, protected document storage, auditable role-based approval, and signed certificate verification.