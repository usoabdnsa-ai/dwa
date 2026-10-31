"use client";

import Link from "next/link";
import { Lock, TrendingUp } from "lucide-react";
import { medicines, type StockItem } from "@/lib/data";
import { fmtPrice } from "@/lib/finder";
import { useAlerts, usePro } from "@/lib/reservations";
import { useT } from "@/lib/locale";

// Stable stand-in for "searches near you this week" until real search logs exist.
function demoSearches(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 12 + (h % 48);
}

/*
 * Missed demand: medicines people near this pharmacy searched for while it had
 * none. A Pro feature, so free accounts see it locked with the real headline
 * number as the reason to upgrade.
 */
export function DemandPanel({ lines }: { lines: StockItem[] }) {
  const { t } = useT();
  const pro = usePro();
  const alerts = useAlerts();
  const carried = new Map(lines.map((l) => [l.medicineId, l.qty]));
  const missing = medicines
    .filter((m) => (carried.get(m.id) ?? 0) === 0)
    .map((m) => {
      const waiting = alerts.filter((a) => a.medicineId === m.id).length;
      const searches = demoSearches(m.id) + waiting * 3;
      return { m, searches, waiting, lost: searches * m.priceDzd * 0.3 };
    })
    .sort((a, b) => b.searches - a.searches)
    .slice(0, 4);

  const total = missing.reduce((s, x) => s + x.searches, 0);
  const locked = pro !== true;

  return (
    <section className="surface relative mt-6 overflow-hidden rounded-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <TrendingUp className="size-4 text-green" aria-hidden /> {t("demand.title")}
        </h2>
        <span className="rounded-full bg-night px-2 py-0.5 text-xs font-medium text-neon">Pro</span>
        <span className="ms-auto font-mono text-xs text-muted">{t("demand.demo")}</span>
      </div>
      <p className="mt-1 text-sm text-muted">
        {t("demand.total", { n: total })}
      </p>

      <ul className={`mt-4 divide-y divide-line/70 ${locked ? "pointer-events-none blur-[5px] select-none" : ""}`} aria-hidden={locked}>
        {missing.map(({ m, searches, waiting, lost }) => (
          <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm">
            <span className="min-w-0 flex-1 font-medium">
              {m.name} <span className="font-mono text-xs text-muted">{m.dosage}</span>
            </span>
            <span className="font-mono text-xs nums">{t("demand.searches", { n: searches })}</span>
            {waiting > 0 && <span className="text-xs font-medium text-green">{t("demand.waiting", { n: waiting })}</span>}
            <span className="w-32 text-end font-mono text-xs text-muted nums">{t("demand.missed", { price: fmtPrice(Math.round(lost / 10) * 10) })}</span>
          </li>
        ))}
      </ul>

      {locked && (
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-surface via-surface/95 to-transparent px-5 pt-16 pb-5 text-center">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <Lock className="size-4" aria-hidden /> {t("demand.lock")}
          </p>
          <Link href="/pro" className="inline-flex h-9 items-center rounded-xl bg-night px-4 text-sm font-medium text-neon hover:bg-night-2">
            {t("demand.unlock")}
          </Link>
        </div>
      )}
    </section>
  );
}
