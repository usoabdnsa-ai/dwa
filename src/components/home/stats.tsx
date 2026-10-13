"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { medicines, pharmacies } from "@/lib/data";

/** Key numbers that count up once when the strip scrolls into view, over a row of medicine names. */
const STATS = [
  { value: pharmacies.length, suffix: "", label: "Pharmacies reporting stock" },
  { value: medicines.length, suffix: "", label: "Medicines tracked" },
  { value: 4, suffix: " s", label: "Average search time" },
  { value: 24, suffix: "/7", label: "Night-duty rota included" },
];

export function Stats() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = ref.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
          const target = Number(el.dataset.count);
          const n = { v: 0 };
          gsap.to(n, {
            v: target,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: { trigger: root, start: "top 85%", once: true },
            onUpdate: () => {
              el.textContent = String(Math.round(n.v));
            },
          });
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  const names = medicines.map((m) => `${m.name} ${m.dosage}`);

  return (
    <section ref={ref} className="border-y border-line bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-4 py-14 sm:px-6 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <div key={s.label} className={`px-2 text-center lg:px-6 ${i > 0 ? "lg:border-l lg:border-line" : ""}`}>
            <p className="font-display text-4xl font-extrabold tracking-tight text-green sm:text-5xl">
              <span data-count={s.value} className="font-mono">
                {s.value}
              </span>
              <span className="text-3xl sm:text-4xl">{s.suffix}</span>
            </p>
            <p className="mt-2 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="marquee relative overflow-hidden border-t border-line py-4 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]" aria-hidden>
        <div className="marquee-track flex w-max gap-3">
          {[...names, ...names].map((n, i) => (
            <span key={i} className="flex items-center gap-2 rounded-full bg-paper px-4 py-1.5 text-sm whitespace-nowrap text-muted ring-1 ring-line">
              <span className="size-1.5 rounded-full bg-green" />
              {n}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
