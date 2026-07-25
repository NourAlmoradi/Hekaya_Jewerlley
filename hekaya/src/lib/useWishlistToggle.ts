"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useWishlistStore } from "@/stores/wishlist.store";
import { useT } from "@/lib/useT";
import { useAuth } from "@/lib/supabase/useAuth";

/**
 * Shared wishlist toggle logic used by ProductCard and ProductDetail.
 * Returns the current membership flag and a memoised toggle handler
 * that also fires the add/remove toast.
 */
export function useWishlistToggle(productId: string) {
  const { t, locale } = useT();
  const { user } = useAuth();
  const inWishlist = useWishlistStore((s) => s.ids.includes(productId));
  const toggleStore = useWishlistStore((s) => s.toggle);
  const loaded = useWishlistStore((s) => s.loaded);
  const load = useWishlistStore((s) => s.load);

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  const toggle = useCallback(() => {
    // The wishlist is only persisted for signed-in users — the store silently
    // skips the DB write otherwise, so don't fake an "added" toast. Prompt
    // sign-in instead of losing the action on reload.
    if (!user) {
      toast(
        locale === "ar"
          ? "سجّل الدخول لحفظ قائمة الرغبات"
          : "Sign in to save your wishlist",
      );
      return;
    }
    void toggleStore(productId);
    toast(inWishlist ? t("wishlist_removed") : t("wishlist_added"));
  }, [user, locale, toggleStore, productId, inWishlist, t]);

  return { inWishlist, toggle };
}
