# BOVAS & Company — Logistics Platform (web)

Next.js front end for the BOVAS & Company fuel-logistics platform: a sign-in screen and
three role workspaces (Logistics, Admin, Safety).

The backend is a separate core PHP API, **`bovas-api`** (sibling repo). Pages load data
through `src/lib/api`. With `API_URL` unset (the default), a built-in mock adapter answers
every call with the same shapes the API will return, so nothing is saved yet.

Live: **https://bovas.vercel.app** · Local: `npm run dev` → http://localhost:3000

## Workspaces & routes

| Workspace | Entry | Pages |
| --------- | ----- | ----- |
| Sign in | `/` | `/forgot` · `/reset` |
| Logistics | `/dashboard` | `/loading-program` · `/generate-ticket` · `/ticket-preview` · `/ticket-history` (+ `/[ticketId]`) · `/reports` · `/support` · `/settings` |
| Admin | `/admin` → `/admin/dashboard` | `/admin/audit` (+ `/[auditId]`) · `/admin/staff` (+ `/[staffId]`, `/new`) · `/admin/marketer-records` · `/admin/activity-reports` · `/admin/support` · `/admin/settings` |
| Safety | `/safety` → `/safety/tickets` | `/safety/history` (+ `/[ticketId]`) · `/safety/support` · `/safety/settings` |
| Dispatch | `/dispatch` → `/dispatch/loading` | `/dispatch/waybills` · `/dispatch/gate` |
| — | `/waybills/[waybillNo]` | printable waybill (Dispatch, Logistics, Admin) |
| — | `/no-access` | shown when a page belongs to another workspace |

Sign-in is real: each account lands in its own workspace, and the workspace layouts send
signed-out visitors to `/` and staff from another workspace to `/no-access`. Support and
Settings are placeholders in every workspace.

Demo accounts (password `Bovas@2026`) are listed under the sign-in form in development and
whenever no API is connected:

| Workspace | Email                              |
| --------- | ---------------------------------- |
| Logistics | `olatejuoyetoke@bovasgroups.com`   |
| Admin     | `olayinkafagboore@bovasgroups.com` |
| Safety    | `abdullahaiyedun@bovasgroups.com`  |
| Dispatch  | `modupejohnson@bovasgroups.com`    |

### How sessions work

- The **Sign In** server action calls `POST /api/auth/login` and keeps the token in the
  httpOnly `bovas_session` cookie ("Remember me" keeps it for the 12-hour token lifetime;
  otherwise it ends with the browser).
- `src/proxy.ts` sends visitors without that cookie to sign in, remembering the page.
- Each workspace layout calls `requireRole()`, which checks the session with `GET /api/me`
  once per request. The API still checks the token and role on every call.
- **Logout** revokes the token and deletes the cookie.

## Tech stack

| Concern   | Choice                                                         |
| --------- | -------------------------------------------------------------- |
| Framework | Next.js 16 (App Router), React 19                              |
| Language  | TypeScript (strict)                                            |
| Styling   | Tailwind CSS v4 — tokens in `src/app/globals.css`              |
| Variants  | `class-variance-authority` + `tailwind-merge`                  |
| Icons     | `lucide-react`                                                 |
| API types | Generated from `bovas-api/openapi.yaml` by `openapi-typescript` |
| Hosting   | Vercel, deploys from `main`                                    |
| Backend   | Core PHP 8.2+ API with MySQL — see `bovas-api`                 |

## Getting started

```bash
npm ci
npm run dev          # http://localhost:3000, on mock data
npm run lint         # run before pushing — `next build` doesn't lint
npm run typecheck
npm run build        # production build + typecheck
```

To use the PHP API instead of mock data, run `composer db:seed` and `composer serve` in
`bovas-api`, then:

```bash
cp .env.example .env.local   # set API_URL=http://localhost:8000, then restart npm run dev
```

Only the endpoints the API has built so far go live. `API_PHASE` in `src/lib/api/client.ts` is
currently 6:

- **Sign-in:** sign-in and password reset.
- **Workflow:** loading programs, tickets, the safety queue and inspections.
- **Dashboard:** stats and charts.
- **Dispatch and audit:** loading, overload approvals, waybills, the gate and the audit log.
- **Administration:** staff management with profile pictures, marketers' records and
  activity reports.
- **Everyone:** Settings (profile and password), Support, and the notification bell. Admins
  also get the support inbox and depot settings: terminals, the safety checklist and the
  overload tolerance.

### Notifications, support and settings

- **Notification bell:** it's in every workspace. The layout renders the latest notifications,
  and the bell checks for new ones every 30 seconds while the tab is visible. Opening a
  notification marks it read and goes to the page that deals with it
  (`src/domain/notifications.ts`).
- **Support:** each workspace's Support page has answers for that role (`src/config/support.ts`)
  and a form that notifies and emails the admins. Admins work through requests under
  **Support**.
- **Admin Settings → Depot:** each section saves on its own. The overload tolerance is used by
  the API and by Dispatch's preview of a load (`src/domain/overload.ts`).
- **Page states:** every workspace has a loading skeleton and an error state with **Try Again**.
- **Small screens:** below 640px, tables built with `ResponsiveTable` turn into labelled cards.

### End-to-end tests

The Playwright tests in `e2e/` run against a real bovas-api:

- **`golden-path.spec.ts`:** a truck goes through every step, each in its own signed-in session.
  1. Logistics starts a ticket from the loading program.
  2. Safety approves it.
  3. Dispatch records the load, issues the waybill and clears the gate.
  4. Logistics and the admin audit trail both show the result.
- **`role-access.spec.ts`:** signed-out visitors are sent to sign in. Each role opens its own
  pages and downloads, and gets "no access" everywhere else.

To run them:

1. Start the API with `composer serve` in `bovas-api`.
2. Start the web app with `npm run dev`, with `API_URL` set in `.env.local`.
3. Run:

   ```bash
   npx playwright install chromium   # once
   npm run test:e2e
   ```

Every run resets the demo depot first with `php ../bovas-api/bin/reset-demo.php`. Set
`BOVAS_API_DIR` if the API lives elsewhere. To run against staging, set `E2E_BASE_URL` and
`E2E_SKIP_RESET=1`.

CI (`.github/workflows/ci.yml`) runs three checks on every pull request:

- Lint, typecheck and build.
- A check that `src/lib/api/schema.d.ts` still matches `bovas-api/openapi.yaml`.
- The end-to-end tests against a fresh API and MySQL.

For CI to check out the API, set the `API_REPOSITORY` variable, plus the `API_REPO_TOKEN`
secret if the API repository is private. `bovas-api/DEPLOY.md` covers the rest of the
production setup.

### Tables, filters and exports

- **Filters in the URL:** search, filters, sort, period (Today, This Week, and so on), Archive
  year and page are all stored in the URL (`src/components/ui/table-controls.tsx`). A filtered
  view can be shared or bookmarked, and every page number comes from the API.
- **CSV exports:** they download through route handlers under `src/app/download`, so the API
  token never reaches the browser. Each export matches the filters on screen:
  - The activity report is streamed from the API.
  - Ticket History, the Audit Log and the Safety History Log are built from the paged list
    endpoints, capped at 5,000 rows.
- **Profile pictures:** they load through `/staff-avatars/{staffNo}`.
- **Toasts:** confirmations use `useToast()`. A redirect can pass `?toast=<key>` from
  `src/config/toasts.ts`.

Screens from later phases keep using mock data until their phase lands, so the app works end
to end at every stage. Password-reset emails are written to `bovas-api/storage/logs/mail.log`
locally.

### The ticket workflow

1. **Admin** uploads the day's loading program from the dashboard. The dialog checks every row
   before anything is saved; the template is at `public/templates/loading-program.csv`.
2. **Logistics** opens **Loading Program** and clicks **Start Ticket** on a truck. They
   complete the form, preview the letterhead and click **Create Ticket**. Until Safety
   decides, the ticket can be edited from its detail page.
3. **Safety** sees the ticket in **Tickets Queue**. The queue refreshes every 30 seconds and
   shows how long each truck has waited. Safety works through the checklist, then approves or
   rejects with a reason.
