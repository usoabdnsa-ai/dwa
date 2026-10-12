import type { Status } from "@/lib/finder";

const styles: Record<Status, { label: string; cls: string; dot: string }> = {
  in: { label: "In stock", cls: "bg-green-soft text-green", dot: "bg-green" },
  low: { label: "Low", cls: "bg-amber-soft text-amber-ink", dot: "bg-amber" },
  out: { label: "Out of stock", cls: "bg-danger-soft text-danger", dot: "bg-danger" },
};

export function StatusBadge({ status, qty }: { status: Status; qty?: number }) {
  const s = styles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${s.cls}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
      {qty !== undefined && status !== "out" && <span className="font-mono nums opacity-80">· {qty}</span>}
    </span>
  );
}

export function OpenBadge({ open, onDuty }: { open: boolean | null; onDuty: boolean }) {
  if (onDuty)
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-night px-2.5 py-1 text-xs font-medium text-neon">
        <span className="size-1.5 rounded-full bg-neon" aria-hidden />
        De garde tonight
      </span>
    );
  if (open === null) return null;
  return (
    <span className={`text-xs font-medium ${open ? "text-green" : "text-muted"}`}>{open ? "Open now" : "Closed now"}</span>
  );
}
