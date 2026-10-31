import Link from "next/link";
import { getT } from "@/lib/i18n-server";
import { LanguageSwitcher } from "./language-switcher";
import { LogoMark } from "./logo";

/* Night again at the bottom: the app pages end where the home map lives. */
export async function SiteFooter() {
  const { t } = await getT();
  const [before, after] = t("footer.mapCredit", { a: "§a", b: "§b", c: "§c" }).split("§a");
  const [mid1, rest] = after.split("§b");
  const [mid2, tail] = rest.split("§c");
  return (
    <footer className="dusk-band border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 pt-24 pb-10 sm:px-6">
        <p className="max-w-3xl font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
          {t("footer.big1")} <span className="text-dusk-mint">{t("footer.big2")}</span>
        </p>
        <div className="mt-20 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-dusk-muted lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <LogoMark className="size-4 text-dusk-mint [--color-paper:var(--color-dusk)]" />
            <span>{t("footer.project")}</span>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/search" className="hover:text-dusk-ink">{t("footer.search")}</Link>
            <Link href="/search?garde=1" className="hover:text-dusk-ink">{t("nav.onDuty")}</Link>
            <Link href="/login" className="hover:text-dusk-ink">{t("footer.pharmacistSpace")}</Link>
            <Link href="/pro" className="hover:text-dusk-ink">dwa Pro</Link>
          </nav>
          <LanguageSwitcher />
        </div>
        <p className="mt-4 text-xs text-dusk-muted">
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
  );
}
