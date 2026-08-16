# 📋 PM Cheatsheet — Interactive PMP Study Companion

A modern, interactive study dashboard for the **PMBOK® 6th edition** — the
"layered cake" of 10 knowledge areas × 5 process groups, plus definitions and
the Inputs / Tools / Outputs for every knowledge area.

**Content lives in a database, not in code.** The site (Next.js) only reads
from Supabase; all PM content is added/edited/removed directly in Supabase's
Studio table editor — no code changes or redeploys needed to update content.

---

## ✨ Features

- **🔍 Instant search** across processes, definitions, tools & outputs, with live
  highlighting and result counts.
- **🗂️ Six views** — Process Matrix, Definitions, Inputs, Tools & Techniques,
  Outputs, and a **Quiz** mode.
- **⭐ Bookmarks** — save any process to Favorites and filter the matrix to just
  those (persisted in your browser).
- **🎓 Progress tracking** — mark processes as *learned*; a progress ring and bar
  show how far through the processes you are (persisted).
- **🔎 Detail modal** — click any process to see its knowledge area, process
  group, definition, and the inputs/tools/outputs it draws on.
- **🧠 Quiz mode** — flashcards that ask which process group a process belongs to,
  with running score.
- **🌗 Dark / light theme** — respects your OS preference and remembers your
  choice.
- **⌨️ Keyboard shortcuts** — `/` search · `1–6` tabs · `T` theme · `Q` quiz ·
  `Esc` close.
- **📋 Copy & 🖨️ print** — click ITO items to copy; print produces a clean,
  ink-friendly full cheat sheet.
- **📱 Responsive** and accessible (semantic roles, keyboard-operable chips,
  `prefers-reduced-motion` support).

---

## 🗂️ Project Structure

```
PMcheatsheet/
├── app/                        # Next.js App Router
│   ├── layout.tsx               # HTML shell, fonts, theme-init script
│   ├── page.tsx                 # Fetches content from Supabase, renders <Dashboard>
├── components/                  # React components (the UI)
├── lib/
│   ├── supabase/client.ts        # Read-only Supabase client (anon key)
│   ├── content.ts                 # Typed fetchers for the 5 content tables
│   ├── pm-model.ts                # Derives matrix/lookups from raw content
│   ├── filters.ts                 # Search/filter logic shared by panels
│   ├── use-local-store.ts         # Theme / bookmarks / progress (localStorage)
│   └── copy-to-clipboard.ts
├── styles/                       # tokens · base · components · print (CSS)
├── supabase/
│   └── migrations/0001_init.sql  # Database schema + Row Level Security
├── scripts/
│   └── seed.ts                    # One-time content loader
├── docs/
│   ├── code-structure-guide.md    # How the code is organized
│   ├── database-schema.md         # Table reference + how to edit content
│   └── design-brainstorm.md       # The design direction & rationale
└── archive/
    ├── fullstack-prototype/       # Earlier incomplete React/tRPC experiment
    └── static-site/               # The previous working static HTML/JS site
```

---

## 🚀 Getting started

1. **Database:** create a free project at [supabase.com](https://supabase.com),
   run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   in its SQL editor, then follow
   [`docs/database-schema.md`](docs/database-schema.md) to load the starting
   content with `pnpm seed`.
2. **Configure:** copy `.env.example` to `.env.local` and fill in your
   Supabase project URL + anon key.
3. **Run:**
   ```bash
   pnpm install
   pnpm dev
   ```
4. **Edit content:** from then on, add/change/remove processes, definitions,
   or inputs/tools/outputs directly in Supabase Studio's table editor. The
   site picks up changes automatically (within about a minute).

---

## 🛠️ How It Works

`app/page.tsx` is a Server Component that fetches all content from Supabase
in parallel and hands it to `<Dashboard>`, a client component that owns all
interactive state (search, tabs, filters) and renders the matrix, cards,
detail modal, and quiz. Personal state — theme, bookmarks, learned progress —
stays in the browser's `localStorage`; it's not shared content, so it's not
in the database.

Row Level Security on every content table grants **public read only** — the
app can never write to the database. All content edits happen through
Supabase Studio, using your own project login.

See **[`docs/code-structure-guide.md`](docs/code-structure-guide.md)** for
the full walkthrough and **[`docs/database-schema.md`](docs/database-schema.md)**
for the table reference.

---

### 👤 About the Author
I am **Kent**, a Business Analyst standing at the bridge between business needs
and technical teams. I built this cheat sheet to deconstruct PM frameworks into
simple, searchable notes — and to be a more empathetic, supportive teammate.

*"Organizing our thoughts is the first step toward building something beautiful together."*

- **GitHub:** [@datnguyen998](https://github.com/datnguyen998)
- **License:** MIT
