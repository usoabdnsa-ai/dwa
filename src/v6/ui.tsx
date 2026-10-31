import Link from "next/link";
import type { ReactNode } from "react";
import type { Status } from "@/lib/finder";

const PILL: Record<Status, { label: string; cls: string; dot: string }> = {
  in: {
    label: "In stock",
    cls: "bg-(--e-sage) text-(--e-green)",
    dot: "bg-(--e-green)",
  },
  low: {
    label: "Low stock",
    cls: "bg-(--e-amber-tint) text-(--e-amber)",
    dot: "bg-(--e-amber)",
  },
  out: {
    label: "Out of stock",
    cls: "bg-(--e-red-tint) text-(--e-red)",
    dot: "bg-(--e-red)",
  },
};

export function StockPill({ status }: { status: Status }) {
  const p = PILL[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${p.cls}`}
    >
      <span className={`size-1.5 rounded-full ${p.dot}`} />
      {p.label}
    </span>
  );
}

export function Chip({
  children,
  tone = "sage",
}: {
  children: ReactNode;
  tone?: "sage" | "line" | "dark";
}) {
  const cls =
    tone === "sage"
      ? "bg-(--e-sage) text-(--e-green)"
      : tone === "dark"
        ? "bg-(--e-dark) text-(--e-sage)"
        : "bg-white text-(--e-muted) ring-1 ring-(--e-line)";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${cls}`}
    >
      {children}
    </span>
  );
}

const FILL: Record<Status, string> = {
  in: "var(--e-green)",
  low: "var(--e-amber)",
  out: "transparent",
};

/* Stock as a thin bar; 40 boxes or more reads as full. */
export function Gauge({
  qty,
  status,
  className = "w-24",
}: {
  qty: number;
  status: Status;
  className?: string;
}) {
  return (
    <span className={`v6-gauge ${className}`} aria-hidden="true">
      <i
        data-gauge
        style={{
          background: FILL[status],
          transform: `scaleX(${Math.min(Math.max(qty, 0) / 40, 1)})`,
        }}
      />
    </span>
  );
}

/* The mark: a soft evergreen tile with a rounded cross and a terracotta dot, the pharmacy that has it. */
export function Mark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="10" fill="var(--e-green)" />
      <path
        d="M13.2 7.5h5.6a1 1 0 0 1 1 1v4.7h4.7a1 1 0 0 1 1 1v5.6a1 1 0 0 1-1 1h-4.7v4.7a1 1 0 0 1-1 1h-5.6a1 1 0 0 1-1-1v-4.7H7.5a1 1 0 0 1-1-1v-5.6a1 1 0 0 1 1-1h4.7V8.5a1 1 0 0 1 1-1Z"
        fill="var(--e-sage)"
      />
      <circle cx="16" cy="16" r="2.6" fill="var(--e-coral)" />
    </svg>
  );
}

export function SectionHead({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold tracking-wide text-(--e-coral) uppercase">
        {kicker}
      </p>
      <h2 className="v6-serif mt-3 text-[clamp(2.1rem,4.4vw,3.4rem)]">
        {title}
      </h2>
      {children && <p className="mt-4 text-lg text-(--e-muted)">{children}</p>}
    </div>
  );
}

export const StockTag = StockPill;

export function Tag({
  children,
  tone = "sage",
}: {
  children: ReactNode;
  tone?: "sage" | "grey" | "warm" | "dark";
}) {
  const cls = {
    sage: "bg-(--e-sage) text-(--e-green)",
    grey: "bg-white text-(--e-muted) ring-1 ring-(--e-line)",
    warm: "bg-(--e-amber-tint) text-(--e-amber)",
    dark: "bg-(--e-dark) text-(--e-sage)",
  }[tone];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${cls}`}
    >
      {children}
    </span>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-(--e-muted)">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {it.href ? (
              <Link href={it.href} className="hover:text-(--e-green)">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-(--e-ink)">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Inset({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-(--e-sage) px-5 py-4 text-(--e-ink)">
      {children}
    </div>
  );
}

export function Warning({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-3 font-semibold">
      <span
        aria-hidden
        className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-(--e-amber) text-xs font-bold text-white"
      >
        !
      </span>
      <span>
        <span className="sr-only">Warning: </span>
        {children}
      </span>
    </p>
  );
}

export function SummaryList({
  rows,
}: {
  rows: { key: string; value: ReactNode }[];
}) {
  return (
    <dl className="v6-card divide-y divide-(--e-line) px-5">
      {rows.map((r) => (
        <div
          key={r.key}
          className="grid gap-1 py-3.5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4"
        >
          <dt className="text-sm text-(--e-muted)">{r.key}</dt>
          <dd className="font-medium">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
