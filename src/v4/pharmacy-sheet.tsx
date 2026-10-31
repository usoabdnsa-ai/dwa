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
import { Gauge, NeonCross, StatusPill } from "./ui";

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

  // The sign flickers on, then the shelf rows fade up with their tubes lighting.
  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from("[data-head]", { y: 30, autoAlpha: 0, filter: "blur(8px)", duration: 0.6, clearProps: "filter" })
          .fromTo("[data-head-pill]", { opacity: 0 }, { keyframes: { opacity: [0, 1, 0.2, 0.9, 0.3, 1] }, duration: 0.7, ease: "none" }, 0.1)
          .from("[data-fact]", { y: 16, autoAlpha: 0, duration: 0.3, stagger: 0.06 }, 0.25)
          .from("[data-line]", { y: 16, autoAlpha: 0, duration: 0.3, stagger: 0.03 }, 0.35)
          .from("[data-line] [data-gauge]", { scaleX: 0, duration: 0.6, stagger: 0.03 }, 0.45);
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="mx-auto max-w-6xl px-4 pt-8 pb-20 sm:px-6">
      <Link href="/v4/search" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-(--nn-muted) hover:bg-white/5 hover:text-(--nn-ink)">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to search
      </Link>

      <header data-head className="v4-glass relative mt-4 overflow-hidden rounded-3xl p-6 sm:p-10">
        <div aria-hidden="true" className={`absolute inset-0 ${p.onDuty ? "bg-[radial-gradient(ellipse_at_85%_20%,color-mix(in_oklab,var(--nn-magenta)_22%,transparent),transparent_55%)]" : "bg-[radial-gradient(ellipse_at_85%_20%,color-mix(in_oklab,var(--nn-neon)_18%,transparent),transparent_55%)]"}`} />
        <div data-head-pill className="pointer-events-none absolute top-6 right-6 w-20 sm:top-10 sm:right-10 sm:w-36" aria-hidden="true">
          <NeonCross tone={p.onDuty ? "magenta" : "neon"} className="w-full" />
        </div>
        <div className="relative flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span className="rounded-full border border-(--nn-line) px-3 py-1 text-(--nn-muted)">{p.commune}</span>
          {p.onDuty && <span className="rounded-full border border-(--nn-magenta)/50 px-3 py-1 text-(--nn-magenta)">De garde tonight</span>}
          {open !== null && (
            <span className={`rounded-full border px-3 py-1 ${open ? "border-(--nn-neon)/50 text-(--nn-neon)" : "border-(--nn-line) text-(--nn-muted)"}`}>{open ? "Open now" : "Closed now"}</span>
          )}
        </div>
        <h1 className="v4-display relative mt-5 max-w-2xl pr-20 text-[clamp(2.2rem,6vw,4.6rem)] sm:pr-0">{p.name}</h1>
        <p className="relative mt-3 text-lg text-(--nn-muted)">
          {p.address} · {p.pharmacist}
        </p>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="v4-press flex items-center gap-2 rounded-xl bg-(--nn-neon) px-5 py-3 font-semibold text-(--nn-bg) shadow-[0_0_24px_-4px_var(--nn-neon)]">
            <Phone className="size-4" aria-hidden="true" /> {p.phone}
          </a>
          <a
            href={`https://www.openstreetmap.org/directions?to=${p.lat}%2C${p.lng}`}
            target="_blank"
            rel="noreferrer"
            className="v4-press flex items-center gap-2 rounded-xl border border-(--nn-line) px-5 py-3 font-semibold hover:border-(--nn-neon)"
          >
            <Navigation className="size-4" aria-hidden="true" /> Directions
          </a>
        </div>
      </header>

      <dl className="mt-5 grid grid-cols-3 gap-3 sm:gap-5">
        {[
          ["Hours", hoursLabel(p), "text-(--nn-ink)"],
          ["On the shelf", `${inStock} of ${items.length}`, "text-(--nn-neon) v4-glow-text"],
          ["Last count", fmtUpdated(lastUpdate), "text-(--nn-ink)"],
        ].map(([k, v, bg]) => (
          <div key={k} data-fact className="v4-glass rounded-2xl p-4 sm:p-5">
            <dt className="text-xs text-(--nn-muted) sm:text-sm">{k}</dt>
            <dd className={`v4-nums mt-1 text-base font-semibold sm:text-2xl ${bg}`}>{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="v4-display text-3xl sm:text-4xl">The shelf</h2>
            <label className="v4-glass flex items-center gap-2 rounded-xl px-4 py-2 focus-within:border-(--nn-neon)">
              <span className="sr-only">Filter the shelf</span>
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by name or DCI"
                className="w-48 bg-transparent text-sm placeholder:text-(--nn-muted) focus:outline-none"
              />
            </label>
          </div>
          <ul className="mt-5 space-y-3">
            {lines.map((l) => {
              const s = statusOf(l.qty);
              return (
                <li key={l.medicineId} data-line className="v4-glass flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <Link href={`/v4/search?q=${encodeURIComponent(l.medicine.name)}`} className="font-semibold hover:text-(--nn-neon)">
                      {l.medicine.name} <span className="font-normal text-(--nn-muted)">{l.medicine.dosage}</span>
                    </Link>
                    <p className="text-sm text-(--nn-muted)">
                      {l.medicine.dci} · {fmtPrice(l.medicine.priceDzd)} · updated {fmtUpdated(l.updatedMinsAgo)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gauge qty={l.qty} status={s} className="w-24" />
                    <span className="v4-nums w-7 text-right font-semibold">{l.qty}</span>
                    <StatusPill status={s} />
                  </div>
                </li>
              );
            })}
            {lines.length === 0 && (
              <li className="v4-glass rounded-2xl px-5 py-6 text-(--nn-muted)">Nothing on this shelf matches “{filter}”.</li>
            )}
          </ul>
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <figure className="v4-glass overflow-hidden rounded-3xl">
            <CityPlan points={others} active={p.id} />
            <figcaption className="border-t border-(--nn-line) px-5 py-3 text-sm text-(--nn-muted)">
              {p.address}, {p.commune}
            </figcaption>
          </figure>
        </aside>
      </div>
    </div>
  );
}
