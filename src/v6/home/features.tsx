"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, BellRing, ShieldCheck } from "lucide-react";
import { SectionHead } from "../ui";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type Equivalent = { name: string; dosage: string; count: number };

/*
 * Two photo-led rows. Each photo carries a small piece of real interface
 * that does the explaining; the photo drifts a little slower than the page.
 */
export function Features({
  scarce,
  equivalents,
  deposit,
  holdShort,
  holdLong,
}: {
  scarce: { name: string; count: number };
  equivalents: Equivalent[];
  deposit: string;
  holdShort: number;
  holdLong: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-feature]").forEach((row) => {
          const tl = gsap.timeline({
            scrollTrigger: { trigger: row, start: "top 75%", once: true },
          });
          tl.from(row.querySelectorAll("[data-copy-in]"), {
            y: 30,
            autoAlpha: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
          })
            .from(
              row.querySelector("[data-photo-in]"),
              { scale: 0.9, autoAlpha: 0, duration: 1.1, ease: "expo.out" },
              0,
            )
            .from(
              row.querySelector("[data-ui-in]"),
              { y: 50, autoAlpha: 0, duration: 0.9, ease: "back.out(1.4)" },
              0.35,
            );
          gsap.fromTo(
            row.querySelector("[data-photo-img]"),
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: row,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="py-24 lg:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead
          kicker="Built for the hard days"
          title={
            <>
              When the shelf is <em>empty,</em> you still have a plan.
            </>
          }
        />

        <div className="mt-20 space-y-28">
          <div data-feature className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative">
              <div
                data-photo-in
                className="aspect-[4/3] overflow-hidden rounded-[32px]"
              >
                <Image
                  data-photo-img
                  src="/v6/photos/capsules.webp"
                  alt="Red and yellow capsules in a blister pack"
                  width={960}
                  height={640}
                  unoptimized
                  className="h-[112%] w-full -translate-y-[6%] object-cover"
                />
              </div>
              <div
                data-ui-in
                className="v6-card absolute -bottom-10 start-4 end-4 p-5 sm:start-auto sm:-end-6 sm:w-80"
              >
                <p className="text-sm font-semibold text-(--e-amber)">
                  Only {scarce.count} pharmacies have {scarce.name}
                </p>
                <p className="mt-3 text-xs text-(--e-muted)">
                  Same active ingredient, in stock:
                </p>
                <ul className="mt-2 space-y-2">
                  {equivalents.map((e) => (
                    <li
                      key={e.name}
                      className="flex items-center justify-between rounded-xl bg-(--e-bg) px-3 py-2 text-sm"
                    >
                      <span className="font-semibold">
                        {e.name}{" "}
                        <span className="font-normal text-(--e-muted)">
                          {e.dosage}
                        </span>
                      </span>
                      <span className="v6-nums text-(--e-green)">
                        {e.count} pharmacies
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="lg:ps-10">
              <h3 data-copy-in className="v6-serif text-3xl lg:text-4xl">
                Out of stock? We show the <em>same molecule</em> under another
                name.
              </h3>
              <p
                data-copy-in
                className="mt-4 max-w-md text-lg text-(--e-muted)"
              >
                Generics and other brands share the active ingredient. Ask your
                pharmacist before switching, and leave your number to hear when
                the original is back.
              </p>
              <p
                data-copy-in
                className="mt-6 flex items-center gap-2 text-sm font-semibold text-(--e-green)"
              >
                <BellRing className="size-4" aria-hidden /> A text message when
                stock is counted again
              </p>
            </div>
          </div>

          <div data-feature className="grid items-center gap-12 lg:grid-cols-2">
            <div className="lg:order-2">
              <div className="relative">
                <div
                  data-photo-in
                  className="aspect-[4/3] overflow-hidden rounded-[32px]"
                >
                  <Image
                    data-photo-img
                    src="/v6/photos/blister-pack.webp"
                    alt="Brown softgel capsules in an opened blister pack"
                    width={1024}
                    height={682}
                    unoptimized
                    className="h-[112%] w-full -translate-y-[6%] object-cover"
                  />
                </div>
                <div
                  data-ui-in
                  className="absolute -bottom-10 start-4 end-4 rounded-3xl bg-(--e-dark) p-5 text-white shadow-xl sm:start-auto sm:-end-6 sm:w-72"
                >
                  <p className="text-sm text-(--e-sage-2)">Hold time</p>
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Free</span>
                        <span className="v6-nums">{holdShort} h</span>
                      </div>
                      <span className="v6-gauge mt-1.5 bg-white/10!">
                        <i
                          style={{
                            background: "var(--e-sage-2)",
                            transform: `scaleX(${holdShort / holdLong})`,
                          }}
                        />
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>With {deposit} deposit</span>
                        <span className="v6-nums">{holdLong} h</span>
                      </div>
                      <span className="v6-gauge mt-1.5 bg-white/10!">
                        <i style={{ background: "var(--e-peach)" }} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:order-1 lg:pe-10">
              <h3 data-copy-in className="v6-serif text-3xl lg:text-4xl">
                Reserve now, <em>collect after work.</em>
              </h3>
              <p
                data-copy-in
                className="mt-4 max-w-md text-lg text-(--e-muted)"
              >
                The pharmacy keeps your boxes for {holdShort} hours. Pay a{" "}
                {deposit} deposit by Edahabia or CIB and they wait {holdLong}{" "}
                hours. The deposit comes off the price at the counter.
              </p>
              <p
                data-copy-in
                className="mt-6 flex items-center gap-2 text-sm font-semibold text-(--e-green)"
              >
                <ShieldCheck className="size-4" aria-hidden /> Prescription
                medicines are handed over with your prescription
              </p>
              <Link
                data-copy-in
                href="/v6/search?q=Doliprane"
                className="v6-btn v6-btn-ghost mt-8 h-12 px-6"
              >
                Try a reservation <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
