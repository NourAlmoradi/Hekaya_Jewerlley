import type { SupabaseClient } from "@supabase/supabase-js";

/** A memory with its private content — never includes the PIN hash. */
export type PublicMemory = {
  token: string;
  orderId: string | null;
  productId: string | null;
  productLabel: string | null;
  title: string;
  message: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
};

/**
 * The public "does a memory exist?" shape returned by get_memory(). It carries
 * the linked product (catalog data) but NOT the private title/message/photos —
 * those only come back from unlockMemory() after a correct PIN, or from a
 * direct table read by the order owner / admin (RLS).
 */
export type MemoryMeta = Omit<PublicMemory, "title" | "message" | "photos">;

type ContentRow = {
  token: string;
  order_id: string | null;
  product_id: string | null;
  product_label: string | null;
  title: string;
  message: string;
  photos: string[] | null;
  created_at: string;
  updated_at: string;
};

type MetaRow = Omit<ContentRow, "title" | "message" | "photos">;

function mapContent(row: ContentRow): PublicMemory {
  return {
    token: row.token,
    orderId: row.order_id,
    productId: row.product_id,
    productLabel: row.product_label,
    title: row.title,
    message: row.message,
    photos: row.photos ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMeta(row: MetaRow): MemoryMeta {
  return {
    token: row.token,
    orderId: row.order_id,
    productId: row.product_id,
    productLabel: row.product_label,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Does a memory exist for this token? Returns linked product, never content. */
export async function getMemoryMeta(
  supabase: SupabaseClient,
  token: string,
): Promise<MemoryMeta | null> {
  const { data, error } = await supabase.rpc("get_memory", { p_token: token });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as MetaRow | undefined;
  return row ? mapMeta(row) : null;
}

/**
 * The outcome of a PIN unlock attempt. `unlock_memory` returns this as data
 * (never throws for a wrong/locked PIN) so the failed-attempt counter it writes
 * actually commits — a raised exception would roll the whole RPC transaction
 * back. Genuine transport/unexpected errors still reject, so the caller can
 * tell "wrong PIN" apart from "the request failed".
 */
export type UnlockResult =
  | { status: "ok"; memory: PublicMemory }
  | { status: "wrong"; attemptsLeft: number | null }
  | { status: "locked"; minutesLeft: number };

type UnlockRow = ContentRow & {
  status?: string;
  attempts_left?: number | null;
  minutes_left?: number | null;
};

/**
 * Unlock the private content with a PIN (the only PIN-gated read). Resolves to
 * an {@link UnlockResult}; rejects only on a real network/unexpected error.
 * Tolerates an older deployment whose `unlock_memory` still RAISES text errors.
 */
export async function unlockMemory(
  supabase: SupabaseClient,
  token: string,
  pin: string,
): Promise<UnlockResult> {
  const { data, error } = await supabase.rpc("unlock_memory", {
    p_token: token,
    p_pin: pin,
  });
  if (error) {
    // Legacy function: it raises instead of returning a status row.
    const msg = error.message ?? "";
    if (/PIN_LOCKED|too many/i.test(msg)) {
      const m = /PIN_LOCKED:(\d+)/.exec(msg)?.[1];
      return { status: "locked", minutesLeft: m ? Number(m) : 15 };
    }
    if (/PIN_WRONG|wrong pin/i.test(msg)) {
      const n = /PIN_WRONG:(\d+)/.exec(msg)?.[1];
      return { status: "wrong", attemptsLeft: n ? Number(n) : null };
    }
    throw error; // genuine transport / unexpected failure
  }
  const row = (Array.isArray(data) ? data[0] : data) as UnlockRow | undefined;
  if (!row) return { status: "wrong", attemptsLeft: null };
  if (row.status === "locked") {
    return { status: "locked", minutesLeft: row.minutes_left ?? 15 };
  }
  if (row.status === "wrong") {
    return { status: "wrong", attemptsLeft: row.attempts_left ?? null };
  }
  // status 'ok', or a legacy row that returned content with no status column.
  return { status: "ok", memory: mapContent(row) };
}

/**
 * Direct table read of the full memory — succeeds only for the order owner or
 * an admin (RLS). Used to skip the PIN gate for the person who owns the order.
 * Returns null when the caller isn't allowed (so the PIN prompt is shown).
 */
export async function fetchMemoryByToken(
  supabase: SupabaseClient,
  token: string,
): Promise<PublicMemory | null> {
  const { data } = await supabase
    .from("memories")
    .select(
      "token, order_id, product_id, product_label, title, message, photos, created_at, updated_at",
    )
    .eq("token", token)
    .maybeSingle();
  return data ? mapContent(data as ContentRow) : null;
}

/** Create or update a memory. PIN is required for first setup and for edits. */
export async function saveMemory(
  supabase: SupabaseClient,
  input: {
    token: string;
    pin?: string;
    title: string;
    message: string;
    photos: string[];
    orderId?: string | null;
    productId?: string | null;
    productLabel?: string | null;
  },
): Promise<void> {
  const { error } = await supabase.rpc("save_memory", {
    p_token: input.token,
    p_order_id: input.orderId ?? null,
    p_product_id: input.productId ?? null,
    p_product_label: input.productLabel ?? null,
    p_pin: input.pin ?? null,
    p_title: input.title,
    p_message: input.message,
    p_photos: input.photos,
  });
  if (error) throw error;
}

/** All memories belonging to the signed-in user's orders (RLS-scoped). */
export async function fetchMyMemories(
  supabase: SupabaseClient,
): Promise<PublicMemory[]> {
  const { data, error } = await supabase
    .from("memories")
    .select(
      "token, order_id, product_id, product_label, title, message, photos, created_at, updated_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ContentRow[]).map(mapContent);
}

/** All memories (admin only — RLS returns every row for admins). */
export async function fetchAllMemories(
  supabase: SupabaseClient,
): Promise<PublicMemory[]> {
  return fetchMyMemories(supabase);
}

/** Admin-only: reset a memory's PIN without knowing the old one. */
export async function adminResetMemoryPin(
  supabase: SupabaseClient,
  token: string,
  pin: string,
): Promise<void> {
  const { error } = await supabase.rpc("admin_reset_memory_pin", {
    p_token: token,
    p_pin: pin,
  });
  if (error) throw error;
}

/**
 * Admin-only: fully delete a memory — the DB row plus every uploaded photo
 * (saved and orphaned) under `memory-photos/<token>/`. This goes through a
 * server route because the `memory-photos` bucket has no client delete policy,
 * so deleting the files has to run with the service role. Throws on failure so
 * the caller can surface an error instead of silently leaving photos behind.
 */
export async function adminDeleteMemory(token: string): Promise<void> {
  const res = await fetch("/api/admin/memory/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    const { error } = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(error || "Failed to delete memory");
  }
}

/**
 * Admin-only: delete every photo in `memory-photos` that no saved memory still
 * references — uploads that were never saved, and files stranded when a memory
 * was edited to drop a photo. Returns how many files were scanned and removed.
 * Goes through a server route because sweeping storage needs the service role.
 */
export async function cleanOrphanMemoryPhotos(): Promise<{
  scanned: number;
  removed: number;
}> {
  const res = await fetch("/api/admin/memory/orphans", { method: "POST" });
  if (!res.ok) {
    const { error } = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(error || "Failed to clean orphan photos");
  }
  return (await res.json()) as { scanned: number; removed: number };
}
