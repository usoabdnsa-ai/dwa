"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Phone } from "lucide-react";
import type { Pharmacy } from "@/lib/data";
import { algiersMinutes, fmtPrice, fmtTime, isOpen, type Status } from "@/lib/finder";
import { useNow } from "@/lib/use-now";
import { Gauge, StatusPill, spot } from "../ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type StockLine = { id: string; name: string; commune: string; qty: number; status: Status };
export type Equivalent = { id: string; name: string; dosage: string; price: number };

/* Four cards, each a small working piece of the product rather than a sentence about it. */
export function Bento({ stock, pharmacies, equivalents }: { stock: StockLine[]; pharmacies: Pharmacy[]; equivalents: Equivalent[] }) {
  const ref = useRef<HTMLElement>(null);
  const now = useNow();
  const minutes = now ? algiersMinutes(now) : null;
  const openNow = minutes === null ? null : pharmacies.filter((p) => isOpen(p, minutes));
  const onDuty = pharmacies.filter((p) => p.onDuty);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const trig = { trigger: ref.current, start: "top 75%", once: true };
        gsap.from("[data-bento]", { y: 32, autoAlpha: 0, duration: 0.7, ease: "power3.out", stagger: 0.08, scrollTrigger: trig });
        gsap.from("[data-bento] [data-gauge]", { scaleX: 0, duration: 0.9, ease: "power3.out", stagger: 0.05, delay: 0.3, scrollTrigger: trig });
        ref.current!.querySelectorAll<HTMLElement>("[data-countup]").forEach((el) => {
          const n = { v: 0 };
          gsap.to(n, {
            v: Number(el.dataset.countup),
            duration: 1,
            ease: "power2.out",
            delay: 0.3,
            scrollTrigger: trig,
            onUpdate: () => void (el.textContent = String(Math.round(n.v))),
          });
        });
      });
    },
    { scope: ref },
  );

  const card = "v5-card v5-spot rounded-2xl p-6";
  return (
    <section ref={ref} className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <p className="text-sm font-medium text-(--ln-green)">What the shelf tells you</p>
      <h2 className="v5-display mt-3 max-w-2xl text-[clamp(2rem,4.5vw,3.25rem)]">
        Everything you’d ask on the phone, <span className="text-(--ln-muted)">already answered.</span>
      </h2>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {/* Live stock for one medicine. */}
        <article data-bento onPointerMove={spot} className={`${card} md:col-span-2`}>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-medium">Boxes on the shelf, per pharmacy</h3>
            <span className="text-sm text-(--ln-muted)">Doliprane 1000 mg</span>
          </div>
          <ul className="mt-5 space-y-3">
            {stock.map((s) => (
              <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_6rem_2.5rem_auto] items-center gap-3 text-sm sm:grid-cols-[minmax(0,1fr)_10rem_2.5rem_auto]">
                <span className="truncate">
                  {s.name} <span className="text-(--ln-muted)">· {s.commune}</span>
                </span>
                <Gauge qty={s.qty} status={s.status} className="w-full" />
                <span data-countup={s.qty} className="v5-mono text-right text-(--ln-soft)">
                  {s.qty}
                </span>
                <StatusPill status={s.status} />
              </li>
            ))}
          </ul>
        </article>

        {/* Open right now, from the real hours and the clock in Algiers. */}
        <article data-bento onPointerMove={spot} className={card}>
          <h3 className="font-medium">Open right now</h3>
          <p className="mt-4 flex items-baseline gap-2">
            <span className="v5-display v5-mono text-6xl">{openNow ? openNow.length : "–"}</span>
            <span className="text-(--ln-muted)">of {pharmacies.length}</span>
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            {(openNow ?? []).slice(0, 3).map((p) => (
              <li key={p.id} className="flex justify-between gap-3">
                <span className="truncate text-(--ln-soft)">{p.name.replace("Pharmacie ", "")}</span>
                <span className="v5-mono shrink-0 text-(--ln-muted)">{p.onDuty ? "all night" : p.opens === 0 && p.closes === 1440 ? "24/7" : `until ${fmtTime(p.closes)}`}</span>
              </li>
            ))}
          </ul>
        </article>

        {/* Tonight's rota. */}
        <article data-bento onPointerMove={spot} className={card}>
          <div className="flex items-center justify-between">
            <h3 className="font-medium">De garde tonight</h3>
            <span className="relative flex size-2">
              <span className="v5-live absolute inset-0 rounded-full bg-(--ln-green)" />
              <span className="relative size-2 rounded-full bg-(--ln-green)" />
            </span>
          </div>
          <ul className="mt-5 space-y-3">
            {onDuty.map((p) => (
              <li key={p.id}>
                <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="group flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate">{p.name}</span>
                    <span className="v5-mono block text-xs text-(--ln-muted)">{p.phone}</span>
                  </span>
                  <Phone className="size-4 shrink-0 text-(--ln-muted) group-hover:text-(--ln-green)" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </article>

        {/* Brand or molecule. */}
        <article data-bento onPointerMove={spot} className={`${card} md:col-span-2`}>
          <h3 className="font-medium">Search the brand or the molecule</h3>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="v5-mono rounded-lg border border-(--ln-line-2) bg-(--ln-surface-2) px-3 py-2 text-sm">paracetamol</span>
            <ArrowUpRight className="size-4 rotate-45 text-(--ln-muted)" aria-hidden="true" />
            {equivalents.map((m) => (
              <Link
                key={m.id}
                href={`/v5/search?q=${encodeURIComponent(m.name)}`}
                className="v5-press flex items-center gap-2 rounded-lg border border-(--ln-line) px-3 py-2 text-sm hover:border-(--ln-green)/50"
              >
                <span className="font-medium">{m.name}</span>
                <span className="text-(--ln-muted)">{m.dosage}</span>
                <span className="v5-mono text-(--ln-green)">{fmtPrice(m.price)}</span>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-sm text-(--ln-muted)">Out of one brand? The same molecule is often on the next shelf, for less.</p>
        </article>
      </div>
    </section>
  );
}
