import type { Metadata } from "next";
import { SearchView } from "@/components/search-view";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: typeof q === "string" && q ? `${q} in stock` : "Search" };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const initial = { stocked: sp.stocked === "1", open: sp.open === "1", garde: sp.garde === "1", chifa: sp.chifa === "1" };
  // Keyed on the query so a new search resets local state (picked match, hover).
  return <SearchView key={q} q={q} initial={initial} />;
}
