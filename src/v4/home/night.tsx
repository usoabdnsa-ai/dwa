"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Pharmacy } from "@/lib/data";
import { fmtTime } from "@/lib/finder";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/*
 * Pinned beat: scroll runs a clock from 18:00 to 03:00. Each shopfront goes
 * dark at its real closing time; the de garde ones switch to magenta and stay
 * lit, the 24/7 one never blinks. Markup is the 03:00 end state, so reduced
 * motion shows the answer straight away.
 */
const START = 18 * 60;
const END = 27 * 60; // 03:00 the next morning

type Fate = "closes" | "garde" | "always";
const fateOf = (p: Pharmacy): Fate => (p.opens === 0 && p.closes === 1440 ? "always" : p.onDuty ? "garde" : "closes");

export function Night({ pharmacies }: { pharmacies: Pharmacy[] }) {
  const ref = useRef<HTMLElement>(null);
  const shops = [...pharmacies].sort((a, b) => a.closes - b.closes);
  const stillOpen = shops.filter((p) => fateOf(p) !== "closes").length;

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const clock = ref.current!.querySelector<HTMLElement>("[data-clock]")!;
        const count = ref.current!.querySelector<HTMLElement>("[data-count]")!;
        const hours = (END - START) / 60;

        // Start of the evening: every sign on.
        gsap.set("[data-state='open']", { opacity: 1 });
        gsap.set("[data-state='garde'], [data-state='closed']", { opacity: 0 });
        gsap.set("[data-sky]", { opacity: 1 });
        gsap.set("[data-final]", { autoAlpha: 0, y: 20 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ref.current, start: "top top", end: "+=250%", scrub: 0.5, pin: true },
        });
        const t = { m: START };
        tl.to(t, {
          m: END,
          duration: hours,
          onUpdate: () => {
            const m = Math.round(t.m / 15) * 15;
            clock.textContent = fmtTime(m % 1440);
            count.textContent = String(shops.filter((p) => fateOf(p) !== "closes" || m < p.closes).length);
          },
        });
        tl.to("[data-sky]", { opacity: 0, duration: hours * 0.7 }, 0);

        shops.forEach((p) => {
          const fate = fateOf(p);
          if (fate === "always") return;
          const at = Math.max(0, (p.closes - START) / 60);
          const tile = `[data-shop='${p.id}']`;
          // The old sign stutters off...
          tl.to(`${tile} [data-state='open']`, { keyframes: { opacity: [1, 0.2, 0.9, 0.1, 0] }, duration: 0.35 }, at);
          // ...and either the closed shutter or the magenta night sign takes over.
          tl.to(`${tile} [data-state='${fate === "garde" ? "garde" : "closed"}']`, { keyframes: { opacity: [0, 1, 0.3, 1] }, duration: 0.35 }, at + 0.2);
        });

        tl.to("[data-final]", { autoAlpha: 1, y: 0, duration: 0.6 }, hours - 0.6);
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Evening sky that drains away as the clock runs. */}
      <div data-sky aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,#2a1240_0%,#3b1a3a_30%,var(--nn-bg)_85%)] opacity-0" />

      <div className="relative mx-auto grid min-h-svh max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-(--nn-magenta) uppercase">Tonight in Alger</p>
          <p data-clock className="v4-display v4-nums v4-glow-text mt-3 text-[clamp(4.5rem,13vw,9rem)] text-(--nn-neon)">
            03:00
          </p>
          <p className="mt-4 text-2xl font-semibold">
            <span data-count className="v4-nums text-(--nn-neon)">
              {stillOpen}
            </span>{" "}
            of {shops.length} still open
          </p>
          <p data-final className="mt-4 max-w-sm text-(--nn-muted)">
            The shutters come down one by one. The de garde rota keeps three lights on, and Bab Ezzouar never closes. dwa shows you which ones, and what’s on their shelves.
          </p>
        </div>

        <ol className="grid grid-cols-2 gap-3 sm:gap-4">
          {shops.map((p) => {
            const fate = fateOf(p);
            return (
              <li key={p.id} data-shop={p.id}>
                <Link href={`/v4/pharmacy/${p.id}`} className="v4-glass group relative block h-full overflow-hidden rounded-2xl p-4 sm:p-5">
                  {/* Three stacked states; only the 03:00 one is visible without motion. */}
                  <span data-state="open" className={`absolute inset-0 bg-(--nn-neon)/10 ${fate === "always" ? "" : "opacity-0"}`} aria-hidden="true" />
                  <span data-state="garde" className={`absolute inset-0 bg-(--nn-magenta)/12 ${fate === "garde" ? "" : "opacity-0"}`} aria-hidden="true" />
                  <span data-state="closed" className={`absolute inset-0 bg-black/40 ${fate === "closes" ? "" : "opacity-0"}`} aria-hidden="true" />

                  <span className="relative block text-xs text-(--nn-muted)">{p.commune}</span>
                  <span className="relative mt-1 block font-semibold group-hover:underline">{p.name.replace("Pharmacie ", "")}</span>
                  <span className="relative mt-3 block h-5 text-xs font-semibold">
                    <span data-state="open" className={`v4-glow-text absolute inset-0 text-(--nn-neon) ${fate === "always" ? "" : "opacity-0"}`}>
                      {fate === "always" ? "Open 24/7" : `Open until ${fmtTime(p.closes)}`}
                    </span>
                    <span data-state="garde" className={`v4-glow-text absolute inset-0 text-(--nn-magenta) ${fate === "garde" ? "" : "opacity-0"}`}>
                      De garde all night
                    </span>
                    <span data-state="closed" className={`absolute inset-0 text-(--nn-muted) ${fate === "closes" ? "" : "opacity-0"}`}>
                      Closed at {fmtTime(p.closes)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
