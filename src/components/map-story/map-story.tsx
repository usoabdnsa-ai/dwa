"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { GeoJSONSource, Map as MlMap } from "maplibre-gl";
import { ArrowRight, Minus, Phone, Plus, Search } from "lucide-react";
import { getPharmacy, pharmacies } from "@/lib/data";
import { availabilityFor, distanceKm, fmtKm, stockOf } from "@/lib/finder";
import { agoText, type MessageKey, type T } from "@/lib/i18n";
import { useT } from "@/lib/locale";
import { HeroSearch } from "@/components/hero-search";
import { onIntroDone } from "@/lib/intro";
import { mapStyle } from "./map-style";
import { BEATS, INTRO_CAM, ROUTE, ROUTE_LEAD, type BeatId, type Cam } from "./story";

/*
 * The home page is one pinned map of Alger. Scroll position is the only
 * conductor: it picks the beat, the camera is interpolated from that beat's
 * keys, and the same position always gives the same frame, so scrolling back
 * replays the story in reverse. Nothing renders once the scroll settles.
 */

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const ll = (c: [number, number]) => ({ lng: c[0], lat: c[1] });

/** Interpolate two cameras; long hops lift the camera mid-way like a short flight. */
function mix(a: Cam, b: Cam, t: number): Cam {
  const e = smooth(clamp(t));
  const lift = Math.min(2.2, distanceKm(ll(a.center), ll(b.center)) * 0.4) * Math.sin(Math.PI * e);
  return {
    center: [lerp(a.center[0], b.center[0], e), lerp(a.center[1], b.center[1], e)],
    zoom: lerp(a.zoom, b.zoom, e) - lift,
    pitch: clamp(lerp(a.pitch, b.pitch, e) - lift * 8, 0, 60),
    bearing: lerp(a.bearing, b.bearing, e),
  };
}

const endCam = (i: number) => BEATS[i].keys[BEATS[i].keys.length - 1].cam;

function camAt(i: number, u: number): Cam {
  let prev = i === 0 ? BEATS[0].keys[0].cam : endCam(i - 1);
  let prevAt = 0;
  for (const k of BEATS[i].keys) {
    if (k.at === 0) {
      prev = k.cam;
      continue;
    }
    if (u <= k.at) return mix(prev, k.cam, (u - prevAt) / (k.at - prevAt));
    prev = k.cam;
    prevAt = k.at;
  }
  return prev;
}

// The old route: one straight leg per stop, each leg drawn while the camera flies it.
const ROUTE_PTS = ROUTE.map((s) => {
  const p = getPharmacy(s.id)!;
  return [p.lng, p.lat] as [number, number];
});
const LEGS = ROUTE_PTS.length - 1;
const routeT = (u: number) => clamp((u - ROUTE_LEAD) / (1 - ROUTE_LEAD));

function routeGeo(t: number): GeoJSON.FeatureCollection {
  const done = Math.min(LEGS, Math.floor(t * LEGS));
  const f = t * LEGS - done;
  const coords = ROUTE_PTS.slice(0, done + 1);
  if (done < LEGS && t > 0) {
    const [a, b] = [ROUTE_PTS[done], ROUTE_PTS[done + 1]];
    coords.push([lerp(a[0], b[0], f), lerp(a[1], b[1], f)]);
  }
  const head = coords[coords.length - 1];
  return {
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords.length > 1 ? coords : [head, head] } },
      { type: "Feature", properties: {}, geometry: { type: "Point", coordinates: head } },
    ],
  };
}

/** Discrete story state. Changes a few dozen times per full scroll, so it lives in React. */
type Phase = { beat: number; stops: number; typed: number; found: boolean; ticked: boolean };

function phaseOf(beat: number, u: number): Phase {
  const id = BEATS[beat].id;
  const order = BEATS.findIndex((b) => b.id === "newrule");
  return {
    beat,
    stops: id === "oldway" ? ROUTE.filter((_, k) => u >= ROUTE_LEAD * 0.8 + ((1 - ROUTE_LEAD) * k) / LEGS - 0.001).length : 0,
    typed: id === "newrule" ? Math.round(clamp(u / 0.3) * QUERY.length) : beat > order ? QUERY.length : 0,
    found: (id === "newrule" && u >= 0.32) || beat > order,
    ticked: id === "pharmacist" && u >= 0.7,
  };
}

