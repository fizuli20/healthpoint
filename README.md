# HealthPoint

> **Healthcare access, wherever life happens.**

HealthPoint is a mobile-first, accessible smart-city healthcare accessibility platform built to help citizens, older adults, persons with disabilities, and tourists locate nearby public Healthcare Access Points in Baku, verify equipment & wheelchair accessibility, initiate turn-by-turn or straight-line fallback navigation, and reach emergency numbers (`103` / `112`) immediately.

> **Important Notice**: HealthPoint access points and this platform do **not** replace ambulances, hospitals, physicians, or professional emergency medical treatment. Seeded Baku locations carry an explicit **"Demo Location — Not a Verified Healthcare Facility"** label until replaced by live municipal records.

---

## Features

- **Red & White Accessible Design System**: High-clarity `#FFFFFF` surfaces with `#C8102E` / `#E11D48` / `#8B1028` / `#FFF1F2` accents, Plus Jakarta Sans & Inter typography, distinct operational status badges, and safe-area mobile layout.
- **Interactive Clustered Map (`/`) & List Directory (`/nearby`)**:
  - React Leaflet + `leaflet.markercluster` with custom Red/Status pin markers, layer switcher (Standard Map & Minimal Light), geolocation permission & manual Baku origin setting, "Find Nearest", search & equipment/wheelchair/24-7 filters, and slide-up mobile sheet.
- **Access Point Detail (`/points/:id`) & Navigation (`/navigation/:id`)**:
  - Full station metadata, equipment inventory (`Blood pressure monitor`, `Heart rate monitor`, `Pulse oximeter`, `First-aid kit`, `SOS communication button`, `AED`), opening hours, last verified timestamp, issue reporting modal, live OSRM walking/driving route polyline with automatic straight-line fallback warning if OSRM is unreachable, and "Open in Google Maps" handoff.
- **Emergency SOS (`/emergency`)**:
  - Requires no authentication. Direct native `tel:103` and `tel:112` calling links, nearest suitable access point finder, private trusted emergency contact caller, and explicit confirmation dialog before sharing GPS coordinates.
- **AI / Deterministic Assistant (`/assistant`)**:
  - Uses Vercel serverless `/api/assistant` with server-side `OPENROUTER_API_KEY`, `NVIDIA_API_KEY`, `XAI_API_KEY`, `OPENAI_API_KEY`, or `GEMINI_API_KEY` when configured.
  - When no external AI key is configured (or locally offline), explicitly runs as a **Deterministic DB Assistant** matching queried equipment/accessibility against stored access points without fabricating responses or clinical diagnoses.
  - Supports browser Web Speech voice input (with graceful notice where unsupported).
- **Accessibility & Multi-Language (`/accessibility`, `/settings`)**:
  - Azerbaijani (`az`, default), English (`en`), and Russian (`ru`).
  - WCAG 2.2 AA targeted controls including **Easy Access Mode**, Large / Extra Large typography, High Contrast Mode, Reduced Motion, and Simple Language Mode.
- **Saved Bookmarks & Private Profile (`/saved`, `/profile`, `/login`)**:
  - Bookmark stations, manage private trusted emergency contacts (RLS-protected per user in Supabase, or local storage in Sandbox mode), and optional email/password login.
- **Role-Protected Admin Portal (`/admin`, `/admin/points`, `/admin/reports`, `/admin/analytics`)**:
  - Live KPI overview, full Access Point Create/Edit/Delete CRUD with delete confirmation, citizen Maintenance Report triage (`open` / `in_progress` / `resolved` / `dismissed`, technician assignment, notes), and computed analytics charts.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v7, TanStack Query, React Leaflet, `leaflet.markercluster`, i18next, Lucide Icons
- **Serverless / API**: Vercel Serverless Functions (`api/assistant.ts`) with per-IP rate limiting
- **Database & Auth Schema**: Supabase PostgreSQL + Row-Level Security (`supabase/migrations/001_init_healthpoint.sql`, `supabase/seed.sql`) with Demo Sandbox localStorage fallback when credentials are omitted
- **Testing**: Vitest, Testing Library, jsdom

---

## Local Development

```bash
npm install
npm run dev
```

### Verification Commands

```bash
npm run typecheck
npm test
npm run build
```

---

## Demo Sandbox vs Live Supabase Setup

Out of the box (without `.env` secrets), HealthPoint runs in **Demo Sandbox (Local DB)** mode:
- All 8 realistic Baku demo access points are seeded in `localStorage` and labeled as demo locations.
- `/login` offers explicit **Enter Demo User Session** and **Enter Demo Admin Session** buttons so reviewers can test all citizen and admin workflows without external accounts.

To connect a dedicated Supabase project:
1. Create a new Supabase project.
2. Run [`supabase/migrations/001_init_healthpoint.sql`](supabase/migrations/001_init_healthpoint.sql) in the SQL Editor to create `profiles`, `access_points`, `saved_access_points`, `emergency_contacts`, `maintenance_reports`, `usage_events`, and strict RLS policies.
3. Optionally seed the 8 Baku demo points via [`supabase/seed.sql`](supabase/seed.sql).
4. Set client env vars in `.env` (or Vercel Environment Variables):

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Server-Side AI Configuration (Optional)

Configure **only** on the server / Vercel Environment Variables (never prefix with `VITE_`):

```env
OPENROUTER_API_KEY=
NVIDIA_API_KEY=
XAI_API_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
```

If none are present, `/api/assistant` responds in explicitly labeled `mode: "deterministic"` using real stored access point records.

---

## Vercel Deployment

The repository includes [`vercel.json`](vercel.json) with SPA fallback rewrites preserving `/api/*`:

```bash
npm run build
vercel --prod
```
