"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export const V5_INTRO_KEY = "dwa-v5-intro-seen";

// Inlined before the overlay so a repeat visit (or reduced motion) never paints it.
export const v5IntroBoot = `try{if(sessionStorage.getItem("${V5_INTRO_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.v5intro="skip"}catch(e){document.documentElement.dataset.v5intro="skip"}`;

function done() {
  try {
    sessionStorage.setItem(V5_INTRO_KEY, "1");
  } catch {}
  document.documentElement.dataset.v5introDone = "1";
  window.dispatchEvent(new Event("v5:intro-done"));
}

const PLUS = "M13 7h6v6h6v6h-6v6h-6v-6H7v-6h6z";

/*
 * First visit, about 1.4 s: on black, the plus traces itself in a thin green
 * line, fills, the wordmark resolves beside it, then the screen fades away
 * as the page scales up into place.
 */
export function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      if (document.documentElement.dataset.v5intro === "skip") {
        setGone(true);
        done();
        return;
      }
      document.documentElement.style.overflow = "hidden";
      const t = gsap.timeline({
        onComplete: () => {
          document.documentElement.style.overflow = "";
          setGone(true);
        },
      });
      tl.current = t;

      t.fromTo("[data-trace]", { strokeDashoffset: 96 }, { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" })
        .fromTo("[data-fill]", { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.out" }, "-=0.05")
        .from("[data-tile]", { scale: 0.7, opacity: 0, duration: 0.4, ease: "back.out(2)", svgOrigin: "16 16" }, "<")
        .from("[data-letter]", { y: 10, opacity: 0, duration: 0.3, ease: "power3.out", stagger: 0.05 }, "-=0.2")
        .to({}, { duration: 0.15 })
        .add(done, "out")
        .to(ref.current, { opacity: 0, duration: 0.45, ease: "power2.out" }, "out")
        .to("[data-lockup]", { scale: 1.08, duration: 0.45, ease: "power2.out" }, "out");

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
    <div ref={ref} className="v5-intro fixed inset-0 z-100 grid place-items-center bg-(--ln-bg)" role="presentation">
      <div data-lockup className="flex items-center gap-4">
        <svg viewBox="0 0 32 32" className="size-14" aria-hidden="true">
          <rect data-tile x="0.5" y="0.5" width="31" height="31" rx="8" fill="#18181b" stroke="rgb(255 255 255 / 0.14)" />
          <path data-fill d={PLUS} fill="#4ade80" opacity="0" />
          <path data-trace d={PLUS} fill="none" stroke="#4ade80" strokeWidth="1" strokeLinejoin="round" strokeDasharray="96" />
        </svg>
        <span className="flex text-4xl font-semibold tracking-tight">
          {"dwa".split("").map((c, i) => (
            <span key={i} data-letter>
              {c}
            </span>
          ))}
        </span>
      </div>
      <button
        type="button"
        onClick={() => tl.current?.progress(1)}
        className="absolute right-5 bottom-5 rounded-md border border-(--ln-line-2) px-3 py-1 text-xs text-(--ln-muted) hover:text-(--ln-ink)"
      >
        Skip
      </button>
    </div>
  );
}
