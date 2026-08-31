"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { animateModalIn, animateModalOut, animateOverlayIn, animateOverlayOut } from "@/lib/animations";

/**
 * Wraps modal content with an animated backdrop + pop-in/out. Always
 * rendered by the caller (Dashboard) — `open` controls visibility, but the
 * component stays mounted a little longer than `open` is true so the exit
 * animation can finish before it actually unmounts. While closing, it keeps
 * rendering the last `children` it had (React updates are naturally frozen
 * once the parent stops passing fresh content), so the modal doesn't go
 * blank mid-animation.
 */
export function Overlay({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const [present, setPresent] = useState(open);
  const [renderedChildren, setRenderedChildren] = useState(children);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setRenderedChildren(children);
      setPresent(true);
    }
  }, [open, children]);

  // Play the exit animation, then actually unmount.
  useEffect(() => {
    if (open || !present) return;
    const overlayEl = overlayRef.current;
    const modalEl = overlayEl?.querySelector<HTMLElement>(".modal") ?? null;
    let pending = modalEl ? 2 : 1;
    const finish = () => {
      pending -= 1;
      if (pending <= 0) setPresent(false);
    };
    animateOverlayOut(overlayEl, finish);
    animateModalOut(modalEl, finish);
    // Only the open->closed transition should re-run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Play the enter animation synchronously before paint, so there's no flash
  // at full opacity before anime.js takes over.
  useLayoutEffect(() => {
    if (!present) return;
    document.body.style.overflow = "hidden";
    const modalEl = overlayRef.current?.querySelector<HTMLElement>(".modal") ?? null;
    animateOverlayIn(overlayRef.current);
    animateModalIn(modalEl);
    return () => {
      document.body.style.overflow = "";
    };
  }, [present]);

  if (!present) return null;

  return (
    <div
      ref={overlayRef}
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {renderedChildren}
    </div>
  );
}
