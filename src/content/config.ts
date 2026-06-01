/**
 * Astro Content Collections — Schema-Definitionen
 *
 * Alle Inhalte werden hier typisiert. Astro validiert beim Build.
 * Neue Felder hier eintragen, dann in den JSON-Dateien ergänzen.
 */

import { defineCollection, z } from "astro:content";

// ─── Sessions ─────────────────────────────────────────────────────────────────

const sessions = defineCollection({
  type: "data", // JSON-Dateien
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    year: z.number(), // Kongress-Jahr (Archivfähigkeit)

    // Bilinguale Felder
    title_de: z.string(),
    title_en: z.string(),
    description_de: z.string(),
    description_en: z.string(),
    longDescription_de: z.string().optional(),
    longDescription_en: z.string().optional(),
    notes_de: z.string().optional(),
    notes_en: z.string().optional(),

    // Session-Metadaten
    type: z.enum(["talk", "workshop", "keynote", "panel"]),
    language: z.enum(["de", "en", "both"]),
    status: z.enum(["confirmed", "draft", "cancelled"]).default("confirmed"),

    // Zeit & Ort
    date: z.string(), // ISO-Datum: "2026-09-05"
    startTime: z.string(), // "10:00"
    endTime: z.string(),   // "11:00"
    day: z.number(),       // 1, 2, 3 (für Filter)
    roomId: z.string(),

    // Verknüpfungen
    speakerIds: z.array(z.string()),
    moderatorId: z.string().optional(),

    // Optionale Angaben
    level: z.enum(["all", "beginner", "advanced"]).optional(),
    capacity: z.number().optional(),
    registrationRequired: z.boolean().default(false),
    recording: z.boolean().default(false),

    // Sortierung
    sortOrder: z.number().default(0),
  }),
});

// ─── Speakers / Referent:innen ────────────────────────────────────────────────

const speakers = defineCollection({
  type: "data",
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    year: z.number(),

    name: z.string(),
    pronouns: z.string().optional(),
    role_de: z.string(),
    role_en: z.string(),
    organization: z.string().optional(),

    bio_de: z.string(),
    bio_en: z.string(),
    longBio_de: z.string().optional(),
    longBio_en: z.string().optional(),

    photo: z.string().optional(), // Pfad relativ zu /public/images/speakers/
    photoPosition: z.string().optional(), // z.B. "center 30%" für Gesichtsfokus
    website: z.string().url().optional(),
    social: z
      .object({
        twitter: z.string().optional(),
        mastodon: z.string().optional(),
        linkedin: z.string().optional(),
        instagram: z.string().optional(),
      })
      .optional(),

    sessionIds: z.array(z.string()),
    sortOrder: z.number().default(0),
  }),
});

// ─── Rooms / Räume ────────────────────────────────────────────────────────────

const rooms = defineCollection({
  type: "data",
  schema: z.object({
    id: z.string(),
    name_de: z.string(),
    name_en: z.string(),
    building: z.string().optional(),
    floor: z.string().optional(),
    photo: z.string().optional(),
    story_de: z.string().optional(),
    story_en: z.string().optional(),
    description_de: z.string().optional(),
    description_en: z.string().optional(),
    accessibility_de: z.string().optional(),
    accessibility_en: z.string().optional(),
    capacity: z.number().optional(),
    sortOrder: z.number().default(0),
  }),
});

// ─── Partners / Sponsoring ────────────────────────────────────────────────────
// Datei partners.json enthält ein Array → z.array() als Schema

const partnerItem = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().optional(),
  url: z.string().url().optional(),
  category: z.enum(["main", "partner", "media", "supporter"]),
  description_de: z.string().optional(),
  description_en: z.string().optional(),
  sortOrder: z.number().default(0),
});

const partners = defineCollection({
  type: "data",
  schema: z.array(partnerItem),
});

// ─── FAQs ─────────────────────────────────────────────────────────────────────
// Datei allgemein.json enthält ein Array → z.array() als Schema

const faqItem = z.object({
  id: z.string(),
  question_de: z.string(),
  question_en: z.string(),
  answer_de: z.string(),
  answer_en: z.string(),
  category: z.string().optional(),
  sortOrder: z.number().default(0),
});

const faqs = defineCollection({
  type: "data",
  schema: z.array(faqItem),
});

// ─── Archive ──────────────────────────────────────────────────────────────────

const archive = defineCollection({
  type: "data",
  schema: z.object({
    year: z.number(),
    slug: z.string(),
    title_de: z.string(),
    title_en: z.string(),
    subtitle_de: z.string().optional(),
    subtitle_en: z.string().optional(),
    description_de: z.string(),
    description_en: z.string(),
    date_de: z.string(), // "5.–7. September 2025"
    date_en: z.string(), // "September 5–7, 2025"
    location: z.string(),
    city: z.string(),
    website: z.string().url().optional(),
    sessionsCount: z.number().optional(),
    speakersCount: z.number().optional(),
    attendeesCount: z.number().optional(),
    highlights_de: z.array(z.string()).optional(),
    highlights_en: z.array(z.string()).optional(),
    heroImage: z.string().optional(),
    sortOrder: z.number().default(0),
  }),
});

// ─── Export ───────────────────────────────────────────────────────────────────

export const collections = {
  sessions,
  speakers,
  rooms,
  partners,
  faqs,
  archive,
};
