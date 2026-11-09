import type { Metadata } from "next";
import { ProView } from "@/v8/account";

export const metadata: Metadata = { title: "dwa Pro" };

export default async function V8ProPage({ searchParams }: PageProps<"/v8/pro">) {
  const { activated, cancelled } = await searchParams;
  return <ProView activated={activated === "1"} cancelled={cancelled === "1"} />;
}
