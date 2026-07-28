import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, FROM, ADMIN_ALERT } from "@/lib/email/resend";
import { contactMessage } from "@/lib/email/templates";
import { clientIp, rateLimited } from "@/lib/rateLimit";
import type { Locale } from "@/types";

export const runtime = "nodejs"; // resend SDK needs Node, not Edge

/**
 * Contact form intake (finding C1).
 *
 * The form previously ran a 700ms setTimeout and then told the customer their
 * message had been sent. Nothing was ever transmitted. For a made-to-order
 * jeweller this is the bespoke-commission channel — the topic list includes
 * "Custom Order" — so every discarded message was a lost order.
 *
 * The submission is PERSISTED FIRST and emailed second, deliberately: an email
 * to a single admin address is not a durable record. If Resend is down, the key
 * is missing, or the alert address bounces, the enquiry still lands in
 * `contact_messages` where it can be recovered.
 */

// Deliberately generous vs the client's 500-char counter, but bounded — this
// matches the CHECK constraints in migration 0004.
const MAX = { name: 120, email: 255, message: 2000 };
const TOPICS = new Set(["order", "qr", "custom", "general", "other"]);

const RATE_RULE = { limit: 5, windowMs: 10 * 60 * 1000 }; // 5 per 10 min per IP

type Body = {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
  locale?: Locale;
};

/**
 * Pragmatic email shape check. Deliberately not RFC 5322 — the goal is to
 * reject obvious junk, and the address is verified in practice by whether the
 * reply reaches them.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  if (rateLimited("contact", clientIp(req), RATE_RULE)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const topic = (body.topic ?? "general").trim();
  const message = (body.message ?? "").trim();
  const locale: Locale = body.locale === "en" ? "en" : "ar";

  if (
    !name ||
    name.length > MAX.name ||
    !email ||
    email.length > MAX.email ||
    !EMAIL_RE.test(email) ||
    !message ||
    message.length > MAX.message ||
    !TOPICS.has(topic)
  ) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // 1) Durable record first. Service role: the table grants no client INSERT
  //    policy, so validation and rate limiting cannot be bypassed.
  let stored = false;
  const { error: dbError } = await supabaseAdmin
    .from("contact_messages")
    .insert({ name, email, topic, message, locale });
  if (dbError) {
    console.error("[contact] could not store message:", dbError.message);
  } else {
    stored = true;
  }

  // 2) Notify the shop. Best-effort — a send failure must not lose a stored
  //    enquiry, and replyTo is the customer so the owner can just hit reply.
  let emailed = false;
  if (resend && ADMIN_ALERT) {
    const mail = contactMessage({ name, email, topic, message, locale });
    const { error } = await resend.emails.send({
      from: FROM,
      to: ADMIN_ALERT,
      replyTo: email,
      subject: mail.subject,
      html: mail.html,
    });
    if (error) console.error("[contact] alert email failed:", error.message);
    else emailed = true;
  } else if (!ADMIN_ALERT) {
    console.error("[contact] ADMIN_ALERT_EMAIL is not set — no alert sent.");
  }

  // Only claim success if the message survived somewhere. Telling the customer
  // it was sent when it was not is the exact bug this route replaces.
  if (!stored && !emailed) {
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
