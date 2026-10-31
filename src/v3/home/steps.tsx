"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Gauge, Pill } from "../ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Three tiles, each a tiny working piece of the product instead of a paragraph. */
const SHELF = [
  { name: "Doliprane 1000 mg", qty: 62, status: "in" as const },
  { name: "Augmentin 1 g", qty: 4, status: "low" as const },
  { name: "Glucophage 850 mg", qty: 31, status: "in" as const },
];

export function Steps() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-tile]", {
          y: 80,
          rotate: (i: number) => [-4, 3, -2][i],
          autoAlpha: 0,
          duration: 0.9,
          ease: "back.out(1.4)",
          stagger: 0.12,
          scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
        });

        // Tile 1: the field types a name, deletes it, types the ingredient. Loops while on screen.
        const typed = ref.current!.querySelector<HTMLElement>("[data-typed]")!;
        const words = ["Ventoline", "salbutamol"];
        const type = gsap.timeline({ repeat: -1, paused: true });
        words.forEach((w) => {
          const s = { n: 0 };
          type
            .to(s, { n: w.length, duration: w.length * 0.08, ease: "none", onUpdate: () => void (typed.textContent = w.slice(0, Math.round(s.n))) })
            .to({}, { duration: 1.2 })
            .to(s, { n: 0, duration: 0.4, ease: "none", onUpdate: () => void (typed.textContent = w.slice(0, Math.round(s.n))) });
        });
        ScrollTrigger.create({ trigger: "[data-tile='0']", start: "top 90%", end: "bottom 10%", onToggle: (self) => (self.isActive ? type.play() : type.pause()) });

        // Tile 2: the shelf gauges fill.
        gsap.from("[data-tile='1'] [data-gauge]", {
          scaleX: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: { trigger: "[data-tile='1']", start: "top 80%", once: true },
        });

        // Tile 3: the route draws itself as you scroll past.
        gsap.fromTo(
          "[data-route]",
          { strokeDashoffset: 420 },
          { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: "[data-tile='2']", start: "top 85%", end: "center 45%", scrub: true } },
        );
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
      <h2 className="v3-display max-w-3xl text-[clamp(2rem,5vw,4rem)]">
        Three taps. <span className="text-(--pp-green)">Zero phone calls.</span>
      </h2>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        <article data-tile="0" className="v3-sticker flex flex-col rounded-[2rem] bg-(--pp-lemon) p-6 sm:p-7">
          <span className="v3-display text-5xl">1</span>
          <h3 className="mt-3 text-xl font-bold">Type the name or the ingredient</h3>
          <div className="mt-auto pt-8">
            <div className="v3-sticker flex items-center gap-3 rounded-full bg-white px-4 py-3">
              <Pill kind="capsule" className="w-8 shrink-0 -rotate-12" />
              <span className="font-semibold">
                <span data-typed>Ventoline</span>
                <span className="ml-0.5 inline-block h-5 w-0.5 translate-y-0.5 bg-(--pp-ink) motion-safe:animate-pulse" />
              </span>
            </div>
            <p className="mt-3 text-sm font-medium">Brand or DCI, both find it.</p>
          </div>
        </article>

        <article data-tile="1" className="v3-sticker flex flex-col rounded-[2rem] bg-white p-6 sm:p-7">
          <span className="v3-display text-5xl">2</span>
          <h3 className="mt-3 text-xl font-bold">Read every shelf, live</h3>
          <ul className="mt-auto space-y-3 pt-8">
            {SHELF.map((s) => (
              <li key={s.name} className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{s.name}</span>
                <span className="flex items-center gap-2">
                  <Gauge qty={s.qty} status={s.status} className="w-20" />
                  <span className="v3-nums w-6 text-right text-sm font-bold">{s.qty}</span>
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article data-tile="2" className="v3-sticker flex flex-col rounded-[2rem] bg-(--pp-tang) p-6 sm:p-7">
          <span className="v3-display text-5xl">3</span>
          <h3 className="mt-3 text-xl font-bold">Walk in. It’s there.</h3>
          <div className="mt-auto pt-6">
            <svg viewBox="0 0 300 120" className="w-full" aria-hidden="true">
              <path
                data-route
                d="M24 96 C 80 96, 70 40, 130 44 S 200 90, 262 30"
                fill="none"
                stroke="var(--pp-ink)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="420"
              />
              <circle cx="24" cy="96" r="11" fill="white" stroke="var(--pp-ink)" strokeWidth="4" />
              <g transform="translate(262 30)">
                <rect x="-18" y="-18" width="36" height="36" rx="11" fill="var(--pp-green)" stroke="var(--pp-ink)" strokeWidth="4" />
                <path d="M-3 -10h6v7h7v6h-7v7h-6v-7h-7v-6h7z" fill="white" />
              </g>
            </svg>
            <p className="mt-2 text-sm font-semibold">1.2 km · open until 21:00</p>
          </div>
        </article>
      </div>
    </section>
  );
}
