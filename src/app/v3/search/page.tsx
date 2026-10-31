import type { Metadata } from "next";
import { Results } from "@/v3/results";

export async function generateMetadata({ searchParams }: PageProps<"/v3/search">): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: typeof q === "string" && q ? `${q} in stock` : "Search" };
}

export default async function V3SearchPage({ searchParams }: PageProps<"/v3/search">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const initial = { stocked: sp.stocked === "1", open: sp.open === "1", garde: sp.garde === "1" };
  // Keyed on the query so a new search resets the picked match and filters.
  return <Results key={q} q={q} initial={initial} />;
}
