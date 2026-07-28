"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import {
  createOrder as dbCreateOrder,
  fetchOrders,
  updateOrderStatus as dbUpdateOrderStatus,
} from "@/lib/supabase/orders";
import type { NewOrderInput } from "@/lib/supabase/orders";
import type { Order } from "@/types";

type OrdersState = {
  orders: Order[];
  loaded: boolean;
  loading: boolean;
  /** Load orders visible to the current user (RLS-scoped). */
  load: () => Promise<void>;
  /** Force a re-fetch. */
  refresh: () => Promise<void>;
  /**
   * Persist a new order (requires sign-in). Resolves to the server-minted
   * order id, or null when not signed in. The id and QR tokens are generated
   * by `place_order`, not here (H10).
   */
  addOrder: (input: NewOrderInput) => Promise<string | null>;
  /** Admin: change an order's status. */
  setStatus: (id: string, status: Order["status"]) => Promise<void>;
};

export const useOrdersStore = create<OrdersState>()((set, get) => ({
  orders: [],
  loaded: false,
  loading: false,
  load: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const orders = await fetchOrders(createClient());
      set({ orders, loaded: true, loading: false });
    } catch {
      set({ loaded: true, loading: false });
    }
  },
  refresh: async () => {
    try {
      const orders = await fetchOrders(createClient());
      set({ orders, loaded: true });
    } catch {
      /* ignore */
    }
  },
  addOrder: async (input) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const id = await dbCreateOrder(supabase, input);
    // Re-fetch so the store holds the server-authoritative order (status
    // 'pending', totals recomputed, and the minted id + QR tokens).
    await get().refresh();
    return id;
  },
  // Optimistic, with a rollback. The call sites did not await this and there
  // was no error path at all, so a rejected write (now also possible when the
  // transition guard refuses the move) produced an unhandled promise rejection
  // and no feedback whatsoever — the admin saw the dropdown close and assumed
  // it saved (M8). Errors are rethrown so the caller can toast.
  setStatus: async (id, status) => {
    const previous = get().orders.find((o) => o.id === id)?.status;
    set((s) => ({
      orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    }));
    try {
      await dbUpdateOrderStatus(createClient(), id, status);
    } catch (e) {
      if (previous) {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, status: previous } : o,
          ),
        }));
      }
      throw e;
    }
  },
}));

// Reload orders when auth changes (sign-in shows your orders, sign-out clears).
// The callback runs while Supabase holds its auth lock, so any Supabase call
// made directly here would deadlock until the lock times out. Defer with
// setTimeout(0) so the work runs after the lock is released.
if (typeof window !== "undefined") {
  const supabase = createClient();
  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") {
      useOrdersStore.setState({ orders: [], loaded: true });
    } else {
      setTimeout(() => void useOrdersStore.getState().refresh(), 0);
    }
  });
}
