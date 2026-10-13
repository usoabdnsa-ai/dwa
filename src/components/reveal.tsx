"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Fades [data-reveal] blocks up once as they enter the viewport. Mount once per page. */
export function Reveal() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const els = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      gsap.set(els, { autoAlpha: 0, y: 16 });
      ScrollTrigger.batch(els, {
        start: "top 85%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.1 }),
      });
    });
    return () => mm.revert();
  }, []);
  return null;
}
