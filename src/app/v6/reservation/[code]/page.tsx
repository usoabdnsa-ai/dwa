import type { Metadata } from "next";
import { ReservationStatus } from "@/v6/reservation";

export const metadata: Metadata = { title: "Your reservation" };

export default async function V6ReservationPage({
  params,
  searchParams,
}: PageProps<"/v6/reservation/[code]">) {
  const { code } = await params;
  const { paid } = await searchParams;
  return (
    <ReservationStatus
      code={code}
      paid={typeof paid === "string" ? paid : null}
    />
  );
}
