/**
 * iCal-Hilfsfunktionen
 *
 * Generiert iCal (.ics) Strings für Sessions.
 * Vollständig client-seitig, kein Server nötig.
 * RFC 5545 konform.
 */

export interface ICalEvent {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string; // ISO: "2026-09-05"
  startTime: string; // "10:00"
  endTime: string;   // "11:00"
  url?: string;
}

/** Formatiert Datum+Zeit als iCal DTSTART/DTEND (Europe/Berlin) */
function formatICalDateTime(date: string, time: string): string {
  // Entfernt Bindestriche und Doppelpunkte, hängt 00 für Sekunden an
  const d = date.replace(/-/g, "");
  const t = time.replace(":", "") + "00";
  return `${d}T${t}00`;
}

/** Escaped Text für iCal (Kommas, Newlines, Backslashes) */
function escapeIcal(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Bricht lange iCal-Zeilen nach 75 Zeichen um (RFC 5545) */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  let result = "";
  let pos = 0;
  while (pos < line.length) {
    if (pos === 0) {
      result += line.substring(pos, 75);
      pos = 75;
    } else {
      result += "\r\n " + line.substring(pos, pos + 74);
      pos += 74;
    }
  }
  return result;
}

/** Generiert einen iCal-String für ein einzelnes Event */
export function generateICalEvent(event: ICalEvent): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const dtStart = formatICalDateTime(event.startDate, event.startTime);
  const dtEnd   = formatICalDateTime(event.startDate, event.endTime);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tierrechtskongress//TRK 2026//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Tierrechtskongress 2026",
    "X-WR-TIMEZONE:Europe/Berlin",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Berlin",
    "BEGIN:STANDARD",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    foldLine(`UID:${event.uid}@tierrechtskongress.de`),
    foldLine(`DTSTAMP:${now}`),
    foldLine(`DTSTART;TZID=Europe/Berlin:${dtStart}`),
    foldLine(`DTEND;TZID=Europe/Berlin:${dtEnd}`),
    foldLine(`SUMMARY:${escapeIcal(event.title)}`),
  ];

  if (event.description) {
    lines.push(foldLine(`DESCRIPTION:${escapeIcal(event.description)}`));
  }
  if (event.location) {
    lines.push(foldLine(`LOCATION:${escapeIcal(event.location)}`));
  }
  if (event.url) {
    lines.push(foldLine(`URL:${event.url}`));
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

/** Generiert einen iCal-String für mehrere Events (Merkliste) */
export function generateICalCalendar(events: ICalEvent[], calName = "Meine Merkliste — Tierrechtskongress 2026"): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Tierrechtskongress//TRK 2026//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    foldLine(`X-WR-CALNAME:${calName}`),
    "X-WR-TIMEZONE:Europe/Berlin",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Berlin",
    "BEGIN:STANDARD",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "END:STANDARD",
    "BEGIN:DAYLIGHT",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "END:DAYLIGHT",
    "END:VTIMEZONE",
  ];

  const eventBlocks = events.map(event => {
    const dtStart = formatICalDateTime(event.startDate, event.startTime);
    const dtEnd   = formatICalDateTime(event.startDate, event.endTime);
    const lines = [
      "BEGIN:VEVENT",
      foldLine(`UID:${event.uid}@tierrechtskongress.de`),
      foldLine(`DTSTAMP:${now}`),
      foldLine(`DTSTART;TZID=Europe/Berlin:${dtStart}`),
      foldLine(`DTEND;TZID=Europe/Berlin:${dtEnd}`),
      foldLine(`SUMMARY:${escapeIcal(event.title)}`),
    ];
    if (event.description) lines.push(foldLine(`DESCRIPTION:${escapeIcal(event.description)}`));
    if (event.location)    lines.push(foldLine(`LOCATION:${escapeIcal(event.location)}`));
    if (event.url)         lines.push(foldLine(`URL:${event.url}`));
    lines.push("END:VEVENT");
    return lines.join("\r\n");
  });

  return [...header, ...eventBlocks, "END:VCALENDAR"].join("\r\n");
}

/** Löst den Browser-Download einer .ics-Datei aus (Client-Side only) */
export function downloadIcal(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
