import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { clientIp, rateLimited } from "@/lib/rateLimit";

export const runtime = "nodejs"; // needs Node Buffer + service role

const BUCKET = "memory-photos";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB after client-side compression
// The browser caps a memory at 3 photos; enforce it server-side too, with a
// little headroom for replace-then-delete flows.
const MAX_FILES_PER_TOKEN = 6;

// Best-effort per-IP rate limit — see src/lib/rateLimit.ts for the per-instance
// caveat. A lightweight guard against someone filling the bucket via a single
// valid token, not a hard quota.
const RATE_RULE = { limit: 20, windowMs: 10 * 60 * 1000 };

type Body = { token?: string; dataUrl?: string };

/**
 * Upload one memory photo to the (public) `memory-photos` bucket and return its
 * public URL. The memory page is used by gift recipients who may be anonymous,
 * so this runs with the service role — but it first validates that the token is
 * real (an existing memory, or a QR token minted on an order). The file is
 * stored under `<token>/<uuid>` so it can be cleaned up with the memory.
 */
export async function POST(req: Request) {
  if (rateLimited("memory-upload", clientIp(req), RATE_RULE)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const token = (body.token ?? "").trim();
  const dataUrl = body.dataUrl ?? "";
  if (!token || !dataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // The token must correspond to a real memory or a minted QR token.
  const { data: mem } = await supabaseAdmin
    .from("memories")
    .select("token")
    .eq("token", token)
    .maybeSingle();
  let valid = !!mem;
  if (!valid) {
    const { data: ord } = await supabaseAdmin
      .from("orders")
      .select("id")
      .contains("qr_tokens", [token])
      .limit(1)
      .maybeSingle();
    valid = !!ord;
  }
  if (!valid) {
    return NextResponse.json({ error: "unknown_token" }, { status: 403 });
  }

  // Enforce the per-memory photo cap server-side (the 3-photo limit otherwise
  // lives only in the browser).
  const { data: existing } = await supabaseAdmin.storage
    .from(BUCKET)
    .list(token, { limit: 100 });
  if ((existing?.length ?? 0) >= MAX_FILES_PER_TOKEN) {
    return NextResponse.json({ error: "too_many" }, { status: 409 });
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: "bad_image" }, { status: 400 });
  }
  const contentType = match[1];
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  const ext = contentType === "image/png" ? "png" : "jpg";
  const path = `${token}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
