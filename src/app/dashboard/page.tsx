import type { Metadata } from "next";
import { StockManager } from "@/components/dashboard/stock-manager";
import { getLocale } from "@/lib/i18n-server";
import { DirScript, LocaleProvider } from "@/lib/locale";

export const metadata: Metadata = { title: "Stock" };

export default async function DashboardPage() {
  const locale = await getLocale();
  return (
    <LocaleProvider locale={locale}>
      <DirScript locale={locale} />
      <StockManager />
    </LocaleProvider>
  );
}
