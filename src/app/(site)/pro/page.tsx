import type { Metadata } from "next";
import { ProPlans } from "@/components/pro-plans";

export const metadata: Metadata = { title: "dwa Pro for pharmacies" };

export default async function ProPage({ searchParams }: PageProps<"/pro">) {
  const { activated, cancelled } = await searchParams;
  return <ProPlans activated={activated === "1"} cancelled={cancelled === "1"} />;
}