const samePhase = (a: Phase, b: Phase) =>
  a.beat === b.beat && a.stops === b.stops && a.typed === b.typed && a.found === b.found && a.ticked === b.ticked;

type PinState = "idle" | "dim" | "out" | "found" | "duty" | "self" | "hidden";

const ANSWER_KEY: Record<string, MessageKey> = {
  meziane: "home.ans.meziane",
  belouizdad: "home.ans.belouizdad",
  "bmr-colonne": "home.ans.bmr",
  "hydra-pins": "home.ans.hydra",
  "kouba-garidi": "home.ans.kouba",
};

function pinView(id: string, phase: Phase, t: T): { state: PinState; label?: string; sub?: string } {
  const p = getPharmacy(id)!;
  const bare = p.name.replace("Pharmacie ", "");
  const short = bare[0].toUpperCase() + bare.slice(1);
  switch (BEATS[phase.beat].id) {
    case "oldway": {
      const k = ROUTE.findIndex((s) => s.id === id);
      if (k < 0) return { state: "dim" };
      if (k >= phase.stops) return { state: "idle" };
      const stop = ROUTE[k];
      return { state: k === ROUTE.length - 1 ? "found" : "out", label: short, sub: t("home.stop", { mins: stop.mins, answer: ANSWER_KEY[stop.id] ? t(ANSWER_KEY[stop.id]) : stop.answer }) };
    }
    case "newrule":
      if (!phase.found) return { state: "idle" };
      return id === GARIDI ? { state: "found", label: short, sub: t("home.left", { n: garidi.item?.qty ?? 0 }) } : { state: "out" };
    case "mechanism":
      return { state: id === GARIDI ? "found" : "dim" };
    case "night":
      return p.onDuty ? { state: "duty", label: short, sub: p.commune } : { state: "hidden" };
    case "pharmacist":
      return { state: id === "meziane" ? "self" : "dim" };
    default:
      return { state: "idle" };
  }
}

const QUERY = "Ventoline";
const GARIDI = "kouba-garidi";
const garidi = availabilityFor("ventoline-100").find((a) => a.pharmacy.id === GARIDI)!;
const outCount = availabilityFor("ventoline-100").filter((a) => a.status === "out").length;
const onDuty = pharmacies.filter((p) => p.onDuty);
const mezianeShelf = stockOf("meziane")
  .filter((s) => s.qty > 5)
  .slice(0, 4);

/** Plain mercator for the no-WebGL poster: the whole city, no tilt. */
function posterProject(w: number, h: number) {
  const merc = ([lng, lat]: [number, number]) => {
    const s = Math.sin((lat * Math.PI) / 180);
    return [(lng + 180) / 360, 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)];
  };
  const pts = pharmacies.map((p) => merc([p.lng, p.lat]));
  const [x0, x1] = [Math.min(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[0]))];
  const [y0, y1] = [Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[1]))];
  const wide = w >= 1024;
  const rtl = document.documentElement.dir === "rtl";
  const box = wide
    ? rtl
      ? { l: w * 0.08, r: w * 0.52, t: h * 0.25, b: h * 0.75 }
      : { l: w * 0.48, r: w * 0.92, t: h * 0.25, b: h * 0.75 }
    : { l: w * 0.12, r: w * 0.88, t: h * 0.14, b: h * 0.5 };
  const k = Math.min((box.r - box.l) / (x1 - x0), (box.b - box.t) / (y1 - y0));
  return (c: [number, number]) => {
    const [x, y] = merc(c);
    return { x: box.l + (x - x0) * k, y: box.t + (y - y0) * k };
  };
}

