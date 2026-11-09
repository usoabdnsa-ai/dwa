"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as MlMap, Marker } from "maplibre-gl";
import { ArrowRight, LocateFixed, Moon, Navigation, X } from "lucide-react";
import { buildStyle } from "@/components/map-story/map-style";
import { pharmacies, type Pharmacy } from "@/lib/data";
import { algiersMinutes, DEFAULT_ORIGIN, distanceKm, fmtKm, fmtTime, isOpen } from "@/lib/finder";
import { useNow } from "@/lib/use-now";

/*
 * v8 map: every pharmacy in Alger on a pearl-and-lilac map, coloured by
 * whether it is open right now (Algiers time, refreshed every 30 s).
 * The list and the pins are one selection: hover a row to find its pin,
 * pick either to fly there and open its card.
 */

/* Lilac land, periwinkle sea, mint parks: white roads read as the city's lines, buildings deepen with height. */
const BASE = buildStyle({
  land: "#e4e2f3",
  sea: "#bcc3f2",
  park: "#c6e8d6",
  roadMinor: "#f4f3fc",
  roadMid: "#ffffff",
  roadMajor: "#ffffff",
  label: "#4f5378",
  halo: "#e4e2f3",
  buildings: ["#d6d2ef", "#c4bdeb", "#aba1e3"],
});
const STYLE: typeof BASE = {
  ...BASE,
  // soft lilac haze on the horizon when the map tilts
  sky: {
    "sky-color": "#c9cdf5",
    "horizon-color": "#f1ecff",
    "fog-color": "#e4e2f3",
    "sky-horizon-blend": 0.6,
    "horizon-fog-blend": 0.6,
    "fog-ground-blend": 0.35,
    "atmosphere-blend": 0.8,
  },
};

export type OpenState = "duty" | "open" | "closing" | "closed";
type Filter = "all" | "open" | "duty";

export function openState(p: Pharmacy, mins: number): OpenState {
  if (p.onDuty) return "duty";
  if (!isOpen(p, mins)) return "closed";
  return p.closes < 1440 && p.closes - mins <= 60 ? "closing" : "open";
}

export function openLine(p: Pharmacy, mins: number) {
  const s = openState(p, mins);
  if (s === "duty") return "On duty, open all night";
  if (p.opens === 0 && p.closes === 1440) return "Open 24/7";
  if (s === "closing") return `Closes soon · ${fmtTime(p.closes)}`;
  if (s === "open") return `Open · closes ${fmtTime(p.closes)}`;
  return mins < p.opens ? `Closed · opens ${fmtTime(p.opens)}` : `Closed · opens ${fmtTime(p.opens)} tomorrow`;
}

const LABEL: Record<OpenState, string> = { duty: "On duty", open: "Open", closing: "Closing soon", closed: "Closed" };

