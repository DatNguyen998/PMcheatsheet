"use client";

import type { CSSProperties } from "react";
import { Highlight } from "./Highlight";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { useToast } from "./ToastProvider";
import type { FilteredResourceGroups } from "@/lib/filters";

export function ResourceGrid({ groups, filter }: { groups: FilteredResourceGroups; filter: string }) {
  const toast = useToast();

  if (groups.groups.length === 0) {
    return (
      <div className="ka-grid">
        <div className="no-results">
          <i className="fas fa-search" aria-hidden="true" />
          No matching items
        </div>
      </div>
    );
  }

  return (
    <div className="ka-grid">
      {groups.groups.map(({ area, items }) => (
        <div className="ka-card" key={area.id} style={{ "--ka-hue": area.hue } as CSSProperties}>
          <div className="ka-card__head">
            <i className={`fas ${area.icon}`} aria-hidden="true" />
            {area.name}
            <span className="ka-card__count">{items.length}</span>
          </div>
          <div className="ka-card__items">
            {items.length === 0 ? (
              <span className="tag empty-tag">(none)</span>
            ) : (
              items.map((item) => (
                <span
                  className="tag"
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => copyToClipboard(item.label, () => toast(`Copied "${item.label}"`, "fa-copy"))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      copyToClipboard(item.label, () => toast(`Copied "${item.label}"`, "fa-copy"));
                    }
                  }}
                >
                  <Highlight text={item.label} term={filter} />
                </span>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
