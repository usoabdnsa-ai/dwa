"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useIntroDone } from "@/lib/intro";
import { BadgeCheck, Clock, MapPin, Moon } from "lucide-react";
import { pharmacies } from "@/lib/data";
import { HeroSearch } from "../hero-search";
import { StatusBadge } from "../status";

const CROSS =
  "M12 3h8a1 1 0 0 1 1 1v7h7a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-7v7a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-7H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h7V4a1 1 0 0 1 1-1Z";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const ready = useIntroDone();

  useEffect(() => {
    if (!ready || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-item", { autoAlpha: 0, y: 14, duration: 0.6, ease: "power2.out", stagger: 0.07 });
        gsap.from(".hero-art-item", { autoAlpha: 0, scale: 0.85, duration: 0.8, ease: "back.out(1.4)", stagger: 0.08, delay: 0.15, transformOrigin: "50% 50%" });
        gsap.from(".hero-card", { autoAlpha: 0, y: 24, scale: 0.9, duration: 0.7, ease: "back.out(1.6)", stagger: 0.15, delay: 0.55 });
        gsap.from(".hero-underline", { strokeDashoffset: 300, duration: 0.9, ease: "power2.inOut", delay: 0.5 });
      });
      gsap.matchMedia().add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".hero-item, .hero-card", { autoAlpha: 1 });
      });
    }, ref);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="cross-pattern-soft absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
        <div className="blob top-[-120px] right-[-80px] size-[520px] bg-green-soft" />
        <div className="blob bottom-[-160px] left-[-120px] size-[420px] bg-[#d9eef6] [animation-delay:-7s]" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pt-14 pb-24 sm:px-6 sm:pt-20 lg:grid-cols-[1.25fr_1fr] lg:pb-32">
        <div>
          <p className="hero-item mb-6 inline-flex items-center gap-2 rounded-full bg-surface py-1.5 pr-3.5 pl-2 text-sm font-medium text-green shadow-sm ring-1 ring-line">
            <span className="relative flex size-2.5" aria-hidden>
              <span className="absolute inset-0 animate-ping rounded-full bg-green/50 [animation-duration:2s]" />
              <span className="relative size-2.5 rounded-full bg-green" />
            </span>
            Live stock from {pharmacies.length} pharmacies in Alger
          </p>
          <h1 className="hero-item max-w-[15ch] font-display text-5xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-7xl">
            Stop walking from{" "}
            <span className="relative inline-block whitespace-nowrap text-green">
              pharmacy
              <svg viewBox="0 0 300 20" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full" aria-hidden>
                <path className="hero-underline" d="M4 14C60 4 140 2 296 10" fill="none" stroke="var(--color-neon)" strokeWidth="7" strokeLinecap="round" strokeDasharray="300" />
              </svg>
            </span>{" "}
            to pharmacy.
          </h1>
          <p className="hero-item mt-7 max-w-[46ch] text-lg leading-relaxed text-muted">
            Type the medicine on your prescription. See which pharmacies near you have it on the shelf right now, counted
            by the pharmacists themselves.
          </p>
          <div className="hero-item mt-9">
            <HeroSearch />
          </div>
          <ul className="hero-item mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-green" aria-hidden /> Licensed pharmacies only
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-green" aria-hidden /> Stock updated through the day
            </li>
            <li className="flex items-center gap-2">
              <Moon className="size-4 text-green" aria-hidden /> Night duty included
            </li>
          </ul>
        </div>

        <div className="relative mx-auto hidden w-full max-w-[420px] lg:block">
          <HeroArt />

          <div className="hero-card absolute top-6 -left-14 w-56">
            <div className="float surface rounded-2xl p-3.5" style={{ "--d": "7s" } as React.CSSProperties}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-display font-bold">Doliprane</span>
                <span className="font-mono text-xs text-muted">1000 mg</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <StatusBadge status="in" qty={42} />
                <span className="font-mono text-xs text-muted">180 DA</span>
              </div>
            </div>
          </div>

          <div className="hero-card absolute -right-8 bottom-10 w-60">
            <div className="float surface rounded-2xl p-3.5" style={{ "--d": "8s" } as React.CSSProperties}>
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-green-soft text-green">
                  <MapPin className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Pharmacie Garidi</p>
                  <p className="text-xs text-muted">
                    <span className="font-mono">6.7 km</span> · <span className="font-medium text-green">Open now</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-card absolute top-1/2 -right-6">
            <div className="float rounded-full bg-night px-3.5 py-2 text-xs font-medium text-neon shadow-lg" style={{ "--d": "6s" } as React.CSSProperties}>
              <span className="flex items-center gap-1.5">
                <Moon className="size-3.5" aria-hidden /> De garde tonight
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Pharmacy illustration: the cross on a soft disc, with medicines drifting around it. */
function HeroArt() {
  return (
    <svg viewBox="0 0 360 360" className="w-full" aria-hidden="true">
      <g className="hero-art-item">
        <circle cx="180" cy="180" r="168" fill="none" stroke="var(--color-line)" strokeWidth="1.5" strokeDasharray="3 9" />
        <circle className="soft-pulse" cx="180" cy="180" r="140" fill="var(--color-green-soft)" />
        <circle cx="180" cy="180" r="98" fill="var(--color-surface)" />
      </g>

      <g className="hero-art-item">
        <g transform="translate(116 116) scale(4)">
          <path d={CROSS} fill="var(--color-green)" />
          <circle cx="16" cy="16" r="3.4" fill="var(--color-surface)" />
        </g>
      </g>

      {/* Capsule, top left */}
      <g transform="translate(70 92)">
        <g className="hero-art-item">
          <g className="float" style={{ "--r": "-32deg", "--d": "6.5s" } as React.CSSProperties}>
            <rect x="-38" y="-15" width="76" height="30" rx="15" fill="var(--color-surface)" stroke="var(--color-green)" strokeWidth="2" />
            <path d="M0 -15h23a15 15 0 0 1 0 30H0Z" fill="var(--color-green)" />
            <rect x="-28" y="-8" width="16" height="4" rx="2" fill="var(--color-green-soft)" />
          </g>
        </g>
      </g>

      {/* Round tablet, right */}
      <g transform="translate(300 128)">
        <g className="hero-art-item">
          <g className="float" style={{ "--r": "18deg", "--d": "7.5s" } as React.CSSProperties}>
            <circle r="22" fill="var(--color-surface)" stroke="var(--color-line)" strokeWidth="2" />
            <path d="M-12 0h24" stroke="var(--color-line)" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>
      </g>

      {/* Second capsule, bottom right */}
      <g transform="translate(282 282)">
        <g className="hero-art-item">
          <g className="float" style={{ "--r": "28deg", "--d": "8s" } as React.CSSProperties}>
            <rect x="-28" y="-11" width="56" height="22" rx="11" fill="var(--color-surface)" stroke="var(--color-amber)" strokeWidth="2" />
            <path d="M0 -11h17a11 11 0 0 1 0 22H0Z" fill="var(--color-amber)" />
          </g>
        </g>
      </g>

      {/* Location pin, bottom left: "near you" */}
      <g transform="translate(84 270)">
        <g className="hero-art-item">
          <g className="float" style={{ "--d": "5.5s" } as React.CSSProperties}>
            <ellipse cx="0" cy="30" rx="12" ry="4" fill="var(--color-ink)" opacity="0.08" />
            <path d="M0 26C-14 10-20 1-20-8a20 20 0 0 1 40 0c0 9-6 18-20 34Z" fill="var(--color-ink)" />
            <circle cx="0" cy="-8" r="7" fill="var(--color-surface)" />
          </g>
        </g>
      </g>

      {/* Small sparkles */}
      {[
        [196, 30],
        [334, 214],
        [30, 196],
      ].map(([x, y]) => (
        <path key={`${x}`} className="hero-art-item" d={`M${x} ${y - 7}v14M${x - 7} ${y}h14`} stroke="var(--color-green)" strokeWidth="2.5" strokeLinecap="round" />
      ))}
    </svg>
  );
}
