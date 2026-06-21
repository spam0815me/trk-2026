/**
 * program-filter.js
 * Client-seitige Filter- und Suchlogik für die Programmübersicht.
 */

const searchInput = document.getElementById("search-input");
const resetBtn    = document.getElementById("reset-filters");
const noResults   = document.getElementById("no-results");
const countNum    = document.getElementById("count-num");
const programDays = document.querySelectorAll(".program-day");
const allCards    = document.querySelectorAll(".session-card");

const activeFilters = { day: "all", type: "all", language: "all", room: "all" };
let searchQuery = "";

function applyFilters() {
  let visibleCount = 0;

  allCards.forEach(card => {
    const type     = card.dataset.type ?? "";
    const language = card.dataset.language ?? "";
    const room     = card.dataset.room ?? "";
    const dayEl    = card.closest(".program-day");
    const day      = dayEl?.dataset.day ?? "";
    const text     = card.textContent?.toLowerCase() ?? "";

    const visible =
      (activeFilters.day      === "all" || day      === activeFilters.day) &&
      (activeFilters.type     === "all" || type     === activeFilters.type) &&
      (activeFilters.language === "all" || language === activeFilters.language || language === "both") &&
      (activeFilters.room     === "all" || room     === activeFilters.room) &&
      (!searchQuery || text.includes(searchQuery));

    card.style.display = visible ? "" : "none";
    if (visible) visibleCount++;
  });

  programDays.forEach(section => {
    const hasVisible = [...section.querySelectorAll(".session-card")]
      .some(c => c.style.display !== "none");
    section.toggleAttribute("data-hidden", !hasVisible);
  });

  if (countNum) countNum.textContent = String(visibleCount);
  if (noResults) noResults.hidden = visibleCount > 0;

  const anyActive = Object.values(activeFilters).some(v => v !== "all") || searchQuery !== "";
  if (resetBtn) resetBtn.hidden = !anyActive;
}

// Filter-Toggle
const filterToggle = document.getElementById("filter-toggle");
const filterPanel  = document.getElementById("filter-panel");
filterToggle?.addEventListener("click", () => {
  const open = filterToggle.getAttribute("aria-expanded") === "true";
  filterToggle.setAttribute("aria-expanded", String(!open));
  if (open) {
    filterPanel?.setAttribute("hidden", "");
  } else {
    filterPanel?.removeAttribute("hidden");
  }
});

// Filter-Buttons
document.querySelectorAll(".filter-btn[data-filter]").forEach(btn => {
  btn.addEventListener("click", () => {
    const { filter, value } = btn.dataset;
    if (!filter || !value) return;

    document.querySelectorAll(`.filter-btn[data-filter="${filter}"]`).forEach(b => {
      b.classList.remove("filter-btn--active");
    });
    btn.classList.add("filter-btn--active");

    activeFilters[filter] = value;
    applyFilters();
  });
});

// Suche
searchInput?.addEventListener("input", () => {
  searchQuery = searchInput.value.toLowerCase().trim();
  applyFilters();
});

// Reset
resetBtn?.addEventListener("click", () => {
  searchQuery = "";
  if (searchInput) searchInput.value = "";
  Object.keys(activeFilters).forEach(k => { activeFilters[k] = "all"; });
  document.querySelectorAll(".filter-btn[data-filter]").forEach(btn => {
    btn.classList.toggle("filter-btn--active", btn.dataset.value === "all");
  });
  applyFilters();
});

applyFilters();
