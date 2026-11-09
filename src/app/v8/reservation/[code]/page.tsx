import type { Metadata } from "next";
import { ReservationView } from "@/v8/booking";

export const metadata: Metadata = { title: "Your reservation" };

export default async function V8ReservationPage({ params, searchParams }: PageProps<"/v8/reservation/[code]">) {
  const { code } = await params;
  const { paid } = await searchParams;
  return <ReservationView code={code} paid={typeof paid === "string" ? paid : null} />;
}
