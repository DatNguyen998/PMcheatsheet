"use client";

import type { KnowledgeArea } from "@/lib/content";
import type { AreaFilter } from "@/lib/filters";

export function AreaFilterChips({
  areas,
  active,
  onChange,
}: {
  areas: KnowledgeArea[];
  active: AreaFilter;
  onChange: (area: AreaFilter) => void;
}) {
  return (
    <div className="filter-chips">
      <button className={`filter-chip${active === "all" ? " active" : ""}`} onClick={() => onChange("all")} type="button">
        All areas
      </button>
      {areas.map((area) => (
        <button
          key={area.id}
          className={`filter-chip${active === area.id ? " active" : ""}`}
          onClick={() => onChange(area.id)}
          type="button"
        >
          {area.name}
        </button>
      ))}
    </div>
  );
}
