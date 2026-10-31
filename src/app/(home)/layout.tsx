import { LogoMark } from "@/components/logo";
import { PillNav } from "@/components/pill-nav";
import { getT } from "@/lib/i18n-server";
import { DirScript, LocaleProvider } from "@/lib/locale";

/* The home page lives on the night map, so it skips the app pages' dusk band and big footer: just the shared pill nav and a one-line footer. */
export default async function HomeLayout({ children }: LayoutProps<"/">) {
  const { locale, t } = await getT();
  const [before, after] = t("footer.mapCredit", { a: "§a", b: "§b", c: "§c" }).split("§a");
  const [mid1, rest] = after.split("§b");
  const [mid2, tail] = rest.split("§c");
  return (
    <LocaleProvider locale={locale}>
      <DirScript locale={locale} />
      <div className="flex min-h-full flex-1 flex-col bg-dusk text-dusk-ink">
        <PillNav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-dusk-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="flex items-center gap-2">
              <LogoMark className="size-4 text-dusk-mint [--color-paper:var(--color-dusk)]" />
              {t("footer.project")}
            </p>
            <p>
              {before}
              <a href="https://openfreemap.org" className="hover:text-dusk-ink">OpenFreeMap</a>
              {mid1}
              <a href="https://www.openmaptiles.org/" className="hover:text-dusk-ink">OpenMapTiles</a>
              {mid2}
              <a href="https://www.openstreetmap.org/copyright" className="hover:text-dusk-ink">{t("footer.osm")}</a>
              {tail}
            </p>
          </div>
        </footer>
      </div>
    </LocaleProvider>
  );
}
