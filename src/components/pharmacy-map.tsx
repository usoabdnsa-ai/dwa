"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { Status } from "@/lib/finder";

export type MapPoint = { id: string; name: string; lat: number; lng: number; status: Status | "none"; onDuty: boolean };

const COLOR: Record<MapPoint["status"], string> = {
  in: "#0b6b3a",
  low: "#b45309",
  out: "#b42318",
  none: "#15201a",
};

function FitBounds({ points, origin }: { points: MapPoint[]; origin: { lat: number; lng: number } }) {
  const map = useMap();
  const key = points.map((p) => p.id).join() + origin.lat + origin.lng;
  useEffect(() => {
    const coords: [number, number][] = [...points.map((p) => [p.lat, p.lng] as [number, number]), [origin.lat, origin.lng]];
    if (coords.length) map.fitBounds(coords, { padding: [36, 36], maxZoom: 14 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
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
  return (
    <MapContainer center={[origin.lat, origin.lng]} zoom={12} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} origin={origin} />
      <CircleMarker center={[origin.lat, origin.lng]} radius={7} pathOptions={{ color: "#fff", weight: 3, fillColor: "#15201a", fillOpacity: 1 }}>
        <Tooltip direction="top" offset={[0, -6]}>You</Tooltip>
      </CircleMarker>
      {points.map((p) => {
        const hot = highlighted === p.id;
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={hot ? 11 : p.status === "out" ? 6 : 8}
            eventHandlers={{ click: () => onSelect?.(p.id) }}
            pathOptions={{
              color: p.onDuty ? "#2bd66b" : "#fff",
              weight: p.onDuty ? 3 : 2,
              fillColor: COLOR[p.status],
              fillOpacity: p.status === "out" ? 0.55 : 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} permanent={hot}>
              {p.name}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
