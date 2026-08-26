#!/usr/bin/env python3
"""
Baut die Social-Media-Grafiken für /medien aus template.html.

    python3 scripts/sharepics/build.py

Ausgabe: public/images/social/trk26-<motiv>-<format>.png
Formate: 1080×1080 (quadratisch, Feed) und 1080×1350 (4:5, Instagram-Hochformat).

Gerendert wird mit Chrome im Headless-Modus — gleicher Weg wie beim
Open-Graph-Bild (scripts/og-image/), nur automatisiert. Poppins kommt von
Google Fonts, der Rechner muss also online sein.
"""

import os
import pathlib
import shutil
import subprocess
import sys
import tempfile

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# Fussbalken: "reihe" = Datum, Ort und Adresse nebeneinander,
#             "stapel" = untereinander (Icons fluchten, Schrift deutlich grösser).
# Die Reihe passt nur in breite Formate — ihre Schriftgrösse hängt allein an der
# Bildbreite, in der Story (9:16) wäre sie verloren klein. Deshalb dort gestapelt.
# Mit SHAREPIC_BAR=reihe|stapel lässt sich das für alle Formate erzwingen.
BALKEN = os.environ.get("SHAREPIC_BAR")

# Die drei Beschriftungen der Icon-Zeilen — bestimmen, wie klein die Reihe wird.
REIHE_TEXTE = "23.–25. Oktober 2026" "Photobastei Zürich" "tierrechtskongress.ch"
ROOT = pathlib.Path(__file__).resolve().parents[2]
TEMPLATE = ROOT / "scripts" / "sharepics" / "template.html"
OUT_DIR = pathlib.Path(os.environ.get("SHAREPIC_OUT", ROOT / "public" / "images" / "social"))

# Motive: Dateiname-Teil, Headline breit, Headline für Hochformate, Unterzeile.
# In Hochformaten wird die Headline umbrochen — zweizeilig darf sie viel grösser
# gesetzt werden, sonst wirkt die Story leer.
MOTIVE = [
    (
        "save-the-date",
        "Drei Tage für die Tiere",
        "Drei Tage<br>für die Tiere",
        "Vorträge, Workshops<br>und Begegnungen",
    ),
]

# Formate: Dateiname-Teil, Breite, Höhe
FORMATE = [
    ("1080x1080", 1080, 1080),   # quadratisch, Feed
    ("1080x1350", 1080, 1350),   # 4:5, Instagram-Hochformat
    ("1080x1920", 1080, 1920),   # 9:16, Story und Reel
]


# Mittlere Zeichenbreite von Poppins ExtraBold, in em. Empirisch aus den
# gerenderten Bildern kalibriert — dient nur der Schriftgrad-Schätzung.
ZEICHENBREITE = 0.62


def headline_groesse(text: str, width: int, pad: int, height: int) -> int:
    """Schriftgrad so wählen, dass die längste Zeile die Satzbreite füllt."""
    zeilen = [z.strip() for z in text.split("<br>")]
    laengste = max(len(z) for z in zeilen)
    passend = (width - 2 * pad) / (laengste * ZEICHENBREITE)
    return round(min(passend, height * 0.075))


