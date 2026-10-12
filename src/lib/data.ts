/*
 * Demo data. Everything here is invented for the prototype: pharmacy names,
 * addresses, phone numbers and stock levels are placeholders until the
 * backend exists. Medicine names are real products sold in Algeria so the
 * search feels realistic, but prices are approximate.
 */

export type Medicine = {
  id: string;
  name: string;
  /** International non-proprietary name (DCI), the active ingredient. */
  dci: string;
  dosage: string;
  form: "Tablet" | "Capsule" | "Syrup" | "Inhaler" | "Sachet" | "Injection";
  /** Prescription required. */
  rx: boolean;
  priceDzd: number;
};

export type Pharmacy = {
  id: string;
  name: string;
  pharmacist: string;
  address: string;
  commune: string;
  lat: number;
  lng: number;
  phone: string;
  /** Opening hours in minutes since midnight, Algiers time. */
  opens: number;
  closes: number;
  /** On the "pharmacie de garde" rota tonight. */
  onDuty: boolean;
};

export type StockItem = {
  pharmacyId: string;
  medicineId: string;
  qty: number;
  /** ISO date. */
  expiry: string;
  /** Minutes since the pharmacist last touched this line. */
  updatedMinsAgo: number;
};

export const medicines: Medicine[] = [
  { id: "doliprane-1000", name: "Doliprane", dci: "Paracetamol", dosage: "1000 mg", form: "Tablet", rx: false, priceDzd: 180 },
  { id: "efferalgan-500", name: "Efferalgan", dci: "Paracetamol", dosage: "500 mg", form: "Tablet", rx: false, priceDzd: 160 },
  { id: "paralgan-500", name: "Paralgan", dci: "Paracetamol", dosage: "500 mg", form: "Tablet", rx: false, priceDzd: 95 },
  { id: "augmentin-1g", name: "Augmentin", dci: "Amoxicillin / Clavulanic acid", dosage: "1 g", form: "Tablet", rx: true, priceDzd: 980 },
  { id: "amoxil-500", name: "Amoxil", dci: "Amoxicillin", dosage: "500 mg", form: "Capsule", rx: true, priceDzd: 420 },
  { id: "spasfon-80", name: "Spasfon", dci: "Phloroglucinol", dosage: "80 mg", form: "Tablet", rx: false, priceDzd: 310 },
  { id: "ventoline-100", name: "Ventoline", dci: "Salbutamol", dosage: "100 µg", form: "Inhaler", rx: true, priceDzd: 540 },
  { id: "glucophage-850", name: "Glucophage", dci: "Metformin", dosage: "850 mg", form: "Tablet", rx: true, priceDzd: 260 },
  { id: "levothyrox-50", name: "Levothyrox", dci: "Levothyroxine", dosage: "50 µg", form: "Tablet", rx: true, priceDzd: 230 },
  { id: "lantus-100", name: "Lantus", dci: "Insulin glargine", dosage: "100 U/ml", form: "Injection", rx: true, priceDzd: 2900 },
  { id: "kardegic-75", name: "Kardegic", dci: "Acetylsalicylic acid", dosage: "75 mg", form: "Sachet", rx: false, priceDzd: 210 },
  { id: "smecta-3g", name: "Smecta", dci: "Diosmectite", dosage: "3 g", form: "Sachet", rx: false, priceDzd: 350 },
  { id: "clamoxyl-250", name: "Clamoxyl", dci: "Amoxicillin", dosage: "250 mg/5 ml", form: "Syrup", rx: true, priceDzd: 390 },
  { id: "aerius-5", name: "Aerius", dci: "Desloratadine", dosage: "5 mg", form: "Tablet", rx: false, priceDzd: 620 },
];

