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
import { Gauge, Mark, StatusPill } from "./ui";

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

  // The header rises, then the shelf rows fade up with their gauges filling.
  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from("[data-head]", { y: 24, autoAlpha: 0, duration: 0.5 })
          .from("[data-head-pill]", { scale: 0.8, autoAlpha: 0, duration: 0.5, ease: "back.out(2)" }, 0.1)
          .from("[data-fact]", { y: 16, autoAlpha: 0, duration: 0.3, stagger: 0.06 }, 0.25)
          .from("[data-line]", { y: 16, autoAlpha: 0, duration: 0.3, stagger: 0.03 }, 0.35)
          .from("[data-line] [data-gauge]", { scaleX: 0, duration: 0.6, stagger: 0.03 }, 0.45);
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="mx-auto max-w-6xl px-4 pt-8 pb-20 sm:px-6">
      <Link href="/v5/search" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-(--ln-muted) hover:bg-white/5 hover:text-(--ln-ink)">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to search
      </Link>

      <header data-head className="v5-card relative mt-4 overflow-hidden rounded-3xl p-6 sm:p-10">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgb(34_197_94/0.14),transparent_55%)]" />
        <div data-head-pill className="pointer-events-none absolute top-6 right-6 size-12 sm:top-10 sm:right-10 sm:size-16" aria-hidden="true">
          <Mark className="size-full" />
        </div>
        <div className="relative flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span className="rounded-full border border-(--ln-line-2) px-3 py-1 text-(--ln-muted)">{p.commune}</span>
          {p.onDuty && <span className="rounded-full border border-(--ln-soft)/50 px-3 py-1 text-(--ln-soft)">De garde tonight</span>}
          {open !== null && (
            <span className={`rounded-full border px-3 py-1 ${open ? "border-(--ln-green)/50 text-(--ln-green)" : "border-(--ln-line-2) text-(--ln-muted)"}`}>{open ? "Open now" : "Closed now"}</span>
          )}
        </div>
        <h1 className="v5-display relative mt-5 max-w-2xl pr-16 text-[clamp(2.2rem,6vw,4.4rem)] sm:pr-0">{p.name}</h1>
        <p className="relative mt-3 text-lg text-(--ln-muted)">
          {p.address} · {p.pharmacist}
        </p>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="v5-press flex items-center gap-2 rounded-xl bg-(--ln-green-solid) px-5 py-3 font-semibold text-(--ln-bg)">
            <Phone className="size-4" aria-hidden="true" /> {p.phone}
          </a>
          <a
            href={`https://www.openstreetmap.org/directions?to=${p.lat}%2C${p.lng}`}
            target="_blank"
            rel="noreferrer"
            className="v5-press flex items-center gap-2 rounded-xl border border-(--ln-line-2) px-5 py-3 font-semibold hover:border-(--ln-green)"
          >
            <Navigation className="size-4" aria-hidden="true" /> Directions
          </a>
        </div>
      </header>

      <dl className="mt-5 grid grid-cols-3 gap-3 sm:gap-5">
        {[
          ["Hours", hoursLabel(p), "text-(--ln-ink)"],
          ["On the shelf", `${inStock} of ${items.length}`, "text-(--ln-green)"],
          ["Last count", fmtUpdated(lastUpdate), "text-(--ln-ink)"],
        ].map(([k, v, bg]) => (
          <div key={k} data-fact className="v5-card rounded-2xl p-4 sm:p-5">
            <dt className="text-xs text-(--ln-muted) sm:text-sm">{k}</dt>
            <dd className={`v5-mono mt-1 text-base font-semibold sm:text-2xl ${bg}`}>{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="v5-display text-3xl sm:text-4xl">The shelf</h2>
            <label className="v5-card flex items-center gap-2 rounded-xl px-4 py-2 focus-within:border-(--ln-green)">
              <span className="sr-only">Filter the shelf</span>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by name or DCI"
                className="w-48 bg-transparent text-sm placeholder:text-(--ln-muted) focus:outline-none"
              />
            </label>
          </div>
          <ul className="mt-5 space-y-3">
            {lines.map((l) => {
              const s = statusOf(l.qty);
              return (
                <li key={l.medicineId} data-line className="v5-card flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <Link href={`/v5/search?q=${encodeURIComponent(l.medicine.name)}`} className="font-semibold hover:text-(--ln-green)">
                      {l.medicine.name} <span className="font-normal text-(--ln-muted)">{l.medicine.dosage}</span>
                    </Link>
                    <p className="text-sm text-(--ln-muted)">
                      {l.medicine.dci} · {fmtPrice(l.medicine.priceDzd)} · updated {fmtUpdated(l.updatedMinsAgo)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gauge qty={l.qty} status={s} className="w-24" />
                    <span className="v5-mono w-7 text-right font-semibold">{l.qty}</span>
                    <StatusPill status={s} />
                  </div>
                </li>
              );
            })}
            {lines.length === 0 && (
              <li className="v5-card rounded-2xl px-5 py-6 text-(--ln-muted)">Nothing on this shelf matches “{filter}”.</li>
            )}
          </ul>
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <figure className="v5-card overflow-hidden rounded-3xl">
            <CityPlan points={others} active={p.id} />
            <figcaption className="border-t border-(--ln-line-2) px-5 py-3 text-sm text-(--ln-muted)">
              {p.address}, {p.commune}
            </figcaption>
          </figure>
        </aside>
      </div>
    </div>
  );
}
