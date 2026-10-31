"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Clock, MapPin, Phone, Search } from "lucide-react";
import type { Medicine, Pharmacy, StockItem } from "@/lib/data";
import { algiersMinutes, fmtPrice, isOpen, statusOf } from "@/lib/finder";
import { agoText, hoursText } from "@/lib/i18n";
import { useT } from "@/lib/locale";
import { useNow } from "@/lib/use-now";
import { ChifaBadge, RatingBadge, WaitBadge } from "./pharmacy-meta";
import { ReserveDialog } from "./reserve-dialog";
import { SendPrescription } from "./send-prescription";
import { OpenBadge, StatusBadge } from "./status";

const PharmacyMap = dynamic(() => import("./pharmacy-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-paper-2" />,
});

type Line = StockItem & { medicine: Medicine };

export function PharmacyDetail({ pharmacy: p, items }: { pharmacy: Pharmacy; items: Line[] }) {
  const { t } = useT();
  const now = useNow();
  const open = now ? isOpen(p, algiersMinutes(now)) : null;
  const [q, setQ] = useState("");

  const lines = useMemo(() => {
    const needle = q.toLowerCase();
    return items
      .filter((l) => !needle || (l.medicine.name + l.medicine.dci).toLowerCase().includes(needle))
      .sort((a, b) => a.medicine.name.localeCompare(b.medicine.name));
  }, [items, q]);

  const inStock = items.filter((l) => l.qty > 0).length;

  return (
    <>
      <section className="dusk-band">
        <div className="mx-auto max-w-6xl px-4 pt-28 pb-10 sm:px-6">
          <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-dusk-muted hover:text-dusk-ink">
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden /> {t("ph.back")}
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{p.name}</h1>
            <OpenBadge open={open} onDuty={p.onDuty} night />
          </div>
          <p className="mt-2 text-dusk-muted">{t("ph.inCharge", { name: p.pharmacist })}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <RatingBadge pharmacyId={p.id} night />
            <WaitBadge pharmacyId={p.id} open={open} night />
            <ChifaBadge pharmacyId={p.id} />
          </div>
          <div className="mt-6">
            <SendPrescription pharmacy={p} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <dl className="grid content-start gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <Fact icon={<MapPin className="size-4" />} label={t("ph.address")} value={`${p.address}, ${p.commune}`} />
            <Fact icon={<Clock className="size-4" />} label={t("ph.hours")} value={p.onDuty ? t("ph.allNight", { hours: hoursText(t, p) }) : hoursText(t, p)} />
            <Fact
              icon={<Phone className="size-4" />}
              label={t("ph.phone")}
              value={
                <a href={`tel:${p.phone.replace(/\s/g, "")}`} dir="ltr" className="font-mono text-sm underline decoration-line underline-offset-4 hover:decoration-green">
                  {p.phone}
                </a>
              }
            />
          </dl>
          <div className="h-56 overflow-hidden rounded-card bg-paper-2 ring-1 ring-line lg:h-full lg:min-h-64">
            <PharmacyMap
              origin={{ lat: p.lat, lng: p.lng }}
              points={[{ id: p.id, name: p.name, lat: p.lat, lng: p.lng, status: "in", onDuty: p.onDuty }]}
              highlighted={p.id}
            />
          </div>
        </div>

        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">{t("ph.shelf")}</h2>
              <p className="mt-1 font-mono text-sm text-muted nums">
                {t("ph.linesIn", { n: inStock, total: items.length })}
              </p>
            </div>
            <label className="surface flex h-10 w-full items-center gap-2 rounded-xl px-3 sm:w-72">
              <Search className="size-4 text-muted" aria-hidden />
              <span className="sr-only">{t("ph.filterLabel")}</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("ph.filter")} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
            </label>
          </div>

          <div className="surface mt-5 overflow-x-auto rounded-card">
            <table className="w-full min-w-[560px] text-start text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="px-5 py-3 text-start font-medium">{t("ph.colMedicine")}</th>
                  <th className="px-5 py-3 text-start font-medium">{t("ph.colDci")}</th>
                  <th className="px-5 py-3 text-start font-medium">{t("ph.colPrice")}</th>
                  <th className="px-5 py-3 text-start font-medium">{t("ph.colAvail")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {lines.map((l) => (
                  <tr key={l.medicineId}>
                    <td className="px-5 py-3.5">
                      <span className="font-medium">{l.medicine.name}</span> <span className="font-mono text-xs text-muted">{l.medicine.dosage}</span>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{l.medicine.dci}</td>
                    <td className="px-5 py-3.5 font-mono nums">{fmtPrice(l.medicine.priceDzd)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={statusOf(l.qty)} qty={l.qty} />
                        <span className="hidden font-mono text-[11px] text-muted md:inline">{agoText(t, l.updatedMinsAgo)}</span>
                        {l.qty > 0 && (
                          <span className="ms-auto">
                            <ReserveDialog pharmacy={p} medicine={l.medicine} available={l.qty} compact />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!lines.length && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-muted">
                      {t("ph.noLine", { q })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-surface p-4 ring-1 ring-line">
      <dt className="flex items-center gap-2 text-xs font-medium text-muted">
        {icon}
        {label}
      </dt>
      <dd className="mt-2 text-sm">{value}</dd>
    </div>
  );
}
