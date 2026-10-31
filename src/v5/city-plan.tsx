"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { Status } from "@/lib/finder";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type PlanPoint = { id: string; name: string; commune: string; lat: number; lng: number; status: Status | "none"; onDuty: boolean };

/*
 * A drawn plan of Alger: the bay, the coast and each pharmacy as a small rounded pin. Equirectangular box over the demo area, corrected for latitude.
 */
const BOX = { west: 2.935, east: 3.205, north: 36.805, south: 36.708 };
const W = 1000;
const H = Math.round((W * (BOX.north - BOX.south)) / ((BOX.east - BOX.west) * Math.cos((36.75 * Math.PI) / 180)));

const x = (lng: number) => ((lng - BOX.west) / (BOX.east - BOX.west)) * W;
const y = (lat: number) => ((BOX.north - lat) / (BOX.north - BOX.south)) * H;

// Approximate shoreline from Aïn Benian round the Bay of Algiers to Bordj El Kiffan.
const COAST: [number, number][] = [
  [2.935, 36.801], [2.97, 36.799], [3.0, 36.796], [3.03, 36.792], [3.05, 36.789], [3.062, 36.784],
  [3.072, 36.772], [3.085, 36.758], [3.1, 36.747], [3.12, 36.737], [3.14, 36.731], [3.16, 36.735],
  [3.18, 36.742], [3.205, 36.75],
];
const coastPath = COAST.map(([lng, lat], i) => `${i ? "L" : "M"}${x(lng).toFixed(1)} ${y(lat).toFixed(1)}`).join(" ");
const seaPath = `${coastPath} L${W} 0 L0 0 Z`;

const FILL: Record<PlanPoint["status"], string> = {
  in: "var(--ln-green)",
  low: "var(--ln-amber)",
  out: "var(--ln-surface-2)",
  none: "var(--ln-soft)",
};

export function CityPlan({
  points,
  origin,
  active,
  onHover,
  className = "",
}: {
  points: PlanPoint[];
  origin?: { lat: number; lng: number };
  active?: string | null;
  onHover?: (id: string | null) => void;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const key = points.map((p) => p.id + p.status).join();

  // Pins drop onto the plan one by one the first time it scrolls into view.
  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-pin]", {
          y: -40,
          opacity: 0,
          duration: 0.5,
          ease: "back.out(2.2)",
          stagger: 0.06,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
      });
    },
    { scope: ref, dependencies: [key] },
  );

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className={`h-auto w-full ${className}`} role="img" aria-label="Plan of Alger with pharmacies">
      <defs>
        <pattern id="v5-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0H0v24" fill="none" stroke="rgb(255 255 255 / 0.05)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="var(--ln-surface)" />
      <rect width={W} height={H} fill="url(#v5-grid)" />
      <path d={seaPath} fill="var(--ln-bg)" />
      <path d={coastPath} fill="none" stroke="rgb(255 255 255 / 0.22)" strokeWidth="1.5" strokeLinejoin="round" />
      <text x={x(3.105)} y={y(36.779)} fontSize="26" fontWeight="700" className="v5-display" fill="var(--ln-dim)" letterSpacing="2">
        Baie d’Alger
      </text>

      {origin && (
        <g transform={`translate(${x(origin.lng)} ${y(origin.lat)})`}>
          <circle r="16" fill="#60a5fa" fillOpacity=".2" />
          <circle r="6" fill="#60a5fa" stroke="var(--ln-bg)" strokeWidth="2" />
          <text x="0" y="-18" textAnchor="middle" fontSize="15" fontWeight="600" fill="#93c5fd">
            You
          </text>
        </g>
      )}

      {points.map((p) => {
        const on = active === p.id;
        const right = x(p.lng) > W - 170;
        return (
          <Link
            key={p.id}
            href={`/v5/pharmacy/${p.id}`}
            onMouseEnter={() => onHover?.(p.id)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(p.id)}
            onBlur={() => onHover?.(null)}
            aria-label={`${p.name}, ${p.commune}`}
          >
            <g transform={`translate(${x(p.lng)} ${y(p.lat)})`}>
              <g data-pin>
                <g style={{ transform: `scale(${on ? 1.35 : 1})`, transition: "transform 200ms var(--ln-ease)" }}>
                  {p.onDuty && <circle r="22" fill="none" stroke="var(--ln-ink)" strokeOpacity=".5" strokeWidth="2" strokeDasharray="4 4" />}
                  <rect x="-13" y="-13" width="26" height="26" rx="8" fill={FILL[p.status]} stroke={p.status === "out" ? "var(--ln-red)" : "none"} strokeWidth="2" />
                  {p.status === "out" ? (
                    <path d="M-6 -6L6 6M6 -6L-6 6" stroke="var(--ln-red)" strokeWidth="2.5" strokeLinecap="round" />
                  ) : (
                    <path d="M-3 -9h6v6h6v6h-6v6h-6v-6h-6v-6h6z" fill="var(--ln-bg)" />
                  )}
                </g>
                <text
                  x={right ? -26 : 26}
                  y="7"
                  textAnchor={right ? "end" : "start"}
                  fontSize="20"
                  fontWeight={on ? 800 : 600}
                  fill="var(--ln-soft)"
                  paintOrder="stroke"
                  stroke="var(--ln-surface)"
                  strokeWidth="6"
                  strokeLinejoin="round"
                >
                  {p.commune}
                </text>
              </g>
            </g>
          </Link>
        );
      })}
    </svg>
  );
}
