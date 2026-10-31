/*
 * Extra demo facts per pharmacy and medicine, kept apart from data.ts so the
 * original catalogue stays untouched. Like the rest of the demo data, these are
 * invented placeholders until the backend exists.
 */

export type PharmacyExtras = {
  /** Accepts the CNAS CHIFA card (tiers payant): the patient doesn't pay up front for covered medicines. */
  chifa: boolean;
  rating: number;
  reviews: number;
  /** Typical wait at the counter at a quiet hour, in minutes. */
  baseWait: number;
};

const EXTRAS: Record<string, PharmacyExtras> = {
  meziane: { chifa: true, rating: 4.6, reviews: 214, baseWait: 4 },
  "hydra-pins": { chifa: true, rating: 4.4, reviews: 128, baseWait: 3 },
  "elbiar-centre": { chifa: false, rating: 4.1, reviews: 87, baseWait: 5 },
  "kouba-garidi": { chifa: true, rating: 4.7, reviews: 302, baseWait: 6 },
  "bab-ezzouar": { chifa: true, rating: 4.2, reviews: 176, baseWait: 7 },
  "bmr-colonne": { chifa: false, rating: 4.5, reviews: 64, baseWait: 2 },
  "cheraga-salam": { chifa: true, rating: 4.3, reviews: 95, baseWait: 4 },
  belouizdad: { chifa: false, rating: 3.9, reviews: 141, baseWait: 5 },
};

const FALLBACK: PharmacyExtras = { chifa: false, rating: 4, reviews: 0, baseWait: 4 };

export function extrasOf(pharmacyId: string): PharmacyExtras {
  return EXTRAS[pharmacyId] ?? FALLBACK;
}

/*
 * Estimated wait right now: the quiet-hour wait scaled by a day curve that
 * peaks mid-morning and after work (Algiers time). Rounded to whole minutes.
 */
const HOURLY = [0.4, 0.3, 0.3, 0.3, 0.3, 0.3, 0.4, 0.7, 1.2, 1.8, 2.0, 1.6, 1.2, 1.0, 1.1, 1.3, 1.6, 2.1, 2.3, 1.8, 1.3, 0.9, 0.6, 0.5];

export function waitNow(pharmacyId: string, minutesOfDay: number) {
  const h = Math.floor(minutesOfDay / 60) % 24;
  return Math.max(1, Math.round(extrasOf(pharmacyId).baseWait * HOURLY[h]));
}

export function waitTone(mins: number): "quiet" | "busy" | "packed" {
  return mins <= 5 ? "quiet" : mins <= 12 ? "busy" : "packed";
}

/*
 * Long-term treatments for refill reminders: how many units a box holds.
 * Doses are entered by the patient; this only turns boxes into days.
 */
export const UNITS_PER_BOX: Record<string, { units: number; unit: string }> = {
  "glucophage-850": { units: 30, unit: "tablets" },
  "levothyrox-50": { units: 30, unit: "tablets" },
  "lantus-100": { units: 300, unit: "units (1 pen)" },
  "kardegic-75": { units: 30, unit: "sachets" },
  "ventoline-100": { units: 200, unit: "puffs" },
  "aerius-5": { units: 30, unit: "tablets" },
  "doliprane-1000": { units: 8, unit: "tablets" },
  "spasfon-80": { units: 30, unit: "tablets" },
};

/** Demo box barcodes (EAN-13 style) so the dashboard scanner has something to match. */
export const BARCODES: Record<string, string> = {
  "6130001000016": "doliprane-1000",
  "6130001000023": "efferalgan-500",
  "6130001000030": "paralgan-500",
  "6130001000047": "augmentin-1g",
  "6130001000054": "amoxil-500",
  "6130001000061": "spasfon-80",
  "6130001000078": "ventoline-100",
  "6130001000085": "glucophage-850",
  "6130001000092": "levothyrox-50",
  "6130001000108": "lantus-100",
  "6130001000115": "kardegic-75",
  "6130001000122": "smecta-3g",
  "6130001000139": "clamoxyl-250",
  "6130001000146": "aerius-5",
};
