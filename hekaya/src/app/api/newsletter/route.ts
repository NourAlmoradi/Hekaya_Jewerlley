import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { clientIp, rateLimited } from "@/lib/rateLimit";
import type { Locale } from "@/types";

export const runtime = "nodejs";

/**
 * Newsletter signup (finding C2).
 *
 * The footer form previously called preventDefault() and nothing else — the
 * email was typed, the button pressed, and the value silently discarded with no
 * feedback at all.
 */

const MAX_EMAIL = 255;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_RULE = { limit: 5, windowMs: 10 * 60 * 1000 };

type Body = { email?: string; locale?: Locale };

export async function POST(req: Request) {
  if (rateLimited("newsletter", clientIp(req), RATE_RULE)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  const locale: Locale = body.locale === "en" ? "en" : "ar";

  if (!email || email.length > MAX_EMAIL || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .insert({ email, locale });

  if (error) {
    // 23505 = unique_violation on the lower(email) index. Already subscribed is
    // a success from the visitor's point of view, and reporting it as an error
    // would leak which addresses are on the list.
    if (error.code === "23505") {
      return NextResponse.json({ ok: true, already: true });
    }
    console.error("[newsletter] insert failed:", error.message);
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
