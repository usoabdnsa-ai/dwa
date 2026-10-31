"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";
import type { Status } from "@/lib/finder";
import { dayStyle } from "./map-story/map-style";

export type MapPoint = { id: string; name: string; lat: number; lng: number; status: Status | "none"; onDuty: boolean };

/* Same cross glyph as the home's night pins; out of stock turns it into an X. */
const CROSS = '<svg viewBox="0 0 32 32" class="dpin-cross" aria-hidden="true"><path d="M12 3h8v8h8v8h-8v8h-8v-8H4v-8h8z" fill="currentColor"/></svg>';

function pinEl(p: MapPoint, onSelect?: (id: string) => void) {
  const el = document.createElement("div");
  el.className = "dpin";
  el.dataset.id = p.id;
  el.dataset.status = p.status;
  if (p.onDuty) el.dataset.duty = "1";
  el.innerHTML = `<button type="button" class="dpin-inner">${p.onDuty ? '<span class="dpin-ring"></span>' : ""}${CROSS}<span class="dpin-label"></span></button>`;
  el.querySelector(".dpin-label")!.textContent = p.name;
  const btn = el.querySelector("button")!;
  btn.setAttribute("aria-label", p.name);
  btn.addEventListener("click", () => onSelect?.(p.id));
  return el;
}

export default function PharmacyMap({
  points,
  origin,
  highlighted,
  onSelect,
}: {
  points: MapPoint[];
  origin: { lat: number; lng: number };
  highlighted?: string | null;
  onSelect?: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const selectRef = useRef(onSelect);
  useEffect(() => {
    selectRef.current = onSelect;
  });

  useEffect(() => {
    const map = new maplibregl.Map({
      container: ref.current!,
      style: dayStyle,
      center: [origin.lng, origin.lat],
      zoom: 12,
      scrollZoom: false,
      dragRotate: false,
      pitchWithRotate: false,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const key = points.map((p) => p.id + p.status).join() + origin.lat + origin.lng;
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    const you = document.createElement("div");
    you.className = "dpin-you";
    you.title = "You";
    markersRef.current = [
      new maplibregl.Marker({ element: you }).setLngLat([origin.lng, origin.lat]).addTo(map),
      ...points.map((p) => new maplibregl.Marker({ element: pinEl(p, (id) => selectRef.current?.(id)) }).setLngLat([p.lng, p.lat]).addTo(map)),
    ];
    const bounds = new maplibregl.LngLatBounds([origin.lng, origin.lat], [origin.lng, origin.lat]);
    points.forEach((p) => bounds.extend([p.lng, p.lat]));
    map.fitBounds(bounds, { padding: 48, maxZoom: 14, duration: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    markersRef.current.forEach((m) => {
      const el = m.getElement();
      el.toggleAttribute("data-hot", !!el.dataset.id && el.dataset.id === highlighted);
    });
  }, [highlighted, key]);

  return <div ref={ref} className="h-full w-full" />;
}
