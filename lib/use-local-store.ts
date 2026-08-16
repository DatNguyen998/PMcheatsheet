"use client";

/**
 * Client-side persistence for personal state — theme, bookmarked processes,
 * and "learned" progress. This is deliberately NOT in Supabase: it's
 * per-browser state, not shared PM knowledge content. Mirrors the old
 * assets/js/store.js behavior, as a hook.
 */
import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const KEYS = {
  theme: "pm.theme",
  bookmarks: "pm.bookmarks",
  learned: "pm.learned",
} as const;

function readSet(key: string): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
}

function writeSet(key: string, set: Set<number>) {
  try {
    window.localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* private-mode / storage disabled — degrade silently */
  }
}

export function usePmStore() {
  // Rendered on the server with these defaults; real values are loaded from
  // localStorage after mount (see the effect below) to avoid a hydration
  // mismatch. A blocking inline script in app/layout.tsx sets the `data-theme`
  // attribute before paint so there's no visible flash of the wrong theme.
  const [theme, setThemeState] = useState<Theme>("light");
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [learned, setLearned] = useState<Set<number>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(KEYS.theme) as Theme | null;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setThemeState(saved || (prefersDark ? "dark" : "light"));
    setBookmarks(readSet(KEYS.bookmarks));
    setLearned(readSet(KEYS.learned));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) document.documentElement.setAttribute("data-theme", theme);
  }, [theme, hydrated]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(KEYS.theme, next);
      return next;
    });
  }, []);

  // These compute off the latest `bookmarks`/`learned` state (a dependency,
  // so the callback identity refreshes on change — cheap for Sets this
  // small) so they can return the new on/off state synchronously, which
  // callers use to pick a toast message immediately.
  const toggleBookmark = useCallback(
    (id: number) => {
      const next = new Set(bookmarks);
      const willBeOn = !next.has(id);
      if (willBeOn) next.add(id);
      else next.delete(id);
      setBookmarks(next);
      writeSet(KEYS.bookmarks, next);
      return willBeOn;
    },
    [bookmarks]
  );

  const toggleLearned = useCallback(
    (id: number) => {
      const next = new Set(learned);
      const willBeOn = !next.has(id);
      if (willBeOn) next.add(id);
      else next.delete(id);
      setLearned(next);
      writeSet(KEYS.learned, next);
      return willBeOn;
    },
    [learned]
  );

  const resetProgress = useCallback(() => {
    setLearned(new Set());
    writeSet(KEYS.learned, new Set());
  }, []);

  return {
    hydrated,
    theme,
    toggleTheme,
    bookmarks,
    toggleBookmark,
    isBookmarked: (id: number) => bookmarks.has(id),
    learned,
    toggleLearned,
    isLearned: (id: number) => learned.has(id),
    resetProgress,
  };
}
