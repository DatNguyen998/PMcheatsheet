"use client";

import { useEffect, useRef } from "react";
import { animateBarWidth, animateCounter, animateRingOffset } from "@/lib/animations";

const RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressStrip({ learnedCount, total }: { learnedCount: number; total: number }) {
  const pct = total ? Math.round((learnedCount / total) * 100) : 0;

  const ringRef = useRef<SVGCircleElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctTextRef = useRef<SVGTextElement>(null);
  const prevPctRef = useRef(0);

  useEffect(() => {
    animateRingOffset(ringRef.current, CIRCUMFERENCE * (1 - pct / 100));
    animateBarWidth(barRef.current, pct);
    animateCounter(prevPctRef.current, pct, (value) => {
      if (pctTextRef.current) pctTextRef.current.textContent = `${value}%`;
    });
    prevPctRef.current = pct;
  }, [pct]);

  return (
    <section className="progress-strip" aria-label="Study progress">
      <div className="progress-ring">
        <svg width="58" height="58" viewBox="0 0 58 58">
          <circle cx="29" cy="29" r={RADIUS} fill="none" stroke="var(--surface-3)" strokeWidth="6" />
          <circle
            ref={ringRef}
            cx="29"
            cy="29"
            r={RADIUS}
            fill="none"
            stroke="url(#pg)"
            strokeWidth="6"
            strokeLinecap="round"
            transform="rotate(-90 29 29)"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
          />
          <defs>
            <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent-2)" />
            </linearGradient>
          </defs>
          <text ref={pctTextRef} x="29" y="33" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text)">
            0%
          </text>
        </svg>
      </div>
      <div className="progress-meta">
        <div className="progress-meta__label">Your learning progress</div>
        <div className="progress-meta__value">
          {learnedCount} / {total} processes learned
        </div>
        <div className="progress-bar">
          <div className="progress-bar__fill" ref={barRef} style={{ width: 0 }} />
        </div>
      </div>
    </section>
  );
}
