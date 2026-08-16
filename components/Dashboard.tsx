"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PmContent } from "@/lib/content";
import { buildPmModel } from "@/lib/pm-model";
import { filterDefinitions, filterMatrix, filterResourceGroups, type AreaFilter } from "@/lib/filters";
import { usePmStore } from "@/lib/use-local-store";
import { useToast } from "./ToastProvider";
import { ThemeToggle } from "./ThemeToggle";
import { ProgressStrip } from "./ProgressStrip";
import { SearchBar } from "./SearchBar";
import { TabNav, TABS, type TabId } from "./TabNav";
import { AreaFilterChips } from "./AreaFilterChips";
import { ProcessMatrix } from "./ProcessMatrix";
import { DefinitionsGrid } from "./DefinitionsGrid";
import { ResourceGrid } from "./ResourceGrid";
import { Quiz } from "./Quiz";
import { Overlay } from "./Overlay";
import { DetailModal } from "./DetailModal";
import { ShortcutsModal } from "./ShortcutsModal";

export function Dashboard({ content }: { content: PmContent }) {
  const model = useMemo(() => buildPmModel(content), [content]);
  const store = usePmStore();
  const toast = useToast();
  const searchRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabId>("processes");
  const [filter, setFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [openProcessId, setOpenProcessId] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const filteredMatrix = useMemo(
    () => filterMatrix(model, filter, areaFilter, favoritesOnly, store.bookmarks),
    [model, filter, areaFilter, favoritesOnly, store.bookmarks]
  );
  const filteredDefinitions = useMemo(() => filterDefinitions(content.definitions, filter), [content.definitions, filter]);
  const filteredInputs = useMemo(
    () => filterResourceGroups(content, model, "input", filter, areaFilter),
    [content, model, filter, areaFilter]
  );
  const filteredTools = useMemo(
    () => filterResourceGroups(content, model, "tool", filter, areaFilter),
    [content, model, filter, areaFilter]
  );
  const filteredOutputs = useMemo(
    () => filterResourceGroups(content, model, "output", filter, areaFilter),
    [content, model, filter, areaFilter]
  );

  const counts: Partial<Record<TabId, number>> = {
    processes: filteredMatrix.count,
    definitions: filteredDefinitions.count,
    inputs: filteredInputs.count,
    tools: filteredTools.count,
    outputs: filteredOutputs.count,
  };

  const openProcess = openProcessId !== null ? model.allProcesses.find((p) => p.id === openProcessId) ?? null : null;
  const closeOverlays = () => {
    setOpenProcessId(null);
    setHelpOpen(false);
  };

  const handleFavToggle = () => {
    setFavoritesOnly((v) => !v);
    if (activeTab !== "processes") setActiveTab("processes");
  };

  const handleReset = () => {
    if (window.confirm("Reset all learning progress? This cannot be undone.")) {
      store.resetProgress();
      toast("Progress reset", "fa-rotate-left");
    }
  };

  const handleThemeToggle = () => {
    store.toggleTheme();
    toast(store.theme === "dark" ? "Light mode on" : "Dark mode on", store.theme === "dark" ? "fa-sun" : "fa-moon");
  };

  // Keyboard shortcuts: / search, 1-6 tabs, T theme, Q quiz, Esc close.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeOverlays();
        return;
      }
      const target = e.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (typing) return;

      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key.toLowerCase() === "t") return handleThemeToggle();
      if (e.key.toLowerCase() === "q") return setActiveTab("quiz");

      const n = parseInt(e.key, 10);
      const tab = TABS[n - 1];
      if (n >= 1 && n <= TABS.length && tab) setActiveTab(tab.id);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.theme]);

  if (!content.configured) {
    return (
      <div className="container">
        <div className="container__inner">
          <div className="no-results" style={{ padding: "60px 20px" }}>
            <i className="fas fa-database" aria-hidden="true" />
            <p style={{ marginTop: 12, fontWeight: 600 }}>Supabase isn&apos;t configured yet</p>
            <p style={{ marginTop: 6, color: "var(--text-muted)" }}>
              Copy <code>.env.example</code> to <code>.env.local</code>, fill in your project&apos;s URL and anon key, run{" "}
              <code>pnpm seed</code>, then restart the dev server. See <code>docs/database-schema.md</code>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container" id="app">
        <header className="app-header">
          <div className="brand">
            <div className="brand__mark">
              <i className="fas fa-layer-group" aria-hidden="true" />
            </div>
            <div>
              <div className="brand__title">PMP Cheatsheet</div>
              <div className="brand__subtitle">Layered-cake study companion · PMBOK 6th</div>
            </div>
          </div>
          <div className="header-actions">
            <button className="hbtn" onClick={() => window.print()} type="button">
              <i className="fas fa-print" aria-hidden="true" />
              <span>Print</span>
            </button>
            <button className="hbtn" onClick={handleReset} title="Reset progress" type="button">
              <i className="fas fa-rotate-left" aria-hidden="true" />
            </button>
            <button className="hbtn hbtn--icon" onClick={() => setHelpOpen(true)} title="Keyboard shortcuts" type="button">
              <i className="fas fa-keyboard" aria-hidden="true" />
            </button>
            <ThemeToggle theme={store.theme} onToggle={handleThemeToggle} />
          </div>
        </header>

        <div className="container__inner">
          <ProgressStrip learnedCount={store.learned.size} total={model.allProcesses.length} />

          <SearchBar ref={searchRef} value={filter} onChange={setFilter} />

          <TabNav active={activeTab} onChange={setActiveTab} counts={counts} />

          <section className={`panel${activeTab === "processes" ? " active" : ""}`} data-print-title="Process Matrix">
            <div className="panel-toolbar">
              <AreaFilterChips areas={content.knowledgeAreas} active={areaFilter} onChange={setAreaFilter} />
              <div className="spacer" />
              <button className={`filter-chip${favoritesOnly ? " active" : ""}`} onClick={handleFavToggle} type="button">
                <i className="fas fa-star" aria-hidden="true" /> Favorites {store.bookmarks.size}
              </button>
            </div>
            <ProcessMatrix
              matrix={filteredMatrix}
              filter={filter}
              isLearned={store.isLearned}
              isBookmarked={store.isBookmarked}
              onOpenProcess={setOpenProcessId}
            />
          </section>

          <section className={`panel${activeTab === "definitions" ? " active" : ""}`} data-print-title="Definitions">
            <DefinitionsGrid definitions={filteredDefinitions} filter={filter} />
          </section>

          <section className={`panel${activeTab === "inputs" ? " active" : ""}`} data-print-title="Inputs">
            <div className="panel-toolbar">
              <AreaFilterChips areas={content.knowledgeAreas} active={areaFilter} onChange={setAreaFilter} />
              <span className="hint">
                <i className="fas fa-copy" aria-hidden="true" /> Click any item to copy it.
              </span>
            </div>
            <ResourceGrid groups={filteredInputs} filter={filter} />
          </section>

          <section className={`panel${activeTab === "tools" ? " active" : ""}`} data-print-title="Tools & Techniques">
            <div className="panel-toolbar">
              <AreaFilterChips areas={content.knowledgeAreas} active={areaFilter} onChange={setAreaFilter} />
              <span className="hint">
                <i className="fas fa-copy" aria-hidden="true" /> Click any item to copy it.
              </span>
            </div>
            <ResourceGrid groups={filteredTools} filter={filter} />
          </section>

          <section className={`panel${activeTab === "outputs" ? " active" : ""}`} data-print-title="Outputs">
            <div className="panel-toolbar">
              <AreaFilterChips areas={content.knowledgeAreas} active={areaFilter} onChange={setAreaFilter} />
              <span className="hint">
                <i className="fas fa-copy" aria-hidden="true" /> Click any item to copy it.
              </span>
            </div>
            <ResourceGrid groups={filteredOutputs} filter={filter} />
          </section>

          <section className={`panel${activeTab === "quiz" ? " active" : ""}`} data-print-title="Quiz">
            <Quiz allProcesses={model.allProcesses} processGroups={content.processGroups} />
          </section>
        </div>
      </div>

      {openProcess && (
        <Overlay onClose={closeOverlays}>
          <DetailModal
            process={openProcess}
            model={model}
            content={content}
            isLearned={store.isLearned(openProcess.id)}
            isBookmarked={store.isBookmarked(openProcess.id)}
            onToggleLearned={() => {
              const on = store.toggleLearned(openProcess.id);
              toast(on ? "Marked as learned" : "Unmarked", on ? "fa-graduation-cap" : "fa-circle");
            }}
            onToggleBookmark={() => {
              const on = store.toggleBookmark(openProcess.id);
              toast(on ? "Saved to favorites" : "Removed from favorites", "fa-star");
            }}
            onClose={closeOverlays}
          />
        </Overlay>
      )}

      {helpOpen && (
        <Overlay onClose={closeOverlays}>
          <ShortcutsModal onClose={closeOverlays} />
        </Overlay>
      )}
    </>
  );
}
