"use client";

import { useEffect, useMemo } from "react";
import { useCatalogStore } from "@/stores/catalog.store";
import type { Collection } from "@/types";

/**
 * Returns the live collections list fetched from Supabase.
 * Sorted by sortOrder; only active collections unless `includeInactive`.
 *
 * Memoised: this used to build `[...collections].filter().sort()` on every
 * render, handing back a NEW array reference each time. Any consumer that put
 * the result in a useMemo/useEffect dependency array therefore re-ran on every
 * render (M16). `useProducts` gets this right by returning the store slice
 * directly.
 */
export function useCollections(opts?: {
  includeInactive?: boolean;
}): Collection[] {
  const collections = useCatalogStore((s) => s.collections);
  const load = useCatalogStore((s) => s.load);
  // Destructured so the memo depends on the boolean, not on a fresh `opts`
  // object literal that callers re-create each render.
  const includeInactive = opts?.includeInactive ?? false;

  useEffect(() => {
    load();
  }, [load]);

  return useMemo(
    () =>
      [...collections]
        .filter((c) => includeInactive || c.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [collections, includeInactive],
  );
}
