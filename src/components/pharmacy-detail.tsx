"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Clock, MapPin, Phone, Search } from "lucide-react";
import type { Medicine, Pharmacy, StockItem } from "@/lib/data";
import { algiersMinutes, fmtPrice, fmtUpdated, hoursLabel, isOpen, statusOf } from "@/lib/finder";
import { useNow } from "@/lib/use-now";
import { OpenBadge, StatusBadge } from "./status";

const PharmacyMap = dynamic(() => import("./pharmacy-map"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-paper-2" />,
});

type Line = StockItem & { medicine: Medicine };

export function PharmacyDetail({ pharmacy: p, items }: { pharmacy: Pharmacy; items: Line[] }) {
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
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6">
      <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Back to search
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{p.name}</h1>
            <OpenBadge open={open} onDuty={p.onDuty} />
          </div>
          <p className="mt-2 text-muted">{p.pharmacist}, pharmacist in charge</p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <Fact icon={<MapPin className="size-4" />} label="Address" value={`${p.address}, ${p.commune}`} />
            <Fact icon={<Clock className="size-4" />} label="Hours" value={p.onDuty ? `${hoursLabel(p)}, all night tonight` : hoursLabel(p)} />
            <Fact
              icon={<Phone className="size-4" />}
              label="Phone"
              value={
                <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="font-mono text-sm underline decoration-line underline-offset-4 hover:decoration-green">
                  {p.phone}
                </a>
              }
            />
          </dl>
        </div>
        <div className="h-56 overflow-hidden rounded-card ring-1 ring-line lg:h-full">
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
            <h2 className="font-display text-2xl font-semibold tracking-tight">On the shelf</h2>
            <p className="mt-1 font-mono text-sm text-muted nums">
              {inStock} of {items.length} lines in stock
            </p>
          </div>
          <label className="surface flex h-10 w-full items-center gap-2 rounded-xl px-3 sm:w-72">
            <Search className="size-4 text-muted" aria-hidden />
            <span className="sr-only">Filter this pharmacy’s stock</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter medicines…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
          </label>
        </div>

        <div className="surface mt-5 overflow-x-auto rounded-card">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th className="px-5 py-3 font-medium">Medicine</th>
                <th className="px-5 py-3 font-medium">Active ingredient</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Availability</th>
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
                      <span className="hidden font-mono text-[11px] text-muted md:inline">{fmtUpdated(l.updatedMinsAgo)}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {!lines.length && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted">
                    This pharmacy doesn’t list anything matching “{q}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
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
