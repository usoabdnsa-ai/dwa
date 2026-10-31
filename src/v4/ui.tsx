import type { Status } from "@/lib/finder";

export const STATUS_WORD: Record<Status, string> = { in: "In stock", low: "Last few", out: "Out" };

const STAMP: Record<Status, string> = {
  in: "text-(--nn-neon) border-(--nn-neon)/50 bg-(--nn-neon)/10",
  low: "text-(--nn-amber) border-(--nn-amber)/50 bg-(--nn-amber)/10",
  out: "text-(--nn-red) border-(--nn-red)/40 bg-(--nn-red)/5",
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STAMP[status]}`}>
      <span className={`size-1.5 rounded-full bg-current ${status === "out" ? "" : "shadow-[0_0_8px_currentColor]"}`} />
      {STATUS_WORD[status]}
    </span>
  );
}

const FILL: Record<Status, string> = {
  in: "var(--nn-neon)",
  low: "var(--nn-amber)",
  out: "transparent",
};

/* Quantity as a glowing tube; 40 boxes or more reads as full. */
export function Gauge({ qty, status, className = "w-24" }: { qty: number; status: Status; className?: string }) {
  const f = Math.min(Math.max(qty, 0) / 40, 1);
  return (
    <span className={`v4-gauge ${className}`} aria-hidden="true">
      <i data-gauge style={{ background: FILL[status], boxShadow: `0 0 10px ${FILL[status]}`, transform: `scaleX(${f})` }} />
    </span>
  );
}

/* The neon cross: a single rounded tube, drawn as an outline. */
export const CROSS_PATH = "M38 8h24v30h30v24H62v30H38V62H8V38h30z";

export function NeonCross({ className = "", tone = "neon" }: { className?: string; tone?: "neon" | "magenta" }) {
  return (
    <svg viewBox="0 0 100 100" className={`${tone === "neon" ? "v4-neon" : "v4-neon-m"} ${className}`} aria-hidden="true">
      <path d={CROSS_PATH} fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
      <path d={CROSS_PATH} fill="none" stroke="white" strokeOpacity=".75" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function Mark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`v4-neon ${className}`} aria-hidden="true">
      <path d={CROSS_PATH} fill="none" stroke="currentColor" strokeWidth="9" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="7" fill="var(--nn-magenta)" />
    </svg>
  );
}