export const pharmacies: Pharmacy[] = [
  { id: "meziane", name: "Pharmacie Meziane", pharmacist: "Dr. S. Meziane", address: "14 Rue Didouche Mourad", commune: "Alger Centre", lat: 36.7651, lng: 3.0503, phone: "+213 21 63 40 12", opens: 480, closes: 1200, onDuty: false },
  { id: "hydra-pins", name: "Pharmacie des Pins", pharmacist: "Dr. A. Belkacem", address: "3 Chemin Ahmed Kara", commune: "Hydra", lat: 36.7449, lng: 3.0391, phone: "+213 23 48 11 07", opens: 510, closes: 1230, onDuty: true },
  { id: "elbiar-centre", name: "Pharmacie du Centre", pharmacist: "Dr. N. Hamidi", address: "27 Avenue Ali Khodja", commune: "El Biar", lat: 36.7671, lng: 3.0312, phone: "+213 21 92 05 66", opens: 480, closes: 1170, onDuty: false },
  { id: "kouba-garidi", name: "Pharmacie Garidi", pharmacist: "Dr. K. Ouali", address: "Cité Garidi II, Bt 12", commune: "Kouba", lat: 36.7273, lng: 3.0798, phone: "+213 23 70 38 91", opens: 480, closes: 1260, onDuty: true },
  { id: "bab-ezzouar", name: "Pharmacie Ennour", pharmacist: "Dr. Y. Saadi", address: "Cité 5 Juillet, local 8", commune: "Bab Ezzouar", lat: 36.7213, lng: 3.1836, phone: "+213 23 92 14 50", opens: 0, closes: 1440, onDuty: false },
  { id: "bmr-colonne", name: "Pharmacie La Colonne", pharmacist: "Dr. F. Rahmani", address: "9 Rue des Frères Oughlis", commune: "Bir Mourad Raïs", lat: 36.7378, lng: 3.0514, phone: "+213 23 55 61 29", opens: 495, closes: 1185, onDuty: false },
  { id: "cheraga-salam", name: "Pharmacie Es-Salam", pharmacist: "Dr. L. Benali", address: "Boulevard Mustapha Ben Boulaïd", commune: "Chéraga", lat: 36.7669, lng: 2.9591, phone: "+213 23 31 07 44", opens: 480, closes: 1200, onDuty: true },
  { id: "belouizdad", name: "Pharmacie du 1er Mai", pharmacist: "Dr. R. Djebbar", address: "62 Rue Mohamed Belouizdad", commune: "Belouizdad", lat: 36.7527, lng: 3.0702, phone: "+213 21 67 22 03", opens: 480, closes: 1215, onDuty: false },
];

// Small deterministic PRNG so the demo stock is identical on server and client.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildStock(): StockItem[] {
  const rand = mulberry32(2026);
  const items: StockItem[] = [];
  for (const p of pharmacies) {
    for (const m of medicines) {
      const r = rand();
      if (r < 0.12) continue; // never carried here
      const qty = r < 0.3 ? 0 : r < 0.42 ? 1 + Math.floor(rand() * 5) : 6 + Math.floor(rand() * 60);
      const month = 1 + Math.floor(rand() * 20);
      const expiry = new Date(Date.UTC(2026, 9 + month, 1 + Math.floor(rand() * 27)));
      items.push({
        pharmacyId: p.id,
        medicineId: m.id,
        qty,
        expiry: expiry.toISOString().slice(0, 10),
        updatedMinsAgo: Math.floor(rand() * 600),
      });
    }
  }
  // Ventoline is the "hard to find" example: only one pharmacy has it.
  for (const s of items) if (s.medicineId === "ventoline-100") s.qty = 0;
  const kouba = items.find((s) => s.pharmacyId === "kouba-garidi" && s.medicineId === "ventoline-100");
  if (kouba) Object.assign(kouba, { qty: 3, updatedMinsAgo: 12 });
  else items.push({ pharmacyId: "kouba-garidi", medicineId: "ventoline-100", qty: 3, expiry: "2027-06-14", updatedMinsAgo: 12 });
  return items;
}

export const stock: StockItem[] = buildStock();

export const getMedicine = (id: string) => medicines.find((m) => m.id === id);
export const getPharmacy = (id: string) => pharmacies.find((p) => p.id === id);
