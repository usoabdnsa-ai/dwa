import { getMedicine, getPharmacy, medicines, pharmacies, stock } from "@/lib/data";
import { Close } from "@/v4/home/close";
import { Feed, type FeedItem } from "@/v4/home/feed";
import { Hero } from "@/v4/home/hero";
import { Night } from "@/v4/home/night";

// Open at 03:00: the de garde rota plus anything open around the clock.
const openAtThree = pharmacies.filter((p) => p.onDuty || (p.opens === 0 && p.closes === 1440)).length;

// Freshest shelf lines, for the live feed.
const feed: FeedItem[] = [...stock]
  .sort((a, b) => a.updatedMinsAgo - b.updatedMinsAgo)
  .slice(0, 16)
  .map((s) => {
    const m = getMedicine(s.medicineId)!;
    const p = getPharmacy(s.pharmacyId)!;
    return { key: p.id + m.id, med: `${m.name} ${m.dosage}`, pharmacy: p.name, commune: p.commune, qty: s.qty, mins: s.updatedMinsAgo };
  });

export default function V4Home() {
  return (
    <>
      <Hero openAtThree={openAtThree} total={pharmacies.length} />
      <Night pharmacies={pharmacies} />
      <Feed items={feed} pharmacies={pharmacies.length} medicines={medicines.length} />
      <Close />
    </>
  );
}
