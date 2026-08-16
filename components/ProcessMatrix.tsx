"use client";

import type { CSSProperties } from "react";
import { Highlight } from "./Highlight";
import type { FilteredMatrix } from "@/lib/filters";

export function ProcessMatrix({
  matrix,
  filter,
  isLearned,
  isBookmarked,
  onOpenProcess,
}: {
  matrix: FilteredMatrix;
  filter: string;
  isLearned: (id: number) => boolean;
  isBookmarked: (id: number) => boolean;
  onOpenProcess: (id: number) => void;
}) {
  return (
    <>
      <div className="matrix-wrap">
        <table className="matrix-table">
          <thead>
            <tr>
              <th>Knowledge Area</th>
              <th>Initiating</th>
              <th>Planning</th>
              <th>Executing</th>
              <th>Monitoring &amp; Controlling</th>
              <th>Closing</th>
            </tr>
          </thead>
          <tbody>
            {matrix.rows.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="no-results">
                    <i className="fas fa-inbox" aria-hidden="true" />
                    No processes match your filters.
                  </div>
                </td>
              </tr>
            ) : (
              matrix.rows.map((row) => (
                <tr key={row.area.id} style={{ "--ka-hue": row.area.hue } as CSSProperties}>
                  <td className="ka-cell">
                    <span className="ka-cell__name">
                      <i className={`fas ${row.area.icon}`} aria-hidden="true" />
                      {row.area.name}
                    </span>
                  </td>
                  {row.cells.map((cell) => (
                    <td key={cell.groupId}>
                      {cell.processes.length === 0 ? (
                        <span className="empty-cell">—</span>
                      ) : (
                        cell.processes.map((p) => (
                          <span
                            key={p.id}
                            className={`proc-item${isLearned(p.id) ? " is-learned" : ""}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => onOpenProcess(p.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onOpenProcess(p.id);
                              }
                            }}
                          >
                            <Highlight text={p.title} term={filter} />
                            {isBookmarked(p.id) && <i className="fas fa-star star-dot" aria-hidden="true" />}
                          </span>
                        ))
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="hint" style={{ marginTop: 12 }}>
        <i className="fas fa-hand-pointer" aria-hidden="true" /> Click a process to open details, mark it learned, or
        save it. ★ = saved.
      </p>
    </>
  );
}
