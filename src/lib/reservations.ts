"use client";

import { useSyncExternalStore } from "react";

/*
 * Demo store for reservations, back-in-stock alerts and the Pro plan.
 * There is no backend yet, so everything lives in localStorage. The browser's
 * "storage" event syncs other tabs: reserve in one tab, watch it arrive in the
 * pharmacist dashboard in another. Swap these functions for API calls when the
 * database exists; the components only use the hooks and actions below.
 */

export type ReservationStatus = "requested" | "confirmed" | "ready" | "collected" | "declined" | "cancelled";
export type DepositStatus = "none" | "pending" | "paid";

export type Reservation = {
  code: string;
  pharmacyId: string;
  medicineId: string;
  qty: number;
  name: string;
  phone: string;
  createdAt: number;
  holdUntil: number;
  status: ReservationStatus;
  deposit: DepositStatus;
  /** 1 to 5, given by the patient after collecting. */
  rating?: number;
};

export type StockAlert = { id: string; medicineId: string; phone: string; createdAt: number };

/** Fixed server-side too (see /api/checkout); shown here for the UI copy. */
export const DEPOSIT_DZD = 100;
export const PRO_DZD = 2900;
export const HOLD_HOURS = 2;
export const HOLD_HOURS_WITH_DEPOSIT = 4;

const KEYS = { reservations: "dwa-reservations", alerts: "dwa-alerts", pro: "dwa-pro", treatments: "dwa-treatments", prescriptions: "dwa-prescriptions", referrals: "dwa-referrals" } as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

// Snapshots must be referentially stable between changes, so parse once per raw string.
function snapshot<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {}
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  const value = raw ? read<T>(key, fallback) : fallback;
  cache.set(key, { raw, value });
  return value;
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (!e.key || Object.values(KEYS).includes(e.key as (typeof KEYS)[keyof typeof KEYS])) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export type Treatment = {
  id: string;
  medicineId: string;
  /** Units taken per day (tablets, puffs, insulin units…). */
  perDay: number;
  /** Units at home when last counted. */
  units: number;
  countedAt: number;
};

export type Prescription = {
  id: string;
  pharmacyId: string;
  /** Downscaled JPEG data URL. Stays on this device in the demo. */
  image: string;
  phone: string;
  note: string;
  createdAt: number;
  status: "sent" | "answered";
  reply?: { message: string; total: number; at: number };
};

const EMPTY_T: Treatment[] = [];
const EMPTY_P: Prescription[] = [];
const EMPTY_R: Reservation[] = [];
const EMPTY_A: StockAlert[] = [];

export function useReservations(): Reservation[] {
  return useSyncExternalStore(subscribe, () => snapshot(KEYS.reservations, EMPTY_R), () => EMPTY_R);
}

export function useAlerts(): StockAlert[] {
  return useSyncExternalStore(subscribe, () => snapshot(KEYS.alerts, EMPTY_A), () => EMPTY_A);
}

export function useTreatments(): Treatment[] {
  return useSyncExternalStore(subscribe, () => snapshot(KEYS.treatments, EMPTY_T), () => EMPTY_T);
}

export function addTreatment(medicineId: string, perDay: number, units: number) {
  const t: Treatment = { id: crypto.randomUUID(), medicineId, perDay, units, countedAt: Date.now() };
  write(KEYS.treatments, [t, ...read<Treatment[]>(KEYS.treatments, []).filter((x) => x.medicineId !== medicineId)]);
}

/** Recount: what's left now, plus any boxes just bought. */
export function refillTreatment(id: string, addUnits: number) {
  write(
    KEYS.treatments,
    read<Treatment[]>(KEYS.treatments, []).map((t) => (t.id === id ? { ...t, units: unitsLeft(t, Date.now()) + addUnits, countedAt: Date.now() } : t)),
  );
}

export function removeTreatment(id: string) {
  write(
    KEYS.treatments,
    read<Treatment[]>(KEYS.treatments, []).filter((t) => t.id !== id),
  );
}

export function unitsLeft(t: Treatment, now: number) {
  const days = (now - t.countedAt) / 86_400_000;
  return Math.max(0, t.units - days * t.perDay);
}

