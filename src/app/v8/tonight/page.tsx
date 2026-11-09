import type { Metadata } from "next";
import { TonightView } from "@/v8/places";

export const metadata: Metadata = { title: "Open tonight" };

export default function V8TonightPage() {
  return <TonightView />;
}
