# BOVAS & Company — Logistics Platform

Front end for the BOVAS & Company fuel-logistics platform — a sign-in screen plus
three role-based dashboards (Logistics, Admin, Safety).

## Dashboards & preview

Live: **https://bovas.vercel.app/**  ·  Local: `npm run dev` → `http://localhost:3000`

| Dashboard | For | Path | Highlights |
| --------- | --- | ---- | ---------- |
| **Logistics** | Logistics Officer | `/dashboard` | Operations stats, per-marketer charts, today's loading tickets, generate-ticket flow, ticket history |
| **Admin** | Admin | `/admin` → `/admin/dashboard` | 4 stat cards + charts, audit log (+ detail), staff management (+ detail/add), marketers' records, activity reports |
| **Safety** | Safety Officer | `/safety` → `/safety/tickets` | Tickets queue + safety checklist (approve/reject), inspection history log (+ detail) |

`/` is the **Sign In** screen; clicking **Sign In** lands on the Logistics dashboard.
Visit `/admin` or `/safety` directly for the other two.

Useful sub-pages: `/generate-ticket`, `/ticket-history` · `/admin/audit`, `/admin/staff` ·
`/safety/tickets`, `/safety/history`.

## Tech stack

| Concern        | Choice                                            |
| -------------- | ------------------------------------------------- |
| Framework      | Next.js 16 (App Router, React 19)                 |
| Language       | TypeScript (strict)                               |
| Styling        | Tailwind CSS v4 (CSS-first `@theme` tokens)       |
| Variants       | `class-variance-authority` + `tailwind-merge`     |
| Icons          | `lucide-react`                                     |

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000  (sign-in at /)
npm run build    # production build (also typechecks + lints)
npm run lint
```

## Architecture

Routes use **route groups** so the auth surface and the authenticated app each get
their own layout without leaking URL segments.

```
src/
├── app/
│   ├── layout.tsx                # root: fonts, <html>, global metadata
│   ├── page.tsx                  # /  → redirects to /sign-in
│   ├── globals.css               # design tokens (@theme) + base layer
│   ├── (auth)/                   # unauthenticated surface
│   │   ├── layout.tsx            # centered, full-screen
│   │   └── sign-in/page.tsx      # /sign-in
│   └── (dashboard)/              # authenticated app shell
│       ├── layout.tsx            # sidebar + topbar (DashboardShell)
│       ├── dashboard/page.tsx    # /dashboard  (the logistics home)
│       ├── loading-program/…     # nav destinations (placeholders for now)
│       ├── reports/…
│       ├── ticket-history/…
│       ├── support/…
│       └── settings/…
├── components/
│   ├── ui/                       # design-system primitives (Button, Input, Card…)
│   ├── layout/                   # app shell (Sidebar, Topbar, DashboardShell)
│   └── brand/                    # Logo
├── features/                     # feature-scoped composites + data + types
│   ├── auth/components/
│   └── dashboard/{components,data,types.ts}
├── config/                       # nav + site metadata as data
└── lib/                          # cn(), formatters
```

### Conventions

- **Design tokens are the single source of truth.** Colors, fonts, and radii live
  in `src/app/globals.css` under `@theme`. Components reference them through
  Tailwind utilities (`bg-primary`, `text-muted-foreground`, `rounded-card`) —
  **never** hardcode hex values in a component.
- **`components/ui` is presentation-only and app-agnostic.** Anything
  domain-specific (a loading ticket, a marketer chart) belongs in `features/`.
- **Variant-driven primitives.** Buttons/badges expose typed variants via `cva`;
  combine classes with `cn()` so caller overrides win.
- **Server by default.** Components are React Server Components unless they need
  state or browser APIs, in which case they start with `"use client"`
  (the sign-in form, the tickets table, and the shell's mobile drawer).
- **Data is mocked** under `features/*/data` and typed in `features/*/types.ts`,
  ready to be swapped for real API calls.

## Status & next steps

This is the structural foundation. Known follow-ups:

- Swap the placeholder **logo** and the sign-in **illustration** for the exported
  Figma assets.
- Pixel-polish spacing/typography against the design once assets land.
- Wire **authentication** (the sign-in form and `currentUser` in `DashboardShell`
  are stubbed) and replace mock data with the real API.
- Make the chart filters and table sort/filter/pagination functional.
