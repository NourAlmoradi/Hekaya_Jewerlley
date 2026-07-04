import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs"; // needs the service role

const BUCKET = "memory-photos";
// Never touch a file younger than this — it may be an upload whose owner hasn't
// pressed "Save" yet (photos land in the bucket before the memory row is written).
const MIN_AGE_MS = 60 * 60 * 1000; // 1 hour

/**
 * Admin-only: sweep the `memory-photos` bucket for orphaned files — every object
 * NOT referenced by a saved memory's `photos` array. This catches the two ways
 * files get stranded:
 *   1. A recipient uploads photos but never saves the memory (no row at all).
 *   2. A memory is edited to drop a photo — the row's array loses the URL but the
 *      old file is never deleted from storage.
 *
 * A single-memory delete already removes every file under its `<token>/` folder,
 * so this is the bulk complement for files whose token has a *surviving* memory.
 * Runs with the service role (the bucket has no client delete policy) after
 * proving the caller is a signed-in admin.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // 1. Collect every storage path still referenced by a saved memory. A photo URL
  //    is getPublicUrl output: ".../memory-photos/<token>/<uuid>.jpg" → the path
  //    is everything after "/memory-photos/". Anything else (e.g. a legacy data:
  //    URL) has no storage file to protect, so it's simply skipped.
  const { data: mems, error: memErr } = await supabaseAdmin
    .from("memories")
    .select("photos");
  if (memErr) {
    return NextResponse.json({ error: memErr.message }, { status: 500 });
  }
  const referenced = new Set<string>();
  const marker = `/${BUCKET}/`;
  for (const m of mems ?? []) {
    for (const url of (m.photos ?? []) as string[]) {
      const i = url.indexOf(marker);
      if (i !== -1) referenced.add(url.slice(i + marker.length).split("?")[0]);
    }
  }

  // 2. Walk the bucket. Files live one level deep under a "<token>/" folder, so
  //    list the root to get the token folders, then list each folder's files.
  const { data: folders, error: rootErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .list("", { limit: 1000 });
  if (rootErr) {
    return NextResponse.json({ error: rootErr.message }, { status: 500 });
  }

  const cutoff = Date.now() - MIN_AGE_MS;
  const orphans: string[] = [];
  let scanned = 0;
  for (const folder of folders ?? []) {
    // Folder entries have a null id; a non-null id would be a stray root file.
    if (folder.id) continue;
    const token = folder.name;
    const { data: files, error: listErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(token, { limit: 1000 });
    if (listErr) {
      return NextResponse.json({ error: listErr.message }, { status: 500 });
    }
    for (const f of files ?? []) {
      // Only real files are deletable — a null id marks a folder placeholder.
      if (!f.id) continue;
      scanned++;
      const path = `${token}/${f.name}`;
      if (referenced.has(path)) continue;
      // Give an in-flight upload a grace window before reaping it.
      const created = f.created_at ? new Date(f.created_at).getTime() : 0;
      if (created > cutoff) continue;
      orphans.push(path);
    }
  }

  // 3. Remove the orphans in batches so a huge backlog can't blow one request.
  let removed = 0;
  for (let i = 0; i < orphans.length; i += 100) {
    const batch = orphans.slice(i, i + 100);
    const { error: rmErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .remove(batch);
    if (rmErr) {
      return NextResponse.json({ error: rmErr.message, removed }, { status: 500 });
    }
    removed += batch.length;
  }

  return NextResponse.json({ ok: true, scanned, removed });
}
