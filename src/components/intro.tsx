"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { markIntroDone } from "@/lib/intro";
import { INTRO_STORAGE_KEY } from "@/lib/intro-boot";

/*
 * Opening sequence: on a pharmacy-green screen a capsule drops in and spins
 * level, little crosses burst out around it, and the wordmark rises letter by
 * letter. Then the capsule pulls apart and the screen splits down the middle
 * with it, the two halves sliding away to reveal the page.
 */

const BURST = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
  const r = i % 2 ? 150 : 190;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.75, s: i % 3 === 0 ? 1 : 0.7 };
});

const WORD = ["d", "w", "a"];

export function Intro() {
  const rootRef = useRef<HTMLDivElement>(null);
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

      tl.from(q(".intro-cap"), { y: -120, rotate: -140, scale: 0.4, autoAlpha: 0, duration: 0.85, ease: "back.out(1.5)" })
        .fromTo(
          q(".intro-burst"),
          { x: 0, y: 0, scale: 0, autoAlpha: 0 },
          { x: (i) => BURST[i].x, y: (i) => BURST[i].y, scale: (i) => BURST[i].s, autoAlpha: 1, duration: 0.7, ease: "expo.out", stagger: 0.02 },
          "-=0.35",
        )
        .from(q(".intro-letter"), { yPercent: 110, duration: 0.55, stagger: 0.07 }, "-=0.55")
        .from(q(".intro-fade"), { autoAlpha: 0, y: 10, duration: 0.4 }, "-=0.3")
        .to(q(".intro-burst"), { rotate: 90, autoAlpha: 0.35, duration: 0.6, ease: "sine.inOut" }, "-=0.1")
        // The capsule opens: halves pull apart, a pinch of powder spills out.
        .to(q(".intro-cap-l"), { x: -26, rotate: -8, duration: 0.45, ease: "power2.inOut" }, "+=0.1")
        .to(q(".intro-cap-r"), { x: 26, rotate: 8, duration: 0.45, ease: "power2.inOut" }, "<")
        .from(q(".intro-dust"), { scale: 0, autoAlpha: 0, y: -6, duration: 0.35, stagger: 0.03, transformOrigin: "50% 50%" }, "<0.15")
        .to(q(".intro-content"), { autoAlpha: 0, scale: 1.06, duration: 0.35, ease: "power2.in" }, "+=0.05")
        .to(q(".intro-half-l"), { xPercent: -100, duration: 0.85, ease: "expo.inOut" }, "-=0.2")
        .to(q(".intro-half-r"), { xPercent: 100, duration: 0.85, ease: "expo.inOut" }, "<")
        // Hero starts while the halves are still sliding so the motions overlap.
        .add(markIntroDone, "-=0.5");
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

  return (
    <div ref={rootRef} className="intro-overlay fixed inset-0 z-[100] overflow-hidden text-white" aria-hidden="true">
      <div className="intro-half-l cross-pattern absolute inset-y-0 left-0 w-[calc(50%+1px)] bg-green" />
      <div className="intro-half-r cross-pattern absolute inset-y-0 right-0 w-1/2 bg-green" />

      <div className="intro-content relative flex h-full flex-col items-center justify-center gap-10 p-6">
        <div className="relative grid place-items-center">
          {BURST.map((_, i) => (
            <svg key={i} viewBox="0 0 20 20" className={`intro-burst absolute size-5 ${i % 2 ? "text-neon" : "text-white"}`}>
              <path d="M8 2h4v6h6v4h-6v6H8v-6H2V8h6Z" fill="currentColor" />
            </svg>
          ))}

          <svg viewBox="0 0 200 80" className="intro-cap relative w-48 overflow-visible drop-shadow-[0_18px_30px_rgba(0,40,30,0.35)] sm:w-56">
            <g className="intro-cap-l">
              <path d="M100 8H40a32 32 0 0 0 0 64h60Z" fill="#fff" />
              <rect x="26" y="20" width="34" height="8" rx="4" fill="var(--color-green-soft)" />
            </g>
            <g className="intro-cap-r">
              <path d="M100 8h60a32 32 0 0 1 0 64h-60Z" fill="var(--color-neon)" />
              <rect x="112" y="20" width="40" height="8" rx="4" fill="#fff" opacity="0.55" />
            </g>
            {[
              [94, 44, 3],
              [104, 52, 2.5],
              [99, 60, 2],
              [108, 38, 2],
              [92, 56, 1.8],
            ].map(([cx, cy, r], i) => (
              <circle key={i} className="intro-dust" cx={cx} cy={cy} r={r} fill="#fff" />
            ))}
          </svg>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex overflow-hidden font-display text-6xl leading-none font-extrabold tracking-tight sm:text-7xl">
            {WORD.map((l, i) => (
              <span key={i} className="intro-letter inline-block">
                {l}
              </span>
            ))}
          </span>
          <span className="intro-fade text-sm font-medium text-green-soft sm:text-base">
            Your medicine, in stock, near you
          </span>
        </div>
      </div>
    </div>
  );
}
