import type { Status } from "@/lib/finder";

export const STATUS_WORD: Record<Status, string> = { in: "In stock", low: "Last few", out: "Out" };

const STAMP: Record<Status, string> = {
  in: "bg-(--pp-green) text-white border-(--pp-green)",
  low: "bg-(--pp-lemon) text-(--pp-ink) border-(--pp-ink)",
  out: "bg-white text-(--pp-red) border-(--pp-red)",
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1 text-xs font-bold ${STAMP[status]}`}>
      {status === "out" ? (
        <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
          <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <span className="size-2 rounded-full bg-current" />
      )}
      {STATUS_WORD[status]}
    </span>
  );
}

const FILL: Record<Status, string> = { in: "var(--pp-green)", low: "var(--pp-tang)", out: "transparent" };

/* Quantity as a capsule that fills up; 40 boxes or more reads as full. */
export function Gauge({ qty, status, className = "w-28" }: { qty: number; status: Status; className?: string }) {
  const f = Math.min(Math.max(qty, 0) / 40, 1);
  return (
    <span className={`v3-gauge ${className}`} aria-hidden="true">
      <i data-gauge style={{ background: FILL[status], transform: `scaleX(${f})` }} />
    </span>
  );
}

/* The pill shapes the whole design is built from. Pure SVG, colored from the palette. */
export type PillKind = "capsule" | "tablet" | "cross" | "softgel";

export function Pill({ kind, a = "var(--pp-tang)", b = "var(--pp-white)", className = "" }: { kind: PillKind; a?: string; b?: string; className?: string }) {
  if (kind === "capsule")
    return (
      <svg viewBox="0 0 200 84" className={className} aria-hidden="true">
        <path d="M100 4H44a38 38 0 0 0 0 76h56z" fill={a} stroke="var(--pp-ink)" strokeWidth="4" />
        <path d="M100 4h56a38 38 0 0 1 0 76h-56z" fill={b} stroke="var(--pp-ink)" strokeWidth="4" />
        <path d="M30 22c6-6 14-8 26-8" stroke="white" strokeOpacity=".7" strokeWidth="7" strokeLinecap="round" fill="none" />
      </svg>
    );
  if (kind === "tablet")
    return (
      <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
        <circle cx="50" cy="50" r="46" fill={a} stroke="var(--pp-ink)" strokeWidth="4" />
        <path d="M14 50h72" stroke="var(--pp-ink)" strokeWidth="4" strokeLinecap="round" />
        <path d="M26 30c5-7 12-11 22-12" stroke="white" strokeOpacity=".7" strokeWidth="7" strokeLinecap="round" fill="none" />
      </svg>
    );
  if (kind === "cross")
    return (
      <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
        <path
          d="M36 6h28a4 4 0 0 1 4 4v22h22a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H68v22a4 4 0 0 1-4 4H36a4 4 0 0 1-4-4V68H10a4 4 0 0 1-4-4V36a4 4 0 0 1 4-4h22V10a4 4 0 0 1 4-4z"
          fill={a}
          stroke="var(--pp-ink)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>
    );
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true">
      <ellipse cx="60" cy="40" rx="56" ry="36" fill={a} stroke="var(--pp-ink)" strokeWidth="4" />
      <ellipse cx="40" cy="26" rx="16" ry="7" fill="white" fillOpacity=".6" />
    </svg>
  );
}

/* The mark: a green cross with a capsule laid across it. */
export function Mark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="1" y="1" width="38" height="38" rx="12" fill="var(--pp-green)" stroke="var(--pp-ink)" strokeWidth="2" />
      <path d="M16 8h8v8h8v8h-8v8h-8v-8H8v-8h8z" fill="var(--pp-mint)" />
      <g transform="rotate(-35 20 20)">
        <rect x="9" y="16" width="22" height="8" rx="4" fill="var(--pp-tang)" stroke="var(--pp-ink)" strokeWidth="1.5" />
        <path d="M20 16v8" stroke="var(--pp-ink)" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
