"use client";

import type { Status } from "@/lib/finder";
import type { MessageKey } from "@/lib/i18n";
import { useT } from "@/lib/locale";

const styles: Record<Status, { label: MessageKey; cls: string; dot: string }> = {
  in: { label: "status.in", cls: "bg-green-soft text-green", dot: "bg-green" },
  low: { label: "status.low", cls: "bg-amber-soft text-amber-ink", dot: "bg-amber" },
  out: { label: "status.out", cls: "bg-danger-soft text-danger", dot: "bg-danger" },
};

export function StatusBadge({ status, qty }: { status: Status; qty?: number }) {
  const { t } = useT();
  const s = styles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${s.cls}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} aria-hidden />
      {t(s.label)}
      {qty !== undefined && status !== "out" && <span className="font-mono nums opacity-80">· {qty}</span>}
    </span>
  );
}

export function OpenBadge({ open, onDuty, night = false }: { open: boolean | null; onDuty: boolean; night?: boolean }) {
  const { t } = useT();
  if (onDuty)
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-neon ${
          night ? "bg-dusk-mint/10 ring-1 ring-dusk-mint/40" : "bg-night"
        }`}
      >
        <span className="size-1.5 rounded-full bg-neon" aria-hidden />
        {t("open.garde")}
      </span>
    );
  if (open === null) return null;
  const tone = night ? (open ? "text-dusk-mint" : "text-dusk-muted") : open ? "text-green" : "text-muted";
  return <span className={`text-xs font-medium ${tone}`}>{open ? t("open.now") : t("open.closed")}</span>;
}
