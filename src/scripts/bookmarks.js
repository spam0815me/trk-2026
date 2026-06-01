/**
 * bookmarks.js
 * Merkliste — localStorage-basiert, kein Server nötig.
 * Wird auf Programm- und Session-Seiten eingebunden.
 */

const STORAGE_KEY = "trk2026_bookmarks";

/** Aktuelle Merkliste aus localStorage laden */
function getBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** Merkliste speichern */
function saveBookmarks(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  // Event auslösen, damit andere Tabs/Komponenten reagieren können
  window.dispatchEvent(new CustomEvent("bookmarks-changed", { detail: { ids } }));
}

/** Session merken */
export function addBookmark(sessionId) {
  const ids = getBookmarks();
  if (!ids.includes(sessionId)) {
    ids.push(sessionId);
    saveBookmarks(ids);
  }
}

/** Session entmerken */
export function removeBookmark(sessionId) {
  const ids = getBookmarks().filter(id => id !== sessionId);
  saveBookmarks(ids);
}

/** Toggle */
export function toggleBookmark(sessionId) {
  if (isBookmarked(sessionId)) {
    removeBookmark(sessionId);
    return false;
  } else {
    addBookmark(sessionId);
    return true;
  }
}

/** Prüfen ob gemerkt */
export function isBookmarked(sessionId) {
  return getBookmarks().includes(sessionId);
}

/** Alle Merklisten-IDs */
export function getAllBookmarks() {
  return getBookmarks();
}

// ─── Button-Initialisierung ────────────────────────────────────────────────────

function updateButton(btn, bookmarked) {
  const label = btn.querySelector(".bookmark-btn__label");
  const addLabel    = btn.dataset.addLabel    ?? (document.documentElement.lang === "en" ? "Save" : "Merken");
  const removeLabel = btn.dataset.removeLabel ?? (document.documentElement.lang === "en" ? "Saved" : "Gemerkt");

  btn.classList.toggle("is-bookmarked", bookmarked);
  btn.setAttribute("aria-pressed", String(bookmarked));
  if (label) label.textContent = bookmarked ? removeLabel : addLabel;
}

function initBookmarkButtons() {
  document.querySelectorAll(".bookmark-btn[data-session-id]").forEach(btn => {
    const sessionId = btn.dataset.sessionId;
    if (!sessionId) return;

    // Initial-Zustand
    updateButton(btn, isBookmarked(sessionId));

    btn.addEventListener("click", () => {
      const nowBookmarked = toggleBookmark(sessionId);
      updateButton(btn, nowBookmarked);

      // Kurzes visuelles Feedback
      btn.animate?.(
        [{ transform: "scale(1)" }, { transform: "scale(1.15)" }, { transform: "scale(1)" }],
        { duration: 200, easing: "ease-out" }
      );
    });
  });
}

// Synchronisierung über Tabs
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    document.querySelectorAll(".bookmark-btn[data-session-id]").forEach(btn => {
      updateButton(btn, isBookmarked(btn.dataset.sessionId ?? ""));
    });
  }
});

// DOM fertig
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBookmarkButtons);
} else {
  initBookmarkButtons();
}
