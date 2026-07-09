# Linely — Queue Management SaaS

A high-fidelity Queue Management Software-as-a-Service (SaaS) with a landing page, operator console, admin dashboard, and superadmin panels.

## Run & Operate

- `pnpm --filter @workspace/linely run dev` — run the frontend (port auto-assigned via workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite 7, Tailwind CSS v4
- Animation: motion/react (v12)
- Charts: Recharts
- Icons: Lucide React
- Backend: Express 5 (API server, minimal — app is mostly frontend-driven)

## Where things live

- `artifacts/linely/src/App.tsx` — root app with state-driven view routing
- `artifacts/linely/src/components/` — 30 components (AdminDashboard, OperatorConsole, SuperadminDashboard, etc.)
- `artifacts/linely/src/types.ts` — shared TypeScript types
- `artifacts/linely/src/index.css` — Tailwind v4 theme with brand colors (navy, cyan, cream)

## Product

**Views (state-driven SPA):**
- **Landing** — marketing page with hero, features, pricing, industries
- **Auth** — login/role selector portal
- **Operator Console** — frontline counter management with real-time queue, Web Audio chimes, camera scanner
- **Admin Dashboard** — queue stress simulator, branding toolkit, audit logs
- **Superadmin Dashboard** — platform-level tenant management, billing, system health
- **Company Superadmin** — company-level admin control panel
- **Waiting Room TV** — display screen for customers
- **Product / Contact pages** — additional marketing surfaces

## Architecture decisions

- Pure frontend SPA — all state is in-memory React state (no database needed for demo)
- Web Audio API for chimes (no sound file assets required)
- `motion/react` package (not `framer-motion`) for animations

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Components use `motion/react` imports (framer-motion v12 new package name)
- AdminDashboard.tsx exceeds 500KB (Babel deoptimises styling — normal warning)
- Some Lucide icon props use `aria-label` instead of `title` (TS constraint)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
