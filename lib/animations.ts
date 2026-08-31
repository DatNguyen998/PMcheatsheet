"use client";

/**
 * Central anime.js animation helpers. Every JS-driven effect in the app goes
 * through here so timing/easing stays consistent and `prefers-reduced-motion`
 * is respected in exactly one place. Plain CSS still handles cheap,
 * always-on micro-interactions (hover lifts, color transitions) — anime.js is
 * reserved for entrances/exits and anything that benefits from real
 * choreography (staggering, springy easing, animating to a JS-computed value).
 */
import { animate, cubicBezier, stagger, utils } from "animejs";

type Target = HTMLElement | SVGElement | null;

// Matches styles/tokens.css --dur / --ease so JS and CSS transitions still feel like one system.
export const DURATION = 220;
export const EASE = cubicBezier(0.22, 1, 0.36, 1);
const POP_EASE = "outBack(1.6)";
const EXIT_EASE = "inQuad";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/** Fades + slides a tab panel's content in when it becomes the active tab. */
export function animatePanelEnter(el: Target) {
  if (!el || prefersReducedMotion()) return;
  animate(el, { opacity: [0, 1], translateY: [10, 0], duration: DURATION, ease: EASE });
}

/** Staggers a list of card/row/chip elements in — used after a search/filter change. */
export function animateStaggerIn(els: Target[] | NodeListOf<Element>, staggerMs = 30) {
  const list = Array.from(els).filter((el): el is HTMLElement | SVGElement => !!el);
  if (list.length === 0) return;
  if (prefersReducedMotion()) {
    utils.set(list, { opacity: 1, translateY: 0 });
    return;
  }
  utils.set(list, { opacity: 0, translateY: 8 });
  animate(list, {
    opacity: [0, 1],
    translateY: [8, 0],
    duration: 260,
    delay: stagger(staggerMs),
    ease: EASE,
  });
}

/** Modal pop-in: a slight overshoot reads as more "alive" than a plain fade. */
export function animateModalIn(el: Target) {
  if (!el || prefersReducedMotion()) return;
  animate(el, { opacity: [0, 1], scale: [0.94, 1], duration: DURATION, ease: POP_EASE });
}

/** Plays a modal exit, then calls onDone — use to defer the actual unmount. */
export function animateModalOut(el: Target, onDone: () => void) {
  if (!el || prefersReducedMotion()) return onDone();
  animate(el, { opacity: [1, 0], scale: [1, 0.96], duration: 160, ease: EXIT_EASE, onComplete: onDone });
}

export function animateOverlayIn(el: Target) {
  if (!el || prefersReducedMotion()) return;
  animate(el, { opacity: [0, 1], duration: DURATION, ease: "linear" });
}

export function animateOverlayOut(el: Target, onDone: () => void) {
  if (!el || prefersReducedMotion()) return onDone();
  animate(el, { opacity: [1, 0], duration: 160, ease: "linear", onComplete: onDone });
}

/** Toast enter. */
export function animateToastIn(el: Target) {
  if (!el || prefersReducedMotion()) return;
  animate(el, { opacity: [0, 1], translateY: [12, 0], scale: [0.92, 1], duration: DURATION, ease: POP_EASE });
}

/** Toast exit — calls onDone after the animation, to actually drop it from state. */
export function animateToastOut(el: Target, onDone: () => void) {
  if (!el || prefersReducedMotion()) return onDone();
  animate(el, { opacity: [1, 0], translateY: [0, 10], duration: 220, ease: EXIT_EASE, onComplete: onDone });
}

/** Animates an SVG progress ring's stroke-dashoffset to a new value. */
export function animateRingOffset(el: Target, toOffset: number) {
  if (!el) return;
  if (prefersReducedMotion()) return void utils.set(el, { strokeDashoffset: toOffset });
  animate(el, { strokeDashoffset: toOffset, duration: 700, ease: EASE });
}

/** Animates a progress bar fill's width (0-100). */
export function animateBarWidth(el: Target, toPercent: number) {
  if (!el) return;
  if (prefersReducedMotion()) return void utils.set(el, { width: `${toPercent}%` });
  animate(el, { width: `${toPercent}%`, duration: 700, ease: EASE });
}

/** Tweens a plain number from `from` to `to`, calling `onTick` every frame — used to count a "%" label up/down instead of snapping. */
export function animateCounter(from: number, to: number, onTick: (value: number) => void, opts?: { duration?: number }) {
  if (prefersReducedMotion() || from === to) return onTick(to);
  const obj = { value: from };
  animate(obj, {
    value: to,
    duration: opts?.duration ?? 700,
    ease: EASE,
    onUpdate: () => onTick(Math.round(obj.value)),
  });
}