def masse(width: int, height: int) -> dict:
    """Layout-Werte relativ zur Höhe — so sitzt 4:5 gleich satt wie 1:1."""
    pad = round(width * 0.055)
    return {
        "__WIDTH__": width,
        "__HEIGHT__": height,
        "__PAD__": pad,
        "__PAD2__": pad * 2,
        "__PADTOP__": round(height * 0.045),
        "__LOGOW__": round(width * 0.72),
        "__TIFW__": round(width * 0.22),
        "__TIFGAP__": round(height * 0.012),
        "__LOGOMAX__": round(height * 0.40),
        "__LOGOTOP__": round(height * 0.02),
        "__SUBSIZE__": round(height * 0.027),
        "__SUBGAP__": round(height * 0.02),
        "__BARPAD__": round(height * 0.020),
        "__BARGAP__": round(height * 0.012),
        "__BARMOD__": BALKEN or ("stapel" if height / width >= 1.5 else "reihe"),
        "__REIHEGAP__": round(width * 0.035),
        # Nebeneinander muss alles in eine Zeile passen: Zeichen plus drei Icons
        # (je 1.15 em), drei Icon-Abstände (0.4 em) und zwei Gruppenabstände.
        "__REIHESIZE__": round(
            (width - 2 * pad - 2 * round(width * 0.035))
            / (len(REIHE_TEXTE) * ZEICHENBREITE + 3 * 1.15 + 3 * 0.4)
        ),
        "__DATESIZE__": round(height * 0.036),
        "__PLACESIZE__": round(height * 0.024),
        # Die Anmeldezeile ist die längste im Balken — Grad aus der Satzbreite
        # ableiten, damit sie in jedem Format einzeilig bleibt.
        "__CTASIZE__": round(min(height * 0.027,
                                 (width - 2 * pad - round(width * 0.055))
                                 / (len("Jetzt anmelden: tierrechtskongress.ch") * ZEICHENBREITE))),
    }


def rendern(html: str, ziel: pathlib.Path, width: int, height: int) -> None:
    with tempfile.NamedTemporaryFile(
        "w", suffix=".html", dir=TEMPLATE.parent, delete=False, encoding="utf-8"
    ) as fh:
        fh.write(html)
        tmp = pathlib.Path(fh.name)
    try:
        subprocess.run(
            [
                CHROME, "--headless", "--disable-gpu", "--hide-scrollbars",
                "--allow-file-access-from-files",
                "--force-device-scale-factor=1",
                "--virtual-time-budget=4000",
                f"--window-size={width},{height}",
                f"--screenshot={ziel}",
                tmp.as_uri(),
            ],
            check=True,
            capture_output=True,
        )
    finally:
        tmp.unlink(missing_ok=True)


def vorschau(png: pathlib.Path, breite: int = 420) -> None:
    """Kleines WebP für die Vorschau auf /medien — das PNG ist knapp 1 MB gross."""
    try:
        from PIL import Image
    except ImportError:
        print("Pillow fehlt, keine Vorschau erzeugt.", file=sys.stderr)
        return
    with Image.open(png) as im:
        hoehe = round(im.height * breite / im.width)
        im.convert("RGB").resize((breite, hoehe), Image.LANCZOS).save(
            png.with_name(png.stem + "-vorschau.webp"), "WEBP", quality=82, method=6
        )


def main() -> int:
    if not pathlib.Path(CHROME).exists():
        sys.exit(f"Chrome nicht gefunden: {CHROME}")
    if not shutil.which("sips"):
        print("Hinweis: sips fehlt, PNGs werden nicht nachoptimiert.", file=sys.stderr)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    vorlage = TEMPLATE.read_text(encoding="utf-8")

    for motiv, headline_breit, headline_hoch, sub in MOTIVE:
        for fmt, width, height in FORMATE:
            headline = headline_hoch if height / width >= 1.5 else headline_breit
            html = vorlage
            werte = masse(width, height)
            werte["__HEADSIZE__"] = headline_groesse(headline, width, werte["__PAD__"], height)
            for platzhalter, wert in werte.items():
                html = html.replace(platzhalter, str(wert))
            html = html.replace("__HEADLINE__", headline).replace("__SUB__", sub)

            ziel = OUT_DIR / f"trk26-{motiv}-{fmt}.png"
            rendern(html, ziel, width, height)
            vorschau(ziel)
            kb = ziel.stat().st_size // 1024
            try:
                name = ziel.relative_to(ROOT)
            except ValueError:      # Ausgabe ausserhalb des Repos (SHAREPIC_OUT)
                name = ziel
            print(f"{name}  ({width}×{height}, {kb} KB)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
