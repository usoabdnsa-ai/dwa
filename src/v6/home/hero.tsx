"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { BellRing, CheckCircle2, Search } from "lucide-react";
import type { Status } from "@/lib/finder";
import { SearchForm } from "../search-form";
import { StockPill } from "../ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type PhoneRow = {
  id: string;
  name: string;
  commune: string;
  km: string;
  qty: number;
  status: Status;
};

const QUERY = "Doliprane 1000 mg";
const TRY = ["Doliprane", "Augmentin", "Ventoline", "Lantus"];

/*
 * Split hero: the promise and the search on one side, the product doing its
 * job on the other. The phone types a search, real results land, and a
 * reservation confirms, so the visitor sees the whole service in four seconds.
 */
export function Hero({
  count,
  rows,
  code,
}: {
  count: number;
  rows: PhoneRow[];
  code: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-hero-in]", { autoAlpha: 1 });
        const typed = ref.current!.querySelector<HTMLElement>("[data-typed]")!;
        const t = { n: 0 };

        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: "power3.out" },
        });
        tl.from("[data-kicker]", { y: 12, autoAlpha: 0, duration: 0.5 })
          .from(
            "[data-line] > span",
            { yPercent: 105, duration: 0.9, ease: "expo.out", stagger: 0.09 },
            0.1,
          )
          .from(
            "[data-sub]",
            { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.08 },
            0.45,
          )
          .from(
            "[data-phone]",
            { y: 90, rotate: 5, autoAlpha: 0, duration: 1.1, ease: "expo.out" },
            0.3,
          )
          .from(
            "[data-photo]",
            {
              scale: 0.9,
              rotate: -14,
              autoAlpha: 0,
              duration: 1,
              ease: "expo.out",
            },
            0.45,
          )
          .fromTo(
            t,
            { n: 0 },
            {
              n: QUERY.length,
              duration: 0.7,
              ease: "none",
              onUpdate: () =>
                void (typed.textContent = QUERY.slice(0, Math.round(t.n))),
            },
            1,
          )
          .from(
            "[data-row]",
            { y: 16, autoAlpha: 0, duration: 0.45, stagger: 0.09 },
            1.75,
          )
          .from(
            "[data-row] [data-gauge]",
            { scaleX: 0, duration: 0.7, stagger: 0.09 },
            1.85,
          )
          .from(
            "[data-toast]",
            {
              yPercent: -140,
              autoAlpha: 0,
              duration: 0.6,
              ease: "back.out(1.6)",
            },
            2.6,
          )
          .from(
            "[data-chip]",
            {
              y: 14,
              scale: 0.94,
              autoAlpha: 0,
              duration: 0.5,
              ease: "back.out(2)",
            },
            2.9,
          );

        // Wait for the first-visit intro to lift before playing.
        const html = document.documentElement;
        const start = () => tl.play();
        if (html.dataset.v6intro === "skip" || html.dataset.v6introDone)
          start();
        else window.addEventListener("v6:intro-done", start, { once: true });

        // Idle: the phone breathes; on scroll it rises a little faster than the page.
        gsap.to("[data-float]", {
          y: -10,
          duration: 3.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: 3,
        });
        gsap.to("[data-phone]", {
          yPercent: -8,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      // Pointer: a slight 3D lean toward the cursor, fine pointers only.
      mm.add(
        "(prefers-reduced-motion: no-preference) and (pointer: fine)",
        () => {
          const el = ref.current!.querySelector<HTMLElement>("[data-tilt]")!;
          const rx = gsap.quickTo(el, "rotationX", {
            duration: 0.8,
            ease: "power3.out",
          });
          const ry = gsap.quickTo(el, "rotationY", {
            duration: 0.8,
            ease: "power3.out",
          });
          const move = contextSafe!((e: PointerEvent) => {
            ry((e.clientX / window.innerWidth - 0.5) * 10);
            rx(-(e.clientY / window.innerHeight - 0.5) * 8);
          });
          window.addEventListener("pointermove", move);
          return () => window.removeEventListener("pointermove", move);
        },
      );
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="relative overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 size-[640px] rounded-full bg-[radial-gradient(closest-side,var(--e-sage),transparent)] opacity-80"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-14 px-4 pt-14 pb-24 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:pt-20 lg:pb-32">
        <div>
          <p
            data-kicker
            data-hero-in
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-(--e-green) ring-1 ring-(--e-line)"
          >
            <span className="relative flex size-2">
              <span className="v6-live absolute inset-0 rounded-full bg-(--e-coral)" />
              <span className="relative size-2 rounded-full bg-(--e-coral)" />
            </span>
            Live stock from {count} pharmacies in Alger
          </p>
          <h1 className="v6-serif mt-7 text-[clamp(2.8rem,6.4vw,5.2rem)]">
            <span data-line className="block overflow-hidden pb-[0.08em]">
              <span className="block">Know which pharmacy</span>
            </span>
            <span data-line className="block overflow-hidden pb-[0.08em]">
              <span className="block">
                has it <em>before you</em>
              </span>
            </span>
            <span data-line className="block overflow-hidden pb-[0.12em]">
              <span className="block">
                <em>leave home.</em>
              </span>
            </span>
          </h1>
          <p
            data-sub
            data-hero-in
            className="mt-6 max-w-lg text-lg text-(--e-muted)"
          >
            Pharmacists in Alger post their own counts. Search a medicine, see
            the boxes on each shelf, and reserve it for collection.
          </p>
          <div data-sub data-hero-in className="relative z-20 mt-9 max-w-xl">
            <SearchForm />
          </div>
          <p
            data-sub
            data-hero-in
            className="mt-4 flex flex-wrap items-center gap-2 text-sm text-(--e-muted)"
          >
            Popular:
            {TRY.map((q) => (
              <Link
                key={q}
                href={`/v6/search?q=${q}`}
                className="rounded-full bg-white px-3 py-1 ring-1 ring-(--e-line) hover:ring-(--e-green)"
              >
                {q}
              </Link>
            ))}
          </p>
        </div>

        {/* The product, in a phone. */}
        <div
          className="relative mx-auto w-full max-w-[400px] [perspective:1200px]"
          aria-label="Preview of a Doliprane search on dwa"
          role="img"
        >
          <div
            data-photo
            data-hero-in
            className="absolute -top-6 -left-16 hidden w-52 rotate-[-8deg] overflow-hidden rounded-3xl shadow-[0_30px_60px_-30px_rgb(11_42_34/0.5)] ring-4 ring-white sm:block"
          >
            <Image
              src="/v6/photos/white-tablets.webp"
              alt=""
              width={960}
              height={636}
              unoptimized
              className="h-auto w-full"
              priority
            />
          </div>
          <div data-phone data-hero-in className="relative">
            <div data-float>
              <div data-tilt className="v6-phone will-change-transform">
                <div className="v6-phone-screen relative">
                  <div
                    className="flex items-center justify-between px-6 pt-4 text-[11px] font-semibold text-(--e-ink)"
                    aria-hidden
                  >
                    <span className="v6-nums">9:41</span>
                    <span className="h-5 w-24 rounded-full bg-[#0d1512]" />
                    <span>5G</span>
                  </div>
                  <div className="px-4 pt-4 pb-6">
                    <div className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2.5 text-sm shadow-sm ring-1 ring-(--e-line)">
                      <Search className="size-4 text-(--e-green)" aria-hidden />
                      <span className="font-medium">
                        <span data-typed>{QUERY}</span>
                        <span className="ms-0.5 inline-block h-4 w-px translate-y-0.5 bg-(--e-ink) motion-safe:animate-pulse" />
                      </span>
                    </div>
                    <p className="mt-4 px-1 text-xs font-semibold tracking-wide text-(--e-muted) uppercase">
                      {rows.length} nearby have it
                    </p>
                    <ul className="mt-2 space-y-2">
                      {rows.map((r, i) => (
                        <li
                          key={r.id}
                          data-row
                          className={`rounded-2xl bg-white p-3 ring-1 ${i === 0 ? "ring-(--e-green)" : "ring-(--e-line)"}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">
                                {r.name}
                              </span>
                              <span className="block text-xs text-(--e-muted)">
                                {r.commune} · {r.km}
                              </span>
                            </span>
                            <StockPill status={r.status} />
                          </div>
                          <div className="mt-2.5 flex items-center gap-2">
                            <span className="v6-gauge w-full">
                              <i
                                data-gauge
                                style={{
                                  background: "var(--e-green)",
                                  transform: `scaleX(${Math.min(r.qty / 40, 1)})`,
                                }}
                              />
                            </span>
                            <span className="v6-nums shrink-0 text-xs font-semibold">
                              {r.qty} boxes
                            </span>
                          </div>
                          {i === 0 && (
                            <span className="mt-2.5 flex h-8 items-center justify-center gap-1.5 rounded-full bg-(--e-cta) text-xs font-semibold text-white">
                              <BellRing className="size-3.5" aria-hidden />{" "}
                              Reserve
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Reservation lands as a notification. */}
                  <div
                    data-toast
                    data-hero-in
                    className="absolute inset-x-3 top-12 flex items-center gap-3 rounded-2xl bg-(--e-dark) p-3 text-white shadow-xl"
                  >
                    <CheckCircle2
                      className="size-6 shrink-0 text-(--e-sage-2)"
                      aria-hidden
                    />
                    <span className="min-w-0 text-xs">
                      <span className="block font-semibold">
                        Reserved at {rows[0]?.name}
                      </span>
                      <span className="v6-nums block text-(--e-sage-2)">
                        Code {code} · ready in 10 min
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            data-chip
            data-hero-in
            className="v6-card absolute -right-6 -bottom-8 hidden px-4 py-3 sm:block"
          >
            <p className="text-xs text-(--e-muted)">
              Counted by the pharmacist
            </p>
            <p className="v6-nums text-sm font-semibold">
              {rows[0]?.qty} boxes, 1 h ago
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
