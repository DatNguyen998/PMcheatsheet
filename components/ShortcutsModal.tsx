"use client";

import type { CSSProperties } from "react";

const ROWS: [string, string][] = [
  ["Focus search", "/"],
  ["Switch tabs", "1 – 6"],
  ["Toggle dark mode", "T"],
  ["Start quiz", "Q"],
  ["Close dialog", "Esc"],
];

export function ShortcutsModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal" style={{ "--ka-hue": 250 } as CSSProperties} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className="modal__head">
        <div className="modal__eyebrow">Power user</div>
        <div className="modal__title">Keyboard Shortcuts</div>
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <i className="fas fa-xmark" aria-hidden="true" />
        </button>
      </div>
      <div className="modal__body">
        <div className="shortcuts">
          {ROWS.map(([label, key]) => (
            <div className="shortcuts__row" key={label}>
              <span>{label}</span>
              <kbd>{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
