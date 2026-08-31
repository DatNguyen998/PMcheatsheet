# PM Cheatsheet — Code Structure Guide

A tour of how the Next.js + Supabase app is put together.

## 📁 Layout

```
PMcheatsheet/
├── app/
│   ├── layout.tsx          # <html> shell: fonts, global CSS, theme-init script
│   └── page.tsx             # Server Component: fetch content, render <Dashboard>
├── components/
│   ├── Dashboard.tsx         # App shell: all interactive state + event wiring
│   ├── SearchBar.tsx / TabNav.tsx / AreaFilterChips.tsx / ProgressStrip.tsx / ThemeToggle.tsx
│   ├── ProcessMatrix.tsx / DefinitionsGrid.tsx / ResourceGrid.tsx
│   ├── Overlay.tsx / DetailModal.tsx / ShortcutsModal.tsx
│   ├── Quiz.tsx
│   ├── ToastProvider.tsx
│   └── Highlight.tsx         # wraps a search match in <mark>
├── lib/
│   ├── supabase/client.ts    # read-only Supabase client (anon key)
│   ├── content.ts             # typed fetchers for the 5 content tables
│   ├── pm-model.ts            # derives the matrix/lookups from raw content
│   ├── filters.ts             # search/filter logic shared by the panels
│   ├── use-local-store.ts     # theme / bookmarks / progress (localStorage)
│   ├── animations.ts          # anime.js helpers (entrances, stagger, exits)
│   └── copy-to-clipboard.ts
├── styles/                   # tokens.css, base.css, components.css, print.css
├── supabase/migrations/0001_init.sql
├── scripts/seed.ts
└── docs/                     # this guide, database-schema.md, design-brainstorm.md
```

There is no custom backend beyond Supabase itself — Next.js Server Components
call Supabase directly; there's no separate API layer to maintain.

---

## 🧩 The data layer

### `lib/content.ts` — `getPmContent()`
The only place the app talks to Supabase. Fetches all 5 tables in parallel
and returns one typed `PmContent` bundle (camelCased, ready for React). If
Supabase isn't configured yet (missing env vars), returns an empty,
`configured: false` bundle instead of throwing, so the app still renders with
a "not configured" message.

### `lib/pm-model.ts` — `buildPmModel(content)`
Turns the flat `PmContent` into the shapes components actually want: a
matrix grouped by knowledge area × process group, a flat list of every
process (used by search/quiz/detail modal), lookup maps by id, and resource
items grouped by area + kind.

### `lib/filters.ts`
Pure functions — given the model + current search term/area filter/favorites
toggle, return exactly what a panel should render plus its result count (for
the tab badges). Kept separate from `pm-model.ts` because these depend on UI
state, not just the raw content.

### `lib/use-local-store.ts` — `usePmStore()`
The only client-side persistence in the app: theme, bookmarked process ids,
and learned process ids, all in `localStorage`. Deliberately not in Supabase
— it's per-browser state, not shared PM content.

---

## 🔄 How an interaction flows

**Marking a process as "learned":**
```
Click a process chip (ProcessMatrix)
  → Dashboard.setOpenProcessId(id)
  → <DetailModal> renders (looks up the process via pm-model's lookups)
  → user clicks "Mark as learned"
  → usePmStore().toggleLearned(id)   — updates React state + localStorage
  → ProgressStrip and the chip's "is-learned" class re-render automatically
```

**Editing content:** there is no code path for this at all by design — content
changes happen directly in Supabase Studio (see
[`database-schema.md`](database-schema.md)). The app re-fetches on a ~60s ISR
window (`export const revalidate = 60` in `app/page.tsx`), so edits show up
without a redeploy.

---

## 🎨 Theming

Unchanged from the previous version: CSS variables in `styles/tokens.css`,
light by default, overridden under `[data-theme="dark"]`. A small inline
script in `app/layout.tsx` sets that attribute before first paint (avoids a
flash of the wrong theme); `usePmStore()` keeps it in sync afterward.
Knowledge-area accent colors come from each area's `hue` column in Supabase,
applied via a `--ka-hue` CSS variable set inline per row/card.

---

## 🎬 Animation (anime.js)

`lib/animations.ts` is the one place the app talks to [anime.js](https://animejs.com) —
every JS-driven effect (panel entrance, staggered card/row entrance, modal &
toast enter/exit, the progress ring/bar/percentage counting) goes through a
named helper there (`animatePanelEnter`, `animateStaggerIn`, `animateModalIn`
/`animateModalOut`, `animateToastIn`/`animateToastOut`, `animateRingOffset`,
`animateBarWidth`, `animateCounter`), so timing/easing stays consistent and
`prefers-reduced-motion` is respected in exactly one spot.

Plain CSS still owns cheap, always-on micro-interactions (hover lifts, color/
border transitions in `styles/components.css`) — anime.js is reserved for
entrances/exits and anything that benefits from real choreography
(staggering many elements, animating to a value only known at runtime,
deferring an unmount until an exit animation finishes).

**The "animate out, then unmount" pattern** (`components/Overlay.tsx`,
`components/ToastProvider.tsx`): React normally removes an element from the
DOM the instant its condition goes false, which would cut an exit animation
short. Both components work around this the same way — keep rendering a
frozen copy of the content and only flip the state that actually unmounts it
inside the animation's `onComplete` callback.

---

## ➕ Common tasks

| Goal | Where |
|------|-------|
| Add/edit PM content | **Supabase Studio** — see `docs/database-schema.md` (not this repo) |
| Add a new knowledge area | Insert a row in `knowledge_areas`, then its processes/ITO items (Supabase) |
| Change colors / dark mode | `styles/tokens.css` |
| Change/add an effect (timing, easing, stagger) | `lib/animations.ts` |
| Restyle a component | `styles/components.css` |
| Add a new tab/panel | a new `<section className="panel">` in `Dashboard.tsx` + entry in `components/TabNav.tsx` |
| Add a persisted (per-browser) setting | `lib/use-local-store.ts` |
| Change how content is fetched/shaped | `lib/content.ts` / `lib/pm-model.ts` |

---

## 🗄️ The archive

- `archive/static-site/` — the previous working vanilla HTML/CSS/JS version
  of this app (hardcoded content). Retired when content moved to Supabase;
  still runs standalone if you open its `index.html`.
- `archive/fullstack-prototype/` — an earlier, **incomplete** React + tRPC +
  Express rewrite that references files never committed and does not build.
  Kept for reference only.
