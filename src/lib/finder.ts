import { medicines, pharmacies, stock, type Medicine, type Pharmacy, type StockItem } from "./data";

/** Default origin when the visitor hasn't shared a location: Place des Martyrs, Alger. */
export const DEFAULT_ORIGIN = { lat: 36.7856, lng: 3.0603, label: "Alger Centre" };

export type Status = "in" | "low" | "out";
export const LOW_THRESHOLD = 5;

export function statusOf(qty: number): Status {
  if (qty <= 0) return "out";
  if (qty <= LOW_THRESHOLD) return "low";
  return "in";
}

const fold = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

/** Matches on brand name first, then on active ingredient (DCI). */
export function searchMedicines(query: string): Medicine[] {
  const q = fold(query);
  if (!q) return [];
  const score = (m: Medicine) => {
    const name = fold(m.name);
    const dci = fold(m.dci);
    if (name.startsWith(q)) return 0;
    if (name.includes(q)) return 1;
    if (dci.split(/[\s/]+/).some((w) => w.startsWith(q))) return 2;
    if (dci.includes(q)) return 3;
    return -1;
  };
  return medicines
    .map((m) => [m, score(m)] as const)
    .filter(([, s]) => s >= 0)
    .sort((a, b) => a[1] - b[1] || a[0].name.localeCompare(b[0].name))
    .map(([m]) => m);
}

/** Other products sharing the same active ingredient. */
export function equivalentsOf(m: Medicine): Medicine[] {
  return medicines.filter((o) => o.id !== m.id && o.dci === m.dci);
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Minutes since midnight in Algiers, whatever the visitor's own timezone. */
export function algiersMinutes(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Algiers",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return get("hour") * 60 + get("minute");
}

export function isOpen(p: Pharmacy, minutes: number) {
  if (p.onDuty) return true; // de garde: open through the night
  return minutes >= p.opens && minutes < p.closes;
}

export const fmtTime = (mins: number) =>
  mins >= 1440 ? "24:00" : `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

export function hoursLabel(p: Pharmacy) {
  if (p.opens === 0 && p.closes === 1440) return "Open 24/7";
  return `${fmtTime(p.opens)} to ${fmtTime(p.closes)}`;
}

export function fmtUpdated(mins: number) {
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  return `${h} h ago`;
}

const dzd = new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 0 });
export const fmtPrice = (n: number) => `${dzd.format(n)} DA`;

const km = new Intl.NumberFormat("en", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
export const fmtKm = (n: number) => `${km.format(n)} km`;

export type Availability = {
  pharmacy: Pharmacy;
  item: StockItem | undefined;
  status: Status;
  km: number;
};

/** Every pharmacy, with its stock line for this medicine, nearest stocked first. */
export function availabilityFor(medicineId: string, origin = DEFAULT_ORIGIN): Availability[] {
  const rank: Record<Status, number> = { in: 0, low: 1, out: 2 };
  return pharmacies
    .map((pharmacy) => {
      const item = stock.find((s) => s.pharmacyId === pharmacy.id && s.medicineId === medicineId);
      return { pharmacy, item, status: statusOf(item?.qty ?? 0), km: distanceKm(origin, pharmacy) };
    })
    .sort((a, b) => rank[a.status] - rank[b.status] || a.km - b.km);
}

export function stockOf(pharmacyId: string) {
  return stock
    .filter((s) => s.pharmacyId === pharmacyId)
    .map((s) => ({ ...s, medicine: medicines.find((m) => m.id === s.medicineId)! }));
}
