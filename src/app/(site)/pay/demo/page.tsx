import type { Metadata } from "next";
import { DemoPay } from "@/components/demo-pay";

export const metadata: Metadata = { title: "Test payment", robots: { index: false } };

export default async function DemoPayPage({ searchParams }: PageProps<"/pay/demo">) {
  const sp = await searchParams;
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  return <DemoPay purpose={get("purpose")} reference={get("ref")} amount={Number(get("amount")) || 0} success={get("success")} failure={get("failure")} />;
}
