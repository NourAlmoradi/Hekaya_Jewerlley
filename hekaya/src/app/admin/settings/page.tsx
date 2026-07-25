"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Globe as GlobeRaw, Store as StoreRaw } from "lucide-react";
import { useT } from "@/lib/useT";
import {
  useAdminSettings,
  type AdminStoreInfo,
  type AdminShipping,
} from "@/stores/adminSettings.store";
import { cn } from "@/lib/utils";

type TabId = "store" | "shipping";

export default function AdminSettingsPage() {
  const { t } = useT();
  const [tab, setTab] = useState<TabId>("store");

  const tabs: {
    id: TabId;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "store", label: t("admin_tab_store"), Icon: StorefrontIcon },
    { id: "shipping", label: t("admin_tab_shipping"), Icon: GlobeIcon },
  ];

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
          {t("admin_settings")}
        </h1>
        <p className="mt-1 text-sm text-white/50">{t("admin_settings_sub")}</p>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-white/10">
        {tabs.map(({ id, label, Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition",
                active
                  ? "border-[#c9a96e] text-[#c9a96e]"
                  : "border-transparent text-white/50 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tab === "store" && <StoreTab />}
        {tab === "shipping" && <ShippingTab />}
      </div>
    </>
  );
}

/* ============== STORE TAB ============== */
function StoreTab() {
  const { t, locale } = useT();
  const store = useAdminSettings((s) => s.store);
  const setStore = useAdminSettings((s) => s.setStore);
  const [form, setForm] = useState<AdminStoreInfo>(store);

  // The settings row loads asynchronously; sync the draft when it arrives so
  // saving can never overwrite the DB with the stale built-in defaults.
  useEffect(() => {
    setForm(store);
  }, [store]);

  const update = <K extends keyof AdminStoreInfo>(k: K, v: AdminStoreInfo[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    try {
      await setStore(form);
      toast.success(t("admin_settings_saved"));
    } catch {
      toast.error(
        locale === "ar"
          ? "تعذّر الحفظ — تأكد من صلاحيات المدير"
          : "Could not save — check admin permissions",
      );
    }
  };

  return (
    <SettingsCard title={t("admin_store_info")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label={t("admin_contact_email")}
          value={form.email}
          onChange={(v) => update("email", v)}
          type="email"
        />
        <Input
          label={t("admin_phone")}
          value={form.phone}
          onChange={(v) => update("phone", v)}
        />
        <Input
          label={t("admin_whatsapp")}
          value={form.whatsapp}
          onChange={(v) => update("whatsapp", v)}
        />
        <Input
          label={t("admin_instagram")}
          value={form.instagram}
          onChange={(v) => update("instagram", v)}
        />
        <Input
          label={t("admin_facebook")}
          value={form.facebook}
          onChange={(v) => update("facebook", v)}
        />
      </div>
      <SaveButton onClick={save} label={t("admin_save_store")} />
    </SettingsCard>
  );
}

/* ============== SHIPPING TAB ============== */
function ShippingTab() {
  const { t, locale } = useT();
  const shipping = useAdminSettings((s) => s.shipping);
  const setShipping = useAdminSettings((s) => s.setShipping);
  const [form, setForm] = useState<AdminShipping>(shipping);

  // Same stale-draft guard as StoreTab.
  useEffect(() => {
    setForm(shipping);
  }, [shipping]);

  const update = <K extends keyof AdminShipping>(k: K, v: AdminShipping[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    try {
      await setShipping(form);
      toast.success(t("admin_settings_saved"));
    } catch {
      toast.error(
        locale === "ar"
          ? "تعذّر الحفظ — تأكد من صلاحيات المدير"
          : "Could not save — check admin permissions",
      );
    }
  };

  const rows: { key: keyof AdminShipping; label: string }[] = [
    { key: "dubai", label: t("admin_shipping_dubai") },
    { key: "abuDhabi", label: t("admin_shipping_abudhabi") },
    { key: "sharjah", label: t("admin_shipping_sharjah") },
    { key: "ajman", label: t("admin_shipping_ajman") },
    { key: "ummAlQuwain", label: t("admin_shipping_uaq") },
    { key: "rasAlKhaimah", label: t("admin_shipping_rak") },
    { key: "fujairah", label: t("admin_shipping_fujairah") },
  ];

  return (
    <SettingsCard title={t("admin_shipping_rates")}>
      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <NumberInput
            key={r.key}
            suffix={t("admin_aed")}
            label={r.label}
            value={form[r.key]}
            onChange={(v) => update(r.key, v)}
          />
        ))}
      </div>
      <SaveButton onClick={save} label={t("admin_save_shipping")} />
    </SettingsCard>
  );
}

/* ============== UI HELPERS ============== */
function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#141414] p-6">
      <h2 className="mb-4 font-display text-xl font-semibold text-white">
        {title}
      </h2>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
      {children}
    </label>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        dir={dir}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-[#c9a96e]/40 focus:outline-none"
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          type="number"
          min={0}
          step="0.01"
          value={value}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          className={cn(
            "w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none",
            suffix && "pe-14",
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium uppercase tracking-wider text-white/40">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function SaveButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <div className="mt-6 flex justify-end">
      <button
        onClick={onClick}
        className="rounded-md bg-[#c9a96e] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] transition hover:bg-[#b8985d]"
      >
        {label}
      </button>
    </div>
  );
}

function StorefrontIcon(p: { className?: string }) {
  return <StoreRaw {...p} />;
}
function GlobeIcon(p: { className?: string }) {
  return <GlobeRaw {...p} />;
}
