import type { Metadata } from "next";
import { ReserveView } from "@/v8/booking";

export const metadata: Metadata = { title: "Reserve" };

export default async function V8ReservePage({ searchParams }: PageProps<"/v8/reserve">) {
  const { ph, med } = await searchParams;
  return <ReserveView ph={typeof ph === "string" ? ph : ""} med={typeof med === "string" ? med : ""} />;
}
