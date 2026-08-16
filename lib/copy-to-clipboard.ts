"use client";

/** Copies text to the clipboard, falling back to the classic textarea+execCommand trick where the async Clipboard API isn't available. */
export function copyToClipboard(text: string, onDone?: () => void) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(onDone).catch(() => fallbackCopy(text, onDone));
  } else {
    fallbackCopy(text, onDone);
  }
}

function fallbackCopy(text: string, onDone?: () => void) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    onDone?.();
  } catch {
    /* no-op */
  }
  ta.remove();
}
