import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/utils";

export const runtime = "nodejs";

/**
 * OAuth callback. Google sends the user back here (via Supabase) with a
 * `?code=...`; we exchange it for a session cookie and redirect home. On
 * failure we bounce back to /account with an error flag the form can show.
 *
 * `next` is validated with the same guard both client sign-in paths use (M19).
 * Prefixing `origin` already blocked a straightforward open redirect, but a
 * protocol-relative value such as "//evil.example" would otherwise survive.
 */
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/account?error=oauth`);
}