export function MapStory() {
  const { t } = useT();
  const rootRef = useRef<HTMLElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const pinsRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>({ beat: 0, stops: 0, typed: 0, found: false, ticked: false });
  const [mode, setMode] = useState<"loading" | "map" | "poster">("loading");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let map: MlMap | null = null;
    let disposed = false;
    let ranges: { start: number; end: number }[] = [];
    let target = 0;
    let current = 0;
    let raf = 0;
    let intro = reduced ? 1 : 0;
    let lastPhase: Phase = { beat: 0, stops: 0, typed: 0, found: false, ticked: false };
    let routeOpacity = -1;
    let project: (c: [number, number]) => { x: number; y: number } = () => ({ x: -999, y: -999 });

    const measure = () => {
      const vh = window.innerHeight;
      const max = root.offsetHeight - vh;
      const beats = Array.from(root.querySelectorAll<HTMLElement>("[data-beat]"));
      ranges = beats.map((el, i) => ({
        start: i === 0 ? 0 : Math.max(0, el.offsetTop - vh * 0.5),
        end: i === beats.length - 1 ? max : el.offsetTop + el.offsetHeight - vh * 0.5,
      }));
    };

    const locate = (s: number) => {
      let i = 0;
      while (i < ranges.length - 1 && s >= ranges[i + 1].start) i++;
      const r = ranges[i] ?? { start: 0, end: 1 };
      const u = clamp((s - r.start) / Math.max(1, r.end - r.start));
      // Reduced motion: each beat shows its finished state, with no in-between frames.
      return { i, u: reduced ? 1 : u };
    };

    const padding = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // The copy column sits on the reading side: left in English and French, right in Arabic.
      const rtl = document.documentElement.dir === "rtl";
      const column = Math.min(560, w * 0.4);
      return w >= 1024
        ? { left: rtl ? 40 : column, top: 80, right: rtl ? column : 40, bottom: 40 }
        : { left: 0, right: 0, top: 70, bottom: h * 0.42 };
    };

    const place = (el: HTMLElement | null, c: [number, number]) => {
      if (!el) return;
      const p = project(c);
      el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
    };

    const apply = (s: number) => {
      if (!ranges.length) return;
      const { i, u } = locate(s);
      const id: BeatId = BEATS[i].id;

      if (map) {
        const cam = intro < 1 ? mix(INTRO_CAM, camAt(i, u), intro) : camAt(i, u);
        // Narrow screens see less of the city at the same zoom, so pull back to keep the same pins in frame.
        const narrow = Math.max(0, Math.log2(1024 / Math.max(window.innerWidth, 360)) * 0.6);
        map.jumpTo({ ...cam, zoom: cam.zoom - narrow, padding: padding() });

        const src = map.getSource("route") as GeoJSONSource | undefined;
        if (src) {
          const op = id === "oldway" ? 1 : id === "newrule" ? 1 - clamp(u / 0.25) : 0;
          if (op !== routeOpacity) {
            map.setPaintProperty("route-line", "line-opacity", op);
            map.setPaintProperty("route-head", "circle-opacity", op);
            routeOpacity = op;
          }
          if (id === "oldway") src.setData(routeGeo(routeT(u)));
        }
      }

      const flipAt = window.innerWidth - 190;
      pinsRef.current?.querySelectorAll<HTMLElement>("[data-pin]").forEach((el) => {
        const p = getPharmacy(el.dataset.pin!)!;
        place(el, [p.lng, p.lat]);
        // Labels near the right edge open to the left instead of getting clipped.
        const flip = project([p.lng, p.lat]).x > flipAt ? "1" : "";
        if (el.dataset.flip !== flip) el.dataset.flip = flip;
      });
      place(cardRef.current, [garidi.pharmacy.lng, garidi.pharmacy.lat]);
      const mz = getPharmacy("meziane")!;
      place(shelfRef.current, [mz.lng, mz.lat]);

      const fade = (el: HTMLElement | null, v: number) => {
        if (el) el.style.opacity = clamp(v).toFixed(3);
      };
      fade(cardRef.current, id === "mechanism" ? (u - 0.35) / 0.15 : id === "night" ? 1 - u / 0.15 : 0);
      fade(shelfRef.current, id === "pharmacist" ? (u - 0.4) / 0.2 : id === "action" ? 1 - u / 0.15 : 0);
      fade(queryRef.current, id === "newrule" ? u / 0.08 : id === "mechanism" ? 1 - u / 0.2 : 0);
      fade(veilRef.current, id === "night" ? (u / 0.3) * 0.55 : id === "pharmacist" ? 0.55 * (1 - u / 0.3) : 0);

      const next = phaseOf(i, u);
      if (!samePhase(next, lastPhase)) {
        lastPhase = next;
        setPhase(next);
      }
    };

    // Ease the rendered position toward the scroll position, then stop. Time-based so a
    // slow phone settles as fast as a fast one; a big jump (Home key, link) skips ahead.
    let last = 0;
    // Adaptive quality: if the camera can't hold ~40 fps while moving, drop the map to
    // 1x resolution once. Fast machines never notice; slow ones stop stuttering.
    let slowAvg = 0;
    let slowFrames = 0;
    let downgraded = false;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - (last || now)) / 1000);
      last = now;
      if (map && !downgraded && dt > 0) {
        slowAvg = slowAvg ? slowAvg * 0.9 + dt * 0.1 : dt;
        if (++slowFrames > 20 && slowAvg > 0.025 && map.getPixelRatio() > 1) {
          map.setPixelRatio(1);
          downgraded = true;
        }
      }
      const vh = window.innerHeight;
      let d = target - current;
      if (Math.abs(d) > vh * 1.5) {
        current = target - Math.sign(d) * vh * 1.5;
        d = target - current;
      }
      current = Math.abs(d) < 0.5 || reduced ? target : current + d * (1 - Math.exp(-dt / 0.11));
      apply(current);
      if (current === target) {
        raf = 0;
        last = 0;
      } else raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const st = ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      onRefresh: (self) => {
        measure();
        target = current = self.scroll() - self.start;
        apply(current);
      },
      onUpdate: (self) => {
        target = clamp(self.scroll() - self.start, 0, self.end - self.start);
        kick();
      },
    });
    measure();

    const startPoster = () => {
      const make = () => {
        const proj = posterProject(window.innerWidth, window.innerHeight);
        project = proj;
      };
      make();
      window.addEventListener("resize", make);
      setMode("poster");
      apply(current);
      return () => window.removeEventListener("resize", make);
    };

    let cleanupPoster: (() => void) | undefined;
    let stopWaiting: (() => void) | undefined;
    let flyIn: gsap.core.Tween | undefined;
    (async () => {
      const ml = (await import("maplibre-gl")).default;
      if (disposed) return;
      try {
        const start = intro < 1 ? INTRO_CAM : camAt(0, 0);
        map = new ml.Map({
          container: mapRef.current!,
          style: mapStyle,
          ...start,
          interactive: false,
          maxPitch: 60,
          // The camera redraws the whole 3D city on every scroll frame: cap the resolution
          // and skip MSAA so it keeps up on ordinary laptops and phones.
          pixelRatio: Math.min(window.devicePixelRatio, 1.5),
          fadeDuration: 0,
          attributionControl: { compact: true },
          canvasContextAttributes: { antialias: false },
        });
      } catch {
        cleanupPoster = startPoster();
        return;
      }
      const m = map;
      project = (c) => m.project(c);
      m.on("resize", () => apply(current));
      m.once("load", () => {
        m.addSource("route", { type: "geojson", data: routeGeo(0) });
        m.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#ff8a7a", "line-width": 3.5, "line-dasharray": [0.2, 2], "line-opacity": 0 },
        });
        m.addLayer({
          id: "route-head",
          type: "circle",
          source: "route",
          filter: ["==", ["geometry-type"], "Point"],
          paint: { "circle-radius": 6, "circle-color": "#ff8a7a", "circle-stroke-color": "#061519", "circle-stroke-width": 3, "circle-opacity": 0 },
        });
        routeOpacity = -1;
        // Start the map credit collapsed to its (i) button; the footer carries it in full.
        const attrib = m.getContainer().querySelector(".maplibregl-ctrl-attrib");
        attrib?.classList.remove("maplibregl-compact-show");
        attrib?.removeAttribute("open");
        setMode("map");
        // Hold the camera high above the bay until the LED intro hands over, then fly in.
        stopWaiting = onIntroDone(() => {
          if (disposed) return;
          if (intro < 1 && current < 10) {
            const o = { t: 0 };
            flyIn = gsap.to(o, {
              t: 1,
              duration: 2.6,
              ease: "power2.inOut",
              onUpdate: () => {
                intro = o.t;
                apply(current);
              },
            });
          } else {
            intro = 1;
            apply(current);
          }
        });
        apply(current);
      });
      apply(current);
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      st.kill();
      cleanupPoster?.();
      stopWaiting?.();
      flyIn?.kill();
      map?.remove();
    };
  }, []);

  const beat = BEATS[phase.beat].id;

  return (
    <section ref={rootRef} className="relative bg-dusk text-dusk-ink" data-beat-now={beat}>
      {/* The stage: one pinned viewport holding the map and everything drawn on it. */}
      <div className="sticky top-0 h-svh overflow-hidden" aria-hidden>
        {/* MapLibre forces position:relative on its container, so it gets a sized wrapper. */}
        <div className="absolute inset-0">
          <div ref={mapRef} className="h-full w-full" />
        </div>
        {mode === "poster" && <div className="poster-grid absolute inset-0" />}
        <div ref={veilRef} className="pointer-events-none absolute inset-0 bg-[#02090c] opacity-0" />
        <div className="stage-vignette pointer-events-none absolute inset-0" />

        <div ref={pinsRef} className="pointer-events-none absolute inset-0" data-ready={mode !== "loading"}>
          {pharmacies.map((p, n) => {
            const v = pinView(p.id, phase, t);
            return (
              <div key={p.id} data-pin={p.id} className="pin" style={{ ["--n" as string]: n }}>
                <div className="pin-inner" data-state={v.state}>
                  <span className="pin-ring" />
                  <svg viewBox="0 0 32 32" className="pin-cross">
                    <path d="M12 3h8v8h8v8h-8v8h-8v-8H4v-8h8z" fill="currentColor" />
                  </svg>
                  {v.label && (
                    <span className="pin-label">
                      <b>{v.label}</b>
                      {v.sub && <span>{v.sub}</span>}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ventoline at Garidi, the answer the search finds. */}
        <div ref={cardRef} className="pointer-events-none absolute top-0 left-0 opacity-0">
          <div className="night-card absolute bottom-7 left-0 w-64 -translate-x-1/2 p-4 sm:w-72 lg:left-5 lg:translate-x-0">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-lg font-bold">{QUERY}</p>
              <span className="rounded-full bg-[#f2b35b] px-2.5 py-0.5 text-xs font-semibold text-[#06241f]">
                {t("home.left", { n: garidi.item?.qty ?? 0 })}
              </span>
            </div>
            <p className="text-xs text-dusk-muted">{t("home.cardMeta")}</p>
            <div className="mt-3 border-t border-white/10 pt-3 text-sm">
              <p className="font-semibold">{garidi.pharmacy.name}</p>
              <p className="text-dusk-muted">
                {t("home.counted", { ago: agoText(t, garidi.item?.updatedMinsAgo ?? 0), who: garidi.pharmacy.pharmacist })}
              </p>
              <p className="mt-2 flex items-center gap-2 text-dusk-mint">
                <Phone className="size-3.5" /> {garidi.pharmacy.phone.replace("+213 ", "0")} · {fmtKm(garidi.km)}
              </p>
            </div>
          </div>
        </div>

        {/* Meziane's own shelf, as the pharmacist sees it. */}
        <div ref={shelfRef} className="pointer-events-none absolute top-0 left-0 opacity-0">
          <div className="night-card absolute bottom-7 left-0 w-64 -translate-x-1/2 p-4 sm:w-72 lg:left-5 lg:translate-x-0">
            <p className="flex items-center justify-between text-sm font-semibold">
              {t("home.shelf")}
              <span className="text-xs font-normal text-dusk-muted">{phase.ticked ? t("home.updatedNow") : t("home.behind")}</span>
            </p>
            <ul className="mt-2 divide-y divide-white/10 text-sm">
              {mezianeShelf.map((s, k) => {
                const qty = k === 0 && phase.ticked ? s.qty - 1 : s.qty;
                return (
                  <li key={s.medicineId} className="flex items-center justify-between gap-2 py-2">
                    <span className="truncate">
                      {s.medicine.name} <span className="text-dusk-muted">{s.medicine.dosage}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className={`grid size-6 place-items-center rounded-md ring-1 ring-white/15 ${k === 0 && phase.ticked ? "bg-[#7ae8c8] text-[#06241f]" : ""}`}>
                        <Minus className="size-3" />
                      </span>
                      <span className={`nums w-7 text-center font-semibold ${k === 0 && phase.ticked ? "qty-tick" : ""}`} key={qty}>
                        {qty}
                      </span>
                      <span className="grid size-6 place-items-center rounded-md ring-1 ring-white/15">
                        <Plus className="size-3" />
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* The search being typed, floating over the city. */}
        <div ref={queryRef} className="absolute top-24 left-1/2 w-[min(88vw,26rem)] -translate-x-1/2 opacity-0 lg:left-[70%]">
          <div className="night-card flex items-center gap-3 px-4 py-3">
            <Search className="size-4 text-dusk-muted" />
            <span className="flex-1 font-medium">
              {QUERY.slice(0, phase.typed)}
              <span className="caret" />
            </span>
            {phase.found && <span className="text-sm text-dusk-mint">{t("home.found", { n: pharmacies.length })}</span>}
          </div>
        </div>
      </div>

      {/* The chapters scroll over the stage. Their heights set the pace of the story. */}
      <div className="relative -mt-[100svh]">
        {BEATS.map((b) => (
          <article key={b.id} data-beat={b.id} style={{ height: `${b.weight * 100}svh` }} className={`relative ${b.id === "hook" ? "" : "pb-[38svh]"}`}>
            {b.id === "hook" ? <Hook /> : <Chapter id={b.id} />}
          </article>
        ))}
      </div>
    </section>
  );
}

const gutter = "px-4 sm:px-6 lg:ps-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]";

function Hook() {
  const { t } = useT();
  return (
    <div className={`sticky top-0 flex min-h-svh flex-col justify-end pt-28 pb-10 lg:justify-center lg:pb-0 ${gutter}`}>
      <div className="max-w-xl">
        <p className="flex items-center gap-2 text-sm font-medium text-dusk-mint">
          <span className="live-dot" /> {t("home.live", { n: pharmacies.length })}
        </p>
        <h1 className="mt-5 font-display text-[2.75rem] leading-[1.02] font-extrabold tracking-tight text-balance sm:text-7xl">
          {t("home.title")}
        </h1>
        <p className="mt-5 max-w-[42ch] text-lg leading-relaxed text-dusk-muted">
          {t("home.lede")}
        </p>
        <div className="mt-8">
          <HeroSearch tone="dark" />
        </div>
      </div>
    </div>
  );
}

type ChapterCopy = { tag: string; tagClass?: string; title: string; body: ReactNode; link?: { href: string; label: string } };

function chapterCopy(id: Exclude<BeatId, "hook">, t: T, intl: string): ChapterCopy {
  switch (id) {
    case "oldway":
      return { tag: t("ch.oldway.tag"), tagClass: "text-[#ff8a7a]", title: t("ch.oldway.title"), body: t("ch.oldway.body") };
    case "newrule":
      return {
        tag: t("ch.newrule.tag"),
        title: t("ch.newrule.title"),
        body: t("ch.newrule.body", { out: outCount, query: QUERY, name: garidi.pharmacy.name, commune: garidi.pharmacy.commune, n: garidi.item?.qty ?? 0 }),
      };
    case "mechanism":
      return {
        tag: t("ch.mechanism.tag"),
        title: t("ch.mechanism.title", { ago: agoText(t, garidi.item?.updatedMinsAgo ?? 0) }),
        body: t("ch.mechanism.body"),
        link: { href: `/pharmacy/${GARIDI}`, label: t("ch.mechanism.link", { name: garidi.pharmacy.name }) },
      };
    case "night":
      return {
        tag: t("ch.night.tag"),
        title: t("ch.night.title", { n: onDuty.length }),
        body: t("ch.night.body", { list: new Intl.ListFormat(intl, { type: "conjunction" }).format(onDuty.map((p) => p.commune)) }),
        link: { href: "/search?garde=1", label: t("ch.night.link") },
      };
    case "pharmacist":
      return { tag: t("ch.pharmacist.tag"), title: t("ch.pharmacist.title"), body: t("ch.pharmacist.body"), link: { href: "/login", label: t("ch.pharmacist.link") } };
    default:
      return { tag: t("ch.action.tag"), title: t("ch.action.title"), body: t("ch.action.body") };
  }
}

function Chapter({ id }: { id: Exclude<BeatId, "hook"> }) {
  const { t, intl } = useT();
  const c = chapterCopy(id, t, intl);
  return (
    <div className={`sticky top-[56svh] lg:top-[30svh] ${gutter}`}>
      <div className={`night-card max-w-md p-6 ${id === "action" ? "lg:max-w-lg" : ""}`}>
        <p className={`text-xs font-semibold tracking-[0.14em] uppercase ${c.tagClass ?? "text-dusk-mint"}`}>{c.tag}</p>
        <h2 className="mt-3 font-display text-3xl leading-[1.08] font-bold tracking-tight text-balance sm:text-4xl">{c.title}</h2>
        <p className="mt-3 leading-relaxed text-dusk-muted">{c.body}</p>
        {c.link && (
          <Link href={c.link.href} className="mt-5 inline-flex items-center gap-1.5 font-semibold text-dusk-mint hover:underline">
            {c.link.label} <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        )}
        {id === "action" && (
          <div className="mt-6">
            <HeroSearch tone="dark" />
          </div>
        )}
      </div>
    </div>
  );
}
