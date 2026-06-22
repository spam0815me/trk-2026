// Heimliche Tastatur-Navigation (Easter Egg).
// Einzeltasten springen zu den Hauptseiten:
//   h = Home, p = Programm, r = Referierende, o = Ort, k = Kontakt
// Greift NICHT, wenn in einem Eingabefeld getippt wird oder eine Modifier-
// Taste (Ctrl/Cmd/Alt) gedrueckt ist -- damit Formulare/Shortcuts normal bleiben.

const routes = document.documentElement.lang === "en"
  ? { h: "/en/", p: "/en/program", r: "/en/speakers", o: "/en/venue", k: "/en/contact" }
  : { h: "/", p: "/programm", r: "/referentinnen", o: "/ort", k: "/kontakt" };

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;

  const el = e.target;
  const tag = el && el.tagName ? el.tagName.toLowerCase() : "";
  if (tag === "input" || tag === "textarea" || tag === "select" || (el && el.isContentEditable)) return;

  const dest = routes[e.key.toLowerCase()];
  if (dest) {
    e.preventDefault();
    window.location.href = dest;
  }
});
