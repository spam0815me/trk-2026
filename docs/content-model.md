# Content-Modell — Tierrechtskongress-Website

## Übersicht

Alle Inhalte sind dateibasiert in `src/content/` gespeichert.
Das Schema wird in `src/content/config.ts` TypeScript-typisiert und von Astro beim Build validiert.

---

## Sessions (`src/content/sessions/*.json`)

Jede Session ist eine eigene JSON-Datei.

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| `id` | string | ✓ | Eindeutige ID, z.B. `"session-2026-01"` |
| `slug` | string | ✓ | URL-Slug, z.B. `"mein-vortrag"` |
| `year` | number | ✓ | Kongress-Jahr `2026` |
| `title_de` / `title_en` | string | ✓ | Titel in DE/EN |
| `description_de/en` | string | ✓ | Kurzbeschreibung |
| `longDescription_de/en` | string | — | Ausführliche Beschreibung |
| `notes_de/en` | string | — | Hinweise (z.B. Anmeldung erforderlich) |
| `type` | enum | ✓ | `talk` \| `workshop` \| `keynote` \| `panel` |
| `language` | enum | ✓ | `de` \| `en` \| `both` |
| `status` | enum | ✓ | `confirmed` \| `draft` \| `cancelled` |
| `date` | string | ✓ | ISO-Datum `"2026-09-05"` |
| `startTime` / `endTime` | string | ✓ | `"10:00"` / `"11:00"` |
| `day` | number | ✓ | Tag-Nummer: 1, 2, 3 |
| `roomId` | string | ✓ | Verweis auf Raum-ID |
| `speakerIds` | string[] | ✓ | Array von Referent:innen-IDs |
| `moderatorId` | string | — | Optional: Moderation |
| `level` | enum | — | `all` \| `beginner` \| `advanced` |
| `capacity` | number | — | Maximale Teilnehmendenzahl |
| `registrationRequired` | boolean | — | Anmeldung erforderlich? |
| `recording` | boolean | — | Aufzeichnung geplant? |
| `sortOrder` | number | — | Sortierung innerhalb Zeitblock |

---

## Speakers (`src/content/speakers/*.json`)

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|--------------|
| `id` / `slug` | string | ✓ | Eindeutig, URL-sicher |
| `year` | number | ✓ | Zugehöriges Kongress-Jahr |
| `name` | string | ✓ | Vollständiger Name |
| `pronouns` | string | — | z.B. `"sie/ihr"` |
| `role_de/en` | string | ✓ | Funktion/Titel |
| `organization` | string | — | Organisation/Firma |
| `bio_de/en` | string | ✓ | Kurz-Bio |
| `longBio_de/en` | string | — | Ausführliche Bio |
| `photo` | string | — | Pfad ab `/public/`, z.B. `/images/speakers/name.jpg` |
| `website` | string | — | URL |
| `social` | object | — | `{ twitter, mastodon, linkedin, instagram }` |
| `sessionIds` | string[] | ✓ | Verweis auf Sessions |
| `sortOrder` | number | — | Sortierung |

---

## Rooms (`src/content/rooms/*.json`)

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | string | Eindeutig, z.B. `"saal-a"` |
| `name_de/en` | string | Raumname |
| `building` | string | Gebäude (optional) |
| `floor` | string | Stockwerk (optional) |
| `description_de/en` | string | Beschreibung |
| `accessibility_de/en` | string | Barrierefreiheitsinfos |
| `capacity` | number | Kapazität |
| `sortOrder` | number | Sortierung |

---

## Partners (`src/content/partners/partners.json`)

Array von Partner-Objekten.

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | string | Eindeutig |
| `name` | string | Name der Organisation |
| `logo` | string | Pfad zu SVG/PNG |
| `url` | string | Website |
| `category` | enum | `main` \| `partner` \| `media` \| `supporter` |
| `description_de/en` | string | Kurzbeschreibung |
| `sortOrder` | number | Anzeigereihenfolge |

---

## FAQs (`src/content/faqs/allgemein.json`)

Array von FAQ-Einträgen.

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | string | Eindeutig |
| `question_de/en` | string | Frage |
| `answer_de/en` | string | Antwort (HTML erlaubt) |
| `category` | string | z.B. `"general"`, `"registration"`, `"program"` |
| `sortOrder` | number | Reihenfolge |

---

## Archive (`src/content/archive/*.json`)

Eine JSON-Datei pro Ausgabe (z.B. `2025.json`).

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `year` | number | Jahreszahl |
| `slug` | string | URL-Slug (normalerweise die Jahreszahl als String) |
| `title_de/en` | string | Titel |
| `subtitle_de/en` | string | Untertitel (optional) |
| `description_de/en` | string | Beschreibung |
| `date_de/en` | string | Datum als Text, z.B. `"5.–7. September 2025"` |
| `location` | string | Veranstaltungsort |
| `city` | string | Stadt |
| `sessionsCount` | number | Anzahl Sessions |
| `speakersCount` | number | Anzahl Referent:innen |
| `attendeesCount` | number | Anzahl Teilnehmende |
| `highlights_de/en` | string[] | Highlights als Liste |
| `heroImage` | string | Optionales Bild |
| `sortOrder` | number | Reihenfolge (neueste zuerst: niedrigster Wert) |

---

## i18n-Übersetzungen (`src/i18n/de.json`, `src/i18n/en.json`)

Alle UI-Strings sind in diesen zwei Dateien organisiert.
Die Struktur ist verschachtelt nach Seitenbereich (z.B. `nav.*`, `program.*`, `registration.form.*`).
Beide Dateien müssen strukturell identisch sein.
