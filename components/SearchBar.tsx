"use client";

import { forwardRef } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const SearchBar = forwardRef<HTMLInputElement, Props>(function SearchBar({ value, onChange }, ref) {
  return (
    <div className="search-bar">
      <i className="fas fa-search" aria-hidden="true" />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search processes, definitions, tools…"
        aria-label="Search"
      />
      <kbd>/</kbd>
      <button
        className={`clear-btn${value ? " visible" : ""}`}
        onClick={() => onChange("")}
        aria-label="Clear search"
        type="button"
      >
        <i className="fas fa-circle-xmark" aria-hidden="true" />
      </button>
    </div>
  );
});
