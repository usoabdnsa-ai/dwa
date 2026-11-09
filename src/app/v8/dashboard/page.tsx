import type { Metadata } from "next";
import { Dashboard } from "@/v8/dashboard";

export const metadata: Metadata = { title: "Pharmacist dashboard" };

export default function V8DashboardPage() {
  return <Dashboard />;
}
