import { getMedicine, medicines, pharmacies } from "@/lib/data";
import { availabilityFor, equivalentsOf, fmtKm, hoursLabel, stockOf } from "@/lib/finder";
import { Bento } from "@/v5/home/bento";
import { Close } from "@/v5/home/close";
import { Hero, type DemoRow } from "@/v5/home/hero";
import { How } from "@/v5/home/how";

// Hero window: a real Ventoline search, nearest first.
const ventoline = availabilityFor("ventoline-100");
const demo: DemoRow[] = [...ventoline]
  .sort((a, b) => a.km - b.km)
  .map(({ pharmacy, item, status, km }) => ({ id: pharmacy.id, name: pharmacy.name, commune: pharmacy.commune, km: fmtKm(km), status, qty: item?.qty ?? 0 }));
const plan = ventoline.map(({ pharmacy, status }) => ({ ...pharmacy, status }));

// Bento: Doliprane on every shelf, and the paracetamol family.
const doliprane = availabilityFor("doliprane-1000").map(({ pharmacy, item, status }) => ({ id: pharmacy.id, name: pharmacy.name, commune: pharmacy.commune, qty: item?.qty ?? 0, status }));
const paracetamol = [getMedicine("doliprane-1000")!, ...equivalentsOf(getMedicine("doliprane-1000")!)].map((m) => ({ id: m.id, name: m.name, dosage: m.dosage, price: m.priceDzd }));

// How it works: Augmentin, the four nearest shelves that have it.
const augmentin = availabilityFor("augmentin-1g")
  .filter((r) => r.status !== "out")
  .slice(0, 4)
  .map(({ pharmacy, item, status, km }) => ({ id: pharmacy.id, name: pharmacy.name, commune: pharmacy.commune, km: fmtKm(km), qty: item?.qty ?? 0, status, hours: hoursLabel(pharmacy), phone: pharmacy.phone }));

// Stats: all computed from the data.
const lastCounts = pharmacies.map((p) => Math.min(...stockOf(p.id).map((l) => l.updatedMinsAgo))).sort((a, b) => a - b);
const medianLast = lastCounts[Math.floor(lastCounts.length / 2)];
const stats = [
  { value: pharmacies.length, label: "pharmacies posting" },
  { value: medicines.length, label: "medicines tracked" },
  { value: pharmacies.filter((p) => p.onDuty).length, label: "de garde tonight" },
  { value: medianLast, suffix: " min", label: "since a typical shelf was counted" },
];

export default function V5Home() {
  return (
    <>
      <Hero count={pharmacies.length} rows={demo} plan={plan} />
      <Bento stock={doliprane} pharmacies={pharmacies} equivalents={paracetamol} />
      <How rows={augmentin} />
      <Close stats={stats} />
    </>
  );
}
