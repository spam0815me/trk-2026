# Redaktions-Guide — Tierrechtskongress-Website

## Neue Session anlegen

1. Neue JSON-Datei in `src/content/sessions/` anlegen, z.B. `session-2026-08.json`
2. Schema folgt `src/content/config.ts` → Collection `sessions`
3. Pflichtfelder:
   - `id` — eindeutig, z.B. `"session-2026-08"`
   - `slug` — URL-freundlich, z.B. `"mein-vortragstitel"`
   - `year` — Jahreszahl `2026`
   - `title_de`, `title_en`
   - `description_de`, `description_en`
   - `type` — `"talk"` | `"workshop"` | `"keynote"` | `"panel"`
   - `language` — `"de"` | `"en"` | `"both"`
   - `date` — `"2026-09-05"`
   - `startTime`, `endTime` — `"10:00"`
   - `day` — `1`, `2` oder `3`
   - `roomId` — muss einer ID aus `src/content/rooms/` entsprechen
   - `speakerIds` — Array mit Speaker-IDs aus `src/content/speakers/`
4. Session-Slug darf **nicht** doppelt vorkommen.
5. Den Raum und die Referent:innen müssen bereits existieren.
6. `sortOrder` steuert die Reihenfolge innerhalb eines Zeitblocks.

```json
{
  "id": "session-2026-08",
  "slug": "beispielvortrag",
  "year": 2026,
  "title_de": "Mein Beispielvortrag",
  "title_en": "My Example Talk",
  "description_de": "Kurzbeschreibung auf Deutsch.",
  "description_en": "Short description in English.",
  "type": "talk",
  "language": "de",
  "status": "confirmed",
  "date": "2026-09-06",
  "startTime": "10:00",
  "endTime": "11:00",
  "day": 2,
  "roomId": "saal-a",
  "speakerIds": ["beispiel-person"],
  "recording": false,
  "registrationRequired": false,
  "sortOrder": 8
}
```

---

## Neue referierende Person anlegen

1. Neue JSON-Datei in `src/content/speakers/`, z.B. `beispiel-person.json`
2. Pflichtfelder:
   - `id`, `slug`, `year`, `name`
   - `role_de`, `role_en`
   - `bio_de`, `bio_en`
   - `sessionIds` — Array (erst leer, dann nach Sessionerstellung befüllen)
3. Foto in `public/images/speakers/` ablegen (JPG oder WebP, min. 400×400px)
4. Foto-Pfad im JSON als `/images/speakers/dateiname.jpg` angeben

---

## Neuen Kongressjahrgang archivieren

Wenn ein Kongress abgeschlossen ist:

1. Neue JSON-Datei in `src/content/archive/`, z.B. `2026.json`
2. Felder: `year`, `slug`, `title_de/en`, `description_de/en`, `date_de/en`, `location`, `city`, `sessionsCount`, `speakersCount`, `highlights_de/en`
3. Die Sessions und Speaker des Jahrgangs bleiben erhalten (Felder `year: 2026`) — sie werden auf der aktuellen Programmseite durch den `year`-Filter ausgeblendet und können separat im Archiv verlinkt werden.
4. Für den **neuen Kongress** (z.B. 2027): Sessions und Speaker mit `year: 2027` anlegen.

---

## Übersetzungen ergänzen

1. Für UI-Strings: `src/i18n/de.json` und `src/i18n/en.json` parallel bearbeiten
2. Beide Dateien müssen dieselben Schlüssel haben
3. Für Content-Felder: jede JSON-Datei hat `_de`- und `_en`-Suffixe (z.B. `title_de`, `title_en`)

---

## Session mit Raum und Referent:innen verknüpfen

- `roomId` in der Session-JSON muss der `id` in einer Datei unter `src/content/rooms/` entsprechen
- `speakerIds` muss ein Array mit `id`-Werten aus `src/content/speakers/` sein
- Umgekehrt: `sessionIds` in jedem Speaker-JSON pflegen (für die Speaker-Detailseite)

---

## Formularanbieter austauschen

Der Formular-Adapter ist in `src/lib/forms/adapter.ts` definiert.

1. Neue Adapter-Datei anlegen, z.B. `src/lib/forms/formspree.ts`
2. Das `FormAdapter`-Interface implementieren (Methode `submit(data): Promise<FormSubmitResult>`)
3. In `adapter.ts`: `ACTIVE_ADAPTER` auf den neuen Adapter setzen
4. Für Netlify-Formulare: kein Austausch nötig (funktioniert automatisch)

Für Formspree:
```typescript
const formspreeAdapter: FormAdapter = {
  async submit(data) {
    const res = await fetch("https://formspree.io/f/DEINE_ID", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return { success: res.ok };
  }
};
```

---

## Design-Tokens anpassen (TIF-CI)

Alle Farben, Schriften und Abstände sind in `src/styles/tokens.css` als CSS Custom Properties definiert.

Suche nach `TODO: TIF-CI` in den Dateien, um alle Stellen zu finden, die noch angepasst werden müssen:

```bash
grep -r "TODO: TIF" src/
```
