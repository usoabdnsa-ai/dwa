"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CheckCircle2, Search } from "lucide-react";
import { SectionHead } from "../ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type StepRow = { name: string; commune: string; qty: number };

const STEPS = [
  {
    n: "01",
    title: "Type what is written on the box",
    text: "Brand name or active ingredient. Doliprane and paracetamol find the same shelf.",
  },
  {
    n: "02",
    title: "Compare the shelves",
    text: "Each pharmacy shows its count and how long ago it was taken, nearest first.",
  },
  {
    n: "03",
    title: "Reserve and walk in",
    text: "The pharmacist sets the boxes aside. Give your code at the counter.",
  },
];

/*
 * Three steps on a sticky stage. On wide screens the copy column scrolls
 * while the device on the right switches screens, and a rail fills as you go.
 */
export function Steps({ rows, code }: { rows: StepRow[]; code: string }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const screens = gsap.utils.toArray<HTMLElement>("[data-screen]");
          gsap.set(screens.slice(1), { autoAlpha: 0, y: 30 });
          gsap.fromTo(
            "[data-rail]",
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: "[data-copy]",
                start: "top 60%",
                end: "bottom 60%",
                scrub: true,
              },
            },
          );

          gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step, i) => {
            ScrollTrigger.create({
              trigger: step,
              start: "top 60%",
              end: "bottom 60%",
              toggleClass: { targets: step, className: "is-on" },
              onToggle: (self) => {
                if (!self.isActive) return;
                screens.forEach((s, j) =>
                  gsap.to(s, {
                    autoAlpha: j === i ? 1 : 0,
                    y: j === i ? 0 : j < i ? -30 : 30,
                    duration: 0.5,
                    ease: "power3.out",
                    overwrite: true,
                  }),
                );
                if (i === 1)
                  gsap.fromTo(
                    "[data-screen='1'] [data-gauge]",
                    { scaleX: 0 },
                    {
                      scaleX: (k, el: HTMLElement) => Number(el.dataset.to),
                      duration: 0.8,
                      ease: "power3.out",
                      stagger: 0.08,
                    },
                  );
              },
            });
          });
        },
      );
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="bg-white py-24 lg:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead
          kicker="How it works"
          title={
            <>
              Three steps, <em>one trip.</em>
            </>
          }
        >
          No more walking from one pharmacy to the next asking if they have it.
        </SectionHead>

        <div className="mt-16 grid gap-16 lg:grid-cols-2">
          <ol
            data-copy
            className="relative space-y-6 lg:space-y-[28vh] lg:py-[10vh] lg:ps-10"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 start-0 hidden w-px bg-(--e-line) lg:block"
            />
            <span
              aria-hidden
              data-rail
              className="absolute inset-y-0 start-0 hidden w-px origin-top bg-(--e-coral) lg:block"
            />
            {STEPS.map((s) => (
              <li key={s.n} data-step className="group">
                <span className="v6-nums text-sm font-semibold text-(--e-coral)">
                  {s.n}
                </span>
                <h3 className="v6-serif mt-2 text-3xl transition-colors duration-300 lg:text-4xl lg:text-(--e-muted) lg:group-[.is-on]:text-(--e-ink)">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-md text-lg text-(--e-muted)">
                  {s.text}
                </p>
              </li>
            ))}
          </ol>

          <div className="hidden lg:block">
            <div className="sticky top-28 h-[440px]" aria-hidden>
              <div className="relative h-full overflow-hidden rounded-[32px] bg-(--e-bg) p-8 ring-1 ring-(--e-line)">
                {/* 1: the search field with suggestions */}
                <div data-screen="0" className="absolute inset-8">
                  <div className="flex items-center gap-3 rounded-full bg-white px-5 py-4 shadow-sm ring-1 ring-(--e-green)">
                    <Search className="size-5 text-(--e-green)" />
                    <span className="text-lg font-medium">paracetamol</span>
                  </div>
                  <ul className="v6-card mt-3 p-2">
                    {[
                      "Doliprane 1000 mg",
                      "Efferalgan 500 mg",
                      "Paralgan 500 mg",
                    ].map((m, i) => (
                      <li
                        key={m}
                        className={`flex justify-between rounded-xl px-4 py-3 ${i === 0 ? "bg-(--e-sage)" : ""}`}
                      >
                        <span className="font-semibold">{m}</span>
                        <span className="text-sm text-(--e-muted)">
                          Paracetamol
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* 2: shelves compared */}
                <div data-screen="1" className="absolute inset-8 space-y-3">
                  {rows.map((r) => (
                    <div key={r.name} className="v6-card p-4">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">{r.name}</span>
                        <span className="text-(--e-muted)">{r.commune}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="v6-gauge w-full">
                          <i
                            data-gauge
                            data-to={Math.min(r.qty / 40, 1)}
                            style={{
                              background:
                                r.qty <= 5
                                  ? "var(--e-amber)"
                                  : "var(--e-green)",
                              transform: `scaleX(${Math.min(r.qty / 40, 1)})`,
                            }}
                          />
                        </span>
                        <span className="v6-nums w-16 shrink-0 text-end text-sm font-semibold">
                          {r.qty} boxes
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* 3: the code */}
                <div
                  data-screen="2"
                  className="absolute inset-8 grid place-items-center"
                >
                  <div className="w-full max-w-sm rounded-[28px] bg-(--e-dark) p-8 text-center text-white">
                    <CheckCircle2 className="mx-auto size-10 text-(--e-sage-2)" />
                    <p className="mt-4 text-(--e-sage-2)">
                      Show this at the counter
                    </p>
                    <p className="v6-nums mt-1 text-5xl font-semibold tracking-wider">
                      {code}
                    </p>
                    <p className="mt-4 text-sm text-(--e-sage-2)">
                      Held for 2 hours, 4 with a deposit
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
