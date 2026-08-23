# Operio — Project Overview

**Operio** is a multi-tenant SaaS operations platform for restaurants, cafés, and bakeries. It replaces paper checklists, WhatsApp chaos, and spreadsheets with a single mobile-first PWA covering daily operations, reporting, staff accountability, and performance tracking.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (Postgres, Auth, Storage, Row Level Security) |
| Data mutations | Next.js Server Actions |
| i18n | next-intl — English / Arabic, cookie-based locale, full RTL/LTR switching |
| Theming | Pure CSS `prefers-color-scheme` — dark mode by default, no JS toggle |
| PWA | Custom service worker, offline fallback page, installable manifest |
| Hosting | Vercel |
| Animation | Framer Motion |
| Icons | Lucide |

---

## 2. Multi-Tenant Architecture

- **Organizations → Branches → Users**, fully isolated per tenant.
- Every data table carries `organization_id` (and usually `branch_id`), enforced by **Postgres Row Level Security** — never trusted at the frontend layer alone.
- Three access layers on the backend:
  - `client.ts` — browser client, used in client components for realtime/subscriptions.
  - `server.ts` — SSR client, cookie-based, used in server components and Server Actions.
  - `admin.ts` — service-role client, **bypasses RLS**, server-only, used strictly for cross-tenant operations (onboarding a brand-new org, redeeming invite codes, platform admin views).

---

## 3. Roles & Permissions

Two independent role fields exist on every user:

### Platform role (SaaS-operator level, outside all tenants)
| Role | Scope |
|---|---|
| `platform_admin` | Cross-tenant dashboard — total orgs, active/trial/paid counts, users, branches, suspend/activate organizations. Not self-serve — granted manually in the database. |
| `org_user` | Default for every normal account. |

### Organization role (inside one tenant)
| Role | Typical scope |
|---|---|
| `organization_owner` | Full access to their organization. Created automatically as the first account when a new business signs up. |
| `operations_manager` | Near-full access; can manage branches, employees, invites. |
| `branch_manager` | Manages a single branch's staff and operations. |
| `supervisor` | Can award stars, approve overtime/purchases, manage checklists. |
| `employee` | Day-to-day operational access — tasks, capture, breaks, checklists. |

**Account creation paths:**
1. **Onboarding (`/onboarding`)** — bootstraps a brand-new tenant: creates the auth user, organization, first branch, trial subscription, and the owner profile in one transaction (service-role client, since no organization exists yet to scope RLS against).
2. **Invite codes (`/join`)** — an owner/manager generates a role-locked code from **More → Employees**; the invitee redeems it, and their account is created already locked to that role.

---

## 4. Core Modules

### Work
| Module | Description |
|---|---|
| Checklists | Trainer/manager-authored templates (opening, closing, cleaning, food safety, equipment, weekly, monthly); staff submit completed runs. |
| Break tracking | Start/end break, live "currently on break" view for managers. |
| Reminders | Recurring or one-time operational reminders (plant watering, expiry dates, deep cleaning, chemical solution changes) with due dates and completion tracking; recurring reminders auto-reschedule on completion. |
| Till Handover | Cash counting with automatic variance calculation (actual vs. expected cash). |
| Menu Experiments | New product trials — prepared/sold/waste counts, status pipeline (testing → needs changes → approved/rejected → launched), feedback thread. |
| Manual Purchases | Ad-hoc purchase logging with manager approval flow. |
| Business Trips | Distance/purpose/compensation logging. |
| Overtime | Request submission with manager approve/reject. |

### Reports
| Module | Description |
|---|---|
| Walk & Report | Guided store walk-throughs (opening, closing, food safety, cleaning, equipment, store readiness, custom) with photo evidence per stop, auto-generates a report on completion. |
| Incidents | Issues, mistakes, equipment problems, and photo notes — framed around learning and prevention, not punishment; severity-tagged. |
| Out of Stock | Log and resolve stock-out items. |
| Waste / Damage | Captured through the general Capture flow with photo evidence, cost tracking. |
| Critical Issues | High-severity incidents surfaced distinctly on the dashboard and Reports menu. |
| Inventory Count | Add/remove/view item counts (quantity + unit) per branch. |

### How-To Instructions
Three categories — **Cleaning**, **Maintenance**, **Preparation** — each holding manager-authored step-by-step guides (e.g. espresso machine cleaning, ice maker maintenance, V60 brewing methods). Managers/supervisors can add, edit, and delete guides; all staff can browse and expand them. Content is per-organization, not shared across tenants.

