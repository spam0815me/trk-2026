# Offene Anforderungen & fehlende CI-Angaben

## Vom TIF zu liefern

### CI / Branding
- [ ] **Primärfarbe** (Hex-Code) → `src/styles/tokens.css` → `--color-primary`
- [ ] **Sekundärfarbe** → `--color-secondary`
- [ ] **Akzentfarbe** → `--color-accent`
- [ ] **Markenschrift (Überschriften)** → `--font-heading`
- [ ] **Markenschrift (Fließtext)** → `--font-body`
- [ ] **Logo** (SVG bevorzugt, hell + dunkel) → `public/images/`, in Header und Footer einfügen
- [ ] **Favicon** (SVG + PNG 96×96 + Apple Touch Icon 180×180) → `public/favicons/`
- [ ] **OG-Default-Bild** (1200×630px) → `public/images/og-default.jpg`

### Kongress-Inhalte 2026
- [ ] **Veranstaltungsort** (Name, vollständige Adresse)
- [ ] **ÖPNV-Anreiseinformationen**
- [ ] **Ticketpreise** (sobald bekannt) → `src/i18n/de.json` → `registration.form.ticketCategories`
- [ ] **Kontakt-E-Mail-Adresse** → `src/pages/kontakt.astro`
- [ ] **Impressumsangaben** (Name, Adresse, Verantwortliche Person)
- [ ] **Datenschutzerklärung** (rechtlich geprüft) → `src/pages/datenschutz.astro`
- [ ] **Produktions-URL** → `astro.config.mjs` → `site:`
- [ ] **Speaker-Fotos** → `public/images/speakers/`
- [ ] **Partner-Logos** → `public/images/partners/`
- [ ] **Social-Media-Accounts** → Footer in `src/components/layout/Footer.astro`

### Technisch
- [ ] **Formular-Backend entscheiden**: Netlify Forms (Standard, bereits vorbereitet), Formspree oder andere Lösung
- [ ] **E-Mail-Bestätigung nach Anmeldung**: Separat über Netlify/Formspree oder eigene Serverless Function einrichten
- [ ] **Deployment-Ziel**: Netlify, Vercel, Cloudflare Pages oder anderer Hoster

## Durchsuchen nach TODOs im Code

```bash
grep -rn "TODO" src/ public/ --include="*.astro" --include="*.ts" --include="*.css" --include="*.json"
```
