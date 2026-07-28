"use client";

import { useEffect, useMemo } from "react";
import { useCatalogStore } from "@/stores/catalog.store";
import type { Category } from "@/types";

/** Returns all categories from Supabase, sorted by sort order. */
export function useCategories(): Category[] {
  const categories = useCatalogStore((s) => s.categories);
  const load = useCatalogStore((s) => s.load);

  useEffect(() => {
    load();
  }, [load]);

  return categories;
}

/**
 * Look up a single category by id from the loaded catalog.
 *
 * Backed by a Map rather than `.find()`. This hook is called once per
 * ProductCard, so on a 40-product grid the previous version ran 40 linear scans
 * on every render (M16). The Map is memoised on the categories array, so it is
 * rebuilt only when the catalogue actually changes.
 */
export function useCategory(id: string | undefined): Category | undefined {
  const categories = useCategories();
  const byId = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );
  return id ? byId.get(id) : undefined;
}