### Stars Board (management-only)
- Managers/supervisors award **Star of the Week** and **Star of the Month** to an employee, with an optional note.
- **KPI-driven suggestion**: the page surfaces a weekly auto-computed leaderboard candidate before the manager picks, scored from data already captured elsewhere in the app:

  ```
  Score = 35% task completion rate
        + 30% checklist completion rate
        + 15% reports filed (incidents + out-of-stock)
        + 20% till handover accuracy (variance ≤ 5 SAR)
  ```

  The score and its breakdown (tasks %, checklists %, reports count, till accuracy %) are shown per candidate. **The award itself is always a manual click** — the system never auto-selects a winner, keeping a human in the loop.

### Other
| Module | Description |
|---|---|
| Tasks | Assigned to-dos with pending/completed states. |
| Capture | Single entry point for on-the-spot reporting (waste, damage, issue, out of stock, mistake, equipment problem, photo note) — designed to be completed in under 30 seconds, camera-first. |
| KPIs (branch-level) | Aggregated per-branch metrics for owners/operations managers: waste cost, waste count, incident count, task compliance %. |
| Search | Cross-entity search across tasks, waste, incidents, employees, branches. |
| Employees | Invite generation, role assignment, employee listing. |
| Branches | Branch management for multi-location organizations. |
| Subscription | Current plan, trial countdown, branch/user usage vs. plan limits. |
| Profile & Settings | Personal profile editing, default language/currency (organization owner only). |
| Platform Admin | SaaS-operator dashboard — cross-tenant metrics and organization status. |

---

## 5. Navigation

- **Bottom navigation bar** — Home, Tasks, Capture (primary action), Reports, More — visible identically on both mobile and desktop widths, kept at a fixed compact size rather than stretching full-bleed on wide screens.
- **More menu** — restructured into four collapsible sections matching operational grouping:
  1. **Work** — checklists, breaks, reminders, till, menu experiments, purchases, trips, overtime
  2. **Reports** — walk & report, incidents, out of stock, waste/damage, critical issues, inventory count
  3. **How-To Instructions** — cleaning / maintenance / preparation guide categories
  4. **More** — profile, search, stars board, (owners/ops managers only: branches, employees, KPIs), settings, subscription, help, logout

---

## 6. Internationalization & Theming

- Full **English / Arabic** coverage across all pages, including form labels, placeholders, status values, and error states.
- `<html dir="rtl">` / `dir="ltr"` switches automatically with the selected locale; layout mirrors correctly (icons, chevrons, alignment).
- Locale is stored in a cookie and persists across sessions.
- **Dark mode is the default and only "theme"** — implemented purely in CSS via `prefers-color-scheme`, no JavaScript toggle, no flash-of-wrong-theme.
- Brand: deep violet primary, amber gold accent, Plus Jakarta Sans typography, theme-aware transparent logo (separate light/dark PNG variants swapped by CSS).

---

## 7. PWA & Offline Support

- Installable on mobile home screens (manifest.json).
- Custom service worker caches the app shell, manifest, and icon on install.
- Navigation requests fall back to a dedicated `/offline` page **only when the browser is genuinely offline** — fixed after a production bug where transient network hiccups incorrectly showed the offline page even while online.

---

## 8. Database

16 migrations applied to date (`supabase/migrations/0001` → `0016`), covering:
- Core schema (organizations, branches, users) + RLS policies
- Operations core (tasks, incidents, out-of-stock)
- Storage policies (photo uploads)
- Invite codes
- Checklists, shift handovers, till handovers
- Manual purchases, overtime & trips
- Menu experiments, break tracking, walk & report
- Stars board
- Reminders, inventory counts, how-to guides, KPI score snapshots

Every table has RLS enabled with organization-scoped `select`/`insert`/`update`/`delete` policies; management-only writes (e.g. how-to guides, KPI scores) are restricted to `organization_owner`, `operations_manager`, `branch_manager`, and `supervisor` roles at the database level, not just in the UI.

---

## 9. Known Gaps / Not Yet Built

- **How-To guide content** — the three categories exist and are fully functional, but no example guides are pre-seeded; content must be entered per-organization by a manager.
- **KPI history** — `kpi_scores` table exists for weekly snapshots, but nothing currently writes to it; the Stars Board computes scores live on each page load rather than persisting a historical trend.
- **Platform admin signup** — no self-serve path; must be granted manually via a direct database update on an existing account.
- **AI Operations Assistant** — explicitly out of scope per product decision.
