"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { fmtUpdated, statusOf } from "@/lib/finder";
import { StatusPill } from "../ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type FeedItem = { key: string; med: string; pharmacy: string; commune: string; qty: number; mins: number };

const VISIBLE = 5;

/*
 * The shelf as a live wire: stock updates arrive one at a time while the
 * section is on screen, newest on top with a brief neon flash.
 */
export function Feed({ items, pharmacies, medicines }: { items: FeedItem[]; pharmacies: number; medicines: number }) {
  const ref = useRef<HTMLElement>(null);
  const [head, setHead] = useState(0);
  const [live, setLive] = useState(false);

  // Only tick while visible and when motion is welcome.
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setHead((h) => (h + 1) % items.length), 1800);
    return () => clearInterval(id);
  }, [live, items.length]);

  const rows = Array.from({ length: VISIBLE }, (_, i) => items[(head - i + items.length * 2) % items.length]);

  useGSAP(
    () => {
      if (head === 0) return;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-feed-row]:first-child", { y: -24, autoAlpha: 0, duration: 0.45, ease: "power3.out" });
        gsap.fromTo("[data-feed-row]:first-child [data-flash]", { opacity: 1 }, { opacity: 0, duration: 1.2, ease: "power2.out" });
        gsap.from("[data-feed-row]:not(:first-child)", { y: -64, duration: 0.45, ease: "power3.out" });
      });
    },
    { scope: ref, dependencies: [head] },
  );

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        ref.current!.querySelectorAll<HTMLElement>("[data-countup]").forEach((el) => {
          const n = { v: 0 };
          gsap.to(n, {
            v: Number(el.dataset.countup),
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onUpdate: () => void (el.textContent = String(Math.round(n.v))),
          });
        });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative border-t border-(--nn-line) bg-(--nn-bg-2)">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 sm:py-32 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="v4-display text-[clamp(2rem,5vw,3.6rem)]">
            The pharmacist counts.
            <br />
            <span className="v4-glow-text text-(--nn-neon)">You see it.</span>
          </h2>
          <p className="mt-5 max-w-sm text-(--nn-muted)">Every line is posted from behind the counter, with the time it was counted. No guesses, no stale lists.</p>
          <dl className="mt-10 flex gap-10">
            <div>
              <dd data-countup={pharmacies} className="v4-display v4-nums text-5xl text-(--nn-neon)">
                {pharmacies}
              </dd>
              <dt className="mt-1 text-sm text-(--nn-muted)">pharmacies posting</dt>
            </div>
            <div>
              <dd data-countup={medicines} className="v4-display v4-nums text-5xl text-(--nn-magenta)">
                {medicines}
              </dd>
              <dt className="mt-1 text-sm text-(--nn-muted)">medicines tracked</dt>
            </div>
          </dl>
        </div>

        <div className="v4-glass overflow-hidden rounded-3xl">
          <div className="flex items-center justify-between border-b border-(--nn-line) px-5 py-3 text-sm">
            <span className="flex items-center gap-2 font-semibold">
              <span className="relative flex size-2.5">
                <span className="absolute inset-0 rounded-full bg-(--nn-neon) motion-safe:animate-ping" />
                <span className="relative size-2.5 rounded-full bg-(--nn-neon)" />
              </span>
              Live shelf updates
            </span>
            <span className="text-(--nn-muted)">Alger</span>
          </div>
          <ul className="h-[380px] overflow-hidden" aria-live="off">
            {rows.map((r) => (
              <li key={r.key} data-feed-row className="relative flex items-center justify-between gap-4 border-b border-(--nn-line)/60 px-5 py-4">
                <span data-flash aria-hidden="true" className="absolute inset-0 bg-(--nn-neon)/10 opacity-0" />
                <span className="relative min-w-0">
                  <span className="block truncate font-semibold">{r.med}</span>
                  <span className="block truncate text-sm text-(--nn-muted)">
                    {r.pharmacy} · {r.commune} · {fmtUpdated(r.mins)}
                  </span>
                </span>
                <span className="relative flex shrink-0 items-center gap-3">
                  <span className="v4-nums text-sm text-(--nn-muted)">{r.qty} boxes</span>
                  <StatusPill status={statusOf(r.qty)} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
