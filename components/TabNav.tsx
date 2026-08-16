"use client";

export type TabId = "processes" | "definitions" | "inputs" | "tools" | "outputs" | "quiz";

export const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "processes", label: "Process Matrix", icon: "fa-table-cells-large" },
  { id: "definitions", label: "Definitions", icon: "fa-list-ul" },
  { id: "inputs", label: "Inputs", icon: "fa-arrow-right-to-bracket" },
  { id: "tools", label: "Tools & Techniques", icon: "fa-screwdriver-wrench" },
  { id: "outputs", label: "Outputs", icon: "fa-arrow-right-from-bracket" },
  { id: "quiz", label: "Quiz", icon: "fa-brain" },
];

export function TabNav({
  active,
  onChange,
  counts,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
  counts: Partial<Record<TabId, number>>;
}) {
  return (
    <nav className="tabs" aria-label="Sections">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tab${active === tab.id ? " active" : ""}`}
          onClick={() => onChange(tab.id)}
          type="button"
        >
          <i className={`fas ${tab.icon}`} aria-hidden="true" /> {tab.label}
          {counts[tab.id] !== undefined && <span className="tab__count">{counts[tab.id]}</span>}
        </button>
      ))}
    </nav>
  );
}
