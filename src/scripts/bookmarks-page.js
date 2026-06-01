/**
 * bookmarks-page.js
 * Rendert die Merklisten-Seite dynamisch aus localStorage.
 * Zeigt Zeitkonflikte und iCal-Export-Button.
 */

import { getAllBookmarks, removeBookmark } from "./bookmarks.js";
import { generateICalCalendar, downloadIcal } from "../lib/ical.ts";

const SESSIONS_KEY = "trk2026_sessions_cache";
const lang = document.documentElement.lang ?? "de";

// Session-Daten-Cache (werden beim ersten Laden von der Seite eingebettet oder per fetch geladen)
// Da wir statisch sind, lesen wir die Daten aus einem globalen window-Objekt (falls vorhanden)
// oder zeigen nur IDs mit Link an.

async function render() {
  const ids        = getAllBookmarks();
  const emptyEl    = document.getElementById("bookmarks-empty");
  const listEl     = document.getElementById("bookmarks-list");
  const actionsEl  = document.getElementById("bookmarks-actions");
  const conflictsEl = document.getElementById("bookmarks-conflicts");

  if (!listEl || !emptyEl || !actionsEl) return;

  if (ids.length === 0) {
    emptyEl.hidden = false;
    listEl.hidden  = true;
    actionsEl.hidden = true;
    if (conflictsEl) conflictsEl.hidden = true;
    return;
  }

  emptyEl.hidden = true;
  listEl.hidden  = false;
  actionsEl.hidden = false;

  // Gespeicherte Session-Metadaten abrufen (eingebettet vom Build)
  const sessions = window.__TRK_SESSIONS__ ?? [];

  listEl.innerHTML = "";

  const bookedSessions = sessions.filter(s => ids.includes(s.id));

  // Zeitkonflikte prüfen
  const conflicts = findConflicts(bookedSessions);
  if (conflictsEl) {
    if (conflicts.length > 0) {
      conflictsEl.hidden = false;
      const ul = document.getElementById("conflict-list");
      if (ul) {
        ul.innerHTML = conflicts.map(c =>
          `<li>${c[0].title} ↔ ${c[1].title}</li>`
        ).join("");
      }
    } else {
      conflictsEl.hidden = true;
    }
  }

  // Sessions rendern
  bookedSessions
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .forEach(session => {
      const href = lang === "en"
        ? `/en/program/${session.slug}`
        : `/programm/${session.slug}`;

      const isConflict = conflicts.some(c => c[0].id === session.id || c[1].id === session.id);

      const item = document.createElement("div");
      item.className = `bookmark-item${isConflict ? " bookmark-item--conflict" : ""}`;
      item.innerHTML = `
        <div class="bookmark-item__info">
          <span class="bookmark-item__time">${session.startTime}–${session.endTime} · Tag ${session.day}</span>
          <h3 class="bookmark-item__title">
            <a href="${href}">${escHtml(session.title)}</a>
          </h3>
          <span class="bookmark-item__room">${escHtml(session.roomName ?? "")}</span>
          ${isConflict ? `<span class="bookmark-item__conflict-note">⚠ ${lang === "en" ? "Time conflict" : "Zeitkonflikt"}</span>` : ""}
        </div>
        <div class="bookmark-item__actions">
          <a href="${href}" class="btn btn--ghost btn--sm">${lang === "en" ? "Details" : "Details"}</a>
          <button class="btn btn--ghost btn--sm remove-bookmark" data-id="${session.id}" type="button">
            ${lang === "en" ? "Remove" : "Entfernen"}
          </button>
        </div>
      `;
      listEl.appendChild(item);
    });

  // Falls keine Session-Daten vom Build (Fallback: nur Links)
  if (bookedSessions.length === 0 && ids.length > 0) {
    ids.forEach(id => {
      const item = document.createElement("div");
      item.className = "bookmark-item";
      const href = lang === "en" ? `/en/program/` : `/programm/`;
      item.innerHTML = `
        <div class="bookmark-item__info">
          <p>Session ID: ${escHtml(id)}</p>
        </div>
        <div class="bookmark-item__actions">
          <button class="btn btn--ghost btn--sm remove-bookmark" data-id="${id}" type="button">
            ${lang === "en" ? "Remove" : "Entfernen"}
          </button>
        </div>
      `;
      listEl.appendChild(item);
    });
  }

  // Remove-Buttons
  listEl.querySelectorAll(".remove-bookmark").forEach(btn => {
    btn.addEventListener("click", () => {
      removeBookmark(btn.dataset.id ?? "");
      render();
    });
  });

  // iCal-Export für alle
  document.getElementById("export-ical-all")?.addEventListener("click", () => {
    const events = bookedSessions.map(s => ({
      uid: s.id,
      title: s.title,
      description: s.description ?? "",
      location: s.roomName ?? "",
      startDate: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
    }));

    if (events.length === 0) return;
    const calName = lang === "en"
      ? "My Bookmarks — Animal Rights Congress 2026"
      : "Meine Merkliste — Tierrechtskongress 2026";
    const content = generateICalCalendar(events, calName);
    downloadIcal(content, "trk-2026-merkliste");
  });
}

/** Zeitkonflikte erkennen */
function findConflicts(sessions) {
  const conflicts = [];
  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      const a = sessions[i];
      const b = sessions[j];
      if (a.date !== b.date) continue;
      const aStart = timeToMin(a.startTime);
      const aEnd   = timeToMin(a.endTime);
      const bStart = timeToMin(b.startTime);
      const bEnd   = timeToMin(b.endTime);
      if (aStart < bEnd && aEnd > bStart) {
        conflicts.push([a, b]);
      }
    }
  }
  return conflicts;
}

function timeToMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function escHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Storage-Sync
window.addEventListener("storage", (e) => {
  if (e.key === "trk2026_bookmarks") render();
});
window.addEventListener("bookmarks-changed", render);

render();

// Globales CSS für Bookmark-Items (inline da einmaliges Script)
const style = document.createElement("style");
style.textContent = `
  .bookmark-item {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-bg);
  }
  .bookmark-item--conflict {
    border-color: var(--color-warning);
    background: var(--color-warning-bg);
  }
  .bookmark-item__time {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    font-weight: var(--weight-medium);
    display: block;
    margin-bottom: 0.25rem;
  }
  .bookmark-item__title {
    font-size: var(--text-base);
    font-weight: var(--weight-semibold);
    margin: 0 0 0.25rem;
  }
  .bookmark-item__title a { color: var(--color-text); text-decoration: none; }
  .bookmark-item__title a:hover { color: var(--color-primary); }
  .bookmark-item__room { font-size: var(--text-sm); color: var(--color-text-muted); }
  .bookmark-item__conflict-note { display: block; font-size: var(--text-xs); color: var(--color-warning); font-weight: var(--weight-semibold); margin-top: 0.25rem; }
  .bookmark-item__actions { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: flex-start; flex-shrink: 0; }
`;
document.head.appendChild(style);
