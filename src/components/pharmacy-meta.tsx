"use client";

import { CreditCard, Star, Timer } from "lucide-react";
import { extrasOf, waitNow, waitTone } from "@/lib/extras";
import { algiersMinutes } from "@/lib/finder";
import { useT } from "@/lib/locale";
import { useNow } from "@/lib/use-now";

/* Star rating with review count. */
export function RatingBadge({ pharmacyId, night = false }: { pharmacyId: string; night?: boolean }) {
  const { t } = useT();
  const { rating, reviews } = extrasOf(pharmacyId);
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${night ? "text-dusk-muted" : "text-muted"}`} title={t("meta.ratingTitle", { rating, n: reviews })}>
      <Star className="size-3.5 fill-amber text-amber" aria-hidden />
      <span className={`font-mono font-medium nums ${night ? "text-dusk-ink" : "text-ink"}`}>{rating.toFixed(1)}</span>
      <span className="font-mono nums">({reviews})</span>
    </span>
  );
}

const TONE = {
  quiet: { cls: "text-green", label: "meta.quiet" },
  busy: { cls: "text-amber-ink", label: "meta.busy" },
  packed: { cls: "text-danger", label: "meta.packed" },
} as const;

/* Estimated wait at the counter right now, from the hour in Algiers. Blank until hydrated. */
export function WaitBadge({ pharmacyId, open, night = false }: { pharmacyId: string; open: boolean | null; night?: boolean }) {
  const now = useNow();
  const { t } = useT();
  if (!now || open === false) return null;
  const mins = waitNow(pharmacyId, algiersMinutes(now));
  const tone = TONE[waitTone(mins)];
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${night ? "text-dusk-muted" : "text-muted"}`} title={t("meta.waitTitle")}>
      <Timer className="size-3.5" aria-hidden />
      <span className="font-mono nums">{t("meta.wait", { n: mins })}</span>
      <span className={`font-medium ${tone.cls}`}>{t(tone.label)}</span>
    </span>
  );
}

export function ChifaBadge({ pharmacyId }: { pharmacyId: string }) {
  const { t } = useT();
  if (!extrasOf(pharmacyId).chifa) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#e6eefb] px-2 py-0.5 text-[11px] font-medium text-[#1e4a8c]" title={t("meta.chifaTitle")}>
      <CreditCard className="size-3" aria-hidden /> CHIFA
    </span>
  );
}
