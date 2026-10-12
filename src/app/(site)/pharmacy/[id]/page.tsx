import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPharmacy, pharmacies } from "@/lib/data";
import { stockOf } from "@/lib/finder";
import { PharmacyDetail } from "@/components/pharmacy-detail";

export function generateStaticParams() {
  return pharmacies.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/pharmacy/[id]">): Promise<Metadata> {
  const p = getPharmacy((await params).id);
  return { title: p ? `${p.name}, ${p.commune}` : "Pharmacy not found" };
}

export default async function PharmacyPage({ params }: PageProps<"/pharmacy/[id]">) {
  const p = getPharmacy((await params).id);
  if (!p) notFound();
  return <PharmacyDetail pharmacy={p} items={stockOf(p.id)} />;
}
