# Tierrechtskongress 2026 — Website

Statische, mehrsprachige (DE/EN) Kongress-Website auf Basis von [Astro](https://astro.build).

---

## Voraussetzungen

- Node.js >= 18.17
- npm >= 9

## Lokaler Start

```bash
npm install
npm run dev
```

Die Seite läuft dann unter `http://localhost:4321`.

## Weitere Befehle

| Befehl            | Beschreibung                        |
|-------------------|-------------------------------------|
| `npm run dev`     | Lokaler Entwicklungsserver          |
| `npm run build`   | Produktions-Build nach `dist/`      |
| `npm run preview` | Build lokal vorschauen              |
| `npm run check`   | TypeScript + Astro-Typecheck        |

## Projektstruktur

```
src/
  components/       Wiederverwendbare Astro-Komponenten
    layout/         Header, Footer, LanguageSwitcher
    ui/             Hero, CTABlock, Breadcrumbs, SEOHead
    program/        SessionCard, Filters
    speakers/       SpeakerCard
    faq/            FAQAccordion
    partners/       PartnerGrid
    forms/          RegistrationForm, FormField
  content/          Alle Inhalte als JSON-Dateien
    sessions/       Programm-Sessions
    speakers/       Referent:innen
    rooms/          Rauminfos
    partners/       Partner/Sponsoren
    faqs/           FAQ-Einträge
    archive/        Vergangene Kongress-Ausgaben
  i18n/             Übersetzungs-Strings (de.json, en.json)
  layouts/          BaseLayout, PageLayout
  lib/              Hilfsfunktionen (i18n, ical, sessions, forms)
  pages/            Alle Seiten-Routes (DE + /en/ für EN)
  scripts/          Client-Side JS (Filter, Bookmarks)
  styles/           tokens.css, global.css
public/
  images/           Bilder (speakers/, partners/)
  favicons/         Favicon-Dateien
docs/               Dokumentation
CLAUDE.md           Arbeitsregeln für Claude Code
```

## Inhalte bearbeiten

- **Sessions** → `src/content/sessions/*.json`
- **Referent:innen** → `src/content/speakers/*.json`
- **FAQ** → `src/content/faqs/allgemein.json`
- **Partner** → `src/content/partners/partners.json`
- **Archiv** → `src/content/archive/*.json`
- **Übersetzungen** → `src/i18n/de.json` und `src/i18n/en.json`
- **Design-Tokens** → `src/styles/tokens.css`

Ausführliche Anleitungen: `docs/editing-guide.md`

## Deployment

### Netlify (empfohlen)
1. Repository auf GitHub/GitLab pushen
2. Netlify mit dem Repo verbinden
3. Build-Befehl: `npm run build`
4. Publish-Verzeichnis: `dist`
5. Formulare funktionieren automatisch über Netlify Forms

### Andere statische Hosts (Vercel, Cloudflare Pages etc.)
- Build: `npm run build`
- Output: `dist/`
- Kein Server nötig (vollständig statisch)

## Offene CI-Angaben (von TIF zu liefern)

Siehe `docs/requirements.md` für eine vollständige Liste der fehlenden Informationen.
