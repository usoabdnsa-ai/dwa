"use client";

import Link from "next/link";
import { useT } from "@/lib/locale";
import { LanguageSwitcher } from "./language-switcher";
import { LogoMark } from "./logo";
import { CommandSearch } from "./command-search";

/* The floating night pill from the home map, shared by every page so the site reads as one place. */
export function PillNav() {
  const { t } = useT();
  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-40 flex justify-center px-4">
      <nav className="night-card pointer-events-auto flex items-center gap-1 rounded-full p-1.5 pl-4 text-sm text-dusk-ink">
        <Link href="/" className="mr-2 flex items-center gap-2 text-dusk-mint" aria-label={t("nav.homeLabel")}>
          <LogoMark className="size-6 [--color-paper:var(--color-dusk-2)]" />
          <span className="font-display text-lg font-bold tracking-tight text-dusk-ink">dwa</span>
        </Link>
        <CommandSearch />
        <Link href="/search?garde=1" className="hidden rounded-full px-3 py-2 text-dusk-muted hover:text-dusk-ink sm:block">
          {t("nav.onDuty")}
        </Link>
        <Link href="/me" className="hidden rounded-full px-3 py-2 text-dusk-muted hover:text-dusk-ink md:block">
          {t("nav.my")}
        </Link>
        <Link
          href="/login"
          className="rounded-full bg-dusk-mint px-4 py-2 font-semibold text-[#06241f] transition-colors duration-150 hover:bg-white"
        >
          {t("nav.forPharmacists")}
        </Link>
        <span className="hidden lg:block">
          <LanguageSwitcher />
        </span>
      </nav>
    </header>
  );
}
