"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Navigation, Phone, Search } from "lucide-react";
import type { Status } from "@/lib/finder";
import { Gauge, StatusPill } from "../ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type HowRow = { id: string; name: string; commune: string; km: string; qty: number; status: Status; hours: string; phone: string };

const STEPS = [
  { n: "01", title: "Search", body: "Type a brand or a molecule. Suggestions appear as you type, with dosage and form." },
  { n: "02", title: "Compare", body: "Every pharmacy’s shelf at once: boxes left, distance, and when it was last counted." },
  { n: "03", title: "Go", body: "Call ahead or get directions. Open hours and the night rota are already checked." },
];

/*
 * Scroll-driven walkthrough: the steps scroll on the left while the screen on
 * the right stays put (CSS sticky) and crossfades to match. Each step is one
 * ScrollTrigger toggling an index, so no scrubbing work per frame.
 */
export function How({ rows }: { rows: HowRow[] }) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const top = rows[0];

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el, i) => {
        ScrollTrigger.create({ trigger: el, start: "top 55%", end: "bottom 55%", onToggle: (self) => self.isActive && setActive(i) });
      });
    },
    { scope: ref },
  );

  const screens = [
    <div key="s" className="p-5">
      <div className="flex items-center gap-2 rounded-lg border border-(--ln-green)/50 bg-(--ln-surface-2) px-3 py-2.5 text-sm shadow-[0_0_0_4px_rgb(74_222_128/0.1)]">
        <Search className="size-4 text-(--ln-muted)" aria-hidden="true" /> augm<span className="h-4 w-px bg-(--ln-ink) motion-safe:animate-pulse" />
      </div>
      <ul className="mt-2 rounded-lg border border-(--ln-line) bg-(--ln-surface-2) p-1 text-sm">
        <li className="flex justify-between rounded-md bg-white/[0.06] px-3 py-2">
          <span>
            <span className="font-medium">Augmentin</span> <span className="text-(--ln-muted)">1 g · Amoxicillin / Clavulanic acid</span>
          </span>
          <span className="text-xs text-(--ln-muted)">Tablet</span>
        </li>
        <li className="flex justify-between px-3 py-2">
          <span>
            <span className="font-medium">Amoxil</span> <span className="text-(--ln-muted)">500 mg · Amoxicillin</span>
          </span>
          <span className="text-xs text-(--ln-muted)">Capsule</span>
        </li>
      </ul>
    </div>,
    <ul key="c" className="space-y-1 p-3">
      {rows.map((r) => (
        <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_5rem_2rem_auto] items-center gap-3 rounded-lg px-3 py-2.5 text-sm">
          <span className="truncate">
            {r.name} <span className="v5-mono text-xs text-(--ln-muted)">{r.km}</span>
          </span>
          <Gauge qty={r.qty} status={r.status} className="w-full" />
          <span className="v5-mono text-right text-(--ln-soft)">{r.qty}</span>
          <StatusPill status={r.status} />
        </li>
      ))}
    </ul>,
    <div key="g" className="p-6">
      <p className="text-sm text-(--ln-muted)">{top.commune} · {top.km}</p>
      <p className="v5-display mt-1 text-3xl">{top.name}</p>
      <p className="mt-2 text-sm text-(--ln-muted)">
        {top.hours} · <span className="text-(--ln-green)">Augmentin 1 g: {top.qty} boxes</span>
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <span className="flex items-center gap-2 rounded-lg bg-(--ln-green-solid) px-4 py-2 text-sm font-medium text-(--ln-bg)">
          <Phone className="size-4" aria-hidden="true" /> {top.phone}
        </span>
        <span className="flex items-center gap-2 rounded-lg border border-(--ln-line-2) px-4 py-2 text-sm">
          <Navigation className="size-4" aria-hidden="true" /> Directions
        </span>
      </div>
    </div>,
  ];

  return (
    <section ref={ref} className="border-y border-(--ln-line) bg-(--ln-surface)">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <p className="text-sm font-medium text-(--ln-green)">How it works</p>
        <h2 className="v5-display mt-3 text-[clamp(2rem,4.5vw,3.25rem)]">Three steps, no phone calls.</h2>

        <div className="mt-12 grid gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <ol>
            {STEPS.map((s, i) => (
              <li key={s.n} data-step className="py-6 md:flex md:min-h-[60vh] md:flex-col md:justify-center md:py-0">
                <div className={`border-l-2 pl-5 transition-colors duration-300 ${active === i ? "border-(--ln-green)" : "border-(--ln-line)"}`}>
                  <span className="v5-mono text-sm text-(--ln-muted)">{s.n}</span>
                  <h3 className={`v5-display mt-1 text-3xl transition-colors duration-300 ${active === i ? "text-(--ln-ink)" : "md:text-(--ln-muted)"}`}>{s.title}</h3>
                  <p className="mt-2 max-w-sm text-(--ln-muted)">{s.body}</p>
                </div>
                {/* On small screens each step shows its own screen inline. */}
                <div className="v5-card mt-5 overflow-hidden rounded-2xl md:hidden">{screens[i]}</div>
              </li>
            ))}
          </ol>

          <div className="hidden md:block">
            <div className="sticky top-[calc(50vh-11rem)]">
              <div className="v5-card relative h-[22rem] overflow-hidden rounded-2xl">
                <div className="flex items-center gap-1.5 border-b border-(--ln-line) px-4 py-3" aria-hidden="true">
                  {STEPS.map((s, i) => (
                    <span key={s.n} className={`h-1 rounded-full transition-[width,background-color] duration-300 ${active === i ? "w-8 bg-(--ln-green)" : "w-3 bg-white/15"}`} />
                  ))}
                </div>
                {screens.map((sc, i) => (
                  <div
                    key={i}
                    aria-hidden={active !== i}
                    className={`absolute inset-x-0 top-11 transition-[opacity,transform] duration-300 ease-(--ln-ease) ${active === i ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
                  >
                    {sc}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
