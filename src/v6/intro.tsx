"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export const V6_INTRO_KEY = "dwa-v6-intro-seen";

// Inlined before the overlay so a repeat visit (or reduced motion) never paints it.
export const v6IntroBoot = `try{if(sessionStorage.getItem("${V6_INTRO_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.v6intro="skip"}catch(e){document.documentElement.dataset.v6intro="skip"}`;

function done() {
  try {
    sessionStorage.setItem(V6_INTRO_KEY, "1");
  } catch {}
  document.documentElement.dataset.v6introDone = "1";
  window.dispatchEvent(new Event("v6:intro-done"));
}

/*
 * First visit, about 2.4 s, on evergreen: the cross builds bar by bar, the
 * terracotta dot lands with a pulse, the wordmark rises while the pharmacies
 * are counted, then the panel lifts off the page on a curved edge and the
 * hero starts underneath.
 */
export function Intro({ pharmacies }: { pharmacies: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      if (document.documentElement.dataset.v6intro === "skip") {
        setGone(true);
        done();
        return;
      }
      document.documentElement.style.overflow = "hidden";
      const count = ref.current!.querySelector<HTMLElement>("[data-count]")!;
      const n = { v: 0 };

      const t = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: () => {
          document.documentElement.style.overflow = "";
          setGone(true);
        },
      });
      tl.current = t;

      t.from("[data-tile]", {
        scale: 0.6,
        autoAlpha: 0,
        duration: 0.6,
        ease: "back.out(1.8)",
      })
        .from("[data-bar='v']", { scaleY: 0, duration: 0.5 }, 0.2)
        .from("[data-bar='h']", { scaleX: 0, duration: 0.5 }, 0.38)
        .from(
          "[data-dot]",
          { scale: 0, duration: 0.5, ease: "back.out(3)" },
          0.62,
        )
        .fromTo(
          "[data-ring]",
          { scale: 0.4, autoAlpha: 0.7 },
          { scale: 2.6, autoAlpha: 0, duration: 0.9, ease: "power2.out" },
          0.7,
        )
        .from(
          "[data-letter]",
          { yPercent: 110, duration: 0.7, stagger: 0.06 },
          0.7,
        )
        .from(
          "[data-sub]",
          { y: 10, autoAlpha: 0, duration: 0.5, ease: "power3.out" },
          0.95,
        )
        .fromTo(
          "[data-progress]",
          { scaleX: 0 },
          { scaleX: 1, duration: 0.9, ease: "power2.inOut" },
          0.95,
        )
        .to(
          n,
          {
            v: pharmacies,
            duration: 0.9,
            ease: "power2.inOut",
            onUpdate: () => void (count.textContent = String(Math.round(n.v))),
          },
          0.95,
        )
        .addLabel("out", 2.0)
        .add(done, "out")
        .to(
          "[data-lockup]",
          { y: -80, autoAlpha: 0, duration: 0.6, ease: "power3.in" },
          "out",
        )
        .to(
          "[data-panel]",
          { yPercent: -100, duration: 0.9, ease: "expo.inOut" },
          "out+=0.1",
        );

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
    <div
      ref={ref}
      className="v6-intro pointer-events-none fixed inset-0 z-100"
      role="presentation"
    >
      {/* Taller than the screen with a rounded foot, so the lift reads as a curve. */}
      <div
        data-panel
        className="pointer-events-auto absolute inset-x-0 top-0 h-[calc(100dvh+14vh)] rounded-b-[50%_14vh] bg-(--e-dark) will-change-transform"
      >
        <div className="grid h-dvh place-items-center">
          <div data-lockup className="flex flex-col items-center">
            <div className="relative">
              <span
                data-ring
                aria-hidden
                className="absolute inset-0 m-auto size-6 rounded-full bg-(--e-coral)"
              />
              <svg
                viewBox="0 0 32 32"
                className="relative size-24"
                aria-hidden="true"
              >
                <rect
                  data-tile
                  width="32"
                  height="32"
                  rx="10"
                  fill="var(--e-green)"
                  style={{ transformOrigin: "16px 16px" }}
                />
                <rect
                  data-bar="v"
                  x="12.2"
                  y="6.5"
                  width="7.6"
                  height="19"
                  rx="1.4"
                  fill="var(--e-sage)"
                  style={{ transformOrigin: "16px 16px" }}
                />
                <rect
                  data-bar="h"
                  x="6.5"
                  y="12.2"
                  width="19"
                  height="7.6"
                  rx="1.4"
                  fill="var(--e-sage)"
                  style={{ transformOrigin: "16px 16px" }}
                />
                <circle
                  data-dot
                  cx="16"
                  cy="16"
                  r="2.6"
                  fill="var(--e-coral)"
                  style={{ transformOrigin: "16px 16px" }}
                />
              </svg>
            </div>
            <p className="v6-serif mt-6 flex overflow-hidden pb-[0.1em] text-6xl text-white">
              {"dwa".split("").map((c, i) => (
                <span key={i} data-letter className="inline-block">
                  {c}
                </span>
              ))}
            </p>
            <div data-sub className="mt-5 w-56 text-center">
              <p className="v6-nums text-sm text-(--e-sage-2)">
                <span data-count>{pharmacies}</span> / {pharmacies} pharmacies counted
              </p>
              <span className="mt-3 block h-0.5 overflow-hidden rounded-full bg-white/10">
                <span
                  data-progress
                  className="block h-full origin-left rounded-full bg-(--e-peach)"
                />
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => tl.current?.progress(1)}
          className="absolute end-5 top-[calc(100dvh-3.5rem)] rounded-full px-4 py-1.5 text-xs text-(--e-sage-2) ring-1 ring-white/15 hover:text-white"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
