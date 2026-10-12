"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useIntroDone } from "@/lib/intro";
import { pharmacies } from "@/lib/data";
import { HeroSearch } from "../hero-search";

// The sign from the intro, at rest: a thin plus still lit inside the dimmed cross.
const GRID = 9;

const SIGN = Array.from({ length: GRID * GRID }, (_, i) => ({ x: i % GRID, y: Math.floor(i / GRID) })).filter(
  ({ x, y }) => (x >= 3 && x <= 5) || (y >= 3 && y <= 5),
);

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const ready = useIntroDone();

  useEffect(() => {
    if (!ready || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-item", { autoAlpha: 0, y: 18, duration: 0.7, ease: "power3.out", stagger: 0.07 });
        gsap.from(".hero-sign circle", { opacity: 0, duration: 0.5, ease: "power2.out", stagger: { each: 0.008, from: "center" }, delay: 0.15 });
      });
      gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".hero-item", { autoAlpha: 1 });
      });
    }, ref);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section ref={ref} className="relative">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-16 pb-28 sm:px-6 sm:pt-24 lg:grid-cols-[1.35fr_1fr] lg:pb-36">
        <div>
          <p className="hero-item mb-6 inline-flex items-center gap-2 font-mono text-xs text-muted">
            <span className="size-1.5 rounded-full bg-green" aria-hidden />
            {pharmacies.length} pharmacies in Alger reporting stock
          </p>
          <h1 className="hero-item max-w-[14ch] font-display text-5xl leading-[0.98] font-bold tracking-tight text-balance sm:text-7xl">
            Stop walking from pharmacy to pharmacy.
          </h1>
          <p className="hero-item mt-6 max-w-[46ch] text-lg leading-relaxed text-muted">
            Type the medicine on your prescription. See which pharmacies near you have it on the shelf right now, counted
            by the pharmacists themselves.
          </p>
          <div className="hero-item mt-10">
            <HeroSearch />
          </div>
        </div>

        <svg viewBox={`0 0 ${GRID * 24} ${GRID * 24}`} className="hero-sign mx-auto hidden w-full max-w-[340px] lg:block" aria-hidden="true">
          {SIGN.map(({ x, y }) => (
            <circle
              key={`${x},${y}`}
              cx={x * 24 + 12}
              cy={y * 24 + 12}
              r={8.6}
              className={x === 4 || y === 4 ? "fill-green" : "fill-green-soft"}
            />
          ))}
        </svg>
      </div>
    </section>
  );
}
