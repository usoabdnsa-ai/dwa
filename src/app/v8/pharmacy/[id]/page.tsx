import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPharmacy, pharmacies } from "@/lib/data";
import { PharmacyView } from "@/v8/places";

export function generateStaticParams() {
  return pharmacies.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/v8/pharmacy/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: getPharmacy(id)?.name ?? "Pharmacy" };
}

export default async function V8PharmacyPage({ params }: PageProps<"/v8/pharmacy/[id]">) {
  const { id } = await params;
  if (!getPharmacy(id)) notFound();
  return <PharmacyView id={id} />;
}
