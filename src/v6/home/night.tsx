"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, Moon, Phone } from "lucide-react";
import { algiersMinutes } from "@/lib/finder";
import { useNow } from "@/lib/use-now";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type DutyCard = {
  id: string;
  name: string;
  commune: string;
  address: string;
  phone: string;
};
export type FeedItem = {
  med: string;
  pharmacy: string;
  qty: number;
  mins: number;
};

const clock = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Algiers",
});

/* Night duty runs 20:00 to 08:00: where tonight is on that 12-hour line, 0 to 1. */
function nightProgress(mins: number) {
  const since = (mins - 20 * 60 + 1440) % 1440;
  return Math.min(since / 720, 1);
}

/*
 * The one dark band on the page: tonight's duty rota on a 20:00 to 08:00
 * line with a marker at the current Algiers time, plus the latest counts
 * scrolling past underneath.
 */
export function Night({ duty, feed }: { duty: DutyCard[]; feed: FeedItem[] }) {
  const ref = useRef<HTMLElement>(null);
  const now = useNow();
  const mins = now ? algiersMinutes(now) : null;
  const p = mins === null ? 0 : nightProgress(mins);
  const daytime = mins !== null && mins >= 8 * 60 && mins < 20 * 60;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ref.current, start: "top 70%", once: true },
        });
        tl.from("[data-night-head] > *", {
          y: 30,
          autoAlpha: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
        })
          .from(
            "[data-line-fill]",
            { scaleX: 0, duration: 1.2, ease: "power3.inOut" },
            0.2,
          )
          .from(
            "[data-duty]",
            {
              y: 40,
              autoAlpha: 0,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.1,
            },
            0.4,
          );
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-(--e-dark) py-24 text-white lg:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-60 -left-40 size-[700px] rounded-full bg-[radial-gradient(closest-side,rgb(159_196_178/0.16),transparent)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div
          data-night-head
          className="flex flex-wrap items-end justify-between gap-8"
        >
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-(--e-peach) uppercase">
              <Moon className="size-4" aria-hidden /> Pharmacies de garde
            </p>
            <h2 className="v6-serif mt-3 text-[clamp(2.1rem,4.4vw,3.4rem)]">
              {duty.length} pharmacies stay open{" "}
              <em className="text-(--e-sage-2)!">until 08:00</em> tonight.
            </h2>
          </div>
          <p className="v6-nums text-(--e-sage-2)">
            Algiers time{" "}
            <span className="ms-2 text-3xl font-semibold text-white">
              {now ? clock.format(now) : "--:--"}
            </span>
          </p>
        </div>

        {/* The night as a line. */}
        <div className="mt-14" aria-hidden>
          <div className="relative h-1.5 rounded-full bg-white/10">
            <div
              data-line-fill
              className="absolute inset-y-0 start-0 w-full origin-left rounded-full bg-(--e-sage-2)"
              style={{ transform: `scaleX(${daytime ? 0 : p})` }}
            />
            {!daytime && mins !== null && (
              <span
                className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--e-peach) ring-4 ring-(--e-dark)"
                style={{ left: `${p * 100}%` }}
              />
            )}
          </div>
          <div className="v6-nums mt-3 flex justify-between text-sm text-(--e-sage-2)">
            <span>20:00</span>
            <span>00:00</span>
            <span>04:00</span>
            <span>08:00</span>
          </div>
          {daytime && (
            <p className="mt-3 text-sm text-(--e-sage-2)">
              Daytime now. The night rota starts at 20:00.
            </p>
          )}
        </div>

        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {duty.map((d) => (
            <li
              key={d.id}
              data-duty
              className="group relative rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 transition-colors duration-200 hover:bg-white/[0.1]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-(--e-sage-2)">{d.commune}</p>
                  <Link
                    href={`/v6/pharmacy/${d.id}`}
                    className="v6-serif mt-1 block text-2xl after:absolute after:inset-0"
                  >
                    {d.name}
                  </Link>
                </div>
                <ArrowUpRight
                  className="size-5 text-(--e-sage-2) transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </div>
              <p className="mt-6 text-sm text-(--e-sage-2)">{d.address}</p>
              <a
                href={`tel:${d.phone.replace(/\s/g, "")}`}
                className="v6-nums relative z-10 mt-2 inline-flex items-center gap-2 text-sm font-semibold text-(--e-peach) hover:underline"
              >
                <Phone className="size-3.5" aria-hidden /> {d.phone}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Latest counts, as they come in. */}
      <div className="v6-marquee-wrap relative mt-20 overflow-hidden border-y border-white/10 py-5">
        <p className="sr-only">Latest stock counts</p>
        <div className="v6-marquee flex w-max gap-10 pe-10" aria-hidden>
          {[...feed, ...feed].map((f, i) => (
            <span
              key={i}
              className="flex items-center gap-3 whitespace-nowrap text-(--e-sage-2)"
            >
              <span className="size-1.5 rounded-full bg-(--e-peach)" />
              <span className="font-semibold text-white">{f.med}</span>
              <span className="v6-nums">{f.qty} boxes</span>
              <span>at {f.pharmacy}</span>
              <span className="v6-nums text-white/50">{f.mins} min ago</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
