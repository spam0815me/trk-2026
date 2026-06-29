/**
 * Netlify Function: newsletter-subscribe
 * Datei: netlify/functions/newsletter-subscribe.mjs
 *
 * Trägt eine E-Mail-Adresse per Double-Opt-In in die TIF-Mailchimp-Audience ein
 * und versieht den Kontakt mit dem Tag "trk26".
 * Wird vom NewsletterForm aufgerufen via POST /.netlify/functions/newsletter-subscribe
 *
 * Benötigte Umgebungsvariablen (im Netlify-Dashboard setzen, NIE im Repo):
 *   MAILCHIMP_API_KEY     → API-Key aus dem TIF-Mailchimp-Account (endet auf "-usX")
 *   MAILCHIMP_AUDIENCE_ID → ID der Newsletter-Audience (Mailchimp → Audience → Settings)
 *   MAILCHIMP_DC          → Server-Prefix, z.B. "us1" (optional; wird sonst aus dem Key abgeleitet)
 *
 * Die Werte sind identisch mit denen im kiebitz-Projekt (.env: MAILCHIMP_*).
 */

import crypto from "crypto";

// Tag, mit dem über dieses Formular geworbene Kontakte markiert werden.
const TAG = "trk26";

// E-Mail zu Mailchimp-Subscriber-Hash (md5 der kleingeschriebenen Adresse).
function subscriberHash(email) {
  return crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async function handler(req) {
  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  const apiKey     = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  // DC aus eigener Variable oder aus dem Key-Suffix ("xxxx-us1" → "us1") ableiten.
  const dc = process.env.MAILCHIMP_DC || (apiKey ? apiKey.split("-")[1] : null);

  if (!apiKey || !audienceId || !dc) {
    console.error("Fehlende Umgebungsvariablen: MAILCHIMP_API_KEY, MAILCHIMP_AUDIENCE_ID oder MAILCHIMP_DC");
    return json({ ok: false, error: "Server configuration error" }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const { email, firstName = "", _hp = "" } = body;

  // Honeypot: gefülltes Feld = Bot → still als Erfolg quittieren, nichts eintragen.
  if (typeof _hp === "string" && _hp.trim() !== "") {
    return json({ ok: true, status: "pending" });
  }

  if (!isValidEmail(email)) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }

  const base = `https://${dc}.api.mailchimp.com/3.0`;
  const auth = "Basic " + Buffer.from(`anystring:${apiKey}`).toString("base64");
  const hash = subscriberHash(email);

  const mergeFields = {};
  if (typeof firstName === "string" && firstName.trim() !== "") {
    mergeFields.FNAME = firstName.trim();
  }

  try {
    // 1) Upsert: neue Kontakte als "pending" (löst Double-Opt-In-Mail aus).
    //    status_if_new wirkt nur bei NEUEN Kontakten — bestehende behalten ihren
    //    Status (eine frühere Abmeldung wird also respektiert, nicht überschrieben).
    const upsertRes = await fetch(`${base}/lists/${audienceId}/members/${hash}`, {
      method: "PUT",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        email_address: email.trim(),
        status_if_new: "pending",
        ...(Object.keys(mergeFields).length ? { merge_fields: mergeFields } : {}),
      }),
    });

    const member = await upsertRes.json();

    if (!upsertRes.ok) {
      // Häufigster Fall: Adresse wurde früher abgemeldet/gesperrt → Mailchimp
      // verlangt erneute Anmeldung über das Mailchimp-eigene Formular.
      if (member.title === "Member In Compliance State") {
        return json({ ok: false, error: "compliance" }, 409);
      }
      console.error("Mailchimp upsert error:", JSON.stringify(member));
      return json({ ok: false, error: "mailchimp_error" }, 502);
    }

    // 2) Tag "trk26" setzen (eigener Endpoint; idempotent).
    const tagRes = await fetch(`${base}/lists/${audienceId}/members/${hash}/tags`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({ tags: [{ name: TAG, status: "active" }] }),
    });

    if (!tagRes.ok && tagRes.status !== 204) {
      // Tag-Fehler ist nicht kritisch — der Kontakt ist eingetragen.
      const tagErr = await tagRes.text();
      console.error("Mailchimp tag error:", tagErr);
    }

    // status: "pending" = DOI-Mail unterwegs; "subscribed" = war schon angemeldet.
    return json({ ok: true, status: member.status });
  } catch (err) {
    console.error("Newsletter-Fetch-Fehler:", err);
    return json({ ok: false, error: "network_error" }, 500);
  }
}

// Netlify Functions v2 Config
export const config = { path: "/.netlify/functions/newsletter-subscribe" };
