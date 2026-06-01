# CLAUDE.md — Arbeitsregeln für dieses Projekt

Dieses Dokument definiert verbindliche Regeln für die Arbeit an der Tierrechtskongress-Website mit Claude Code.

---

## Inhaltliche Regeln

### Programm & Sessions
- **Nie** Programminhalte als Bild speichern. Alle Sessions müssen strukturierte JSON-Daten sein.
- Jede Session **muss** eine eindeutige `id` und einen eindeutigen `slug` haben.
- `id` und `slug` einer Session dürfen nachträglich **nicht geändert** werden (bricht URLs und Merklisten).
- Jeder Session-Slug entspricht einer statischen URL: `/programm/[slug]` und `/en/program/[slug]`.
- Session-Daten liegen in `src/content/sessions/*.json` — eine Datei pro Session.

### Referent:innen (Speakers)
- Jede referierende Person braucht eine eindeutige `id` und `slug`.
- `id`/`slug` nachträglich **nicht ändern**.
- `sessionIds` im Speaker-JSON und `speakerIds` im Session-JSON müssen konsistent sein.
- Fotos in `public/images/speakers/` ablegen, Pfad im JSON als `/images/speakers/...`.

### Übersetzungen
- Inhaltsfelder: immer beide Sprachvarianten pflegen (`_de` und `_en`).
- UI-Strings: `src/i18n/de.json` und `src/i18n/en.json` immer synchron halten.
- Wenn eine neue UI-Übersetzung hinzugefügt wird, in **beiden** Dateien ergänzen.
- Wenn eine neue Seite angelegt wird, in **beiden** Sprachen anlegen (DE + `/en/`).

### Relationen erhalten
- Beim Ändern einer Session-ID: `speakerIds` aller betroffenen Sessions und `sessionIds` aller betroffenen Speaker aktualisieren.
- Beim Löschen eines Raums: alle Sessions prüfen, die diesen `roomId` verwenden.
- Beim Umbenennen eines Slugs: Interne Links prüfen und anpassen.

---

## Technische Regeln

### Architektur
- Projekt bleibt **statisch** — kein SSR einführen, außer es ist explizit besprochen.
- Keine klassische Datenbank einführen.
- Formularlogik bleibt über den Adapter in `src/lib/forms/adapter.ts` austauschbar.
- **Payment nicht implementieren** — das ist für eine spätere Phase vorgesehen.

### Libraries
- So wenige externe Libraries wie möglich.
- Vor dem Hinzufügen einer neuen Dependency: prüfen, ob die Funktionalität mit Bordmitteln gelöst werden kann.
- Keine Library für einfache Aufgaben (String-Formatting, Array-Ops etc.).

### JavaScript
- Client-seitiges JS auf ein Minimum reduzieren.
- Kein JS-Framework (React, Vue etc.) einführen — Astro Components + Vanilla JS genügen.
- JS-Scripts in `src/scripts/` ablegen und als `type="module"` einbinden.

### CSS
- Design-Tokens zentral in `src/styles/tokens.css`.
- Keine Inline-Styles für Design-Entscheidungen — CSS Custom Properties nutzen.
- Keine CSS-in-JS-Lösungen.

### Accessibility (A11y)
- Semantisches HTML bevorzugen — `<article>`, `<section>`, `<nav>`, `<main>`, `<header>`, `<footer>`.
- Jedes interaktive Element muss per Tastatur bedienbar sein.
- Bilder immer mit sinnvollem `alt`-Text, oder `alt=""` für dekorative Bilder.
- Farbkontraste müssen WCAG AA (4.5:1 für Text) erfüllen.
- Formulare: Labels immer mit `for`/`id` verknüpft, Fehler barrierefrei kommunizieren.
- `aria-`Attribute nur dort, wo sinnvoll — kein „aria for aria's sake".

### SEO
- Jede Seite braucht eindeutigen `<title>` und `<meta name="description">`.
- `hreflang`-Tags bei allen mehrsprachigen Seiten korrekt setzen.
- Canonical-URL auf jeder Seite korrekt setzen.
- Slug-Änderungen bedürfen Redirects (in `public/_redirects` für Netlify).

---

## Dateikonventionen

| Was | Wo | Format |
|-----|----|--------|
| Session | `src/content/sessions/[id].json` | JSON |
| Speaker | `src/content/speakers/[slug].json` | JSON |
| Raum | `src/content/rooms/[id].json` | JSON |
| FAQ | `src/content/faqs/allgemein.json` | JSON-Array |
| Partner | `src/content/partners/partners.json` | JSON-Array |
| Archiv | `src/content/archive/[year].json` | JSON |
| Seiten-Komponente | `src/components/[bereich]/Name.astro` | Astro |
| Layout | `src/layouts/Name.astro` | Astro |
| Seite DE | `src/pages/[pfad].astro` | Astro |
| Seite EN | `src/pages/en/[path].astro` | Astro |

---

## Checkliste für neue Sessions

- [ ] Eindeutige `id` und `slug` vergeben
- [ ] `year: 2026` gesetzt
- [ ] `title_de` und `title_en` befüllt
- [ ] `description_de` und `description_en` befüllt
- [ ] `roomId` zeigt auf existierende Raum-ID
- [ ] `speakerIds` zeigt auf existierende Speaker-IDs
- [ ] `sessionIds` in allen referenzierten Speakern ergänzt
- [ ] `date`, `startTime`, `endTime`, `day` korrekt
- [ ] `status: "confirmed"` (oder `"draft"` wenn noch nicht bestätigt)

## Checkliste für neue Referent:innen

- [ ] Eindeutige `id` und `slug` vergeben
- [ ] `year: 2026` gesetzt
- [ ] `name`, `role_de`, `role_en`, `bio_de`, `bio_en` befüllt
- [ ] `sessionIds: []` zunächst leer, dann beim Anlegen der Sessions ergänzen
- [ ] Foto unter `public/images/speakers/[slug].jpg` abgelegt

## Checkliste für neue Seite (beide Sprachen)

- [ ] `src/pages/[pfad].astro` (DE)
- [ ] `src/pages/en/[path].astro` (EN)
- [ ] `hreflang` in `alternates`-Props korrekt gesetzt
- [ ] Route in `src/lib/i18n.ts` → `pathTranslations` ergänzt
- [ ] Route in Sitemap-Generator `src/pages/sitemap.xml.ts` ergänzt
- [ ] Navigation-Links in Header/Footer ggf. aktualisieren
