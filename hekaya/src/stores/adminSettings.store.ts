"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export type AdminStoreInfo = {
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
};

export type AdminShipping = {
  dubai: number;
  abuDhabi: number;
  sharjah: number;
  ajman: number;
  ummAlQuwain: number;
  rasAlKhaimah: number;
  fujairah: number;
};

export type AdminSettingsState = {
  store: AdminStoreInfo;
  shipping: AdminShipping;
  loaded: boolean;
  load: () => Promise<void>;
  setStore: (s: Partial<AdminStoreInfo>) => Promise<void>;
  setShipping: (sh: Partial<AdminShipping>) => Promise<void>;
};

const defaults: Pick<AdminSettingsState, "store" | "shipping"> = {
  store: {
    email: "hello@mashaerjewellery.com",
    phone: "+971 50 000 0000",
    whatsapp: "+971 50 000 0000",
    instagram: "@mashaerjewellery",
    facebook: "mashaerjewellery",
  },
  shipping: {
    dubai: 0,
    abuDhabi: 15,
    sharjah: 10,
    ajman: 20,
    ummAlQuwain: 25,
    rasAlKhaimah: 25,
    fujairah: 25,
  },
};

type SettingsData = Pick<AdminSettingsState, "store" | "shipping">;

/** Persist the current store + shipping to the single admin_settings row. */
async function persistSettings(data: SettingsData) {
  const supabase = createClient();
  const { error } = await supabase
    .from("admin_settings")
    .update({ data })
    .eq("id", 1);
  if (error) throw error;
}

export const useAdminSettings = create<AdminSettingsState>()((set, get) => ({
  ...defaults,
  loaded: false,
  load: async () => {
    if (get().loaded) return;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("admin_settings")
        .select("data")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      const saved = (data?.data ?? {}) as Partial<SettingsData>;
      set({
        store: { ...defaults.store, ...saved.store },
        shipping: { ...defaults.shipping, ...saved.shipping },
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },
  // Update optimistically, then await the DB write so the caller can surface a
  // real error (e.g. a rejected write) instead of a false "Saved". Roll back the
  // optimistic value on failure so the UI never keeps showing unsaved data.
  setStore: async (s) => {
    const prev = get().store;
    const store = { ...prev, ...s };
    set({ store });
    try {
      await persistSettings({ store, shipping: get().shipping });
    } catch (e) {
      set({ store: prev });
      throw e;
    }
  },
  setShipping: async (sh) => {
    const prev = get().shipping;
    const shipping = { ...prev, ...sh };
    set({ shipping });
    try {
      await persistSettings({ store: get().store, shipping });
    } catch (e) {
      set({ shipping: prev });
      throw e;
    }
  },
}));

// Public consumers (Footer, Contact, Checkout) read these values, so load the
// single settings row once as soon as the store is first used in the browser.
if (typeof window !== "undefined") {
  void useAdminSettings.getState().load();
}
