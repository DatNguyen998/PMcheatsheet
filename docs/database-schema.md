# Database Schema & Content Editing Guide

The PM knowledge content lives in Supabase (Postgres). This is the reference
for the five tables and how to edit content day-to-day.

---

## Setup (one-time)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the contents of
   [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql),
   and run it. This creates the 5 tables below plus their security policies.
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from
     **Project Settings → API** — used by the running app (read-only).
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — same page, the
     **service_role** secret — used *only* by `scripts/seed.ts`, never by the
     app itself. Do not commit this key.
4. Run `pnpm seed` once to load the starting content (the same 10 knowledge
   areas / 49 processes / 15 definitions / ~200 inputs-tools-outputs that used
   to live in `assets/js/data.js`).

From then on, **you don't need this repo to change content** — edit directly
in Supabase Studio (**Table Editor**, left sidebar) as described below.

---

## Tables

### `knowledge_areas`
The 10 PMBOK knowledge areas and how they're presented.

| Column | Type | Notes |
|---|---|---|
| `id` | serial | don't edit — other tables reference this |
| `name` | text | display name, e.g. "Integration" |
| `hue` | integer 0–360 | drives the area's accent color everywhere in the UI |
| `icon` | text | a [Font Awesome](https://fontawesome.com/search?o=r&m=free) class, e.g. `fa-cubes` |
| `blurb` | text | short one-line description |
| `sort_order` | integer | controls display order (lower = earlier) |

**Add a knowledge area:** insert a new row here, then add its processes /
ITO items referencing it. No code change needed.

### `process_groups`
The 5 process groups (Initiating, Planning, Executing, Monitoring &
Controlling, Closing). Rarely touched — mainly here so column order is data,
not code.

### `processes`
One row per process-matrix cell entry — this is the biggest table.

| Column | Notes |
|---|---|
| `knowledge_area_id` | which row (and column-group) of the matrix |
| `process_group_id` | which column |
| `title` | the process name shown as a chip, e.g. "Develop Project Charter" |
| `sort_order` | order within the cell, if a cell has more than one process |

**Add/rename/remove a process:** insert, edit, or delete a row here.

### `definitions`
The glossary cards on the Definitions tab — `title`, `icon`, `body`, and
`sort_order`. Not tied to a knowledge area (kept flat, matching today's UI).

### `resource_items`
Inputs, Tools & Techniques, and Outputs — one table, distinguished by the
`kind` column (a dropdown in Studio: `input` / `tool` / `output`).

| Column | Notes |
|---|---|
| `knowledge_area_id` | which area this item belongs to |
| `kind` | `input`, `tool`, or `output` — pick from the dropdown |
| `label` | the item text, e.g. "Project Charter" |
| `sort_order` | display order within that area + kind |

---

## Editing content in Supabase Studio

1. Open your project → **Table Editor** in the left sidebar.
2. Pick a table (e.g. `processes`).
3. Click a cell to edit it inline, or **Insert → Insert row** to add a new
   one. For foreign key columns (`knowledge_area_id`, `process_group_id`),
   Studio shows a picker so you don't need to know the numeric id.
4. Changes are live immediately. The running site polls for fresh content
   roughly once a minute (see `revalidate` in `app/page.tsx`), so you'll see
   edits appear without redeploying anything.

## Security

Row Level Security (RLS) is enabled on all 5 tables with a single **public
read** policy — no insert/update/delete policy exists for the app's anon key,
so the deployed site is physically incapable of writing to the database.
Content can only be changed by someone signed into the Supabase project
(Studio) or holding the service-role key (`scripts/seed.ts`).

## Resetting content back to the original baseline

`pnpm seed` is idempotent — it clears all 5 tables and re-inserts the
original content from `scripts/seed.ts`. Useful if you want to start over
after experimenting with edits.
