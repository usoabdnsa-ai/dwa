"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Check } from "lucide-react";
import { SearchForm } from "../search-form";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Stat = { value: number; suffix?: string; label: string };

/* Figures that count up once, the pharmacist pitch, and the search again to finish. */
export function Close({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const to = Number(el.dataset.count);
          const o = { v: 0 };
          gsap.to(o, {
            v: to,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
            onUpdate: () => void (el.textContent = String(Math.round(o.v))),
          });
        });
        gsap.from("[data-pro]", {
          y: 60,
          autoAlpha: 0,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: "[data-pro]",
            start: "top 80%",
            once: true,
          },
        });
        gsap.from("[data-pro-ui] > *", {
          x: 30,
          autoAlpha: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: "[data-pro]",
            start: "top 70%",
            once: true,
          },
        });
        gsap.from("[data-last] > *", {
          y: 30,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: "[data-last]",
            start: "top 80%",
            once: true,
          },
        });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <dl className="grid grid-cols-2 gap-y-10 border-y border-(--e-line) py-12 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse px-2">
              <dt className="mt-2 text-sm text-(--e-muted)">{s.label}</dt>
              <dd className="v6-serif v6-nums text-5xl text-(--e-green) lg:text-6xl">
                <span data-count={s.value}>{s.value}</span>
                {s.suffix && <span className="text-3xl">{s.suffix}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* For pharmacists. */}
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:pb-36">
        <div
          data-pro
          className="grid overflow-hidden rounded-[36px] bg-(--e-green) text-white lg:grid-cols-[1.1fr_1fr]"
        >
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="text-sm font-semibold tracking-wide text-(--e-peach) uppercase">
              For pharmacists
            </p>
            <h2 className="v6-serif mt-3 text-[clamp(2rem,4vw,3.2rem)]">
              Fewer &ldquo;do you have it?&rdquo; calls.{" "}
              <em className="text-(--e-sage-2)!">
                More people at the counter.
              </em>
            </h2>
            <ul className="mt-8 space-y-3 text-(--e-sage)">
              {[
                "Update a line in two taps, or scan the box",
                "Receive reservations with the patient's name",
                "See which medicines people search for near you",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <Check
                    className="mt-0.5 size-5 shrink-0 text-(--e-peach)"
                    aria-hidden
                  />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard"
              className="v6-btn mt-10 h-12 bg-white px-6 text-(--e-green) hover:bg-(--e-sage)"
            >
              Open the pharmacist dashboard{" "}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="relative min-h-80 bg-(--e-dark)">
            <Image
              src="/v6/photos/blister-pile.webp"
              alt=""
              width={960}
              height={640}
              unoptimized
              className="absolute inset-0 h-full w-full object-cover opacity-50"
            />
            <div
              data-pro-ui
              className="relative flex h-full flex-col justify-center gap-3 p-8 sm:p-12"
              aria-hidden
            >
              {[
                {
                  t: "New reservation",
                  s: "2 × Augmentin 1 g · Mme Haddad",
                  c: "bg-(--e-peach) text-(--e-dark)",
                },
                {
                  t: "Stock updated",
                  s: "Doliprane 1000 mg · 34 boxes",
                  c: "bg-(--e-sage) text-(--e-green)",
                },
                {
                  t: "Searched near you",
                  s: "Lantus · 12 times today",
                  c: "bg-white text-(--e-ink)",
                },
              ].map((n) => (
                <div
                  key={n.t}
                  className={`max-w-sm rounded-2xl px-5 py-4 shadow-lg ${n.c}`}
                >
                  <p className="text-sm font-semibold">{n.t}</p>
                  <p className="text-sm opacity-80">{n.s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-(--e-bg) py-24 lg:py-36">
        <div data-last className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="v6-serif text-[clamp(2.4rem,5.5vw,4.4rem)]">
            What is on <em>your prescription?</em>
          </h2>
          <p className="mt-4 text-lg text-(--e-muted)">
            Search once. Walk to the right pharmacy.
          </p>
          <div className="mx-auto mt-10 max-w-xl text-start">
            <SearchForm />
          </div>
        </div>
      </div>
    </section>
  );
}
