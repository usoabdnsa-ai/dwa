import { PillNav } from "@/components/pill-nav";
import { SiteFooter } from "@/components/site-footer";
import { getLocale } from "@/lib/i18n-server";
import { DirScript, LocaleProvider } from "@/lib/locale";

/* App pages are the home's city by day: the same pill nav, each page opening in a dusk band, a night footer. */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <LocaleProvider locale={locale}>
      <DirScript locale={locale} />
      <PillNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </LocaleProvider>
  );
}
