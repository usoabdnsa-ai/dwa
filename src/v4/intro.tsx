"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CROSS_PATH } from "./ui";

gsap.registerPlugin(useGSAP);

export const V4_INTRO_KEY = "dwa-v4-intro-seen";

// Inlined before the overlay so a repeat visit (or reduced motion) never paints it.
export const v4IntroBoot = `try{if(sessionStorage.getItem("${V4_INTRO_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.v4intro="skip"}catch(e){document.documentElement.dataset.v4intro="skip"}`;

function done() {
  try {
    sessionStorage.setItem(V4_INTRO_KEY, "1");
  } catch {}
  document.documentElement.dataset.v4introDone = "1";
  window.dispatchEvent(new Event("v4:intro-done"));
}

/*
 * First visit: a dark street. The pharmacy cross draws itself as a cold tube,
 * buzzes and flickers to full glow, the "open all night" sign stutters on in
 * magenta, then the camera flies through the cross into the site.
 */
export function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      if (document.documentElement.dataset.v4intro === "skip") {
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

      // A neon flicker: a few uneven on/off beats before it holds.
      const flicker = (target: string, beats: number[]) => {
        const f = gsap.timeline();
        beats.forEach((o, i) => f.to(target, { opacity: o, duration: 0.05 + (i % 3) * 0.03, ease: "steps(1)" }));
        return f;
      };

      t.fromTo("[data-tube]", { strokeDashoffset: 400 }, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" })
        .add(flicker("[data-lit]", [1, 0, 0.8, 0.1, 1, 0.3, 1]), "-=0.1")
        .fromTo("[data-halo]", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, "<0.2")
        .add(flicker("[data-sign]", [1, 0, 1, 0.2, 0, 1]), "-=0.15")
        .to({}, { duration: 0.35 })
        .add(done, "fly")
        .to("[data-cross]", { scale: 9, opacity: 0, duration: 0.8, ease: "power3.in" }, "fly")
        .to("[data-sign]", { y: 60, opacity: 0, duration: 0.35, ease: "power2.in" }, "fly")
        .to(ref.current, { opacity: 0, duration: 0.35, ease: "none" }, "fly+=0.45");

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
    <div ref={ref} className="v4-intro fixed inset-0 z-100 grid place-items-center overflow-hidden bg-(--nn-bg)" role="presentation">
      <div data-halo className="absolute size-[70vmin] rounded-full will-change-transform bg-[radial-gradient(circle,color-mix(in_oklab,var(--nn-neon)_22%,transparent),transparent_65%)] opacity-0" />
      <div className="relative flex flex-col items-center">
        <svg data-cross viewBox="0 0 100 100" className="w-[min(40vmin,260px)] overflow-visible will-change-transform" aria-hidden="true">
          {/* Cold tube: visible while drawing, before the gas lights. */}
          <path data-tube d={CROSS_PATH} fill="none" stroke="var(--nn-line)" strokeWidth="5" strokeLinejoin="round" strokeDasharray="400" />
          <g data-lit className="v4-neon opacity-0">
            <path d={CROSS_PATH} fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
            <path d={CROSS_PATH} fill="none" stroke="white" strokeOpacity=".8" strokeWidth="1.5" strokeLinejoin="round" />
          </g>
        </svg>
        <p data-sign className="v4-display v4-glow-text mt-10 text-2xl tracking-[0.2em] text-(--nn-magenta) uppercase opacity-0 sm:text-3xl">
          Open all night
        </p>
      </div>
      <button
        type="button"
        onClick={() => tl.current?.progress(1)}
        className="absolute right-5 bottom-5 rounded-lg border border-(--nn-line) px-3.5 py-1.5 text-sm text-(--nn-muted) hover:text-(--nn-ink)"
      >
        Skip
      </button>
    </div>
  );
}