export function OpenMap({ className = "" }: { className?: string }) {
  const now = useNow();
  const mins = now ? algiersMinutes(now) : null;
  const [filter, setFilter] = useState<Filter>("all");
  const [sel, setSel] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const pins = useRef(new Map<string, { marker: Marker; el: HTMLDivElement }>());

  const rows = useMemo(
    () =>
      pharmacies
        .map((p) => ({ p, km: distanceKm(DEFAULT_ORIGIN, p), state: mins === null ? null : openState(p, mins) }))
        .sort((a, b) => rank(a.state) - rank(b.state) || a.km - b.km),
    [mins],
  );
  const shown = rows.filter((r) => filter === "all" || (filter === "duty" ? r.state === "duty" : r.state !== null && r.state !== "closed"));
  const counts = { all: rows.length, open: rows.filter((r) => r.state && r.state !== "closed").length, duty: rows.filter((r) => r.state === "duty").length };
  const picked = sel ? rows.find((r) => r.p.id === sel) : undefined;

  /* map + markers, built once */
  useEffect(() => {
    let dead = false;
    const markers = pins.current;
    import("maplibre-gl").then(({ default: ml }) => {
      if (dead || !box.current) return;
      const map = new ml.Map({
        container: box.current,
        style: STYLE,
        center: [3.06, 36.75],
        zoom: 11.4,
        pitch: 38,
        bearing: -12,
        cooperativeGestures: true,
        dragRotate: false,
        pitchWithRotate: false,
        pixelRatio: Math.min(devicePixelRatio, 2),
        attributionControl: { compact: true },
      });
      if (innerWidth >= 640) map.addControl(new ml.NavigationControl({ showCompass: false }), "top-right"); // phones pinch
      mapRef.current = map;

      const you = document.createElement("div");
      you.className = "m8-you";
      you.innerHTML = "<span></span>";
      you.setAttribute("aria-label", `You, ${DEFAULT_ORIGIN.label}`);
      new ml.Marker({ element: you }).setLngLat([DEFAULT_ORIGIN.lng, DEFAULT_ORIGIN.lat]).addTo(map);

      for (const p of pharmacies) {
        const el = document.createElement("div");
        el.className = "m8-pin";
        el.innerHTML = `<button type="button"><span class="m8-ring"></span><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12 3h8v8h8v8h-8v8h-8v-8H4v-8h8z" fill="currentColor"/></svg></button><span class="m8-tag"></span>`;
        el.querySelector(".m8-tag")!.textContent = p.name.replace(/^Pharmacie\s+/, "");
        const btn = el.querySelector("button")!;
        btn.addEventListener("click", () => setSel(p.id));
        btn.addEventListener("mouseenter", () => setHover(p.id));
        btn.addEventListener("mouseleave", () => setHover(null));
        markers.set(p.id, { marker: new ml.Marker({ element: el, anchor: "bottom" }).setLngLat([p.lng, p.lat]).addTo(map), el });
      }
      const b = new ml.LngLatBounds([DEFAULT_ORIGIN.lng, DEFAULT_ORIGIN.lat], [DEFAULT_ORIGIN.lng, DEFAULT_ORIGIN.lat]);
      pharmacies.forEach((p) => b.extend([p.lng, p.lat]));
      map.fitBounds(b, { padding: { top: 64, bottom: 28, left: 28, right: 28 }, pitch: 22, bearing: -12, duration: 0 }); // flatter overview: more city, less open sea
      map.once("load", () => setReady(true));
    });
    return () => {
      dead = true;
      markers.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  /* keep each pin's state, filter, hover and selection in sync */
  useEffect(() => {
    for (const r of rows) {
      const pin = pins.current.get(r.p.id);
      if (!pin) continue;
      const { el } = pin;
      el.dataset.state = r.state ?? "unknown";
      el.toggleAttribute("data-hidden", !shown.some((s) => s.p.id === r.p.id));
      el.toggleAttribute("data-on", sel === r.p.id);
      el.toggleAttribute("data-hover", hover === r.p.id);
      el.querySelector("button")!.setAttribute("aria-label", `${r.p.name}, ${mins === null ? "checking hours" : openLine(r.p, mins)}`);
      el.style.zIndex = sel === r.p.id ? "3" : hover === r.p.id ? "2" : "";
    }
  });

  /* fly to the picked pharmacy */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !picked) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const to = { center: [picked.p.lng, picked.p.lat] as [number, number], zoom: 14.3, pitch: 45, offset: [0, -70] as [number, number] };
    if (still) map.jumpTo(to);
    else map.flyTo({ ...to, duration: 1400, curve: 1.5, essential: true });
  }, [picked]);

  const recentre = () => {
    const map = mapRef.current;
    if (!map) return;
    setSel(null);
    import("maplibre-gl").then(({ default: ml }) => {
      const b = new ml.LngLatBounds([DEFAULT_ORIGIN.lng, DEFAULT_ORIGIN.lat], [DEFAULT_ORIGIN.lng, DEFAULT_ORIGIN.lat]);
      shown.forEach((r) => b.extend([r.p.lng, r.p.lat]));
      map.fitBounds(b, { padding: { top: 64, bottom: 28, left: 28, right: 28 }, pitch: 22, bearing: -12, maxZoom: 14, duration: 1100 });
    });
  };

  return (
    <div className={`card card-solid grid overflow-hidden lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] ${className}`}>
      {/* list */}
      <div className="order-2 flex min-h-0 flex-col border-(--l-line) bg-[linear-gradient(180deg,#f6f5fd,#efeefb)] p-3 lg:order-1 lg:max-h-[620px] lg:border-e">
        <div className="flex items-center justify-between gap-2 px-2 pt-2 pb-3">
          <div role="radiogroup" aria-label="Show" className="flex gap-1 rounded-full bg-(--l-sunk) p-1">
            {(["all", "open", "duty"] as const).map((f) => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={filter === f}
                onClick={() => (setFilter(f), setSel(null))}
                className={`h-8 rounded-full px-3 text-[13px] font-medium transition-[background-color,color,box-shadow] duration-200 ${filter === f ? "bg-white text-(--l-ink) shadow-[0_1px_2px_rgb(18_19_28/0.08),0_0_0_1px_var(--l-line)]" : "text-(--l-muted) hover:text-(--l-ink)"}`}
              >
                {f === "all" ? "All" : f === "open" ? "Open now" : "On duty"} <span className="nums opacity-60">{mins === null ? "" : counts[f]}</span>
              </button>
            ))}
          </div>
          <span className="mono shrink-0 text-[12px] text-(--l-faint) nums" title="Algiers time">
            {mins === null ? "--:--" : fmtTime(mins)}
          </span>
        </div>
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pe-1">
          {shown.map(({ p, km, state }) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSel(p.id)}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                aria-pressed={sel === p.id}
                className={`flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-start transition-[background-color,box-shadow] duration-200 ${sel === p.id ? "bg-(--l-lilac-soft) shadow-[inset_0_0_0_1px_rgb(91_72_217/0.2)]" : hover === p.id ? "bg-white/80" : ""}`}
              >
                <span className="m8-dot shrink-0" data-state={state ?? "unknown"} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{p.name}</span>
                  <span className={`block truncate text-[13px] ${state === "closed" ? "text-(--l-faint)" : state === "duty" ? "text-(--l-lilac)" : state === "closing" ? "text-(--l-low)" : "text-(--l-in)"}`}>
                    {mins === null ? "Checking hours…" : openLine(p, mins)}
                  </span>
                </span>
                <span className="shrink-0 text-[12.5px] text-(--l-faint) nums">{fmtKm(km)}</span>
              </button>
            </li>
          ))}
          {shown.length === 0 && <li className="px-3 py-8 text-center text-[14px] text-(--l-muted)">Nothing matches right now.</li>}
        </ul>
      </div>

      {/* map */}
      <div className="relative order-1 h-[420px] bg-[#e4e2f3] lg:order-2 lg:h-[620px]">
        <div ref={box} className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`} />
        {!ready && <div className="absolute inset-0 grid place-items-center text-[14px] text-(--l-faint)">Loading the map of Alger…</div>}

        <div className="frost pointer-events-none absolute start-3 top-3 me-16 flex flex-wrap gap-x-3 gap-y-1 rounded-full px-3.5 py-2 text-[12.5px] text-(--l-muted)">
          {(["open", "closing", "duty", "closed"] as const).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span className="m8-dot m8-dot-sm" data-state={s} aria-hidden /> {LABEL[s]}
            </span>
          ))}
        </div>
        <button type="button" onClick={recentre} className="frost absolute end-3 top-3 grid size-10 sm:top-[86px] place-items-center rounded-full text-(--l-ink)" aria-label="Show all pharmacies">
          <LocateFixed className="size-[18px]" aria-hidden />
        </button>

        {picked && mins !== null && (
          <div key={picked.p.id} className="m8-card frost absolute inset-x-3 bottom-3 rounded-[24px] p-4 sm:end-auto sm:w-[22rem] sm:p-5" role="dialog" aria-label={picked.p.name}>
            <button type="button" onClick={() => setSel(null)} className="absolute end-3 top-3 grid size-8 place-items-center rounded-full text-(--l-muted) hover:bg-white" aria-label="Close">
              <X className="size-4" aria-hidden />
            </button>
            <p className="flex items-center gap-2 text-[13px] font-medium">
              <span className="m8-dot m8-dot-sm" data-state={picked.state ?? "unknown"} aria-hidden />
              <span className={picked.state === "closed" ? "text-(--l-faint)" : picked.state === "duty" ? "text-(--l-lilac)" : picked.state === "closing" ? "text-(--l-low)" : "text-(--l-in)"}>
                {picked.state === "duty" && <Moon className="me-1 inline size-3.5 align-[-2px]" aria-hidden />}
                {openLine(picked.p, mins)}
              </span>
            </p>
            <p className="mt-2 pe-8 text-[20px] font-semibold leading-tight">{picked.p.name}</p>
            <p className="mt-1 text-[13.5px] text-(--l-muted)">
              {picked.p.address}, {picked.p.commune} · <span className="nums">{fmtKm(picked.km)}</span>
            </p>
            {picked.state !== "duty" && !(picked.p.opens === 0 && picked.p.closes === 1440) && <DayBar p={picked.p} mins={mins} />}
            <div className="mt-4 flex gap-2">
              <Link href={`/v8/pharmacy/${picked.p.id}`} className="btn btn-ink btn-sm flex-1">
                See the shelf <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a href={`https://www.openstreetmap.org/directions?route=${DEFAULT_ORIGIN.lat},${DEFAULT_ORIGIN.lng};${picked.p.lat},${picked.p.lng}`} target="_blank" rel="noreferrer" className="btn btn-soft btn-sm">
                <Navigation className="size-4" aria-hidden /> Go
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Today's opening hours as a bar, with a tick at now. */
function DayBar({ p, mins }: { p: Pharmacy; mins: number }) {
  const pct = (m: number) => `${(m / 1440) * 100}%`;
  return (
    <div className="mt-4" role="img" aria-label={`Open ${fmtTime(p.opens)} to ${fmtTime(p.closes)}`}>
      <div className="relative h-2 rounded-full bg-(--l-sunk)">
        <span className="absolute inset-y-0 rounded-full bg-(--l-in-soft) shadow-[inset_0_0_0_1px_rgb(11_122_85/0.25)]" style={{ left: pct(p.opens), width: pct(p.closes - p.opens) }} />
        <span className="absolute -inset-y-1 w-0.5 rounded bg-(--l-ink)" style={{ left: pct(mins) }} />
      </div>
      <div className="mono mt-1.5 flex justify-between text-[11px] text-(--l-faint) nums" aria-hidden>
        <span>00:00</span>
        <span>12:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
}

function rank(s: OpenState | null) {
  return s === "duty" ? 0 : s === "open" ? 1 : s === "closing" ? 2 : 3;
}
