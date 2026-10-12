"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { markIntroDone } from "@/lib/intro";
import { INTRO_STORAGE_KEY } from "@/lib/intro-boot";

/*
 * Opening sequence: the green LED cross every Algerian pharmacy hangs over
 * its door switches on, dot by dot, rippling out from the centre, while a
 * ticker "checks" pharmacies across the city and a counter climbs to 100.
 * The sign then flickers like a real neon cross, and five columns lift off
 * centre-out to reveal the page.
 *
 * One progress value p ∈ [0, 1] drives the dots, the ticker and the counter
 * so they can never drift apart.
 */

const GRID = 9;
const ARM = 3; // arm width in cells
const CELL = 24;
const COLUMNS = 5;

type Dot = { x: number; y: number; order: number };

const DOTS: Dot[] = (() => {
  const lo = (GRID - ARM) / 2;
  const hi = lo + ARM - 1;
  const c = (GRID - 1) / 2;
  const cells: { x: number; y: number; d: number }[] = [];
  for (let y = 0; y < GRID; y++)
    for (let x = 0; x < GRID; x++)
      if ((x >= lo && x <= hi) || (y >= lo && y <= hi)) cells.push({ x, y, d: Math.hypot(x - c, y - c) + ((x * 7 + y * 3) % 5) * 0.08 });
  const sorted = [...cells].sort((a, b) => a.d - b.d);
  return cells.map((cell) => ({ x: cell.x, y: cell.y, order: sorted.indexOf(cell) / (cells.length - 1) }));
})();

const TICKER = [
  "Pharmacie Meziane · Alger Centre",
  "Pharmacie des Pins · Hydra",
  "Pharmacie du Centre · El Biar",
  "Pharmacie Garidi · Kouba",
  "Pharmacie Ennour · Bab Ezzouar",
  "Pharmacie La Colonne · Bir Mourad Raïs",
  "Pharmacie Es-Salam · Chéraga",
  "Pharmacie du 1er Mai · Belouizdad",
];

export function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const pctRef = useRef<HTMLSpanElement>(null);
  const tickRef = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (document.documentElement.dataset.intro === "skip") {
      markIntroDone();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGone(true);
      return;
    }

    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
    } catch {
      // Storage blocked: the intro simply plays again next visit.
    }

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const q = gsap.utils.selector(root);
    const progress = { p: 0 };
    let lastLit = -1;

    const render = () => {
      const { p } = progress;
      const lit = Math.floor(p * DOTS.length);
      if (lit !== lastLit) {
        DOTS.forEach((d, i) => dotRefs.current[i]?.classList.toggle("is-lit", d.order <= p));
        lastLit = lit;
      }
      if (pctRef.current) pctRef.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
      if (tickRef.current) tickRef.current.textContent = TICKER[Math.min(TICKER.length - 1, Math.floor(p * TICKER.length))];
    };
    render();

    // A context lets cleanup revert every tween, so React's dev double-effect
    // doesn't leave from() targets stuck at their start values.
    let tl!: gsap.core.Timeline;
    const ctx = gsap.context(() => {
      tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          html.style.overflow = prevOverflow;
          setGone(true);
        },
      });

      tl.from(q(".intro-fade"), { autoAlpha: 0, y: 10, duration: 0.35, stagger: 0.05 })
        .to(progress, { p: 1, duration: 1.1, ease: "power1.inOut", onUpdate: render }, "<0.1")
        // The neon flicker: two quick dips, then full glow.
        .to(q(".intro-sign"), { opacity: 0.35, duration: 0.05, ease: "none" }, "+=0.05")
        .to(q(".intro-sign"), { opacity: 1, duration: 0.05, ease: "none" })
        .to(q(".intro-sign"), { opacity: 0.55, duration: 0.04, ease: "none" }, "+=0.06")
        .to(q(".intro-sign"), { opacity: 1, duration: 0.08, ease: "none" })
        .to(q(".intro-content"), { autoAlpha: 0, y: -20, duration: 0.25, ease: "power2.in" }, "+=0.15")
        .to(
          q(".intro-col"),
          { yPercent: -100, duration: 0.7, ease: "expo.inOut", stagger: { each: 0.05, from: "center" } },
          "-=0.1",
        )
        // Hero starts while the columns are still lifting so the motions overlap.
        .add(markIntroDone, "-=0.45");
    }, root);

    // Impatient? Any click or key fast-forwards the rest.
    const skip = () => tl.timeScale(4);
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });

    return () => {
      ctx.revert();
      html.style.overflow = prevOverflow;
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      markIntroDone();
    };
  }, []);

  if (gone) return null;

  const size = GRID * CELL;

  return (
    <div ref={rootRef} className="intro-overlay fixed inset-0 z-[100] text-[#e6efe9]" aria-hidden="true">
      <div className="absolute inset-0 flex">
        {Array.from({ length: COLUMNS }, (_, i) => (
          // Columns overlap by 1px so no seam shows mid-lift.
          <div key={i} className="intro-col -mx-px h-full flex-1 bg-night" />
        ))}
      </div>

      <div className="intro-content relative flex h-full flex-col justify-between p-6 sm:p-10">
        <div className="intro-fade flex items-center justify-between font-mono text-xs tracking-[0.18em] text-night-muted uppercase">
          <span>dwa</span>
          <span>Alger · 24h/24</span>
        </div>

        <div className="flex flex-col items-center gap-8">
          <svg viewBox={`0 0 ${size} ${size}`} className="intro-sign w-[min(52vw,240px)]">
            {DOTS.map((d, i) => (
              <circle
                key={i}
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                className="intro-dot"
                cx={d.x * CELL + CELL / 2}
                cy={d.y * CELL + CELL / 2}
                r={CELL * 0.36}
              />
            ))}
          </svg>
          <p className="intro-fade flex items-center gap-2 font-mono text-xs text-night-muted sm:text-sm">
            <span className="size-1.5 rounded-full bg-neon" />
            checking <span ref={tickRef} className="min-w-[30ch] text-[#e6efe9]" />
          </p>
        </div>

        <div className="intro-fade flex items-end justify-between gap-6">
          <span className="max-w-[20ch] text-sm text-night-muted">
            Eight pharmacies. One search. No more walking door to door.
          </span>
          <span className="font-mono text-6xl leading-none font-medium nums sm:text-8xl">
            <span ref={pctRef}>000</span>
            <span className="text-neon">%</span>
          </span>
        </div>
      </div>
    </div>
  );
}
