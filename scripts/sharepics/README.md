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

- **Text**: Liste `MOTIVE` in `build.py` – Dateiname-Teil, Headline für breite Formate,
  Headline für Hochformate (9:16 bekommt einen eigenen Umbruch, damit sie zweizeilig und
  damit viel grösser gesetzt werden kann), Unterzeile. `<br>` erzwingt einen Zeilenumbruch.
- **Weiteres Format**: Eintrag in `FORMATE` ergänzen, danach den Download-Link in
  `src/pages/medien.astro` (`sharepics`) nachziehen.
- **Layout**: Faktoren in `masse()` bzw. das CSS in `template.html`.

Der Schriftgrad der Headline wird aus der längsten Zeile berechnet, damit der Text die
Satzbreite ausnutzt (`headline_groesse()`, Deckel bei 7.5 % der Bildhöhe). Das Logo ist auf
48 % der Bildhöhe gedeckelt, in der Story (9:16) auf 40 % – ohne Deckel schöbe es den gelben
Balken aus dem Bild, das `overflow: hidden` schnitte dann das TIF-Logo ab. Achtung, die Box
ist wegen `object-fit: contain` immer `__LOGOMAX__` hoch, auch wenn das Bild darin kleiner
dargestellt wird: ein zu hoher Deckel kostet Platz, ohne das Logo grösser zu machen. Nach
Textänderungen also kurz alle drei Formate anschauen.

## Logo

Das Sharepic zieht `../og-image/trk-logo-negativ-trim.png`, den Trim des offiziellen
**Negativ-Logos** – weisse Kuh **im gelben X**, wie im Website-Footer. Eine Kuh ohne X ist kein
offizielles Logo; wie sie hier zwischenzeitlich hineingeriet und wie Trims und PNGs neu
entstehen, steht in `scripts/og-image/README.md`.

Der Grund ist dunkel (`#26282a`), Headline und Unterzeile stehen in Ghost White. Bei einer
hellen Fassung müssten alle drei zusammen wechseln: Grund, Schriftfarbe und Logo-Variante.

## Fussbalken: Reihe oder Stapel

Im Balken steht «Jetzt anmelden!», darunter Datum, Ort und Adresse. Diese drei stehen
**nebeneinander mit Icons** (Klasse `reihe`) in 1:1 und 4:5 und **untereinander, zentriert
und ohne Icons** (Klasse `stapel`, Schrift viel grösser) in der Story – vor dem vielen
Weissraum eines 9:16-Bildes wirken die Icons unruhig.
Grund: Die Schriftgrösse der Reihe hängt allein an der Bildbreite – in einem 9:16-Bild
wäre sie verloren klein. Erzwingen lässt sich beides:

```bash
SHAREPIC_BAR=stapel python3 scripts/sharepics/build.py
SHAREPIC_BAR=reihe  python3 scripts/sharepics/build.py
```

Zum Vergleichen, ohne die Live-Dateien anzufassen:
`SHAREPIC_OUT=/tmp/vergleich python3 scripts/sharepics/build.py`

## Icons im Fussbalken (nur `reihe`)

Die drei Einträge im gelben Balken tragen Icons aus dem Website-Bestand:
`Tag.svg` (Datum), `Location.svg` (Ort) und `Ticket.svg` (Anmeldung). Die Dateien sind
gelb gefüllt (#e5b969) und wären auf dem gelben Balken unsichtbar – sie werden deshalb
als CSS-Maske eingesetzt und dunkel eingefärbt, gleiches Prinzip wie bei den
Button-Icons der Website. Ein anderes Icon: `--i: url(...)` in `template.html` ändern.
Zur Auswahl stehen unter anderem noch `Uhrzeit.svg` (Uhr) und `Events.svg` (Mikrofon).

## Wenn ein Motiv Zahlen nennt

Zahlen im Bild veralten. Aktueller Stand jederzeit:

```bash
ls src/content/sessions/*.json | wc -l   # Sessions
ls src/content/speakers/*.json | wc -l   # Referierende
```

Verwandt: `scripts/og-image/` erzeugt das Vorschaubild fürs Teilen von Links
(1200 × 630) – gleiches Prinzip, anderer Zweck.
