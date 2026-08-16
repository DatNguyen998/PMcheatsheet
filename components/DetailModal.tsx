"use client";

import type { CSSProperties } from "react";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import type { PmContent } from "@/lib/content";
import type { FlatProcess, PmModel } from "@/lib/pm-model";
import { useToast } from "./ToastProvider";

function BadgeList({ items }: { items: string[] }) {
  if (items.length === 0) return <span className="badge-pill">—</span>;
  return (
    <>
      {items.map((it) => (
        <span className="badge-pill" key={it}>
          {it}
        </span>
      ))}
    </>
  );
}

export function DetailModal({
  process,
  model,
  content,
  isLearned,
  isBookmarked,
  onToggleLearned,
  onToggleBookmark,
  onClose,
}: {
  process: FlatProcess;
  model: PmModel;
  content: PmContent;
  isLearned: boolean;
  isBookmarked: boolean;
  onToggleLearned: () => void;
  onToggleBookmark: () => void;
  onClose: () => void;
}) {
  const toast = useToast();
  const area = model.areaById.get(process.areaId);
  const def = model.definitionByAreaManagementTitle.get(`${process.areaName} Management`);
  const inputs = (model.resourceItemsByAreaAndKind.get(`${process.areaId}:input`) ?? []).slice(0, 6).map((i) => i.label);
  const tools = (model.resourceItemsByAreaAndKind.get(`${process.areaId}:tool`) ?? []).slice(0, 6).map((i) => i.label);
  const outputs = (model.resourceItemsByAreaAndKind.get(`${process.areaId}:output`) ?? []).slice(0, 6).map((i) => i.label);

  if (!area) return null;

  return (
    <div className="modal" style={{ "--ka-hue": area.hue } as CSSProperties} role="dialog" aria-modal="true" aria-label={process.title}>
      <div className="modal__head">
        <div className="modal__eyebrow">
          {process.areaName} · {process.groupName}
        </div>
        <div className="modal__title">{process.title}</div>
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <i className="fas fa-xmark" aria-hidden="true" />
        </button>
      </div>
      <div className="modal__body">
        <div className="modal__badges">
          <span className="badge-pill">
            <i className={`fas ${area.icon}`} aria-hidden="true" /> {process.areaName} Knowledge Area
          </span>
          <span className="badge-pill">
            <i className="fas fa-diagram-project" aria-hidden="true" /> {process.groupName}
          </span>
        </div>

        {def && <p className="def-card__body">{def.body}</p>}

        <div className="modal__section">
          <h4>
            <i className="fas fa-arrow-right-to-bracket" aria-hidden="true" /> Common Inputs
          </h4>
          <div className="modal__badges">
            <BadgeList items={inputs} />
          </div>
        </div>
        <div className="modal__section">
          <h4>
            <i className="fas fa-screwdriver-wrench" aria-hidden="true" /> Tools &amp; Techniques
          </h4>
          <div className="modal__badges">
            <BadgeList items={tools} />
          </div>
        </div>
        <div className="modal__section">
          <h4>
            <i className="fas fa-arrow-right-from-bracket" aria-hidden="true" /> Common Outputs
          </h4>
          <div className="modal__badges">
            <BadgeList items={outputs} />
          </div>
        </div>

        <div className="modal__actions">
          <button className={`btn btn--primary btn--block${isLearned ? " is-on" : ""}`} onClick={onToggleLearned}>
            <i className={`fas ${isLearned ? "fa-circle-check" : "fa-circle"}`} aria-hidden="true" />{" "}
            {isLearned ? "Learned" : "Mark as learned"}
          </button>
          <button className={`btn btn--star${isBookmarked ? " is-on" : ""}`} onClick={onToggleBookmark}>
            <i className={`fa-star ${isBookmarked ? "fas" : "far"}`} aria-hidden="true" /> {isBookmarked ? "Saved" : "Save"}
          </button>
          <button className="btn" onClick={() => copyToClipboard(process.title, () => toast(`Copied "${process.title}"`, "fa-copy"))}>
            <i className="fas fa-copy" aria-hidden="true" /> Copy
          </button>
        </div>
      </div>
    </div>
  );
}
