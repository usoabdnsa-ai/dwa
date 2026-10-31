"use client";

import { Languages } from "lucide-react";
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT } from "@/lib/i18n";
import { useT } from "@/lib/locale";

/* EN · FR · عربي. The current one is highlighted; the choice is remembered for a year. */
export function LanguageSwitcher({ tone = "night" }: { tone?: "night" | "light" }) {
  const { locale, setLocale, t } = useT();
  const idle = tone === "night" ? "text-dusk-muted hover:text-dusk-ink" : "text-muted hover:text-ink";
  const on = tone === "night" ? "bg-white/10 text-dusk-ink" : "bg-ink text-paper";
  return (
    <div role="group" aria-label={t("nav.language")} className="flex items-center gap-0.5 rounded-full p-0.5">
      <Languages className={`mx-1 size-3.5 ${tone === "night" ? "text-dusk-muted" : "text-muted"}`} aria-hidden />
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-pressed={locale === l}
          title={LOCALE_NAMES[l]}
          onClick={() => locale !== l && setLocale(l)}
          className={`rounded-full px-2 py-1 text-xs font-medium transition-colors duration-150 ${locale === l ? on : idle}`}
        >
          {LOCALE_SHORT[l]}
        </button>
      ))}
    </div>
  );
}
