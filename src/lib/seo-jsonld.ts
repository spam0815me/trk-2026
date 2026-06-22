/**
 * Zentrale schema.org-JSON-LD-Bausteine (strukturierte Daten für SEO/GEO).
 *
 * Eine Quelle für alle strukturierten Daten — keine parallelen Implementierungen.
 * Fakten (Datum, Ort, Veranstalterin) hier pflegen, Sprach-/URL-abhängiges per Argument.
 */
import type { Locale } from "./i18n";

const ORGANIZER = {
  "@type": "Organization",
  name: "Tier im Fokus (TIF)",
  alternateName: "TIF",
  url: "https://tierimfokus.ch",
} as const;

const LOCATION = {
  "@type": "Place",
  name: "Photobastei",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Sihlquai 125",
    postalCode: "8005",
    addressLocality: "Zürich",
    addressCountry: "CH",
  },
} as const;

const CONGRESS_NAME: Record<Locale, string> = {
  de: "Tierrechtskongress 2026",
  en: "Animal Rights Congress 2026",
};

/** Haupt-Event (der gesamte Kongress) — für die Startseite. */
export function congressEventJsonLd(opts: {
  locale: Locale;
  url: string;
  image: string;
  description: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: CONGRESS_NAME[opts.locale],
    description: opts.description,
    startDate: "2026-10-23",
    endDate: "2026-10-25",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: LOCATION,
    organizer: ORGANIZER,
    image: opts.image,
    url: opts.url,
    inLanguage: opts.locale,
  };
}

/** Veranstalterin als eigenständige Organization (Knowledge Graph). */
export function organizationJsonLd(): Record<string, unknown> {
  return { "@context": "https://schema.org", ...ORGANIZER };
}

// Schweizer Sommerzeit endet am letzten Sonntag im Oktober (25.10.2026 -> CET).
function tzOffset(date: string): string {
  return date >= "2026-10-25" ? "+01:00" : "+02:00";
}

/** Einzelne Session als Event (Sub-Event des Kongresses) — für Session-Detailseiten. */
export function sessionEventJsonLd(opts: {
  locale: Locale;
  name: string;
  description: string;
  date: string; // "2026-10-24"
  startTime: string; // "15:00"
  endTime: string; // "16:00"
  roomName: string;
  performers: string[];
  url: string;
  superEventUrl: string;
}): Record<string, unknown> {
  const off = tzOffset(opts.date);
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: opts.name,
    description: opts.description,
    startDate: `${opts.date}T${opts.startTime}:00${off}`,
    endDate: `${opts.date}T${opts.endTime}:00${off}`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: opts.roomName ? `${opts.roomName}, Photobastei` : "Photobastei",
      address: { ...LOCATION.address },
    },
    organizer: ORGANIZER,
    ...(opts.performers.length
      ? { performer: opts.performers.map(n => ({ "@type": "Person", name: n })) }
      : {}),
    superEvent: { "@type": "Event", name: CONGRESS_NAME[opts.locale], url: opts.superEventUrl },
    url: opts.url,
    inLanguage: opts.locale,
  };
}
