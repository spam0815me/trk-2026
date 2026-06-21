/**
 * calendar-export.js
 * Verdrahtet den Kalender-Button auf der Merkliste-Seite.
 *
 * Erwartet im DOM:
 *   #calendar-actions  — Container (wird bei leerer Liste ausgeblendet)
 *   #cal-download      — lädt die .ics mit allen gemerkten Sessions
 *
 * Erwartet global: window.__TRK_SESSIONS__ (Array von ICalEvent-Objekten).
 */
import { generateICalCalendar, downloadIcal } from "../lib/ical.ts";

const STORAGE_KEY = "trk2026_bookmarks";

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

/** Button nur zeigen, wenn etwas gemerkt ist. */
function updateVisibility() {
  const group = document.getElementById("calendar-actions");
  if (group) group.hidden = getBookmarks().length === 0;
}

document.getElementById("cal-download")?.addEventListener("click", () => {
  downloadMerkliste();
});

updateVisibility();
window.addEventListener("bookmarks-changed", updateVisibility);
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) updateVisibility();
});
