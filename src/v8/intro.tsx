"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { setBlob } from "./blob";

gsap.registerPlugin(useGSAP);

export const V8_INTRO_KEY = "dwa-v8-intro-seen";

export const v8IntroBoot = `try{if(sessionStorage.getItem("${V8_INTRO_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.dataset.v8intro="skip";else document.documentElement.dataset.v8intro="play"}catch(e){document.documentElement.dataset.v8intro="skip"}`;

export function onIntroDone(fn: () => void) {
  if (typeof document === "undefined") return () => {};
  const d = document.documentElement.dataset;
  if (d.v8intro !== "play" || d.v8introDone) {
    fn();
    return () => {};
  }
  const h = () => fn();
  addEventListener("v8:intro-done", h, { once: true });
  return () => removeEventListener("v8:intro-done", h);
}

/*
 * Intro, about 2.3 s, once per session, skippable: four droplets drift apart
 * on a pearl screen, pull together and melt into the blob, while "dwa" types
 * itself underneath. Then the page fades in around the blob.
 */
export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (document.documentElement.dataset.v8intro !== "play") return;
      setBlob({ merge: 0, morph: 0, x: 0, y: 0.1, scale: 1.25 });
      const finish = () => {
        try {
          sessionStorage.setItem(V8_INTRO_KEY, "1");
        } catch {}
        document.documentElement.dataset.v8introDone = "1";
        dispatchEvent(new Event("v8:intro-done"));
      };
      const tl = gsap.timeline({ onComplete: () => root.current?.remove() });
      tl.add(() => setBlob({ merge: 1 }), 0.35)
        .from(".i-letter", { opacity: 0, y: 18, filter: "blur(6px)", duration: 0.5, ease: "power3.out", stagger: 0.09 }, 0.6)
        .from(".i-sub", { opacity: 0, duration: 0.4 }, 1.0)
        .to(".i-text", { opacity: 0, y: -10, duration: 0.35, ease: "power2.in" }, 1.75)
        .add(finish, 1.85);
      const skip = () => {
        setBlob({ merge: 1 });
        tl.progress(1);
      };
      root.current?.addEventListener("click", skip);
      addEventListener("keydown", skip, { once: true });
      return () => removeEventListener("keydown", skip);
    },
    { scope: root },
  );

  return (
    <div ref={root} className="v8-intro fixed inset-0 z-[100] hidden cursor-pointer place-items-end justify-center pb-[18vh]" role="presentation" title="Skip intro">
      <div className="i-text text-center">
        <p className="display text-[64px] text-(--l-ink)" aria-label="dwa">
          {"dwa".split("").map((c, i) => (
            <span key={i} className="i-letter inline-block">
              {c}
            </span>
          ))}
        </p>
        <p className="i-sub mt-2 text-[15px] text-(--l-muted)">Medicines in Alger, live</p>
      </div>
    </div>
  );
}
