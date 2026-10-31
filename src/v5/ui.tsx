import type { PointerEvent } from "react";
import type { Status } from "@/lib/finder";

export const STATUS_WORD: Record<Status, string> = { in: "In stock", low: "Low", out: "Out" };

const DOT: Record<Status, string> = { in: "bg-(--ln-green)", low: "bg-(--ln-amber)", out: "bg-(--ln-red)" };
const TEXT: Record<Status, string> = { in: "text-(--ln-green)", low: "text-(--ln-amber)", out: "text-(--ln-red)" };

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border border-(--ln-line) bg-white/[0.03] px-2 py-0.5 text-xs font-medium ${TEXT[status]}`}>
      <span className={`size-1.5 rounded-full ${DOT[status]}`} />
      {STATUS_WORD[status]}
    </span>
  );
}

const FILL: Record<Status, string> = { in: "var(--ln-green)", low: "var(--ln-amber)", out: "transparent" };

/* Quantity as a thin bar; 40 boxes or more reads as full. */
export function Gauge({ qty, status, className = "w-24" }: { qty: number; status: Status; className?: string }) {
  const f = Math.min(Math.max(qty, 0) / 40, 1);
  return (
    <span className={`v5-gauge ${className}`} aria-hidden="true">
      <i data-gauge style={{ background: FILL[status], transform: `scaleX(${f})` }} />
    </span>
  );
}

/* The mark: a plus cut from a dark rounded tile, lit green from above. */
export function Mark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="v5-mark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#86efac" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="#18181b" stroke="rgb(255 255 255 / 0.14)" />
      <path d="M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z" fill="url(#v5-mark)" />
    </svg>
  );
}

/* Pointer handler for .v5-spot cards: moves the light to where the cursor is. */
export function spot(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}
