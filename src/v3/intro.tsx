"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Mark } from "./ui";

gsap.registerPlugin(useGSAP);

export const V3_INTRO_KEY = "dwa-v3-intro-seen";

// Inlined before the overlay so a repeat visit (or reduced motion) never paints it.
export const v3IntroBoot = `try{if(sessionStorage.getItem("${V3_INTRO_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.v3intro="skip"}catch(e){document.documentElement.dataset.v3intro="skip"}`;

/* Tells the hero it can start its own entrance. */
function done() {
  try {
    sessionStorage.setItem(V3_INTRO_KEY, "1");
  } catch {}
  document.documentElement.dataset.v3introDone = "1";
  window.dispatchEvent(new Event("v3:intro-done"));
}

const BITS = ["var(--pp-tang)", "var(--pp-lemon)", "var(--pp-lilac)", "var(--pp-green)", "var(--pp-white)", "var(--pp-tang)", "var(--pp-lemon)", "var(--pp-lilac)", "var(--pp-green)", "var(--pp-white)"];

/*
 * First visit: a capsule drops onto the counter, wobbles, the logo pops, then
 * the capsule splits and its two halves slide away like curtains, revealing the
 * site while small tablets burst out of the gap. About two seconds, skippable.
 */
export function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      if (document.documentElement.dataset.v3intro === "skip") {
        setGone(true);
        done();
        return;
      }
      document.documentElement.style.overflow = "hidden";
      const finish = () => {
        document.documentElement.style.overflow = "";
        setGone(true);
      };

      const t = gsap.timeline({ onComplete: finish });
      tl.current = t;
      t.from("[data-whole]", { y: () => -window.innerHeight * 0.7, rotate: -160, duration: 0.75, ease: "bounce.out" })
        .to("[data-whole]", { rotate: 0, duration: 0.45, ease: "back.out(3)" }, "-=0.05")
        .from("[data-logo]", { y: 30, scale: 0.8, autoAlpha: 0, duration: 0.4, ease: "back.out(2.5)" }, "-=0.35")
        .to("[data-whole]", { scaleX: 1.06, scaleY: 0.9, duration: 0.12, ease: "power2.out" }, "+=0.15")
        .to("[data-logo]", { y: 20, autoAlpha: 0, duration: 0.2, ease: "power2.in" }, "<")
        .set("[data-whole]", { autoAlpha: 0 })
        .set("[data-half]", { autoAlpha: 1 })
        // The split: halves ride their curtains off screen, tablets fly out of the seam.
        .add(done, "split")
        .to("[data-curtain='l']", { xPercent: -101, duration: 1, ease: "power4.inOut" }, "split")
        .to("[data-curtain='r']", { xPercent: 101, duration: 1, ease: "power4.inOut" }, "split")
        .to("[data-half='l']", { rotate: -25, duration: 0.8, ease: "power2.out" }, "split")
        .to("[data-half='r']", { rotate: 25, duration: 0.8, ease: "power2.out" }, "split")
        .fromTo(
          "[data-bit]",
          { x: 0, y: 0, scale: 0.4, autoAlpha: 1 },
          {
            x: () => gsap.utils.random(-1, 1) * window.innerWidth * 0.45,
            y: () => gsap.utils.random(-1, 1) * window.innerHeight * 0.45,
            rotate: () => gsap.utils.random(-260, 260),
            scale: () => gsap.utils.random(0.8, 1.4),
            duration: 0.9,
            ease: "power3.out",
            immediateRender: false,
          },
          "split",
        )
        .to("[data-bit]", { autoAlpha: 0, duration: 0.3 }, "split+=0.6");

      const skip = (e: KeyboardEvent) => e.key === "Escape" && t.progress(1);
      window.addEventListener("keydown", skip);
      return () => {
        window.removeEventListener("keydown", skip);
        document.documentElement.style.overflow = "";
      };
    },
    { scope: ref },
  );

  if (gone) return null;

  return (
    <div ref={ref} className="v3-intro fixed inset-0 z-100" role="presentation">
      {/* Two curtains, each carrying one half of the capsule at the seam. */}
      <div data-curtain="l" className="absolute inset-y-0 left-0 w-1/2 bg-(--pp-ink)">
        <svg data-half="l" viewBox="0 0 100 84" className="invisible absolute top-1/2 right-0 w-[min(22vw,160px)] -translate-y-1/2 origin-right overflow-visible" aria-hidden="true">
          <path d="M100 4H42a38 38 0 0 0 0 76h58z" fill="var(--pp-tang)" stroke="var(--pp-mint)" strokeWidth="4" />
          <path d="M28 22c6-6 14-8 26-8" stroke="white" strokeOpacity=".7" strokeWidth="7" strokeLinecap="round" fill="none" />
        </svg>
      </div>
      <div data-curtain="r" className="absolute inset-y-0 right-0 w-1/2 bg-(--pp-ink)">
        <svg data-half="r" viewBox="0 0 100 84" className="invisible absolute top-1/2 left-0 w-[min(22vw,160px)] -translate-y-1/2 origin-left overflow-visible" aria-hidden="true">
          <path d="M0 4h58a38 38 0 0 1 0 76H0z" fill="var(--pp-white)" stroke="var(--pp-mint)" strokeWidth="4" />
        </svg>
      </div>

      {/* The whole capsule that drops in, same size and spot as the two halves together. */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg data-whole viewBox="0 0 200 84" className="block w-[min(44vw,320px)] overflow-visible" aria-hidden="true">
          <path d="M100 4H42a38 38 0 0 0 0 76h58z" fill="var(--pp-tang)" stroke="var(--pp-mint)" strokeWidth="4" />
          <path d="M100 4h58a38 38 0 0 1 0 76h-58z" fill="var(--pp-white)" stroke="var(--pp-mint)" strokeWidth="4" />
          <path d="M28 22c6-6 14-8 26-8" stroke="white" strokeOpacity=".7" strokeWidth="7" strokeLinecap="round" fill="none" />
        </svg>
        {BITS.map((c, i) => (
          <span
            key={i}
            data-bit
            className={`invisible absolute top-1/2 left-1/2 -mt-3 -ml-3 border-[3px] border-(--pp-mint) ${i % 3 === 0 ? "h-6 w-11 rounded-full" : "size-6 rounded-full"}`}
            style={{ background: c }}
          />
        ))}
      </div>

      <div data-logo className="absolute inset-x-0 top-[calc(50%+min(13vw,96px))] flex items-center justify-center gap-2.5">
        <Mark className="size-10" />
        <span className="v3-display text-3xl text-(--pp-mint)">dwa</span>
      </div>

      <button
        type="button"
        onClick={() => tl.current?.progress(1)}
        className="absolute right-5 bottom-5 rounded-full border-2 border-(--pp-ink) bg-white px-4 py-1.5 text-sm font-bold"
      >
        Skip
      </button>
    </div>
  );
}
