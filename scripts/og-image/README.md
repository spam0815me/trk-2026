# Social-Sharing-Bild (Open Graph / Twitter Card)

Erzeugt `public/images/og-default.jpg` (1200 × 630) – das Vorschaubild, das beim
Teilen der Website auf WhatsApp, Facebook, LinkedIn, X, Signal usw. erscheint.

Eingebunden in `src/components/ui/SEOHead.astro` als Default-`ogImage`. Jede Seite
kann über die `ogImage`-Prop ein eigenes Bild mitgeben; ohne Angabe greift dieses.

## Bestandteile

- `public/images/trk-header-bg.webp` – heller Beton-Hintergrund (gleicher Look wie der Hero)
- `trk-logo-trim.png` – das Logo (Kuh im gelben X, enthält bereits
  «Tierrechtskongress 2026 / Tier im Fokus»), gross & zentriert

### Logo-Quelle: immer das SVG

Verbindlich ist **`public/images/trk-logo.svg`** (identisch mit `Ressourcen /Logo/TRK_26_Logo.svg`):
die Kuh **im gelben X**. Es gibt keine offizielle Variante ohne X – wo eine auftaucht, ist sie
falsch. Zwischen Juni und August 2026 lag genau so eine X-lose Kuh in `trk-logo.png`; über den
Trim wanderte sie ins OG-Bild und in die Sharepics.

`public/images/trk-logo.png` ist deshalb kein eigenes Motiv mehr, sondern ein Render des SVG.
Beide neu erzeugen, wenn sich das Logo ändert:

```bash
rsvg-convert -w 2000 public/images/trk-logo.svg -o /tmp/trk-logo.png
```

```python
from PIL import Image
src = Image.open("/tmp/trk-logo.png").convert("RGBA")
src.quantize(colors=128, method=Image.FASTOCTREE, dither=Image.NONE).save(
    "public/images/trk-logo.png", optimize=True)          # Download auf /medien
im = Image.open("public/images/trk-logo.png").convert("RGBA")
im.crop(im.getbbox()).save("scripts/og-image/trk-logo-trim.png", optimize=True)
```

### Warum ein getrimmtes Logo?

Das gerenderte PNG hat ungleiche transparente Ränder. Zentriert man es als Ganzes, sitzt das
sichtbare Motiv nicht mittig – deshalb das zugeschnittene `trk-logo-trim.png` (Motiv =
Bounding-Box). Der Hero der Startseite bindet direkt das SVG ein, nicht das PNG.

## Neu rendern

1. Lokalen Server im Projekt-Root starten:
   `python3 -m http.server 8765 --directory .`
2. `http://localhost:8765/scripts/og-image/og-default.html` bei Viewport **1200 × 630** öffnen
   (DevTools → Device Toolbar → 1200×630) und einen Screenshot der `.og-card` machen
   – oder per Playwright den Viewport auf 1200×630 setzen und `page.screenshot()`.
3. Zu JPG konvertieren / optimieren:
   `sips -s format jpeg -s formatOptions 90 <screenshot>.png --out public/images/og-default.jpg`

Logo-Grösse/Layout werden in `og-default.html` (CSS `.og-card__logo`) gepflegt – dort
anpassen, neu rendern, JPG ersetzen.
