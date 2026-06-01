/**
 * Session-Hilfsfunktionen
 * Laden und Verarbeiten von Session-Daten aus den Content Collections.
 */

import { getCollection } from "astro:content";
import type { Locale } from "./i18n";
import { getField } from "./i18n";

// ─── Typen ────────────────────────────────────────────────────────────────────

export type SessionEntry = Awaited<ReturnType<typeof getCollection<"sessions">>>[number];
export type SpeakerEntry = Awaited<ReturnType<typeof getCollection<"speakers">>>[number];
export type RoomEntry    = Awaited<ReturnType<typeof getCollection<"rooms">>>[number];

/** Aufbereitete Session für Templates */
export interface SessionView {
  id: string;
  slug: string;
  year: number;
  title: string;
  description: string;
  longDescription?: string;
  notes?: string;
  type: string;
  language: string;
  status: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  day: number;
  roomId: string;
  speakerIds: string[];
  level?: string;
  capacity?: number;
  registrationRequired: boolean;
  recording: boolean;
  sortOrder: number;
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

/** Berechnet Dauer in Minuten aus Start- und Endzeit (HH:MM) */
export function calcDuration(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

/** Gibt Session-Daten sprachspezifisch aufbereitet zurück */
export function toSessionView(entry: SessionEntry, locale: Locale): SessionView {
  const d = entry.data;
  return {
    id: d.id,
    slug: d.slug,
    year: d.year,
    title: getField<string>("title", locale, d as unknown as Record<string, unknown>),
    description: getField<string>("description", locale, d as unknown as Record<string, unknown>),
    longDescription: getField<string>("longDescription", locale, d as unknown as Record<string, unknown>) || undefined,
    notes: getField<string>("notes", locale, d as unknown as Record<string, unknown>) || undefined,
    type: d.type,
    language: d.language,
    status: d.status,
    date: d.date,
    startTime: d.startTime,
    endTime: d.endTime,
    durationMinutes: calcDuration(d.startTime, d.endTime),
    day: d.day,
    roomId: d.roomId,
    speakerIds: d.speakerIds,
    level: d.level,
    capacity: d.capacity,
    registrationRequired: d.registrationRequired,
    recording: d.recording,
    sortOrder: d.sortOrder,
  };
}

/** Lädt alle Sessions des aktuellen Jahrgangs (confirmed + draft, kein cancelled) */
export async function getCurrentSessions(year = 2026) {
  const all = await getCollection("sessions");
  return all
    .filter(s => s.data.year === year && s.data.status !== "cancelled")
    .sort((a, b) => {
      // Sortierung: Tag → Uhrzeit → Sortierreihenfolge
      if (a.data.day !== b.data.day) return a.data.day - b.data.day;
      if (a.data.startTime !== b.data.startTime) return a.data.startTime.localeCompare(b.data.startTime);
      return a.data.sortOrder - b.data.sortOrder;
    });
}

/** Gibt alle eindeutigen Tags zurück */
export function getUniqueDays(sessions: SessionEntry[]): number[] {
  return [...new Set(sessions.map(s => s.data.day))].sort();
}

/** Gibt alle eindeutigen Räume zurück */
export function getUniqueRooms(sessions: SessionEntry[]): string[] {
  return [...new Set(sessions.map(s => s.data.roomId))];
}

/** Gibt alle eindeutigen Sprachen zurück */
export function getUniqueLanguages(sessions: SessionEntry[]): string[] {
  return [...new Set(sessions.map(s => s.data.language))];
}

/** Gibt alle eindeutigen Typen zurück */
export function getUniqueTypes(sessions: SessionEntry[]): string[] {
  return [...new Set(sessions.map(s => s.data.type))];
}

/** Formatiert ein Datum auf DE/EN */
export function formatDate(dateStr: string, locale: Locale): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString(locale === "de" ? "de-DE" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Gibt Datum als kurze Variante zurück */
export function formatDateShort(dateStr: string, locale: Locale): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString(locale === "de" ? "de-DE" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
