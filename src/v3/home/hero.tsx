"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SearchBox } from "../search-box";
import { Pill, type PillKind } from "../ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Piece = { kind: PillKind; a: string; b?: string; left: string; top: string; w: string; rot: number; depth: number };

/* The pill cluster. depth drives pointer parallax: higher moves more. */
const PIECES: Piece[] = [
  { kind: "capsule", a: "var(--pp-tang)", b: "var(--pp-white)", left: "4%", top: "6%", w: "46%", rot: -22, depth: 1.4 },
  { kind: "tablet", a: "var(--pp-lemon)", left: "64%", top: "0%", w: "23%", rot: 0, depth: 0.7 },
  { kind: "cross", a: "var(--pp-green)", left: "34%", top: "30%", w: "36%", rot: 8, depth: 1 },
  { kind: "capsule", a: "var(--pp-lilac)", b: "var(--pp-white)", left: "52%", top: "66%", w: "42%", rot: 28, depth: 1.8 },
  { kind: "softgel", a: "var(--pp-tang)", left: "2%", top: "56%", w: "22%", rot: -10, depth: 0.6 },
  { kind: "tablet", a: "var(--pp-white)", left: "80%", top: "38%", w: "16%", rot: 0, depth: 1.2 },
  { kind: "capsule", a: "var(--pp-green)", b: "var(--pp-lemon)", left: "10%", top: "82%", w: "30%", rot: 12, depth: 0.9 },
];

const LINES = ["Find it.", "On the shelf.", "Near you."];

export function Hero({ count }: { count: number }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = ref.current!;
        gsap.set("[data-hero-in]", { autoAlpha: 1 });

        // Entrance: headline lines rise out of their masks, then the search, then the pills rain in.
        const tl = gsap.timeline({ defaults: { ease: "power4.out" }, paused: true });
        tl.from("[data-line]", { yPercent: 110, rotate: 4, duration: 0.9, stagger: 0.1 })
          .from("[data-sub]", { y: 24, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, "-=0.5")
          .from(
            "[data-drop]",
            {
              y: () => -gsap.utils.random(260, 520),
              rotate: () => gsap.utils.random(-120, 120),
              autoAlpha: 0,
              duration: 1.1,
              ease: "bounce.out",
              stagger: { each: 0.07, from: "random" },
            },
            0.15,
          )
          .from("[data-chip]", { scale: 0.6, autoAlpha: 0, duration: 0.5, ease: "back.out(2.5)" }, "-=0.35");

        // Wait for the first-visit intro to open before the hero plays.
        const start = () => tl.play();
        const html = document.documentElement;
        if (html.dataset.v3intro === "skip" || html.dataset.v3introDone) start();
        else window.addEventListener("v3:intro-done", start, { once: true });

        // Idle: every pill bobs on its own rhythm so the cluster never freezes.
        root.querySelectorAll<HTMLElement>("[data-bob]").forEach((el) => {
          gsap.to(el, {
            y: gsap.utils.random(-14, 14),
            rotate: gsap.utils.random(-7, 7),
            duration: gsap.utils.random(2.4, 3.8),
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 1.2,
          });
        });

        // Scroll: the cluster lifts away faster than the text.
        gsap.to("[data-cluster]", { yPercent: -18, ease: "none", scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true } });
      });

      // Pointer: pills lean toward the cursor, deeper ones further. Fine pointers only.
      mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]").map((el) => ({
          d: Number(el.dataset.depth),
          x: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3.out" }),
          y: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3.out" }),
        }));
        const move = contextSafe!((e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          layers.forEach((l) => {
            l.x(nx * 40 * l.d);
            l.y(ny * 30 * l.d);
          });
        });
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative overflow-x-clip">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pt-6 pb-20 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-10 lg:pb-28">
        <div className="relative z-10">
          <h1 className="v3-display text-[clamp(2.6rem,7.2vw,5.6rem)]">
            {LINES.map((l, i) => (
              <span key={l} className="block overflow-hidden pb-[0.08em]">
                <span data-line data-hero-in className={`block ${i === 1 ? "text-(--pp-green)" : ""}`}>
                  {i === 1 ? (
                    <>
                      On the <span className="relative inline-block">shelf.<span className="absolute inset-x-0 bottom-[0.06em] -z-10 h-[0.32em] -rotate-1 rounded-full bg-(--pp-lemon)" /></span>
                    </>
                  ) : (
                    l
                  )}
                </span>
              </span>
            ))}
          </h1>
          <p data-sub data-hero-in className="mt-6 max-w-lg text-lg font-medium text-(--pp-muted) sm:text-xl">
            {count} pharmacies in Alger post their own stock, so you know who has your Doliprane, Ventoline or insulin before you leave home.
          </p>
          <div data-sub data-hero-in className="mt-8 max-w-xl">
            <SearchBox />
          </div>
        </div>

        <div data-cluster className="relative mx-auto aspect-square w-full max-w-[560px]" aria-hidden="true">
          {PIECES.map((p, i) => (
            <div key={i} data-depth={p.depth} className="absolute" style={{ left: p.left, top: p.top, width: p.w }}>
              <div data-drop data-hero-in>
                <div data-bob>
                  <div style={{ transform: `rotate(${p.rot}deg)` }}>
                    <Pill kind={p.kind} a={p.a} b={p.b} className="block h-auto w-full drop-shadow-[0_10px_0_rgb(6_55_42/0.18)]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* One real annotation on the visual: today's hardest find. */}
          <div data-chip data-hero-in data-depth="2.2" className="v3-sticker absolute top-[50%] left-[58%] rounded-2xl bg-white px-4 py-3 text-sm shadow-[0_4px_0_0_var(--pp-ink)]">
            <p className="font-bold">Ventoline 100 µg</p>
            <p className="text-(--pp-muted)">3 left · Kouba</p>
          </div>
        </div>
      </div>
    </section>
  );
}
