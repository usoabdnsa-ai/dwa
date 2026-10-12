"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
 * The problem, shown instead of told: the route you walk without dwa.
 * The path draws itself as you scroll; each stop answers as the line reaches it.
 */

const STOPS = [
  { x: 60, y: 150, name: "Meziane", answer: "Don't have it", ok: false, mins: "0 min" },
  { x: 270, y: 70, name: "Du 1er Mai", answer: "Out since Sunday", ok: false, mins: "11 min" },
  { x: 480, y: 190, name: "La Colonne", answer: "Come back Thursday", ok: false, mins: "24 min" },
  { x: 700, y: 90, name: "Des Pins", answer: "Try Kouba?", ok: false, mins: "33 min" },
  { x: 920, y: 160, name: "Garidi, Kouba", answer: "Yes, 3 left", ok: true, mins: "47 min" },
];

const PATH = STOPS.reduce((d, s, i) => {
  if (i === 0) return `M${s.x},${s.y}`;
  const p = STOPS[i - 1];
  const mx = (p.x + s.x) / 2;
  return `${d} C${mx},${p.y} ${mx},${s.y} ${s.x},${s.y}`;
}, "");

export function DoorToDoor() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = ref.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const path = root.querySelector<SVGPathElement>(".route")!;
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.querySelector(".route-svg"), start: "top 75%", end: "bottom 45%", scrub: 0.6 },
        });
        tl.to(path, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0);
        STOPS.forEach((_, i) => {
          tl.from(root.querySelectorAll(`.stop-${i}`), { autoAlpha: 0, y: 8, duration: 0.08, ease: "power2.out" }, i / (STOPS.length - 1) - 0.04);
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="border-t border-line bg-paper-2/60">
      <div className="mx-auto max-w-6xl px-4 py-28 sm:px-6 sm:py-36">
        <h2 className="max-w-[20ch] font-display text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl">
          One inhaler. Five pharmacies. Forty-seven minutes.
        </h2>
        <p className="mt-4 max-w-[52ch] text-muted">
          Walk in, ask, get sent to the next one. Repeat until somebody says yes.
        </p>

        <div className="route-svg mt-14 overflow-x-auto pb-2">
          <svg viewBox="0 0 980 270" className="min-w-[680px]" role="img" aria-label="A walking route through five pharmacies; only the last one has the inhaler">
            <path d={PATH} fill="none" stroke="var(--color-line)" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" />
            <path className="route" d={PATH} fill="none" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" />
            {STOPS.map((s, i) => (
              <g key={s.name}>
                <circle cx={s.x} cy={s.y} r={s.ok ? 11 : 8} fill={s.ok ? "var(--color-green)" : "var(--color-surface)"} stroke={s.ok ? "none" : "var(--color-ink)"} strokeWidth="2" />
                {!s.ok && (
                  <path className={`stop-${i}`} d={`M${s.x - 3.5},${s.y - 3.5}l7,7m0,-7l-7,7`} stroke="var(--color-danger)" strokeWidth="2" strokeLinecap="round" />
                )}
                <g className={`stop-${i}`}>
                  <text x={s.x} y={s.y + 34} textAnchor="middle" className="fill-ink text-[15px] font-semibold">
                    {s.name}
                  </text>
                  <text x={s.x} y={s.y + 54} textAnchor="middle" className={`text-[14px] ${s.ok ? "fill-green font-medium" : "fill-muted"}`}>
                    “{s.answer}”
                  </text>
                  <text x={s.x} y={s.y - 20} textAnchor="middle" className="fill-muted font-mono text-[12px]">
                    {s.mins}
                  </text>
                </g>
              </g>
            ))}
          </svg>
        </div>

        <p className="mt-10 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          With dwa you’d have gone straight to Kouba.
        </p>
      </div>
    </section>
  );
}
