import { getPharmacy } from "@/lib/data";

/*
 * The scroll story, as data. Each beat owns a stretch of scroll (weight, in
 * viewport heights) and the camera keys it flies through. A beat starts from
 * wherever the previous beat ended, so keys only list where it is going.
 */

export type Cam = { center: [number, number]; zoom: number; pitch: number; bearing: number };
export type Key = { at: number; cam: Cam };
export type BeatId = "hook" | "oldway" | "newrule" | "mechanism" | "night" | "pharmacist" | "action";
export type Beat = { id: BeatId; weight: number; keys: Key[] };

const lngLat = (id: string): [number, number] => {
  const p = getPharmacy(id)!;
  return [p.lng, p.lat];
};

const street = (id: string, bearing: number, zoom = 15): Cam => ({ center: lngLat(id), zoom, pitch: 57, bearing });

/** The walk without dwa: same stops and answers as the old door-to-door story. */
export const ROUTE = [
  { id: "meziane", answer: "Don't have it", mins: 0 },
  { id: "belouizdad", answer: "Out since Sunday", mins: 11 },
  { id: "bmr-colonne", answer: "Come back Thursday", mins: 24 },
  { id: "hydra-pins", answer: "Try Kouba?", mins: 33 },
  { id: "kouba-garidi", answer: "Yes, 3 left", mins: 47 },
];

/** Share of the old-way beat spent getting from the overview down to the first stop. */
export const ROUTE_LEAD = 0.14;

export const BEATS: Beat[] = [
  {
    id: "hook",
    weight: 1.3,
    keys: [
      { at: 0, cam: { center: [3.071, 36.748], zoom: 11.3, pitch: 50, bearing: 172 } },
      { at: 1, cam: { center: [3.07, 36.75], zoom: 11.85, pitch: 55, bearing: 162 } },
    ],
  },
  {
    id: "oldway",
    weight: 2.6,
    keys: [
      { at: ROUTE_LEAD, cam: street("meziane", 150) },
      { at: ROUTE_LEAD + 0.86 * 0.25, cam: street("belouizdad", 128) },
      { at: ROUTE_LEAD + 0.86 * 0.5, cam: street("bmr-colonne", 200) },
      { at: ROUTE_LEAD + 0.86 * 0.75, cam: street("hydra-pins", 232) },
      { at: 1, cam: street("kouba-garidi", 168) },
    ],
  },
  {
    id: "newrule",
    weight: 1.4,
    keys: [{ at: 0.45, cam: { center: [3.07, 36.748], zoom: 11.4, pitch: 38, bearing: 176 } }],
  },
  {
    id: "mechanism",
    weight: 1.4,
    keys: [
      { at: 0.55, cam: { ...street("kouba-garidi", 140, 15.8), pitch: 58 } },
      { at: 1, cam: { ...street("kouba-garidi", 112, 16), pitch: 60 } },
    ],
  },
  {
    id: "night",
    weight: 1.3,
    keys: [{ at: 0.5, cam: { center: [3.02, 36.752], zoom: 11.5, pitch: 44, bearing: 198 } }],
  },
  {
    id: "pharmacist",
    weight: 1.3,
    keys: [
      { at: 0.5, cam: street("meziane", 222, 15.6) },
      { at: 1, cam: street("meziane", 242, 15.8) },
    ],
  },
  {
    id: "action",
    weight: 1.2,
    keys: [{ at: 0.7, cam: { center: [3.066, 36.75], zoom: 11.3, pitch: 32, bearing: 180 } }],
  },
];

/** Where the page opens before the fly-in: high above the bay, looking straight down. */
export const INTRO_CAM: Cam = { center: [3.08, 36.8], zoom: 9.6, pitch: 0, bearing: 200 };
