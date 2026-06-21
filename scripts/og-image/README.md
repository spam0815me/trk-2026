# Social-Sharing-Bild (Open Graph / Twitter Card)

Erzeugt `public/images/og-default.jpg` (1200 × 630) — das Vorschaubild, das beim
Teilen der Website auf WhatsApp, Facebook, LinkedIn, X, Signal usw. erscheint.

Eingebunden in `src/components/ui/SEOHead.astro` als Default-`ogImage`. Jede Seite
kann über die `ogImage`-Prop ein eigenes Bild mitgeben; ohne Angabe greift dieses.

## Bestandteile

- `public/images/trk-header-bg.png` — heller Beton-Hintergrund (gleicher Look wie der Hero)
- `trk-logo-trim.png` — das Logo (dunkle Kuh + heller Schriftzug, enthält bereits
  «Tierrechtskongress 2026 / Tier im Fokus»), gross & zentriert

### Warum ein getrimmtes Logo?

`public/images/trk-logo.png` hat ungleiche transparente Ränder (oben 271 px, unten 19 px,
links 54, rechts 168). Zentriert man das ganze PNG, sitzt das sichtbare Motiv nicht mittig.
Deshalb wird ein zugeschnittenes `trk-logo-trim.png` verwendet (Motiv = Bounding-Box).
Das **Original nicht ersetzen** — der Hero der Startseite nutzt `trk-logo.png`.

Trim neu erzeugen (falls sich das Original ändert):

```python
from PIL import Image
im = Image.open("public/images/trk-logo.png").convert("RGBA")
im.crop(im.getbbox()).save("scripts/og-image/trk-logo-trim.png")
```

## Neu rendern

1. Lokalen Server im Projekt-Root starten:
   `python3 -m http.server 8765 --directory .`
2. `http://localhost:8765/scripts/og-image/og-default.html` bei Viewport **1200 × 630** öffnen
   (DevTools → Device Toolbar → 1200×630) und einen Screenshot der `.og-card` machen
   — oder per Playwright den Viewport auf 1200×630 setzen und `page.screenshot()`.
3. Zu JPG konvertieren / optimieren:
   `sips -s format jpeg -s formatOptions 90 <screenshot>.png --out public/images/og-default.jpg`

Logo-Grösse/Layout werden in `og-default.html` (CSS `.og-card__logo`) gepflegt — dort
anpassen, neu rendern, JPG ersetzen.
