import type { Metadata } from "next";
import { Results } from "@/v6/results";

export async function generateMetadata({
  searchParams,
}: PageProps<"/v6/search">): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title:
      typeof q === "string" && q ? `${q}: pharmacies with stock` : "Search",
  };
}

export default async function V6SearchPage({
  searchParams,
}: PageProps<"/v6/search">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const initial = {
    stocked: sp.stocked === "1",
    open: sp.open === "1",
    garde: sp.garde === "1",
    chifa: sp.chifa === "1",
    sort: sp.sort === "most" ? ("most" as const) : ("near" as const),
  };
  return <Results key={q} q={q} initial={initial} />;
}
