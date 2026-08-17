"use client";

import { Highlight } from "./Highlight";
import type { FilteredDefinitions } from "@/lib/filters";

export function DefinitionsGrid({ definitions, filter }: { definitions: FilteredDefinitions; filter: string }) {
  if (definitions.items.length === 0) {
    return (
      <div className="card-grid">
        <div className="no-results">
          <i className="fas fa-search" aria-hidden="true" />
          No matching definitions
        </div>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {definitions.items.map((def) => (
        <div className="def-card" key={def.id}>
          <div className="def-card__title">
            <i className={`fas ${def.icon}`} aria-hidden="true" />
            <Highlight text={def.title} term={filter} />
          </div>
          <div className="def-card__body">
            <Highlight text={def.body} term={filter} />
          </div>
        </div>
      ))}
    </div>
  );
}
