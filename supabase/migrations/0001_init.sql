-- =============================================================================
-- 0001_init.sql — PM Cheatsheet content schema.
--
-- Five tables hold everything that used to be hardcoded in assets/js/data.js:
-- knowledge areas, process groups, the process matrix, definitions, and the
-- inputs/tools/outputs (ITO) for each knowledge area.
--
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query)
-- against a fresh project, then run `pnpm seed` to load the content.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- knowledge_areas — the 10 PMBOK knowledge areas + presentation metadata.
-- ---------------------------------------------------------------------------
create table if not exists knowledge_areas (
  id         serial primary key,
  name       text not null unique,          -- "Integration", "Scope", ...
  hue        integer not null check (hue between 0 and 360),
  icon       text not null,                 -- Font Awesome class, e.g. "fa-cubes"
  blurb      text not null,
  sort_order integer not null default 0
);
comment on table knowledge_areas is 'The 10 PMBOK knowledge areas + their accent color/icon/blurb.';

-- ---------------------------------------------------------------------------
-- process_groups — the 5 process groups (Initiating..Closing). Static, but
-- kept as a table (not hardcoded) so column order can be changed without code.
-- ---------------------------------------------------------------------------
create table if not exists process_groups (
  id         serial primary key,
  name       text not null unique,          -- "Initiating", "Planning", ...
  sort_order integer not null default 0
);
comment on table process_groups is 'The 5 PMBOK process groups, in display order.';

-- ---------------------------------------------------------------------------
-- processes — one row per process-matrix cell entry.
-- ---------------------------------------------------------------------------
create table if not exists processes (
  id                serial primary key,
  knowledge_area_id integer not null references knowledge_areas(id) on delete cascade,
  process_group_id  integer not null references process_groups(id) on delete cascade,
  title             text not null,
  sort_order        integer not null default 0
);
comment on table processes is 'Every process in the matrix: one knowledge area x process group cell entry.';
create index if not exists processes_area_group_idx on processes (knowledge_area_id, process_group_id);

-- ---------------------------------------------------------------------------
-- definitions — the flat glossary cards (5 process-group + 10 knowledge-area
-- definitions today, but not restricted to that split).
-- ---------------------------------------------------------------------------
create table if not exists definitions (
  id         serial primary key,
  title      text not null,
  icon       text not null,
  body       text not null,
  sort_order integer not null default 0
);
comment on table definitions is 'Glossary/definition cards shown on the Definitions tab.';

-- ---------------------------------------------------------------------------
-- resource_items — Inputs / Tools & Techniques / Outputs, one table with a
-- `kind` enum so Supabase Studio renders it as a dropdown (avoids typos vs.
-- a free-text column, and avoids three near-identical tables to maintain).
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'resource_kind') then
    create type resource_kind as enum ('input', 'tool', 'output');
  end if;
end $$;

create table if not exists resource_items (
  id                serial primary key,
  knowledge_area_id integer not null references knowledge_areas(id) on delete cascade,
  kind              resource_kind not null,
  label             text not null,
  sort_order        integer not null default 0
);
comment on table resource_items is 'Inputs / Tools & Techniques / Outputs per knowledge area, distinguished by `kind`.';
create index if not exists resource_items_area_kind_idx on resource_items (knowledge_area_id, kind);

-- ---------------------------------------------------------------------------
-- Row Level Security — public read-only. All writes happen through Supabase
-- Studio using the project owner's own authenticated session (or the seed
-- script's service-role key), never through the app.
-- ---------------------------------------------------------------------------
alter table knowledge_areas enable row level security;
alter table process_groups  enable row level security;
alter table processes       enable row level security;
alter table definitions     enable row level security;
alter table resource_items  enable row level security;

drop policy if exists "public read" on knowledge_areas;
create policy "public read" on knowledge_areas for select using (true);

drop policy if exists "public read" on process_groups;
create policy "public read" on process_groups for select using (true);

drop policy if exists "public read" on processes;
create policy "public read" on processes for select using (true);

drop policy if exists "public read" on definitions;
create policy "public read" on definitions for select using (true);

drop policy if exists "public read" on resource_items;
create policy "public read" on resource_items for select using (true);

-- No insert/update/delete policies are defined for the anon/authenticated
-- roles above, which means the app (using the anon key) can never write —
-- only a service-role key (seed script) or the Studio table editor can.
