/**
 * Netlify Function: create-payment
 * Datei: netlify/functions/create-payment.mjs
 *
 * Erstellt ein Payrexx Gateway und gibt den Zahlungslink zurück.
 * Wird vom RegistrationForm aufgerufen via POST /.netlify/functions/create-payment
 */

import crypto from "crypto";

// ─── Ticketpreise (Cents) ────────────────────────────────────────────────────
const TICKET_PRICES = {
  "3day-normal":  15000,
  "3day-reduced": 10000,
  "3day-soli":    20000,
  "fri-normal":    5500,
  "fri-reduced":   4000,
  "fri-soli":      7500,
  "sat-normal":    8000,
  "sat-reduced":   5500,
  "sat-soli":     10000,
  "sun-normal":    5500,
  "sun-reduced":   4000,
  "sun-soli":      7500,
};

// ─── Ticket-Labels (für Payrexx Rechnung/E-Mail) ─────────────────────────────
const TICKET_LABELS = {
  "3day-normal":  { de: "3-Tagespass Normal",      en: "3-Day Pass Regular"  },
  "3day-reduced": { de: "3-Tagespass Reduziert",    en: "3-Day Pass Reduced"  },
  "3day-soli":    { de: "3-Tagespass Solidarität",  en: "3-Day Pass Solidarity" },
  "fri-normal":   { de: "1-Tagespass Freitag Normal",    en: "1-Day Pass Friday Regular"   },
  "fri-reduced":  { de: "1-Tagespass Freitag Reduziert", en: "1-Day Pass Friday Reduced"   },
  "fri-soli":     { de: "1-Tagespass Freitag Solidarität", en: "1-Day Pass Friday Solidarity" },
  "sat-normal":   { de: "1-Tagespass Samstag Normal",    en: "1-Day Pass Saturday Regular"   },
  "sat-reduced":  { de: "1-Tagespass Samstag Reduziert", en: "1-Day Pass Saturday Reduced"   },
  "sat-soli":     { de: "1-Tagespass Samstag Solidarität", en: "1-Day Pass Saturday Solidarity" },
  "sun-normal":   { de: "1-Tagespass Sonntag Normal",    en: "1-Day Pass Sunday Regular"   },
  "sun-reduced":  { de: "1-Tagespass Sonntag Reduziert", en: "1-Day Pass Sunday Reduced"   },
  "sun-soli":     { de: "1-Tagespass Sonntag Solidarität", en: "1-Day Pass Sunday Solidarity" },
};

// ─── HMAC-Signatur für Payrexx ────────────────────────────────────────────────
function sign(params, apiKey) {
  const str = new URLSearchParams(params).toString();
  return crypto.createHmac("sha256", apiKey).update(str).digest("base64");
}

// ─── Handler ─────────────────────────────────────────────────────────────────
export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const instance = process.env.PAYREXX_INSTANCE; // z.B. "tierimfokus"
  const apiKey   = process.env.PAYREXX_API_KEY;
  const baseUrl  = process.env.URL || "https://tierrechtskongress.ch"; // Netlify setzt URL automatisch

  if (!instance || !apiKey) {
    console.error("Fehlende Umgebungsvariablen: PAYREXX_INSTANCE oder PAYREXX_API_KEY");
    return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { firstName, lastName, email, ticketCategory, language = "de" } = body;

  // Validierung
  if (!firstName || !lastName || !email || !ticketCategory) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const amount = TICKET_PRICES[ticketCategory];
  if (!amount) {
    return new Response(JSON.stringify({ error: "Invalid ticket category" }), { status: 400 });
  }

  const label = TICKET_LABELS[ticketCategory]?.[language] ?? ticketCategory;
  const lang  = language === "en" ? "en" : "de";
  const successUrl = `${baseUrl}/${lang === "en" ? "en/confirmation" : "bestaetigung"}`;
  const cancelUrl  = `${baseUrl}/${lang === "en" ? "en/registration" : "anmeldung"}?payment=cancelled`;
  const failUrl    = `${baseUrl}/${lang === "en" ? "en/registration" : "anmeldung"}?payment=failed`;

  // Payload für Payrexx
  const params = {
    amount:                          String(amount),
    vatRate:                         "0",
    currency:                        "CHF",
    successRedirectUrl:              encodeURIComponent(successUrl),
    failedRedirectUrl:               encodeURIComponent(failUrl),
    cancelRedirectUrl:               encodeURIComponent(cancelUrl),
    referenceId:                     `trk-${ticketCategory}-${Date.now()}`,
    "fields[forename][value]":       firstName,
    "fields[forename][mandatory]":   "1",
    "fields[surname][value]":        lastName,
    "fields[surname][mandatory]":    "1",
    "fields[email][value]":          email,
    "fields[email][mandatory]":      "1",
    "basket[0][name]":               `Tierrechtskongress 2026 – ${label}`,
    "basket[0][quantity]":           "1",
    "basket[0][amount]":             String(amount),
  };

  params.ApiSignature = sign(params, apiKey);

  try {
    const res = await fetch(
      `https://api.payrexx.com/v1.14/Gateway/?instance=${instance}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:    new URLSearchParams(params).toString(),
      }
    );

    const data = await res.json();

    if (data.status === "success" && data.data?.[0]?.link) {
      return new Response(JSON.stringify({ url: data.data[0].link }), {
        status:  200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Payrexx Fehler:", JSON.stringify(data));
    return new Response(JSON.stringify({ error: data.message ?? "Payrexx error" }), { status: 502 });

  } catch (err) {
    console.error("Fetch-Fehler:", err);
    return new Response(JSON.stringify({ error: "Network error" }), { status: 500 });
  }
}

// Netlify Functions v2 Config
export const config = { path: "/.netlify/functions/create-payment" };
