"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { animateToastIn, animateToastOut } from "@/lib/animations";

type ToastItem = { id: number; message: string; icon: string };
type ToastFn = (message: string, icon?: string) => void;

const ToastContext = createContext<ToastFn | null>(null);
const DISPLAY_MS = 2200;

function Toast({ message, icon, onExited }: { message: string; icon: string; onExited: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  // Synchronous so the toast never paints at full opacity before anime.js sets its "from" state.
  useLayoutEffect(() => {
    animateToastIn(ref.current);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => animateToastOut(ref.current, onExited), DISPLAY_MS);
    return () => clearTimeout(timer);
    // Fires once per toast instance — onExited is stable enough for this lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className="toast">
      <i className={`fas ${icon}`} aria-hidden="true" />
      {message}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const toast = useCallback<ToastFn>((message, icon = "fa-circle-check") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, icon }]);
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} icon={t.icon} onExited={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a <ToastProvider>");
  return ctx;
}
