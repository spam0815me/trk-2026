/**
 * calendar-export.js
 * Verdrahtet die Kalender-Buttons auf der Merkliste-Seite.
 *
 * Erwartet im DOM:
 *   #calendar-actions  — Container (wird bei leerer Liste ausgeblendet)
 *   #cal-apple         — lädt die .ics mit allen gemerkten Sessions
 *   #cal-google        — lädt dieselbe .ics und öffnet Googles Import-Seite
 *
 * Erwartet global: window.__TRK_SESSIONS__ (Array von ICalEvent-Objekten).
 */
import { generateICalCalendar, downloadIcal } from "../lib/ical.ts";

const STORAGE_KEY = "trk2026_bookmarks";
// Mehrere Events lassen sich bei Google nur per Import (nicht per 1-Klick-Link) hinzufügen.
// /u/0/ adressiert das erste eingeloggte Konto zuverlässig (ohne landet man bei
// Multi-Account-Setups leicht im falschen oder leeren Kontext).
const GOOGLE_IMPORT_URL = "https://calendar.google.com/calendar/u/0/r/settings/import";

function getBookmarks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); }
  catch { return []; }
}

/** Gemerkte Sessions als ICalEvent-Liste (Reihenfolge wie __TRK_SESSIONS__). */
function selectedEvents() {
  const ids = getBookmarks();
  const all = window.__TRK_SESSIONS__ ?? [];
  return all.filter(s => ids.includes(s.uid));
}

/** Lädt die .ics herunter. Gibt false zurück, wenn nichts gemerkt ist. */
function downloadMerkliste() {
  const events = selectedEvents();
  if (events.length === 0) return false;
  downloadIcal(generateICalCalendar(events), "trk-2026-merkliste");
  return true;
}

/** Button-Gruppe nur zeigen, wenn etwas gemerkt ist. */
function updateVisibility() {
  const group = document.getElementById("calendar-actions");
  if (group) group.hidden = getBookmarks().length === 0;
}

document.getElementById("cal-apple")?.addEventListener("click", () => {
  downloadMerkliste();
});

document.getElementById("cal-google")?.addEventListener("click", () => {
  const events = selectedEvents();
  if (events.length === 0) return;
  // Tab ZUERST öffnen, solange die Klick-Geste frisch ist: Der programmatische
  // Download danach würde sie sonst "verbrauchen", worauf der Popup-Blocker das
  // window.open kippt und der Google-Tab gar nicht aufgeht.
  window.open(GOOGLE_IMPORT_URL, "_blank", "noopener");
  // Dann die Datei laden, die auf der Import-Seite hochgeladen wird.
  downloadIcal(generateICalCalendar(events), "trk-2026-merkliste");
});

updateVisibility();
window.addEventListener("bookmarks-changed", updateVisibility);
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) updateVisibility();
});