export function daysLeft(t: Treatment, now: number) {
  return Math.floor(unitsLeft(t, now) / t.perDay);
}

/** Refill when this many days or fewer remain. */
export const REFILL_DAYS = 5;

export function usePrescriptions(): Prescription[] {
  return useSyncExternalStore(subscribe, () => snapshot(KEYS.prescriptions, EMPTY_P), () => EMPTY_P);
}

/** Returns false when the browser's storage is full (images are the big item). */
export function sendPrescription(p: Pick<Prescription, "pharmacyId" | "image" | "phone" | "note">): boolean {
  const next: Prescription = { ...p, id: crypto.randomUUID(), phone: p.phone.replace(/\s/g, ""), createdAt: Date.now(), status: "sent" };
  try {
    localStorage.setItem(KEYS.prescriptions, JSON.stringify([next, ...read<Prescription[]>(KEYS.prescriptions, [])].slice(0, 10)));
  } catch {
    return false;
  }
  listeners.forEach((l) => l());
  return true;
}

export function answerPrescription(id: string, message: string, total: number) {
  write(
    KEYS.prescriptions,
    read<Prescription[]>(KEYS.prescriptions, []).map((p) => (p.id === id ? { ...p, status: "answered" as const, reply: { message, total, at: Date.now() } } : p)),
  );
}

export function useReferralCount(): number {
  return useSyncExternalStore(subscribe, () => snapshot<number>(KEYS.referrals, 0), () => 0);
}

export function countReferral() {
  write(KEYS.referrals, read<number>(KEYS.referrals, 0) + 1);
}

/** null while hydrating, so Pro-only UI never flashes the wrong state. */
export function usePro(): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => snapshot<boolean>(KEYS.pro, false),
    () => null,
  );
}

// Unambiguous alphabet: no 0/O, 1/I/L.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return "DWA-" + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function createReservation(input: Pick<Reservation, "pharmacyId" | "medicineId" | "qty" | "name" | "phone"> & { withDeposit: boolean }): Reservation {
  const now = Date.now();
  const r: Reservation = {
    code: newCode(),
    pharmacyId: input.pharmacyId,
    medicineId: input.medicineId,
    qty: input.qty,
    name: input.name.trim(),
    phone: input.phone.replace(/\s/g, ""),
    createdAt: now,
    holdUntil: now + (input.withDeposit ? HOLD_HOURS_WITH_DEPOSIT : HOLD_HOURS) * 3_600_000,
    status: "requested",
    deposit: input.withDeposit ? "pending" : "none",
  };
  write(KEYS.reservations, [r, ...read<Reservation[]>(KEYS.reservations, [])]);
  return r;
}

export function updateReservation(code: string, patch: Partial<Pick<Reservation, "status" | "deposit" | "rating">>) {
  write(
    KEYS.reservations,
    read<Reservation[]>(KEYS.reservations, []).map((r) => (r.code === code ? { ...r, ...patch } : r)),
  );
}

export function addAlert(medicineId: string, phone: string) {
  const alerts = read<StockAlert[]>(KEYS.alerts, []);
  const clean = phone.replace(/\s/g, "");
  if (alerts.some((a) => a.medicineId === medicineId && a.phone === clean)) return;
  write(KEYS.alerts, [{ id: crypto.randomUUID(), medicineId, phone: clean, createdAt: Date.now() }, ...alerts]);
}

export function removeAlert(id: string) {
  write(
    KEYS.alerts,
    read<StockAlert[]>(KEYS.alerts, []).filter((a) => a.id !== id),
  );
}

export function setPro(on: boolean) {
  write(KEYS.pro, on);
}

/** Algerian mobile numbers: 05, 06 or 07 followed by 8 digits (spaces allowed), or the +213 form. */
export function validPhone(v: string) {
  return /^(?:0|\+213)[567]\d{8}$/.test(v.replace(/\s/g, ""));
}

export const STATUS_LABEL: Record<ReservationStatus, string> = {
  requested: "Waiting for the pharmacy",
  confirmed: "Confirmed",
  ready: "Ready at the counter",
  collected: "Collected",
  declined: "Declined by the pharmacy",
  cancelled: "Cancelled",
};
