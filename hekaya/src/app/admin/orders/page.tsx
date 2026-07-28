"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Search, X, Check } from "lucide-react";
import { useT } from "@/lib/useT";
import type { TKey } from "@/lib/i18n";
import { useOrders } from "@/lib/useOrders";
import { useOrdersStore } from "@/stores/orders.store";
import { formatDate, formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  type Order,
  type OrderStatus,
} from "@/types";

// Single source of truth lives in @/types (and is mirrored by the
// guard_order_status trigger); this local copy used to drift.
const ALL_STATUSES = ORDER_STATUSES;

const STATUS_PILL: Record<OrderStatus, string> = {
  pending: "bg-amber-200/15 text-amber-300 ring-amber-300/30",
  paid: "bg-violet-300/15 text-violet-300 ring-violet-300/30",
  processing: "bg-blue-300/15 text-blue-300 ring-blue-300/30",
  shipped: "bg-purple-400/15 text-purple-300 ring-purple-400/30",
  delivered: "bg-emerald-300/15 text-emerald-300 ring-emerald-300/30",
  cancelled: "bg-rose-300/15 text-rose-300 ring-rose-300/30",
};

type Filter = "all" | OrderStatus;

export default function AdminOrders() {
  const { t, locale } = useT();
  const all = useOrders();
  const setStatus = useOrdersStore((s) => s.setStatus);

  // Awaited, with a toast on failure. This was fire-and-forget: a rejected
  // write (bad transition, lost permissions, network) produced an unhandled
  // rejection and no feedback, so the admin believed it had saved (M8).
  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await setStatus(id, status);
      toast.success(t("admin_status_updated"));
    } catch {
      toast.error(t("admin_status_update_failed"));
    }
  };
  const [selected, setSelected] = useState<Order | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (
        q &&
        !o.id.toLowerCase().includes(q) &&
        !o.customerName.toLowerCase().includes(q) &&
        !o.email.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [all, query, filter]);

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: t("admin_filter_all") },
    { id: "pending", label: t("status_pending") },
    { id: "paid", label: t("status_paid") },
    { id: "processing", label: t("status_processing") },
    { id: "shipped", label: t("status_shipped") },
    { id: "delivered", label: t("status_delivered") },
    { id: "cancelled", label: t("status_cancelled") },
  ];

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
          {locale === "ar" ? "الطلبات" : "Orders"}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          {all.length} {t("admin_total_orders_count")}
        </p>
      </div>

      {/* Search + tabs */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("admin_search_orders")}
            className="w-full rounded-md border border-white/10 bg-[#141414] py-3 ps-10 pe-3 text-sm text-white placeholder:text-white/40 focus:border-[#c9a96e]/40 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition",
                filter === tab.id
                  ? "bg-[#c9a96e] text-[#1a1a1a]"
                  : "bg-[#141414] text-white/70 ring-1 ring-white/10 hover:bg-white/[0.06]",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-white/5 bg-[#141414]">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-4 py-4 text-start font-medium">
                  {t("order")}
                </th>
                <th className="px-4 py-4 text-start font-medium">
                  {t("date")}
                </th>
                <th className="px-4 py-4 text-start font-medium">
                  {t("items")}
                </th>
                <th className="px-4 py-4 text-start font-medium">
                  {t("total")}
                </th>
                <th className="px-4 py-4 text-start font-medium">
                  {t("status")}
                </th>
                <th className="px-4 py-4 text-end font-medium">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((o) => {
                const itemsCount = o.items.reduce((s, i) => s + i.qty, 0);
                return (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-4 font-mono text-sm font-bold text-white">
                      {o.id}
                    </td>
                    <td className="px-4 py-4 text-white/60">
                      {formatDate(o.createdAt, locale)}
                    </td>
                    <td className="px-4 py-4 text-white/80">{itemsCount}</td>
                    <td className="px-4 py-4 font-semibold text-white">
                      {formatPrice(o.total, locale)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusPill
                        status={o.status}
                        editable
                        open={openDropdown === o.id}
                        onToggle={() =>
                          setOpenDropdown(openDropdown === o.id ? null : o.id)
                        }
                        onChange={(s) => {
                          void updateStatus(o.id, s);
                          setOpenDropdown(null);
                        }}
                        t={t}
                      />
                    </td>
                    <td className="px-4 py-4 text-end">
                      <button
                        onClick={() => setSelected(o)}
                        className="grid h-8 w-8 ms-auto place-items-center rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white"
                        aria-label={t("view")}
                      >
                        <ChevronRight
                          className={cn(
                            "h-4 w-4",
                            locale === "ar" && "rotate-180",
                          )}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-white/40"
                  >
                    {locale === "ar"
                      ? "لا توجد طلبات."
                      : "No orders match your filter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="divide-y divide-white/5 md:hidden">
          {filtered.map((o) => {
            const itemsCount = o.items.reduce((s, i) => s + i.qty, 0);
            return (
              <li key={o.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-bold text-white">
                      {o.id}
                    </p>
                    <p className="mt-0.5 text-xs text-white/50">
                      {formatDate(o.createdAt, locale)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(o)}
                    className="shrink-0 rounded-md bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/[0.08]"
                  >
                    {t("view")}
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-white/40">{t("items")}</p>
                    <p className="mt-0.5 text-sm text-white/85">{itemsCount}</p>
                  </div>
                  <div>
                    <p className="text-white/40">{t("total")}</p>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      {formatPrice(o.total, locale)}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <StatusPill
                    status={o.status}
                    editable
                    open={openDropdown === o.id}
                    onToggle={() =>
                      setOpenDropdown(openDropdown === o.id ? null : o.id)
                    }
                    onChange={(s) => {
                      void updateStatus(o.id, s);
                      setOpenDropdown(null);
                    }}
                    t={t}
                  />
                </div>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="p-8 text-center text-sm text-white/40">
              {locale === "ar"
                ? "لا توجد طلبات."
                : "No orders match your filter."}
            </li>
          )}
        </ul>
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-[#141414] p-6 text-white shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    {t("order_number")}
                  </p>
                  <h3 className="font-mono text-xl font-bold">{selected.id}</h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/[0.06]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FieldDark
                  label={t("customer")}
                  value={selected.customerName}
                />
                <FieldDark label={t("email")} value={selected.email} />
                <FieldDark
                  label={t("date")}
                  value={formatDate(selected.createdAt, locale)}
                />
                <FieldDark
                  label={t("status")}
                  value={t(`status_${selected.status}` as TKey)}
                />
              </div>

              <h4 className="mt-6 mb-2 font-semibold text-white">
                {t("items")}
              </h4>
              <ul className="divide-y divide-white/5 rounded-md bg-[#0a0a0a] ring-1 ring-white/5">
                {selected.items.map((it, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between p-3 text-sm"
                  >
                    <span className="text-white/80">
                      {it.name[locale]} × {it.qty}
                    </span>
                    <span className="font-semibold text-white">
                      {formatPrice(it.price * it.qty, locale)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex justify-between border-t border-white/5 pt-4">
                <span className="text-sm font-semibold text-white/80">
                  {t("cart_total")}
                </span>
                <span className="font-display text-lg font-semibold text-[#c9a96e]">
                  {formatPrice(selected.total, locale)}
                </span>
              </div>

              {selected.qrTokens.length > 0 && (
                <div className="mt-6">
                  <h4 className="mb-2 font-semibold text-white">
                    {t("admin_qr_codes")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.qrTokens.map((tok) => (
                      <Link
                        key={tok}
                        href={`/memory/${tok}`}
                        target="_blank"
                        className="rounded-md bg-[#0a0a0a] px-3 py-1.5 font-mono text-xs text-[#c9a96e] ring-1 ring-white/10 hover:bg-white/[0.04]"
                      >
                        {tok}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function StatusPill({
  status,
  editable,
  open,
  onToggle,
  onChange,
  t,
}: {
  status: OrderStatus;
  editable: boolean;
  open: boolean;
  onToggle: () => void;
  onChange: (s: OrderStatus) => void;
  // Typed with the real key union rather than `never` — the old signature made
  // every call site need an `as never` cast and rejected genuine keys.
  t: (k: TKey) => string;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  // The pill lives inside containers with overflow-hidden / overflow-x-auto,
  // which clip an absolutely-positioned menu. Render the menu in a portal with
  // fixed positioning so it escapes those clipping contexts.
  useEffect(() => {
    if (!open) return;
    const MENU_W = 176; // w-44
    const MENU_H = 168; // ~4 rows
    const place = () => {
      const btn = btnRef.current;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const rtl = document.documentElement.dir === "rtl";
      let left = rtl ? r.right - MENU_W : r.left;
      left = Math.max(8, Math.min(left, window.innerWidth - MENU_W - 8));
      let top = r.bottom + 8; // mt-2
      if (top + MENU_H > window.innerHeight - 8) {
        top = Math.max(8, r.top - 8 - MENU_H); // flip above when no room below
      }
      setCoords({ top, left });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  if (!editable) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
          STATUS_PILL[status],
        )}
      >
        {t(`status_${status}` as TKey)}
      </span>
    );
  }
  return (
    <>
      <button
        ref={btnRef}
        onClick={onToggle}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
          STATUS_PILL[status],
        )}
      >
        {t(`status_${status}` as TKey)}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[55]" onClick={onToggle} />
            <div
              className="fixed z-[56] w-44 overflow-hidden rounded-md border border-white/10 bg-white text-[#1a1a1a] shadow-xl"
              style={{ top: coords.top, left: coords.left }}
            >
              {/* Only the current status plus its legal next moves. The list
                  used to offer all six regardless, so `delivered → pending`
                  was one click away; the server now rejects that outright, so
                  offering it would only produce an error toast (M8). */}
              {ALL_STATUSES.filter(
                (s) => s === status || ORDER_STATUS_TRANSITIONS[status].includes(s),
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => s !== status && onChange(s)}
                  disabled={s === status}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-[#f5efe2]",
                    s === status && "bg-[#f5efe2] font-semibold",
                  )}
                >
                  <span>{t(`status_${s}` as TKey)}</span>
                  {s === status && <Check className="h-4 w-4 text-[#c9a96e]" />}
                </button>
              ))}
              {ORDER_STATUS_TRANSITIONS[status].length === 0 && (
                <p className="px-3 py-2 text-xs text-[#1a1a1a]/50">
                  {t("admin_status_final")}
                </p>
              )}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}

function FieldDark({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-white">{value}</p>
    </div>
  );
}
