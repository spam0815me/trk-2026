# Social-Sharing-Bild (Open Graph / Twitter Card)

Erzeugt `public/images/og-default.jpg` (1200 × 630) — das Vorschaubild, das beim
Teilen der Website auf WhatsApp, Facebook, LinkedIn, X, Signal usw. erscheint.

Eingebunden in `src/components/ui/SEOHead.astro` als Default-`ogImage`. Jede Seite
kann über die `ogImage`-Prop ein eigenes Bild mitgeben; ohne Angabe greift dieses.

## Bestandteile (alle aus `public/images/`, gleicher Look wie der Hero)

- `trk-header-bg.png` — heller Beton-Hintergrund
- `trk-logo.png` — Logo (dunkle Kuh + Schriftzug, Positiv-Variante für hellen Grund)
- `hero-kuh.png` — Foto in Sprechblasen-Form
- `x-separator.svg` — Marken-X als Trenner im Datum-Band

Text/Datum sind aus den Site-Inhalten belegt: **23.–25. Oktober 2026, Photobastei Zürich**.

## Neu rendern

1. Lokalen Server im Projekt-Root starten:
   `python3 -m http.server 8765`
2. `http://localhost:8765/scripts/og-image/og-default.html` bei Viewport **1200 × 630** öffnen
   (DevTools → Device Toolbar → 1200×630) und einen Screenshot der `.og-card` machen
   — oder per Playwright den Viewport auf 1200×630 setzen und `page.screenshot()`.
3. Zu JPG konvertieren / optimieren:
   `sips -s format jpeg -s formatOptions 88 <screenshot>.png --out public/images/og-default.jpg`

Layout und Texte werden in `og-default.html` (CSS oben) gepflegt — dort anpassen,
neu rendern, JPG ersetzen.
