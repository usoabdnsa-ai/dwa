import type { Metadata } from "next";
import { ReservationView } from "@/components/reservation-view";

export const metadata: Metadata = { title: "Your reservation" };

export default async function ReservationPage({ params, searchParams }: PageProps<"/reservation/[code]">) {
  const { code } = await params;
  const { paid } = await searchParams;
  return <ReservationView code={code} paid={typeof paid === "string" ? paid : null} />;
}
