import { medicines, pharmacies, stock } from "@/lib/data";
import {
  availabilityFor,
  equivalentsOf,
  fmtKm,
  fmtPrice,
  statusOf,
} from "@/lib/finder";
import {
  DEPOSIT_DZD,
  HOLD_HOURS,
  HOLD_HOURS_WITH_DEPOSIT,
} from "@/lib/reservations";
import { Close } from "@/v6/home/close";
import { Features } from "@/v6/home/features";
import { Hero } from "@/v6/home/hero";
import { Night } from "@/v6/home/night";
import { Steps } from "@/v6/home/steps";

const CODE = "DWA-4827";

const doliprane = availabilityFor("doliprane-1000").filter(
  (a) => a.status !== "out" && a.item,
);
const phoneRows = doliprane.slice(0, 3).map((a) => ({
  id: a.pharmacy.id,
  name: a.pharmacy.name,
  commune: a.pharmacy.commune,
  km: fmtKm(a.km),
  qty: a.item!.qty,
  status: a.status,
}));
const stepRows = availabilityFor("augmentin-1g")
  .filter((a) => a.item)
  .slice(0, 4)
  .map((a) => ({
    name: a.pharmacy.name,
    commune: a.pharmacy.commune,
    qty: a.item!.qty,
  }));

const duty = pharmacies
  .filter((p) => p.onDuty)
  .map(({ id, name, commune, address, phone }) => ({
    id,
    name,
    commune,
    address,
    phone,
  }));
const feed = [...stock]
  .filter((s) => s.qty > 0)
  .sort((a, b) => a.updatedMinsAgo - b.updatedMinsAgo)
  .slice(0, 10)
  .map((s) => ({
    med: medicines.find((m) => m.id === s.medicineId)!.name,
    pharmacy: pharmacies.find((p) => p.id === s.pharmacyId)!.name,
    qty: s.qty,
    mins: s.updatedMinsAgo,
  }));

const stockedAt = (id: string) =>
  stock.filter((s) => s.medicineId === id && statusOf(s.qty) !== "out").length;
// The scarcest medicine that has an equivalent in stock elsewhere.
const scarce = medicines
  .map((m) => ({
    m,
    n: stockedAt(m.id),
    eq: equivalentsOf(m)
      .map((e) => ({ name: e.name, dosage: e.dosage, count: stockedAt(e.id) }))
      .filter((e) => e.count > 0),
  }))
  .filter((x) => x.eq.length > 0)
  .sort((a, b) => a.n - b.n)[0];

const stats = [
  { value: pharmacies.length, label: "pharmacies counting in Alger" },
  { value: medicines.length, label: "medicines tracked" },
  {
    value: Math.min(...stock.map((s) => s.updatedMinsAgo)),
    suffix: " min",
    label: "since the latest count",
  },
  { value: duty.length, label: "on night duty tonight" },
];

export default function V6Home() {
  return (
    <>
      <Hero count={pharmacies.length} rows={phoneRows} code={CODE} />
      <Steps rows={stepRows} code={CODE} />
      <Night duty={duty} feed={feed} />
      <Features
        scarce={{ name: scarce.m.name, count: scarce.n }}
        equivalents={scarce.eq.slice(0, 3)}
        deposit={fmtPrice(DEPOSIT_DZD)}
        holdShort={HOLD_HOURS}
        holdLong={HOLD_HOURS_WITH_DEPOSIT}
      />
      <Close stats={stats} />
    </>
  );
}
