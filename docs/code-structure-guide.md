# PM Cheatsheet — Code Structure Guide

A tour of how the interactive static app is put together, so you can find and
change things quickly.

## 📁 Layout

```
PMcheatsheet/
├── index.html            # Markup + script/style includes (the entry point)
├── assets/
│   ├── css/
│   │   ├── tokens.css     # CSS variables: colors, spacing, light/dark themes
│   │   ├── base.css       # Reset, typography, page shell, header, search
│   │   ├── components.css # Tabs, matrix, cards, chips, modal, quiz, toasts
│   │   └── print.css      # Print-only overrides
│   └── js/
│       ├── data.js        # PM_DATA  — all content + area metadata
│       ├── store.js       # PM_STORE — localStorage persistence
│       ├── render.js      # PM_RENDER — data + state → HTML strings
│       ├── quiz.js        # PM_QUIZ  — flashcard quiz flow
│       └── app.js         # boot + state + all event wiring
└── docs/                  # This guide + the design brainstorm
```

There is **no build step**. Scripts are classic `<script>` tags loaded in a
fixed order; each attaches one global to `window`. This keeps the app runnable
straight from `file://` or any static host.

---

## 🧩 The modules

### `data.js` → `PM_DATA`
The single source of truth for content. Exposes:
- `PROCESS_GROUPS` — the 5 groups, in order.
- `KNOWLEDGE_AREAS` — the 10 areas with a `hue`, `icon`, and short `blurb` used
  for semantic color-coding across the UI.
- `processData`, `definitions`, `inputsData`, `toolsData`, `outputsData` — the
  raw PMBOK content.
- `allProcesses` — a flat, pre-computed list (`{ id, title, area, group }`) used
  by search, the detail modal, the quiz, and progress totals.

**To edit content**, this is the only file you touch.

### `store.js` → `PM_STORE`
A thin wrapper over `localStorage` (with an in-memory fallback for private mode).
Handles the theme, the set of bookmarked process ids, and the set of learned
process ids. Every user action that should survive a refresh goes through here.

### `render.js` → `PM_RENDER`
Pure(ish) functions that take data + current filter/state and return HTML
strings (`renderMatrix`, `renderDefinitions`, `renderKaGrid`, `detailHtml`).
Also exports `escapeHtml` and `highlight`. **No event listeners live here** — it
only produces markup.

### `quiz.js` → `PM_QUIZ`
Owns the "which process group?" flashcard flow: pick a random process, render
the process-group options, score the answer, advance.

### `app.js`
The conductor. Holds app state (`tab`, `filter`, `area`, `favoritesOnly`), wires
every control once, re-renders the active panel on change, and owns the theme,
progress ring, detail modal, toasts, and keyboard shortcuts.

---

## 🔄 How an interaction flows

**Marking a process as "learned":**
```
Click process chip in the matrix
   → app.js openDetail(id)            (render.js builds the modal body)
   → user clicks "Mark as learned"
   → PM_STORE.toggleLearned(id)       (persists to localStorage)
   → app.js updateProgress()          (ring + bar recalculated)
   → app.js renderActive()            (chip now shows the learned state)
```

**Searching:**
```
Type in #globalSearch
   → app.js updates state.filter
   → renderActive() re-renders the current panel via PM_RENDER
   → matches are wrapped in <mark> by PM_RENDER.highlight()
```

---

## 🎨 Theming

All colors are CSS variables in `tokens.css`. Light is the default on `:root`;
`[data-theme="dark"]` overrides them. `app.js` sets that attribute on `<html>`
based on the saved preference or the OS setting. To retheme the app, you
generally only edit `tokens.css` — components reference the variables.

Knowledge-area accent colors are derived at render time from each area's `hue`
(e.g. `hsl(var(--ka-hue) 70% 55%)`), so adding an area only needs a hue in
`data.js`.

---

## ➕ Common tasks

| Goal | Where |
|------|-------|
| Add/edit a process, definition, or ITO item | `assets/js/data.js` |
| Add a new knowledge area | `data.js` (`KNOWLEDGE_AREAS` + the data maps) |
| Change colors / dark mode | `assets/css/tokens.css` |
| Restyle a component | `assets/css/components.css` |
| Add a new tab/panel | markup in `index.html` + a branch in `app.js renderActive()` |
| Add a persisted setting | `assets/js/store.js` |

---

## 🗄️ The archived prototype

`archive/fullstack-prototype/` holds an earlier, **incomplete** React + tRPC +
Express rewrite. Its entry (`client/src/app.tsx`) imports components, pages, and
libs that were never committed, so it does not build. It's retained for
reference only and is not part of the shipping app.
