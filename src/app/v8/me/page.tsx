import type { Metadata } from "next";
import { MeView } from "@/v8/account";

export const metadata: Metadata = { title: "My dwa" };

export default function V8MePage() {
  return <MeView />;
}
