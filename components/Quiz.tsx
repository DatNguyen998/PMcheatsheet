"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProcessGroup } from "@/lib/content";
import type { FlatProcess } from "@/lib/pm-model";

export function Quiz({ allProcesses, processGroups }: { allProcesses: FlatProcess[]; processGroups: ProcessGroup[] }) {
  const [current, setCurrent] = useState<FlatProcess | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [asked, setAsked] = useState(0);

  const pickNext = useCallback(() => {
    if (allProcesses.length === 0) return;
    const next = allProcesses[Math.floor(Math.random() * allProcesses.length)];
    if (!next) return;
    setCurrent(next);
    setChosen(null);
  }, [allProcesses]);

  useEffect(() => {
    if (!current) pickNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProcesses]);

  if (allProcesses.length === 0) {
    return (
      <div className="quiz">
        <div className="quiz__card quiz__empty">
          <i className="fas fa-database" aria-hidden="true" style={{ fontSize: 28, color: "var(--text-muted)" }} />
          <p style={{ marginTop: 10 }}>No content loaded yet — check your Supabase connection.</p>
        </div>
      </div>
    );
  }
  if (!current) return null;

  const isCorrect = chosen === current.groupName;

  const restart = () => {
    setScore(0);
    setAsked(0);
    pickNext();
  };

  const answer = (groupName: string) => {
    if (chosen) return;
    setChosen(groupName);
    setAsked((n) => n + 1);
    if (groupName === current.groupName) setScore((s) => s + 1);
  };

  return (
    <div className="quiz">
      <div className="quiz__scorebar">
        <span>
          <i className="fas fa-bullseye" style={{ color: "var(--accent)" }} aria-hidden="true" /> Score: {score} / {asked}
        </span>
        <button className="btn" onClick={restart} type="button">
          <i className="fas fa-rotate-right" aria-hidden="true" /> Restart
        </button>
      </div>
      <div className="quiz__card">
        <div className="quiz__q-eyebrow">{current.areaName} Knowledge Area</div>
        <div className="quiz__q">{current.title}</div>
        <div className="quiz__q-sub">Which process group does this belong to?</div>
        <div className="quiz__options">
          {processGroups.map((g) => {
            let cls = "quiz__opt";
            if (chosen) {
              if (g.name === current.groupName) cls += " correct";
              else if (g.name === chosen) cls += " wrong";
            }
            return (
              <button key={g.id} className={cls} disabled={!!chosen} onClick={() => answer(g.name)} type="button">
                {g.name}
              </button>
            );
          })}
        </div>
        {chosen && (
          <button className="btn btn--primary quiz__next" onClick={pickNext} type="button">
            {isCorrect ? "Correct! " : `Answer: ${current.groupName}. `}Next question <i className="fas fa-arrow-right" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
