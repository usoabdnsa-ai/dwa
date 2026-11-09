import type { Metadata } from "next";
import { SearchView } from "@/v8/search";

export const metadata: Metadata = { title: "Find a medicine" };

export default async function V8SearchPage({ searchParams }: PageProps<"/v8/search">) {
  const { q } = await searchParams;
  return <SearchView q={typeof q === "string" ? q : ""} />;
}
