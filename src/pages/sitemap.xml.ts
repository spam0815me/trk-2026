/**
 * Sitemap — dynamisch aus allen Seiten und Content Collections generiert
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async ({ site }) => {
  const base = site?.toString() ?? "https://tierrechtskongress.ch";

  const sessions = await getCollection("sessions");
  const speakers = await getCollection("speakers");
  const archive  = await getCollection("archive");

  const staticPages = [
    // DE
    { url: base,                        priority: "1.0", changefreq: "weekly" },
    { url: `${base}programm/`,          priority: "0.9", changefreq: "weekly" },
    { url: `${base}referentinnen/`,     priority: "0.8", changefreq: "weekly" },
    { url: `${base}ort/`,               priority: "0.7", changefreq: "monthly" },
    { url: `${base}anmeldung/`,         priority: "0.9", changefreq: "monthly" },
    { url: `${base}archiv/`,            priority: "0.6", changefreq: "yearly" },
    { url: `${base}faq/`,               priority: "0.7", changefreq: "monthly" },
    { url: `${base}kontakt/`,           priority: "0.5", changefreq: "yearly" },
    { url: `${base}sponsoring/`,        priority: "0.5", changefreq: "monthly" },
    { url: `${base}barrierefreiheit/`,  priority: "0.5", changefreq: "yearly" },
    { url: `${base}datenschutz/`,       priority: "0.3", changefreq: "yearly" },
  ];

  // Dynamic session pages
  const sessionPages = sessions.filter(s => s.data.year === 2026).map(s => (
    { url: `${base}programm/${s.data.slug}/`,    priority: "0.8", changefreq: "weekly" }
  ));

  // Dynamic speaker pages
  const speakerPages = speakers.filter(s => s.data.year === 2026).map(s => (
    { url: `${base}referentinnen/${s.data.slug}/`,  priority: "0.7", changefreq: "weekly" }
  ));

  // Archive pages
  const archivePages = archive.map(a => (
    { url: `${base}archiv/${a.data.slug}/`,        priority: "0.5", changefreq: "yearly" }
  ));

  const allPages = [...staticPages, ...sessionPages, ...speakerPages, ...archivePages];
  const today = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPages.map(p => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
