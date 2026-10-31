import type { Metadata } from "next";
import { MyDwa } from "@/components/my-dwa";

export const metadata: Metadata = { title: "My dwa" };

export default function MePage() {
  return <MyDwa />;
}
