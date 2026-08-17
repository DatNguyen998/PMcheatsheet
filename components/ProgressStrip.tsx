"use client";

const RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressStrip({ learnedCount, total }: { learnedCount: number; total: number }) {
  const pct = total ? Math.round((learnedCount / total) * 100) : 0;
  const offset = CIRCUMFERENCE * (1 - pct / 100);

  return (
    <section className="progress-strip" aria-label="Study progress">
      <div className="progress-ring">
        <svg width="58" height="58" viewBox="0 0 58 58">
          <circle cx="29" cy="29" r={RADIUS} fill="none" stroke="var(--surface-3)" strokeWidth="6" />
          <circle
            cx="29"
            cy="29"
            r={RADIUS}
            fill="none"
            stroke="url(#pg)"
            strokeWidth="6"
            strokeLinecap="round"
            transform="rotate(-90 29 29)"
            style={{
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: offset,
              transition: "stroke-dashoffset 600ms cubic-bezier(0.22,1,0.36,1)",
            }}
          />
          <defs>
            <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent-2)" />
            </linearGradient>
          </defs>
          <text x="29" y="33" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text)">
            {pct}%
          </text>
        </svg>
      </div>
      <div className="progress-meta">
        <div className="progress-meta__label">Your learning progress</div>
        <div className="progress-meta__value">
          {learnedCount} / {total} processes learned
        </div>
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </section>
  );
}
