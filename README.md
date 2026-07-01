# 📋 PM Cheatsheet — Interactive PMP Study Companion

A modern, interactive study dashboard for the **PMBOK® 6th edition** — the
"layered cake" of 10 knowledge areas × 5 process groups, plus definitions and
the Inputs / Tools / Outputs for every knowledge area.

Open **[`index.html`](index.html)** in any browser. No build step, no server,
no dependencies to install — it's a self-contained static app.

---

## ✨ Features

- **🔍 Instant search** across processes, definitions, tools & outputs, with live
  highlighting and result counts.
- **🗂️ Six views** — Process Matrix, Definitions, Inputs, Tools & Techniques,
  Outputs, and a **Quiz** mode.
- **⭐ Bookmarks** — save any process to Favorites and filter the matrix to just
  those (persisted in your browser).
- **🎓 Progress tracking** — mark processes as *learned*; a progress ring and bar
  show how far through the 49 processes you are (persisted).
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
├── index.html                 # App entry point (markup + wiring)
├── assets/
│   ├── css/
│   │   ├── tokens.css          # Design tokens + light/dark palettes
│   │   ├── base.css            # Reset, typography, header, search
│   │   ├── components.css      # Tabs, matrix, cards, modal, quiz, toasts
│   │   └── print.css           # Print styles
│   └── js/
│       ├── data.js             # All PMBOK data + knowledge-area metadata
│       ├── store.js            # localStorage state (theme, bookmarks, progress)
│       ├── render.js           # Pure rendering functions → HTML
│       ├── quiz.js             # Flashcard quiz logic
│       └── app.js              # App shell: state, events, tabs, modal
├── docs/
│   ├── code-structure-guide.md # How the code is organized
│   └── design-brainstorm.md    # The design direction & rationale
└── archive/
    └── fullstack-prototype/    # Incomplete React/tRPC experiment (see note)
```

> **Note on `archive/fullstack-prototype/`** — an earlier, incomplete attempt to
> rebuild this as a React + tRPC + Express app. It references many files that
> were never committed and does not build. It's kept for reference only; the
> working product is the static app at the repo root.

---

## 🛠️ How It Works

The app is plain HTML/CSS/JS split into small, single-responsibility files.
Scripts load in order and communicate through a few globals — no bundler
required, so it runs the same from `file://` or any static host (e.g. GitHub
Pages).

| Global      | Provided by   | Responsibility                              |
|-------------|---------------|---------------------------------------------|
| `PM_DATA`   | `data.js`     | All content + per-area colors/icons         |
| `PM_STORE`  | `store.js`    | Persistence (theme, bookmarks, progress)    |
| `PM_RENDER` | `render.js`   | Turn data + state into HTML                  |
| `PM_QUIZ`   | `quiz.js`     | Quiz question flow                           |
| —           | `app.js`      | Wires everything together                    |

See **[`docs/code-structure-guide.md`](docs/code-structure-guide.md)** for the
full walkthrough.

---

### 👤 About the Author
I am **Kent**, a Business Analyst standing at the bridge between business needs
and technical teams. I built this cheat sheet to deconstruct PM frameworks into
simple, searchable notes — and to be a more empathetic, supportive teammate.

*"Organizing our thoughts is the first step toward building something beautiful together."*

- **GitHub:** [@datnguyen998](https://github.com/datnguyen998)
- **License:** MIT
