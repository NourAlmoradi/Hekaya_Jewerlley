import { Resend } from "resend";

// Server-only. Degrade gracefully when the key is missing instead of throwing
// at module load — a missing key would otherwise 500 the whole /api/email/order
// route. `sendOrderEmails` handles a null client via its `no_key` path, and
// checkout fire-and-forgets the call, so a missing key never blocks an order.
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey && process.env.NODE_ENV === "production") {
  console.error("RESEND_API_KEY is not set — order emails are disabled.");
}

export const resend = apiKey ? new Resend(apiKey) : null;

export const FROM = process.env.EMAIL_FROM ?? "Mashaer <onboarding@resend.dev>";
export const REPLY_TO = process.env.EMAIL_REPLY_TO;
export const ADMIN_ALERT = process.env.ADMIN_ALERT_EMAIL;
