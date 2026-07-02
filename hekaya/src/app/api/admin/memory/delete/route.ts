import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs"; // needs the service role

const BUCKET = "memory-photos";

type Body = { token?: string };

/**
 * Admin-only: fully delete a memory. Removes the DB row AND every photo the
 * recipient uploaded under `memory-photos/<token>/` — including orphaned files
 * that were uploaded but never saved into the row's `photos` array.
 *
 * The row-delete + storage-remove run with the service role because the
 * `memory-photos` bucket has no client-side delete policy (uploads go through
 * the service role too). We first prove the caller is a signed-in admin.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Read the admin flag with the service role so RLS can't hide it from us.
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const token = (body.token ?? "").trim();
  if (!token) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // 1. Remove every photo under this token's folder (saved + orphaned) FIRST.
  //    If this fails we return before deleting the row, so the memory still
  //    shows in the admin list and the delete can be retried — deleting the row
  //    first would strand the files with no UI entry left to retry from.
  const { data: files, error: listErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .list(token, { limit: 1000 });
  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }
  if (files?.length) {
    const paths = files.map((f) => `${token}/${f.name}`);
    const { error: rmErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove(paths);
    if (rmErr) {
      return NextResponse.json({ error: rmErr.message }, { status: 500 });
    }
  }

  // 2. Remove the memory row (a no-op re-run is safe, so retries are fine).
  const { error: rowErr } = await supabaseAdmin
    .from("memories")
    .delete()
    .eq("token", token);
  if (rowErr) {
    return NextResponse.json({ error: rowErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
