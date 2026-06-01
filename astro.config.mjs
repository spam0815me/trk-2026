// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  // TODO: Produktions-URL hier eintragen
  site: "https://tierrechtskongress.de",

  // Statische Ausgabe (SSG) — Standard für Astro
  output: "static",

  // Basis-URL (anpassen bei Subdirectory-Deployment)
  // base: '/',

  // Internationalisierung
  i18n: {
    defaultLocale: "de",
    locales: ["de", "en"],
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
