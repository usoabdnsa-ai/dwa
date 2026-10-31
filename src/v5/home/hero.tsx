"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, RotateCcw, Search } from "lucide-react";
import type { Status } from "@/lib/finder";
import { CityPlan, type PlanPoint } from "../city-plan";
import { SearchBox } from "../search-box";
import { StatusPill } from "../ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type DemoRow = { id: string; name: string; commune: string; km: string; status: Status; qty: number };

const TRY = ["Doliprane", "Ventoline", "Lantus", "Augmentin"];

/*
 * Centered hero over the product itself: a window running a real Ventoline
 * search. It starts tilted back and flattens as you scroll; once it is in view
 * the answers come back shelf by shelf.
 */
export function Hero({ count, rows, plan }: { count: number; rows: DemoRow[]; plan: PlanPoint[] }) {
  const ref = useRef<HTMLElement>(null);
  const demo = useRef<gsap.core.Timeline | null>(null);
  const yes = rows.find((r) => r.status !== "out");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-hero-in]", { autoAlpha: 1 });

        // The demo inside the window.
        const d = gsap.timeline({ paused: true });
        d.set("[data-answer]", { autoAlpha: 0 })
          .set("[data-pending]", { autoAlpha: 1 })
          .set("[data-row]", { opacity: 1 })
          .set("[data-summary]", { autoAlpha: 0 })
          .from("[data-row]", { y: 10, autoAlpha: 0, duration: 0.3, ease: "power2.out", stagger: 0.04 });
        rows.forEach((_, i) => {
          d.to(`[data-row-i='${i}'] [data-pending]`, { autoAlpha: 0, duration: 0.1 }, 0.5 + i * 0.14).to(`[data-row-i='${i}'] [data-answer]`, { autoAlpha: 1, duration: 0.18 }, "<");
        });
        d.to("[data-row]:not([data-row-yes])", { opacity: 0.4, duration: 0.3 }, "+=0.1").to("[data-summary]", { autoAlpha: 1, duration: 0.3 }, "<");
        demo.current = d;

        const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
        tl.from("[data-badge]", { y: 12, autoAlpha: 0, duration: 0.5 })
          .from("[data-line]", { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.08)
          .from("[data-sub]", { y: 16, autoAlpha: 0, duration: 0.5, stagger: 0.07 }, 0.3)
          .from("[data-window]", { y: 80, autoAlpha: 0, duration: 1, ease: "expo.out" }, 0.45);

        const html = document.documentElement;
        const start = () => tl.play();
        if (html.dataset.v5intro === "skip" || html.dataset.v5introDone) start();
        else window.addEventListener("v5:intro-done", start, { once: true });

        // The window lies back like a screen on a desk, then stands up as you scroll.
        gsap.fromTo(
          "[data-tilt]",
          { rotateX: 24, scale: 0.94 },
          { rotateX: 0, scale: 1, ease: "none", scrollTrigger: { trigger: "[data-window]", start: "top 95%", end: "top 25%", scrub: true } },
        );
        ScrollTrigger.create({ trigger: "[data-window]", start: "top 70%", once: true, onEnter: () => void d.play(0) });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative overflow-x-clip">
      <div aria-hidden="true" className="v5-grid pointer-events-none absolute inset-x-0 top-0 h-[900px]" />
      <div aria-hidden="true" className="pointer-events-none absolute top-[420px] left-1/2 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(34_197_94/0.18),transparent)]" />

      <div className="relative mx-auto max-w-6xl px-4 pt-20 text-center sm:px-6 sm:pt-28">
        <Link
          href="/v5/search?garde=1"
          data-badge
          data-hero-in
          className="inline-flex items-center gap-2 rounded-full border border-(--ln-line-2) bg-white/[0.03] py-1 pr-3 pl-2.5 text-xs text-(--ln-soft) hover:border-(--ln-green)/40"
        >
          <span className="relative flex size-2">
            <span className="v5-live absolute inset-0 rounded-full bg-(--ln-green)" />
            <span className="relative size-2 rounded-full bg-(--ln-green)" />
          </span>
          Live in Alger · {count} pharmacies posting stock
          <ArrowRight className="size-3 text-(--ln-muted)" aria-hidden="true" />
        </Link>

        <h1 className="v5-display mx-auto mt-7 max-w-4xl text-[clamp(2.4rem,7.5vw,5.75rem)]">
          <span data-line data-hero-in className="block">
            Medicine in stock.
          </span>
          <span data-line data-hero-in className="block text-(--ln-muted)">
            Right now, near you.
          </span>
        </h1>
        <p data-sub data-hero-in className="mx-auto mt-6 max-w-xl text-lg text-(--ln-muted)">
          See which pharmacy has it, how many boxes are left and whether the door is open, before you leave home.
        </p>
        <div data-sub data-hero-in className="mx-auto mt-9 max-w-xl text-left">
          <SearchBox hotkey />
        </div>
        <p data-sub data-hero-in className="mt-4 flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-sm text-(--ln-muted)">
          Try
          {TRY.map((t) => (
            <Link key={t} href={`/v5/search?q=${t}`} className="rounded-md px-2 py-0.5 text-(--ln-soft) hover:bg-white/[0.06] hover:text-(--ln-ink)">
              {t}
            </Link>
          ))}
        </p>
      </div>

      {/* The product window. */}
      <div data-window data-hero-in className="relative mx-auto mt-16 max-w-6xl px-4 pb-24 [perspective:1600px] sm:px-6 sm:pb-32">
        <div data-tilt className="origin-top overflow-hidden rounded-2xl border border-(--ln-line-2) bg-(--ln-surface) shadow-[0_40px_120px_-40px_rgb(0_0_0/0.9),0_0_0_1px_rgb(0_0_0/0.5)] will-change-transform">
          <div className="flex items-center gap-3 border-b border-(--ln-line) px-4 py-3 text-sm">
            <Search className="size-4 text-(--ln-muted)" aria-hidden="true" />
            <span className="font-medium">Ventoline 100 µg</span>
            <span className="hidden text-(--ln-muted) sm:inline">Salbutamol · Inhaler</span>
            <span data-summary className="ml-auto rounded-md bg-(--ln-green)/10 px-2 py-0.5 text-xs font-medium text-(--ln-green)">
              1 of {rows.length} in stock
            </span>
          </div>
          <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <ol className="border-(--ln-line) p-2 md:border-r">
              {rows.map((r, i) => {
                const isYes = r.status !== "out";
                return (
                  <li
                    key={r.id}
                    data-row
                    data-row-i={i}
                    data-row-yes={isYes || undefined}
                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 ${isYes ? "bg-(--ln-green)/[0.07] ring-1 ring-(--ln-green)/25 ring-inset" : ""}`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{r.name}</span>
                      <span className="v5-mono block text-xs text-(--ln-muted)">
                        {r.commune} · {r.km}
                      </span>
                    </span>
                    <span className="grid shrink-0 justify-items-end">
                      <span data-pending className="v5-mono invisible col-start-1 row-start-1 self-center text-xs text-(--ln-muted)" aria-hidden="true">
                        checking…
                      </span>
                      <span data-answer className="col-start-1 row-start-1 flex items-center gap-2">
                        {isYes && <span className="v5-mono text-xs text-(--ln-green)">{r.qty} left</span>}
                        <StatusPill status={r.status} />
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className="relative hidden md:block">
              <CityPlan points={plan} />
              {yes && (
                <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between gap-3 rounded-xl border border-(--ln-line-2) bg-(--ln-surface-2)/95 px-4 py-3 text-sm">
                  <span>
                    <span className="font-medium">{yes.name}</span>
                    <span className="text-(--ln-muted)"> · {yes.commune} · {yes.km}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => demo.current?.play(0)}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-(--ln-muted) hover:bg-white/[0.06] hover:text-(--ln-ink)"
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" /> Replay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
