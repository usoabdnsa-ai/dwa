import type { Metadata } from "next";
import { StockManager } from "@/components/dashboard/stock-manager";

export const metadata: Metadata = { title: "Stock" };

export default function DashboardPage() {
  return <StockManager />;
}
