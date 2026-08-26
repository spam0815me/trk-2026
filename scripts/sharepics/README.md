# Social-Media-Grafiken für /medien

Erzeugt die fertigen Sharepics, die auf der Medienseite zum Download stehen:

| Datei | Format | Motiv |
|---|---|---|
| `public/images/social/trk26-save-the-date-1080x1080.png` | 1:1 | «Drei Tage für die Tiere» |
| `public/images/social/trk26-save-the-date-1080x1350.png` | 4:5 | «Drei Tage für die Tiere» |
| `public/images/social/trk26-programm-1080x1080.png` | 1:1 | «Das Programm ist online» |
| `public/images/social/trk26-programm-1080x1350.png` | 4:5 | «Das Programm ist online» |

1:1 ist das quadratische Feed-Format, 4:5 das Instagram-Hochformat.

## Neu rendern

```bash
python3 scripts/sharepics/build.py
```

Das Skript füllt `template.html` mit den Layout-Massen (alle relativ zur Bildhöhe,
damit 1:1 und 4:5 gleich satt sitzen) und schiesst je ein PNG mit Chrome im
Headless-Modus. Poppins kommt von Google Fonts, der Rechner muss also online sein.

## Ändern

- **Text**: Liste `MOTIVE` in `build.py` — Dateiname-Teil, Headline, Unterzeile.
  `<br>` im Text erzwingt einen Zeilenumbruch.
- **Weiteres Format** (z. B. Story 1080×1920): Eintrag in `FORMATE` ergänzen,
  danach den Download-Link in `src/pages/medien.astro` (`sharepics`) nachziehen.
- **Layout**: Faktoren in `masse()` bzw. das CSS in `template.html`.

Nach dem Rendern die Bilder anschauen: Läuft der Text zu weit nach unten, schneidet
`overflow: hidden` die letzte Zeile im gelben Balken ab. Dann Logo oder Schriftgrad
in `masse()` etwas verkleinern.

## Zahlen im Motiv «Programm»

«31 Vorträge und Workshops mit 34 Referierenden» ist von Hand gepflegt und muss zum
Programm passen. Aktueller Stand jederzeit:

```bash
ls src/content/sessions/*.json | wc -l   # Sessions
ls src/content/speakers/*.json | wc -l   # Referierende
```

Verwandt: `scripts/og-image/` erzeugt das Vorschaubild fürs Teilen von Links
(1200 × 630) — gleiches Prinzip, anderer Zweck.
