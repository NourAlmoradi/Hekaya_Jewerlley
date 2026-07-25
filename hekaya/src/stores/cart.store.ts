"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  qrChoice: "per_order" | "per_piece";
  setOpen: (open: boolean) => void;
  setQrChoice: (c: "per_order" | "per_piece") => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variationId?: string) => void;
  updateQty: (productId: string, qty: number, variationId?: string) => void;
  clear: () => void;
  /**
   * Sync each line's persisted price to the live catalog price. Returns the
   * number of lines whose price changed (0 = nothing stale).
   */
  reconcilePrices: (priceOf: (productId: string) => number | undefined) => number;
};

const keyOf = (id: string, v?: string) => `${id}__${v ?? ""}`;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      qrChoice: "per_order",
      setOpen: (isOpen) => set({ isOpen }),
      setQrChoice: (qrChoice) => set({ qrChoice }),
      addItem: (item) =>
        set((state) => {
          const idx = state.items.findIndex(
            (i) =>
              keyOf(i.productId, i.variationId) ===
              keyOf(item.productId, item.variationId),
          );
          if (idx >= 0) {
            const copy = [...state.items];
            copy[idx] = { ...copy[idx], qty: copy[idx].qty + item.qty };
            return { items: copy };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId, variationId) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              keyOf(i.productId, i.variationId) !==
              keyOf(productId, variationId),
          ),
        })),
      updateQty: (productId, qty, variationId) =>
        set((state) => ({
          items: state.items.map((i) =>
            keyOf(i.productId, i.variationId) === keyOf(productId, variationId)
              ? { ...i, qty: Math.max(1, qty) }
              : i,
          ),
        })),
      clear: () => set({ items: [] }),
      reconcilePrices: (priceOf) => {
        let changed = 0;
        set((state) => ({
          items: state.items.map((i) => {
            const live = priceOf(i.productId);
            if (live !== undefined && live !== i.price) {
              changed++;
              return { ...i, price: live };
            }
            return i;
          }),
        }));
        return changed;
      },
    }),
    { name: "mashaer-cart" },
  ),
);

/**
 * Derived selector hooks — subscribe only to `items` so consuming
 * components re-render solely when the relevant total changes.
 */
export const useCartCount = () =>
  useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));

export const useCartSubtotal = () =>
  useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.qty, 0));
