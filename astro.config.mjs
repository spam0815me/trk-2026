// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // Kanonische Site-URL für absolute Links (og:image, canonical, Sitemap …).
  // Netlify setzt process.env.URL automatisch auf die PRIMÄRE Domain der Site:
  //   - solange keine Custom-Domain gesetzt ist → https://tierrechtskongress-2026.netlify.app
  //   - sobald tierrechtskongress.ch als primäre Domain in Netlify aktiv ist → diese
  // So zeigen die Meta-Tags immer auf die tatsächlich ausgelieferte Domain – ohne Code-Change.
  // Fallback (lokaler Build / kein Netlify): die Zieldomain.
  site: process.env.URL ?? "https://tierrechtskongress.ch",

  // Statische Ausgabe (SSG) — Standard für Astro
  output: "static",

  // Basis-URL (anpassen bei Subdirectory-Deployment)
  // base: '/',

  // Internationalisierung — Frontend ist DE-only (EN-Baum entfernt)
  i18n: {
    defaultLocale: "de",
    locales: ["de"],
    routing: {
      prefixDefaultLocale: false, // /de/ wird zu / (Deutsch ist default ohne Prefix)
    },
  },

  // Build-Konfiguration
  build: {
    // Assets in geordnete Unterordner
    assets: "_assets",
  },

  // Vite-Konfiguration
  vite: {
    build: {
      // Sourcemaps in Produktion deaktivieren
      sourcemap: false,
    },
  },
});
