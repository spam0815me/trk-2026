# Social-Sharing-Bild (Open Graph / Twitter Card)

Erzeugt `public/images/og-default.jpg` (1200 × 630) – das Vorschaubild, das beim
Teilen der Website auf WhatsApp, Facebook, LinkedIn, X, Signal usw. erscheint.

Eingebunden in `src/components/ui/SEOHead.astro` als Default-`ogImage`. Jede Seite
kann über die `ogImage`-Prop ein eigenes Bild mitgeben; ohne Angabe greift dieses.

## Bestandteile

- dunkler Grund `#26282a` – gleicher Look wie der Website-Footer und die Sharepics
- `trk-logo-negativ-trim.png` – das Negativ-Logo (weisse Kuh im gelben X, enthält bereits
  «Tierrechtskongress 2026 / Tier im Fokus»), gross & zentriert

### Logo-Quelle: immer das SVG

Verbindlich ist **`public/images/trk-logo.svg`** (identisch mit `Ressourcen /Logo/TRK_26_Logo.svg`):
die Kuh **im gelben X**. Es gibt keine offizielle Variante ohne X – wo eine auftaucht, ist sie
falsch. Zwischen Juni und August 2026 lag genau so eine X-lose Kuh in `trk-logo.png`; über den
Trim wanderte sie ins OG-Bild und in die Sharepics.

`public/images/trk-logo.png` ist deshalb kein eigenes Motiv mehr, sondern ein Render des SVG.
Beide neu erzeugen, wenn sich das Logo ändert:

```bash
rsvg-convert -w 2000 public/images/trk-logo.svg            -o /tmp/trk-logo.png
rsvg-convert -w 2000 public/images/TRK_26_Logo_negativ.svg -o /tmp/trk-logo-negativ.png
```

```python
from PIL import Image

for quelle, png, trim in [
    ("/tmp/trk-logo.png",         "public/images/trk-logo.png",
     "scripts/og-image/trk-logo-trim.png"),
    ("/tmp/trk-logo-negativ.png", "public/images/TRK_26_Logo_negativ.png",
     "scripts/og-image/trk-logo-negativ-trim.png"),
]:
    src = Image.open(quelle).convert("RGBA")
    src.quantize(colors=128, method=Image.FASTOCTREE, dither=Image.NONE).save(png, optimize=True)
    im = Image.open(png).convert("RGBA")
    im.crop(im.getbbox()).save(trim, optimize=True)
```

Das positive Trim (`trk-logo-trim.png`) wird derzeit nirgends gerendert, bleibt aber liegen –
sobald wieder etwas auf hellem Grund entsteht, ist es da.

### Warum ein getrimmtes Logo?

Die gerenderten PNGs haben ungleiche transparente Ränder. Zentriert man sie als Ganzes, sitzt
das sichtbare Motiv nicht mittig – deshalb die zugeschnittenen Trims (Motiv = Bounding-Box).
Der Hero der Startseite bindet direkt das SVG ein, nicht das PNG.

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
