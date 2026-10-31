"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/*
 * Scroll reveal for everything marked data-reveal inside: rises 24px and
 * fades in, batched so a row of cards staggers together. Gauges marked
 * data-gauge fill from zero as they arrive. Nothing moves with reduced motion.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        gsap.set(items, { autoAlpha: 0, y: 24 });
        ScrollTrigger.batch(items, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.07,
              overwrite: true,
            }),
        });
        gsap.utils.toArray<HTMLElement>("[data-gauge]").forEach((g) => {
          gsap.from(g, {
            scaleX: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: g, start: "top 92%", once: true },
          });
        });
      });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
