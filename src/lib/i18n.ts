/**
 * i18n-Hilfsfunktionen
 *
 * Zentrale Logik für Übersetzungen, URL-Generierung und Sprach-Routing.
 * Neue Sprachen können durch Ergänzung in LOCALES und der JSON-Dateien hinzugefügt werden.
 */

import de from "../i18n/de.json";
import en from "../i18n/en.json";

// ─── Typen ───────────────────────────────────────────────────────────────────

export type Locale = "de" | "en";
// Für eine dritte Sprache: export type Locale = "de" | "en" | "fr";

// Frontend ist DE-only — der /en-Baum wurde entfernt. "en" bleibt im Locale-Typ
// (Content-Felder _en sind Schema-Pflicht), wird aber nicht mehr gerendert/verlinkt.
export const LOCALES: Locale[] = ["de"];
export const DEFAULT_LOCALE: Locale = "de";

// Übersetzungs-Map
const translations: Record<Locale, typeof de> = { de, en };

// ─── Kernfunktion: t() ────────────────────────────────────────────────────────

type DeepKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string ? `${K}` | `${K}.${DeepKeyOf<T[K]>}` : never }[keyof T]
  : never;

type ValueAt<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? ValueAt<T[K], Rest>
    : never
  : P extends keyof T
  ? T[P]
  : never;

/**
 * Übersetzungs-Funktion — gibt den String für den angegebenen Schlüssel zurück.
 *
 * Verwendung:
 *   const t = useTranslations("de");
 *   t("nav.home") // → "Startseite"
 */
export function useTranslations(locale: Locale) {
  return function t(key: DeepKeyOf<typeof de>): string {
    const parts = (key as string).split(".");
    let value: unknown = translations[locale] ?? translations[DEFAULT_LOCALE];

    for (const part of parts) {
      if (typeof value === "object" && value !== null && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        // Fallback: versuche Default-Locale
        let fallback: unknown = translations[DEFAULT_LOCALE];
        for (const p of parts) {
          if (typeof fallback === "object" && fallback !== null && p in fallback) {
            fallback = (fallback as Record<string, unknown>)[p];
          } else {
            return key as string; // Schlüssel zurückgeben als letzter Fallback
          }
        }
        return typeof fallback === "string" ? fallback : (key as string);
      }
    }

    return typeof value === "string" ? value : (key as string);
  };
}

// ─── URL-Hilfsfunktionen ──────────────────────────────────────────────────────

/**
 * Gibt die korrekte URL für eine Seite zurück.
 * Für die Default-Locale (de) wird kein Prefix gesetzt.
 *
 * localizeUrl("de", "/programm") → "/programm"
 * localizeUrl("en", "/programm") → "/en/program"
 */
export function localizeUrl(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) {
    return path;
  }
  return `/${locale}${path}`;
}

/**
 * Pfadübersetzungen zwischen den Sprachen.
 * Muss für neue Routen gepflegt werden.
 */
export const pathTranslations: Record<Locale, Record<string, string>> = {
  de: {
    "/": "/",
    "/programm": "/programm",
    "/programm/merkliste": "/programm/merkliste",
    "/referentinnen": "/referentinnen",
    "/ort": "/ort",
    "/anmeldung": "/anmeldung",
    "/bestaetigung": "/bestaetigung",
    "/archiv": "/archiv",
    "/faq": "/faq",
    "/kontakt": "/kontakt",
    "/sponsoring": "/sponsoring",
    "/barrierefreiheit": "/barrierefreiheit",
    "/datenschutz": "/datenschutz",
  },
  en: {
    "/": "/",
    "/programm": "/program",
    "/programm/merkliste": "/program/bookmarks",
    "/referentinnen": "/speakers",
    "/ort": "/venue",
    "/anmeldung": "/registration",
    "/bestaetigung": "/confirmation",
    "/archiv": "/archive",
    "/faq": "/faq",
    "/kontakt": "/contact",
    "/sponsoring": "/sponsoring",
    "/barrierefreiheit": "/accessibility",
    "/datenschutz": "/privacy",
  },
};

/**
 * Gibt die übersetzte URL für einen DE-Pfad in der Zielsprache zurück.
 */
export function getLocalizedPath(dePath: string, targetLocale: Locale): string {
  const translated = pathTranslations[targetLocale][dePath] ?? dePath;
  return localizeUrl(targetLocale, translated);
}

/**
 * Extrahiert die Locale aus einer Astro-URL.
 */
export function getLocaleFromUrl(url: URL): Locale {
  const [, firstSegment] = url.pathname.split("/");
  if (LOCALES.includes(firstSegment as Locale) && firstSegment !== DEFAULT_LOCALE) {
    return firstSegment as Locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Gibt den Pfad ohne Locale-Prefix zurück (normalisiert auf DE-Pfad).
 */
export function getPathWithoutLocale(url: URL): string {
  const locale = getLocaleFromUrl(url);
  if (locale === DEFAULT_LOCALE) {
    return url.pathname;
  }
  return url.pathname.replace(`/${locale}`, "") || "/";
}

// ─── Hilfsfunktion für bilinguale Content-Felder ─────────────────────────────

/**
 * Gibt den sprachspezifischen Wert eines bilingualen Feldes zurück.
 * Konvention: Felder enden auf _de oder _en.
 *
 * getField("title", "en", { title_de: "Hallo", title_en: "Hello" })
 * → "Hello"
 */
export function getField<T>(
  fieldBase: string,
  locale: Locale,
  obj: Record<string, unknown>
): T {
  const key = `${fieldBase}_${locale}`;
  const fallbackKey = `${fieldBase}_${DEFAULT_LOCALE}`;
  return (obj[key] ?? obj[fallbackKey] ?? "") as T;
}
