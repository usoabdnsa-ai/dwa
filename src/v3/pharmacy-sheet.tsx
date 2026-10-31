"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, Navigation, Phone } from "lucide-react";
import { pharmacies, type Medicine, type Pharmacy, type StockItem } from "@/lib/data";
import { algiersMinutes, fmtPrice, fmtUpdated, hoursLabel, isOpen, statusOf } from "@/lib/finder";
import { useNow } from "@/lib/use-now";
import { CityPlan } from "./city-plan";
import { Gauge, Pill, StatusPill } from "./ui";

gsap.registerPlugin(useGSAP);

type Line = StockItem & { medicine: Medicine };

const others = pharmacies.map((p) => ({ ...p, status: "none" as const }));

export function PharmacySheet({ pharmacy: p, items }: { pharmacy: Pharmacy; items: Line[] }) {
  const now = useNow();
  const open = now ? isOpen(p, algiersMinutes(now)) : null;
  const [filter, setFilter] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => {
    const f = filter.trim().toLowerCase();
    return items
      .filter((l) => !f || l.medicine.name.toLowerCase().includes(f) || l.medicine.dci.toLowerCase().includes(f))
      .sort((a, b) => a.medicine.name.localeCompare(b.medicine.name));
  }, [items, filter]);

  const inStock = items.filter((l) => l.qty > 0).length;
  const lastUpdate = Math.min(...items.map((l) => l.updatedMinsAgo));

  // Header card pops, then the shelf rows deal in with their gauges filling.
  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from("[data-head]", { y: 30, autoAlpha: 0, duration: 0.5 })
          .from("[data-head-pill]", { y: -200, rotate: -90, autoAlpha: 0, duration: 0.9, ease: "bounce.out" }, 0.1)
          .from("[data-fact]", { y: 16, autoAlpha: 0, duration: 0.3, stagger: 0.06 }, 0.25)
          .from("[data-line]", { y: 16, autoAlpha: 0, duration: 0.3, stagger: 0.03 }, 0.35)
          .from("[data-line] [data-gauge]", { scaleX: 0, duration: 0.6, stagger: 0.03 }, 0.45);
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="mx-auto max-w-7xl px-4 pt-4 pb-20 sm:px-8">
      <Link href="/v3/search" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-(--pp-mint-2)">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to search
      </Link>

      <header data-head className={`v3-sticker relative mt-4 overflow-hidden rounded-[2.25rem] p-6 sm:p-10 ${p.onDuty ? "bg-(--pp-tang)" : "bg-(--pp-lemon)"}`}>
        <div data-head-pill className="pointer-events-none absolute -top-4 -right-6 w-40 rotate-[24deg] sm:w-64" aria-hidden="true">
          <Pill kind="capsule" a={p.onDuty ? "var(--pp-lemon)" : "var(--pp-tang)"} className="w-full" />
        </div>
        <div className="relative flex flex-wrap items-center gap-2 text-sm font-bold">
          <span className="rounded-full bg-white px-3 py-1">{p.commune}</span>
          {p.onDuty && <span className="rounded-full bg-(--pp-ink) px-3 py-1 text-(--pp-mint)">De garde tonight</span>}
          {open !== null && (
            <span className={`rounded-full px-3 py-1 ${open ? "bg-(--pp-green) text-white" : "bg-white"}`}>{open ? "Open now" : "Closed now"}</span>
          )}
        </div>
        <h1 className="v3-display relative mt-5 max-w-3xl text-[clamp(2.2rem,6vw,4.6rem)]">{p.name}</h1>
        <p className="relative mt-3 text-lg font-semibold">
          {p.address} · {p.pharmacist}
        </p>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="v3-press v3-sticker flex items-center gap-2 rounded-full bg-(--pp-ink) px-5 py-3 font-bold text-(--pp-mint)">
            <Phone className="size-4" aria-hidden="true" /> {p.phone}
          </a>
          <a
            href={`https://www.openstreetmap.org/directions?to=${p.lat}%2C${p.lng}`}
            target="_blank"
            rel="noreferrer"
            className="v3-press v3-sticker flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold"
          >
            <Navigation className="size-4" aria-hidden="true" /> Directions
          </a>
        </div>
      </header>

      <dl className="mt-5 grid grid-cols-3 gap-3 sm:gap-5">
        {[
          ["Hours", hoursLabel(p), "bg-white"],
          ["On the shelf", `${inStock} of ${items.length}`, "bg-(--pp-lilac)"],
          ["Last count", fmtUpdated(lastUpdate), "bg-white"],
        ].map(([k, v, bg]) => (
          <div key={k} data-fact className={`v3-sticker rounded-3xl p-4 sm:p-5 ${bg}`}>
            <dt className="text-xs font-bold sm:text-sm">{k}</dt>
            <dd className="v3-nums mt-1 text-base font-extrabold sm:text-2xl">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="v3-display text-3xl sm:text-4xl">The shelf</h2>
            <label className="v3-sticker flex items-center gap-2 rounded-full bg-white px-4 py-2">
              <span className="sr-only">Filter the shelf</span>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by name or DCI"
                className="w-48 bg-transparent text-sm font-semibold placeholder:text-(--pp-muted) focus:outline-none"
              />
            </label>
          </div>
          <ul className="mt-5 space-y-3">
            {lines.map((l) => {
              const s = statusOf(l.qty);
              return (
                <li key={l.medicineId} data-line className="v3-sticker flex flex-wrap items-center gap-x-5 gap-y-3 rounded-3xl bg-white px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <Link href={`/v3/search?q=${encodeURIComponent(l.medicine.name)}`} className="text-lg font-extrabold hover:underline">
                      {l.medicine.name} <span className="font-semibold text-(--pp-green)">{l.medicine.dosage}</span>
                    </Link>
                    <p className="text-sm font-medium text-(--pp-muted)">
                      {l.medicine.dci} · {fmtPrice(l.medicine.priceDzd)} · updated {fmtUpdated(l.updatedMinsAgo)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gauge qty={l.qty} status={s} className="w-24" />
                    <span className="v3-nums w-7 text-right font-extrabold">{l.qty}</span>
                    <StatusPill status={s} />
                  </div>
                </li>
              );
            })}
            {lines.length === 0 && (
              <li className="v3-sticker rounded-3xl bg-white px-5 py-6 font-semibold">Nothing on this shelf matches “{filter}”.</li>
            )}
          </ul>
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <figure className="v3-sticker overflow-hidden rounded-[2rem] bg-white">
            <CityPlan points={others} active={p.id} />
            <figcaption className="border-t-2 border-(--pp-ink) px-5 py-3 text-sm font-semibold">
              {p.address}, {p.commune}
            </figcaption>
          </figure>
        </aside>
      </div>
    </div>
  );
}
