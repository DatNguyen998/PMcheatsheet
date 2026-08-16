/* =============================================================================
 * store.js — Tiny localStorage-backed state layer.
 * Persists the user's theme, bookmarked processes and learning progress so the
 * cheat sheet behaves like a real study companion across sessions.
 * Exposed as `PM_STORE`. Degrades gracefully if localStorage is unavailable
 * (e.g. private mode) by falling back to an in-memory store.
 * ========================================================================== */
(function (global) {
  "use strict";

  const KEYS = {
    theme: "pm.theme",
    bookmarks: "pm.bookmarks",
    learned: "pm.learned",
  };

  // Feature-detect localStorage once; fall back to a Map-backed shim.
  let backend;
  try {
    const t = "__pm_test__";
    global.localStorage.setItem(t, t);
    global.localStorage.removeItem(t);
    backend = global.localStorage;
  } catch (_e) {
    const mem = new Map();
    backend = {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => mem.set(k, String(v)),
      removeItem: (k) => mem.delete(k),
    };
  }

  const readSet = (key) => {
    try {
      const raw = backend.getItem(key);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch (_e) {
      return new Set();
    }
  };
  const writeSet = (key, set) => backend.setItem(key, JSON.stringify([...set]));

  const bookmarks = readSet(KEYS.bookmarks);
  const learned = readSet(KEYS.learned);

  const PM_STORE = {
    // ---- Theme ----
    getTheme() {
      return backend.getItem(KEYS.theme); // "light" | "dark" | null (=system)
    },
    setTheme(theme) {
      if (theme) backend.setItem(KEYS.theme, theme);
      else backend.removeItem(KEYS.theme);
    },

    // ---- Bookmarks ----
    isBookmarked: (id) => bookmarks.has(id),
    toggleBookmark(id) {
      bookmarks.has(id) ? bookmarks.delete(id) : bookmarks.add(id);
      writeSet(KEYS.bookmarks, bookmarks);
      return bookmarks.has(id);
    },
    bookmarkCount: () => bookmarks.size,
    bookmarkIds: () => [...bookmarks],

    // ---- Learning progress ----
    isLearned: (id) => learned.has(id),
    toggleLearned(id) {
      learned.has(id) ? learned.delete(id) : learned.add(id);
      writeSet(KEYS.learned, learned);
      return learned.has(id);
    },
    learnedCount: () => learned.size,
    learnedIds: () => [...learned],
    resetProgress() {
      learned.clear();
      writeSet(KEYS.learned, learned);
    },
  };

  global.PM_STORE = PM_STORE;
})(window);
