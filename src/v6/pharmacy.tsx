"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Medicine, Pharmacy, StockItem } from "@/lib/data";
import { extrasOf, waitNow } from "@/lib/extras";
import {
  algiersMinutes,
  fmtPrice,
  fmtUpdated,
  hoursLabel,
  isOpen,
  statusOf,
} from "@/lib/finder";
import { useNow } from "@/lib/use-now";
import { Navigation, Phone } from "lucide-react";
import { Reveal } from "./reveal";
import { Breadcrumbs, Gauge, StockTag, SummaryList, Tag } from "./ui";

type Line = StockItem & { medicine: Medicine };

export function PharmacyPage({
  pharmacy: p,
  items,
}: {
  pharmacy: Pharmacy;
  items: Line[];
}) {
  const now = useNow();
  const minutes = now ? algiersMinutes(now) : null;
  const open = minutes === null ? null : isOpen(p, minutes);
  const ex = extrasOf(p.id);
  const [q, setQ] = useState("");

  const lines = useMemo(() => {
    const n = q.trim().toLowerCase();
    return items
      .filter(
        (l) =>
          !n ||
          (l.medicine.name + " " + l.medicine.dci).toLowerCase().includes(n),
      )
      .sort((a, b) => a.medicine.name.localeCompare(b.medicine.name));
  }, [items, q]);
  const inStock = items.filter((l) => l.qty > 0).length;
  const lastCount = Math.min(...items.map((l) => l.updatedMinsAgo));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6">
      <Breadcrumbs
        items={[
          { href: "/v6", label: "Home" },
          { href: "/v6/search", label: "Pharmacies" },
          { label: p.name },
        ]}
      />

      <Reveal className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <header data-reveal>
          <p className="text-(--e-muted)">{p.commune}</p>
          <h1 className="v6-serif mt-1 text-[clamp(2.6rem,5vw,4rem)]">
            {p.name}
          </h1>
          <p className="mt-4 flex flex-wrap gap-2">
            {p.onDuty && <Tag tone="dark">On duty tonight</Tag>}
            {open !== null && !p.onDuty && (
              <Tag tone={open ? "sage" : "grey"}>
                {open ? "Open now" : "Closed now"}
              </Tag>
            )}
            {ex.chifa && <Tag tone="grey">Accepts CHIFA</Tag>}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`tel:${p.phone.replace(/\s/g, "")}`}
              className="v6-btn v6-btn-cta h-12 px-6"
            >
              <Phone className="size-4" aria-hidden />{" "}
              <span className="v6-nums">{p.phone}</span>
            </a>
            <a
              href={`https://www.openstreetmap.org/directions?to=${p.lat}%2C${p.lng}`}
              target="_blank"
              rel="noreferrer"
              className="v6-btn v6-btn-ghost h-12 px-6"
            >
              <Navigation className="size-4" aria-hidden /> Directions
            </a>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4">
            {[
              {
                k: "Rating",
                v: ex.rating.toFixed(1),
                s: `${ex.reviews} reviews`,
              },
              {
                k: "Wait now",
                v:
                  open && minutes !== null
                    ? `${waitNow(p.id, minutes)} min`
                    : "Closed",
                s: "estimated",
              },
              {
                k: "In stock",
                v: `${inStock}/${items.length}`,
                s: `counted ${fmtUpdated(lastCount)}`,
              },
            ].map((x) => (
              <div key={x.k} className="flex flex-col-reverse">
                <dt className="text-sm text-(--e-muted)">
                  {x.k}
                  <span className="block text-xs">{x.s}</span>
                </dt>
                <dd className="v6-serif v6-nums text-3xl text-(--e-green) sm:text-4xl">
                  {x.v}
                </dd>
              </div>
            ))}
          </dl>
        </header>
        <div data-reveal>
          <SummaryList
            rows={[
              { key: "Address", value: `${p.address}, ${p.commune}` },
              {
                key: "Hours",
                value: p.onDuty
                  ? `${hoursLabel(p)}, and all night tonight`
                  : hoursLabel(p),
              },
              { key: "Pharmacist", value: p.pharmacist },
            ]}
          />
        </div>
      </Reveal>

      <section className="mt-20" aria-labelledby="stock">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="stock" className="v6-serif text-4xl">
            On the <em>shelves</em>
          </h2>
          <label className="w-full max-w-xs">
            <span className="sr-only">
              Filter by medicine or active ingredient
            </span>
            <input
              id="stock-filter"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter medicines…"
              className="v6-input"
              autoComplete="off"
            />
          </label>
        </div>

        <Reveal className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lines.map((l) => {
            const s = statusOf(l.qty);
            return (
              <article
                key={l.medicineId}
                data-reveal
                className="v6-card flex flex-col p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold">
                      {l.medicine.name}{" "}
                      <span className="font-normal text-(--e-muted)">
                        {l.medicine.dosage}
                      </span>
                    </h3>
                    <p className="text-sm text-(--e-muted)">{l.medicine.dci}</p>
                  </div>
                  <StockTag status={s} />
                </div>
                <Gauge qty={l.qty} status={s} className="mt-5 w-full" />
                <div className="mt-2 flex justify-between text-xs text-(--e-muted)">
                  <span className="v6-nums">
                    {s === "out" ? "None" : `${l.qty} boxes`}
                  </span>
                  <span>{fmtUpdated(l.updatedMinsAgo)}</span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-(--e-line) pt-4">
                  <span className="v6-nums text-sm font-semibold">
                    {fmtPrice(l.medicine.priceDzd)}
                    {l.medicine.rx && (
                      <span className="ms-2 font-normal text-(--e-amber)">
                        Rx
                      </span>
                    )}
                  </span>
                  {s !== "out" && (
                    <Link
                      href={`/v6/reserve?pharmacy=${p.id}&medicine=${l.medicineId}`}
                      className="v6-btn h-9 bg-(--e-sage) px-4 text-sm text-(--e-green) hover:bg-(--e-green) hover:text-white"
                    >
                      Reserve<span className="sr-only"> {l.medicine.name}</span>
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </Reveal>
        {lines.length === 0 && (
          <p className="mt-6 text-(--e-muted)">
            No medicine here matches &ldquo;{q}&rdquo;.
          </p>
        )}
      </section>
    </div>
  );
}
