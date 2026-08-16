"use client";

import type { Theme } from "@/lib/use-local-store";

export function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const dark = theme === "dark";
  return (
    <button
      className="hbtn hbtn--icon"
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <i className={`fas ${dark ? "fa-sun" : "fa-moon"}`} aria-hidden="true" />
    </button>
  );
}
