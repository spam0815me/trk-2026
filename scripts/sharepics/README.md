# Social-Media-Grafiken für /medien

Erzeugt die fertigen Sharepics, die auf der Medienseite zum Download stehen:

Ein Motiv – «Drei Tage für die Tiere» – in drei Formaten:

| Format | Grösse | Wofür |
|---|---|---|
| 1:1 | 1080 × 1080 | quadratischer Feed-Post |
| 4:5 | 1080 × 1350 | Instagram-Hochformat |
| 9:16 | 1080 × 1920 | Story und Reel |

Dateien: `public/images/social/trk26-<motiv>-<breite>x<höhe>.png`

## Neu rendern

```bash
python3 scripts/sharepics/build.py
```

Das Skript füllt `template.html` mit den Layout-Massen (alle relativ zur Bildhöhe,
damit 1:1 und 4:5 gleich satt sitzen) und schiesst je ein PNG mit Chrome im
Headless-Modus. Poppins kommt von Google Fonts, der Rechner muss also online sein.

## Ändern

- **Text**: Liste `MOTIVE` in `build.py` — Dateiname-Teil, Headline für breite Formate,
  Headline für Hochformate (9:16 bekommt einen eigenen Umbruch, damit sie zweizeilig und
  damit viel grösser gesetzt werden kann), Unterzeile. `<br>` erzwingt einen Zeilenumbruch.
- **Weiteres Format**: Eintrag in `FORMATE` ergänzen, danach den Download-Link in
  `src/pages/medien.astro` (`sharepics`) nachziehen.
- **Layout**: Faktoren in `masse()` bzw. das CSS in `template.html`.

Der Schriftgrad der Headline wird aus der längsten Zeile berechnet, damit der Text die
Satzbreite ausnutzt (`headline_groesse()`, Deckel bei 7.5 % der Bildhöhe). Das Logo ist
auf 40 % der Bildhöhe gedeckelt — ohne diesen Deckel schöbe es den gelben Balken aus dem
Bild, das `overflow: hidden` schnitte dann die Adresse ab. Nach Textänderungen also kurz
alle drei Formate anschauen.

## Wenn ein Motiv Zahlen nennt

Zahlen im Bild veralten. Aktueller Stand jederzeit:

```bash
ls src/content/sessions/*.json | wc -l   # Sessions
ls src/content/speakers/*.json | wc -l   # Referierende
```

Verwandt: `scripts/og-image/` erzeugt das Vorschaubild fürs Teilen von Links
(1200 × 630) — gleiches Prinzip, anderer Zweck.
