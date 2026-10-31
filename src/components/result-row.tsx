"use client";

import Link from "next/link";
import { Phone, ChevronRight } from "lucide-react";
import type { Medicine } from "@/lib/data";
import { fmtKm, type Availability } from "@/lib/finder";
import { agoText } from "@/lib/i18n";
import { useT } from "@/lib/locale";
import { ChifaBadge, RatingBadge, WaitBadge } from "./pharmacy-meta";
import { ReserveDialog } from "./reserve-dialog";
import { StatusBadge, OpenBadge } from "./status";

export function ResultRow({
  a,
  open,
  highlighted = false,
  showStock = true,
  marks,
  onHover,
  reserve,
}: {
  a: Availability;
  open: boolean | null;
  highlighted?: boolean;
  showStock?: boolean;
  /** Annotation pins placed beside the name, the open badge and the stock line (home page capture only). */
  marks?: { name?: React.ReactNode; open?: React.ReactNode; stock?: React.ReactNode };
  onHover?: (id: string | null) => void;
  /** The medicine being searched: shows a Reserve button on rows that have it. */
  reserve?: Medicine;
}) {
  const { t } = useT();
  const { pharmacy: p, item, status } = a;
  const dim = status === "out";
  const canReserve = !!reserve && !!item && status !== "out";
  return (
    <li
      onMouseEnter={() => onHover?.(p.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group relative grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 rounded-xl px-4 py-4 transition-colors duration-150 sm:grid-cols-[1fr_auto_auto] ${
        highlighted ? "bg-green-soft/60" : "hover:bg-paper"
      }`}
    >
      <div className={`min-w-0 ${dim ? "opacity-60" : ""}`}>
        <Link href={`/pharmacy/${p.id}`} className="font-semibold after:absolute after:inset-0 after:content-['']">
          {p.name}
        </Link>
        {marks?.name}
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
          <span>{p.commune}</span>
          <span aria-hidden>·</span>
          <span className="font-mono text-xs nums">{fmtKm(a.km)}</span>
          {(p.onDuty || open !== null) && <span aria-hidden>·</span>}
          <OpenBadge open={open} onDuty={p.onDuty} />
          {marks?.open}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <RatingBadge pharmacyId={p.id} />
          <WaitBadge pharmacyId={p.id} open={open} />
          <ChifaBadge pharmacyId={p.id} />
        </p>
      </div>

      {showStock ? (
      <div className="flex flex-col items-end gap-1 sm:items-start">
        <StatusBadge status={status} qty={item?.qty} />
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
          {item ? t("row.counted", { ago: agoText(t, item.updatedMinsAgo) }) : t("row.notCarried")}
          {marks?.stock}
        </span>
      </div>
      ) : (
        <span className="hidden sm:block" />
      )}

      <div className="relative z-10 col-span-2 flex items-center gap-2 sm:col-span-1">
        {canReserve && <ReserveDialog pharmacy={p} medicine={reserve} available={item.qty} />}
        <a
          href={`tel:${p.phone.replace(/\s/g, "")}`}
          className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium ring-1 ring-line transition-colors duration-150 hover:bg-surface"
          aria-label={t("row.call", { name: p.name })}
        >
          <Phone className="size-3.5" aria-hidden />
          {/* With a Reserve button next to it, the call button shrinks to its icon so the name keeps its room. */}
          <span className={`font-mono text-xs nums ${canReserve ? "sr-only" : ""}`} dir="ltr">
            {p.phone.slice(5)}
          </span>
        </a>
        <ChevronRight className="hidden size-4 text-muted transition-transform duration-150 group-hover:translate-x-0.5 sm:block rtl:rotate-180 rtl:group-hover:-translate-x-0.5" aria-hidden />
      </div>
    </li>
  );
}
