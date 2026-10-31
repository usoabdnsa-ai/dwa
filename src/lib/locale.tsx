"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { LOCALE_COOKIE, dirOf, intlLocale, makeT, type Locale, type T } from "./i18n";

type Ctx = { locale: Locale; t: T; intl: string; setLocale: (l: Locale) => void };

const LocaleContext = createContext<Ctx>({ locale: "en", t: makeT("en"), intl: "en-GB", setLocale: () => {} });

/*
 * Language for the main site. The server reads the cookie and passes the
 * locale in, so the first paint is already in the right language; switching
 * writes the cookie and re-renders the server components.
 */
export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const router = useRouter();

  // Direction and language on <html>; reset when leaving the main site (v3 to v5 stay English).
  useEffect(() => {
    const html = document.documentElement;
    html.lang = locale;
    html.dir = dirOf(locale);
    return () => {
      html.lang = "en";
      html.dir = "ltr";
    };
  }, [locale]);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      t: makeT(locale),
      intl: intlLocale(locale),
      setLocale: (l) => {
        document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
        router.refresh();
      },
    }),
    [locale, router],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useT() {
  return useContext(LocaleContext);
}

/** Inline before the page so <html dir> is right on the very first paint (no right-to-left jump). */
export function DirScript({ locale }: { locale: Locale }) {
  return <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)};document.documentElement.dir=${JSON.stringify(dirOf(locale))};` }} />;
}
