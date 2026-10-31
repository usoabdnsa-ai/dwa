"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Availability } from "@/lib/finder";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/*
 * Pinned beat: one huge capsule splits open and every pharmacy's answer for
 * Ventoline spills out around it. Seven say no, one says yes. The markup is the
 * end state, so reduced motion simply shows the answer.
 */
const STEPS = ["Out of Ventoline again?", "We ask all of them at once.", "7 said no. One said yes."];

export function Story({ rows }: { rows: Pick<Availability, "status" | "km" | "pharmacy" | "item">[] }) {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  // Final chip positions on an ellipse around the capsule, the yes card on top.
  const yes = rows.findIndex((r) => r.status !== "out");
  const order = [yes, ...rows.map((_, i) => i).filter((i) => i !== yes)];
  const spots = order.map((_, k) => {
    const a = -Math.PI / 2 + (k * 2 * Math.PI) / rows.length;
    return { cx: Math.cos(a), cy: Math.sin(a) };
  });

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const st = stage.current!;
        const rx = () => (st.offsetWidth < 640 ? 0.36 : 0.38) * st.offsetWidth;
        const ry = () => 0.36 * st.offsetHeight;

        gsap.set("[data-step]", { autoAlpha: 0, y: 30 });
        gsap.set("[data-step='0']", { autoAlpha: 1, y: 0 });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: { trigger: ref.current, start: "top top", end: "+=220%", scrub: 0.6, pin: true, invalidateOnRefresh: true },
        });

        tl.fromTo("[data-capsule]", { rotate: -28, scale: 0.85 }, { rotate: 0, scale: 1, duration: 1 })
          .to("[data-step='0']", { autoAlpha: 0, y: -30, duration: 0.4 }, 0.8)
          .to("[data-step='1']", { autoAlpha: 1, y: 0, duration: 0.4 }, 1)
          .fromTo("[data-half='a']", { xPercent: 0 }, { xPercent: -55, rotate: -14, duration: 1 }, 1.2)
          .fromTo("[data-half='b']", { xPercent: 0 }, { xPercent: 55, rotate: 14, duration: 1 }, 1.2)
          .from(
            "[data-answer]",
            {
              x: (i: number) => -spots[i].cx * rx(),
              y: (i: number) => -spots[i].cy * ry(),
              scale: 0.2,
              rotate: () => gsap.utils.random(-90, 90),
              autoAlpha: 0,
              duration: 1.1,
              ease: "back.out(1.6)",
              stagger: 0.06,
            },
            1.5,
          )
          .to("[data-step='1']", { autoAlpha: 0, y: -30, duration: 0.4 }, 2.6)
          .to("[data-step='2']", { autoAlpha: 1, y: 0, duration: 0.4 }, 2.8)
          .to("[data-answer]:not([data-yes])", { opacity: 0.7, scale: 0.92, duration: 0.5 }, 2.9)
          .to("[data-yes]", { scale: 1.25, duration: 0.5, ease: "back.out(3)" }, 2.9)
          .to("[data-capsule]", { scale: 0.7, opacity: 0.35, duration: 0.6 }, 2.9);
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative overflow-hidden bg-(--pp-lilac)">
      <div className="mx-auto flex min-h-svh max-w-7xl flex-col px-4 pt-16 pb-10 sm:px-8">
        <div className="relative h-[2.4em] text-center text-[clamp(1.6rem,4.4vw,3.6rem)]">
          {STEPS.map((s, i) => (
            <h2 key={s} data-step={i} className={`v3-display absolute inset-x-0 top-0 ${i === 2 ? "" : "opacity-0"}`}>
              {i === 2 ? (
                <>
                  7 said no. <span className="text-white [-webkit-text-stroke:2px_var(--pp-ink)]">One said yes.</span>
                </>
              ) : (
                s
              )}
            </h2>
          ))}
        </div>

        <div ref={stage} className="relative mx-auto mt-4 w-full max-w-5xl flex-1" style={{ minHeight: "min(70svh, 640px)" }}>
          {/* The capsule, in two halves that pull apart. */}
          <div data-capsule className="absolute top-1/2 left-1/2 flex w-[min(54%,420px)] -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
            <svg data-half="a" viewBox="0 0 100 84" className="w-1/2 overflow-visible">
              <path d="M100 4H42a38 38 0 0 0 0 76h58z" fill="var(--pp-tang)" stroke="var(--pp-ink)" strokeWidth="4" />
              <path d="M28 22c6-6 14-8 26-8" stroke="white" strokeOpacity=".7" strokeWidth="7" strokeLinecap="round" fill="none" />
            </svg>
            <svg data-half="b" viewBox="0 0 100 84" className="w-1/2 overflow-visible">
              <path d="M0 4h58a38 38 0 0 1 0 76H0z" fill="var(--pp-white)" stroke="var(--pp-ink)" strokeWidth="4" />
            </svg>
          </div>

          <ol>
            {order.map((ri, k) => {
              const r = rows[ri];
              const isYes = ri === yes;
              const { cx, cy } = spots[k];
              return (
                <li
                  key={r.pharmacy.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${50 + cx * 38}%`, top: `${50 + cy * 36}%` }}
                >
                  <div
                    data-answer
                    data-yes={isYes || undefined}
                    className={`v3-sticker rounded-2xl px-3 py-2 text-center text-xs whitespace-nowrap sm:px-5 sm:py-3 sm:text-base ${isYes ? "bg-(--pp-lemon)" : "bg-white"}`}
                  >
                    <p className="font-bold">{r.pharmacy.commune}</p>
                    {isYes ? (
                      <p className="font-semibold text-(--pp-ink)">{r.item?.qty} left · {r.km.toFixed(1)} km</p>
                    ) : (
                      <p className="flex items-center justify-center gap-1 font-semibold text-(--pp-red)">
                        <svg viewBox="0 0 10 10" className="size-2.5" aria-hidden="true">
                          <path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        No
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
