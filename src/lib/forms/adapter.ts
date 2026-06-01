/**
 * Formular-Adapter-Abstraktion
 *
 * Entkoppelt die Formularlogik vom konkreten Anbieter.
 * Standard-Implementierung: Netlify Forms (funktioniert ohne Server für statische Sites).
 *
 * Zum Austauschen: ACTIVE_ADAPTER unten ändern und neuen Adapter implementieren.
 *
 * Künftige Erweiterungen möglich:
 *   - formspree.ts (Formspree)
 *   - api.ts (eigene API-Route)
 *   - supabase.ts (Supabase)
 */

// ─── Typen ────────────────────────────────────────────────────────────────────

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  language: "de" | "en";
  ticketCategory: string;
  remarks?: string;
  diet?: string;
  accessibilityNeeds?: string;
  privacyConsent: boolean;
  newsletterConsent?: boolean;
  // Honeypot-Feld (muss leer sein)
  _hp?: string;
}

export interface FormSubmitResult {
  success: boolean;
  error?: string;
}

export interface FormAdapter {
  submit(data: RegistrationData): Promise<FormSubmitResult>;
}

// ─── Netlify-Adapter (Standard) ───────────────────────────────────────────────
// Netlify Forms erkennt HTML-Formulare automatisch im Build.
// Der Adapter sendet per fetch an dieselbe URL mit application/x-www-form-urlencoded.

const netlifyAdapter: FormAdapter = {
  async submit(data: RegistrationData): Promise<FormSubmitResult> {
    // Honeypot-Prüfung
    if (data._hp && data._hp.trim() !== "") {
      // Stille Ablehnung (Spam)
      return { success: true };
    }

    try {
      const body = new URLSearchParams({
        "form-name": "registration",
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone ?? "",
        language: data.language,
        ticketCategory: data.ticketCategory,
        remarks: data.remarks ?? "",
        diet: data.diet ?? "",
        accessibilityNeeds: data.accessibilityNeeds ?? "",
        privacyConsent: data.privacyConsent ? "yes" : "no",
        newsletterConsent: data.newsletterConsent ? "yes" : "no",
      });

      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}` };
      }
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  },
};

// ─── Aktiver Adapter ──────────────────────────────────────────────────────────
// Zum Wechseln: hier importieren und zuweisen.
export const ACTIVE_ADAPTER: FormAdapter = netlifyAdapter;

// ─── Validierung (Client-seitig) ──────────────────────────────────────────────

export interface ValidationErrors {
  [field: string]: string;
}

export function validateRegistration(
  data: Partial<RegistrationData>,
  locale: "de" | "en" = "de"
): ValidationErrors {
  const errors: ValidationErrors = {};

  const msg = {
    required: locale === "de" ? "Dieses Feld ist erforderlich." : "This field is required.",
    email:    locale === "de" ? "Bitte eine gültige E-Mail-Adresse eingeben." : "Please enter a valid email address.",
    privacy:  locale === "de" ? "Bitte stimme der Datenschutzerklärung zu." : "Please agree to the privacy policy.",
  };

  if (!data.firstName?.trim())      errors.firstName      = msg.required;
  if (!data.lastName?.trim())       errors.lastName       = msg.required;
  if (!data.email?.trim())          errors.email          = msg.required;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = msg.email;
  if (!data.ticketCategory?.trim()) errors.ticketCategory = msg.required;
  if (!data.privacyConsent)         errors.privacyConsent = msg.privacy;

  return errors;
}
