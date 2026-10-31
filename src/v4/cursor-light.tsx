"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/* A soft pool of green light that trails the cursor across the whole night. Fine pointers only. */
export function CursorLight() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
      const el = ref.current!;
      const x = gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" });
      let shown = false;
      const move = (e: PointerEvent) => {
        if (!shown) {
          shown = true;
          gsap.to(el, { opacity: 1, duration: 0.4 });
        }
        x(e.clientX);
        y(e.clientY);
      };
      window.addEventListener("pointermove", move);
      return () => window.removeEventListener("pointermove", move);
    });
  });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-30 -mt-[300px] -ml-[300px] size-[600px] rounded-full opacity-0 will-change-transform"
      style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--nn-neon) 7%, transparent), transparent 60%)" }}
    />
  );
}
