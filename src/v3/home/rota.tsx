"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Phone } from "lucide-react";
import type { Pharmacy } from "@/lib/data";
import { CityPlan, type PlanPoint } from "../city-plan";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* Tonight's de garde pharmacies on a tangerine band, rows sliding in from alternating sides. */
export function Rota({ onDuty, plan }: { onDuty: Pharmacy[]; plan: PlanPoint[] }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-row]", {
          x: (i: number) => (i % 2 ? 120 : -120),
          rotate: (i: number) => (i % 2 ? 4 : -4),
          autoAlpha: 0,
          duration: 0.8,
          ease: "back.out(1.5)",
          stagger: 0.12,
          scrollTrigger: { trigger: "[data-rows]", start: "top 80%", once: true },
        });
        gsap.from("[data-moon]", {
          y: 60,
          rotate: -40,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "top 30%", scrub: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative overflow-hidden border-y-2 border-(--pp-ink) bg-(--pp-tang)">
      <svg data-moon viewBox="0 0 100 100" className="pointer-events-none absolute -top-6 right-6 w-28 sm:right-16 sm:w-40" aria-hidden="true">
        <path d="M70 10a42 42 0 1 0 20 60A34 34 0 0 1 70 10z" fill="var(--pp-lemon)" stroke="var(--pp-ink)" strokeWidth="4" strokeLinejoin="round" />
      </svg>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <h2 className="v3-display text-[clamp(2rem,5vw,4rem)]">Open tonight, while the rest sleep.</h2>
          <p className="mt-4 max-w-md text-lg font-medium">The de garde rota for Alger, with stock you can read before you drive.</p>
          <ol data-rows className="mt-8 space-y-3">
            {onDuty.map((p) => (
              <li key={p.id} data-row>
                <Link
                  href={`/v3/pharmacy/${p.id}`}
                  className="v3-press v3-sticker group flex items-center justify-between gap-4 rounded-full bg-white py-3 pr-3 pl-6"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{p.name}</span>
                    <span className="flex items-center gap-1.5 text-sm text-(--pp-muted)">
                      {p.commune} <span aria-hidden="true">·</span> <Phone className="size-3.5" aria-hidden="true" /> {p.phone}
                    </span>
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-(--pp-ink) text-(--pp-mint) transition-transform duration-200 group-hover:rotate-45">
                    <ArrowUpRight className="size-5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <figure className="v3-sticker overflow-hidden rounded-[2rem] bg-white">
          <CityPlan points={plan} />
          <figcaption className="flex flex-wrap gap-x-5 gap-y-1 border-t-2 border-(--pp-ink) px-5 py-3 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <span className="size-4 rounded-full border-[3px] border-dashed border-(--pp-tang)" /> De garde tonight
            </span>
            <span className="flex items-center gap-2">
              <span className="size-4 rounded-md border-2 border-(--pp-ink) bg-(--pp-green)" /> Pharmacy on dwa
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
