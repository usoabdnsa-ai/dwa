import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale, makeT, type Locale } from "./i18n";

/** The visitor's language, from the cookie the switcher sets. English by default. */
export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : "en";
}

export async function getT() {
  const locale = await getLocale();
  return { locale, t: makeT(locale) };
}
