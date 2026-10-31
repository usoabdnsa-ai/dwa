"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SearchBox } from "../search-box";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Stat = { value: number; suffix?: string; label: string };

/* Real numbers from the data counting up, then the search once more over a low green glow. */
export function Close({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        ref.current!.querySelectorAll<HTMLElement>("[data-stat]").forEach((el) => {
          const n = { v: 0 };
          gsap.to(n, {
            v: Number(el.dataset.stat),
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onUpdate: () => void (el.textContent = String(Math.round(n.v))),
          });
        });
        gsap.from("[data-cta]", { y: 30, autoAlpha: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: "[data-cta]", start: "top 85%", once: true } });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative overflow-hidden">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden border-b border-(--ln-line) md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="px-6 py-10 text-center">
            <dd className="v5-display v5-mono text-5xl">
              <span data-stat={s.value}>{s.value}</span>
              {s.suffix && <span className="text-2xl text-(--ln-muted)">{s.suffix}</span>}
            </dd>
            <dt className="mt-2 text-sm text-(--ln-muted)">{s.label}</dt>
          </div>
        ))}
      </dl>

      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 h-[480px] w-[1000px] -translate-x-1/2 translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(34_197_94/0.2),transparent)]" />
      <div data-cta className="relative mx-auto max-w-2xl px-4 py-28 text-center sm:px-6 sm:py-36">
        <h2 className="v5-display text-[clamp(2.25rem,5.5vw,4rem)]">Stop calling around.</h2>
        <p className="mt-4 text-lg text-(--ln-muted)">One search reads every shelf in the city.</p>
        <div className="mt-9 text-left">
          <SearchBox />
        </div>
      </div>
    </section>
  );
}
