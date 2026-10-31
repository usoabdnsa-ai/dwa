"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SearchBox } from "../search-box";
import { NeonCross } from "../ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Star field from an integer PRNG, rounded, so server and client render identical markup.
const STARS = (() => {
  let seed = 3;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return Array.from({ length: 60 }, (_, i) => ({ x: r2(rand() * 100), y: r2(rand() * 100), s: r2(1 + rand() * 2), d: r2(2 + rand() * 4), layer: i % 3, twinkle: i % 4 === 0 }));
})();

export function Hero({ openAtThree, total }: { openAtThree: number; total: number }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-hero-in]", { autoAlpha: 1 });
        // Picks up where the intro's fly-through leaves off: the cross settles from close up.
        const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
        tl.from("[data-big-cross]", { scale: 2.4, autoAlpha: 0, duration: 1.2, ease: "expo.out" })
          .from("[data-word]", { y: 40, autoAlpha: 0, duration: 0.8, stagger: 0.07 }, 0.2)
          .from("[data-sub]", { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 0.7);

        const html = document.documentElement;
        const start = () => tl.play();
        if (html.dataset.v4intro === "skip" || html.dataset.v4introDone) start();
        else window.addEventListener("v4:intro-done", start, { once: true });

        // Scroll: the cross swells and dims, stars drift at their own depth.
        const st = { trigger: ref.current, start: "top top", end: "bottom top", scrub: true };
        gsap.to("[data-big-cross]", { scale: 1.6, opacity: 0.3, ease: "none", scrollTrigger: st });
        gsap.utils.toArray<HTMLElement>("[data-stars]").forEach((el) => {
          gsap.to(el, { y: -60 * (Number(el.dataset.stars) + 1), ease: "none", scrollTrigger: st });
        });
        gsap.to("[data-copy]", { y: -80, opacity: 0, ease: "none", scrollTrigger: { ...st, start: "30% top" } });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative -mt-16 flex min-h-svh items-center overflow-hidden pt-16">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#0d3a2b_0%,transparent_60%)]" />
      {[0, 1, 2].map((layer) => (
        <div key={layer} data-stars={layer} aria-hidden="true" className="absolute inset-0 will-change-transform">
          {STARS.filter((s) => s.layer === layer).map((s, i) => (
            <span
              key={i}
              data-twinkle={s.twinkle || undefined}
              className="v4-star absolute rounded-full bg-(--nn-ink)"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}px`, height: `${s.s}px`, opacity: 0.3 + layer * 0.2, ["--d" as string]: `${s.d}s` }}
            />
          ))}
        </div>
      ))}

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
        <div data-big-cross data-hero-in className="w-[min(92vw,760px)] will-change-transform">
          <div className="opacity-30">
            <NeonCross className="w-full" />
          </div>
        </div>
      </div>

      <div data-copy className="relative z-10 mx-auto w-full max-w-4xl px-4 py-24 text-center sm:px-6">
        <div aria-hidden="true" className="absolute inset-x-0 inset-y-10 -z-10 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--nn-bg)_80%,transparent)_20%,transparent_70%)]" />
        <h1 className="v4-display text-[clamp(2.4rem,7vw,5.25rem)]">
          <span className="block pb-[0.06em]">
            {["It’s", "3", "a.m."].map((w) => (
              <span key={w} data-word data-hero-in className="mr-[0.25em] inline-block last:mr-0">
                {w}
              </span>
            ))}
          </span>
          <span className="block pb-[0.1em]">
            {["Someone’s", "open."].map((w) => (
              <span key={w} data-word data-hero-in className="v4-glow-text mr-[0.25em] inline-block text-(--nn-neon) last:mr-0">
                {w}
              </span>
            ))}
          </span>
        </h1>
        <p data-sub data-hero-in className="mx-auto mt-6 max-w-xl text-lg text-(--nn-ink)/80">
          {openAtThree} of Alger’s {total} pharmacies on dwa stay open through the night. See which one has your medicine before you get in the car.
        </p>
        <div data-sub data-hero-in className="mx-auto mt-10 max-w-2xl text-left">
          <SearchBox />
        </div>
      </div>
    </section>
  );
}