4. **Logistics** sees the decision, with who made it and when, on the ticket's detail page.
5. **Dispatch** records the litres each approved truck loaded in **Loading Queue**, seeing
   before saving whether it's within limit (1% over the request, and no more than the truck
   holds). Overloaded trucks go to an admin.
6. **Admin** approves or denies overloads from the card on the dashboard.
7. **Dispatch** issues the waybill in **Waybills**, prints it (`/waybills/[waybillNo]`), and
   clears the truck in **Gate**. The ticket's page and the Admin **Audit Log** show every step
   with its time and who did it.

Writes go through server actions (`features/*/actions.ts`), which call `src/lib/api`. The API's
422 errors appear under the matching form fields.

After changing `../bovas-api/openapi.yaml`, regenerate the types and commit the result:

```bash
npm run api:types            # writes src/lib/api/schema.d.ts
```

## Project structure

```
src/
├── app/
│   ├── layout.tsx         # root layout: Inter font, metadata
│   ├── globals.css        # design tokens (@theme)
│   ├── (auth)/            # sign in (/), /forgot, /reset
│   ├── (dashboard)/       # Logistics workspace, wrapped in DashboardShell
│   ├── admin/             # Admin workspace, DashboardShell role="admin"
│   └── safety/            # Safety workspace, SafetyShell
├── components/
│   ├── ui/                # primitives: Button, Input, Card, Badge, Checkbox…
│   ├── layout/            # DashboardShell, Sidebar, Topbar, PagePlaceholder
│   └── brand/             # Logo
├── domain/                # UI wording for API enums (truck types, statuses, reasons)
├── features/              # per-workspace components (presentation only)
│   └── auth/ · dashboard/ · admin/ · safety/
├── lib/
│   ├── api/
│   │   ├── schema.d.ts    # GENERATED from openapi.yaml — never edit by hand
│   │   ├── types.ts       # named aliases for the generated types
│   │   ├── client.ts      # fetch wrapper: live API or mock, errors as ApiError
│   │   ├── tickets.ts …   # one module per API area (server-only)
│   │   └── mock/          # contract-shaped fixtures used while API_URL is unset
│   ├── format.ts          # litres, variance, Lagos date/time
│   └── search.ts          # client-side search matching
└── config/                # nav.ts (sidebar items per role), site.ts
```

## Conventions

- **Data flows down from pages.** Pages are async server components that fetch through
  `@/lib/api/*` and pass results to components as props. Those modules are server-only;
  client components import nothing from `@/lib/api` except types from `@/lib/api/types`.
- **The contract owns the shapes.** Never hand-write an API response type. Change
  `openapi.yaml`, run `npm run api:types`, and update the mock fixtures to match — the
  typechecker points at every place that needs changing.
- **Tokens only.** Colours, fonts and radii live in `globals.css` under `@theme`, including
  the ticket letterhead palette. Use utilities such as `bg-primary` or
  `text-letterhead-ink` — never hex values or raw palette classes like `bg-red-600`.
- **`components/ui` stays app-agnostic.** Anything domain-specific (a loading ticket, a
  marketer chart) belongs in `features/`.
- **Variant-driven primitives.** Buttons and badges expose typed variants via `cva`; merge
  classes with `cn()` so caller overrides win.
- **Server by default.** Only components that need state or browser APIs start with
  `"use client"`.
- **Depot time.** Dates and times display in Lagos time (`Africa/Lagos`) via `lib/format`.
- **Identifiers.** Ticket numbers are 8 digits (`24989001`), waybills look like
  `A1234567`, staff IDs like `BO001`. All are issued by the API.

## Roadmap

0. Stabilise the prototype — done
1. API contract and data layer — done; shared table/dialog components still to build
2. PHP API sign-in and roles
3. Loading program → ticket → safety inspection, saved for real
4. Loading, overload approval, waybill, gate clearance (new Dispatch workspace)
5. Staff and marketer management, reports and exports
6. Settings, support, notifications, accessibility
7. Tests, CI, security review, launch
