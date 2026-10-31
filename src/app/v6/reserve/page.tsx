import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMedicine, getPharmacy, stock } from "@/lib/data";
import { ReserveForm } from "@/v6/reserve-form";

export const metadata: Metadata = { title: "Reserve a medicine" };

export default async function V6ReservePage({
  searchParams,
}: PageProps<"/v6/reserve">) {
  const sp = await searchParams;
  const p =
    typeof sp.pharmacy === "string" ? getPharmacy(sp.pharmacy) : undefined;
  const m =
    typeof sp.medicine === "string" ? getMedicine(sp.medicine) : undefined;
  const line =
    p && m
      ? stock.find((s) => s.pharmacyId === p.id && s.medicineId === m.id)
      : undefined;
  if (!p || !m || !line || line.qty <= 0) notFound();
  return <ReserveForm pharmacy={p} medicine={m} available={line.qty} />;
}
