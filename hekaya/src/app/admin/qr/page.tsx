"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  Eye,
  KeyRound,
  QrCode,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useT } from "@/lib/useT";
import { useOrders } from "@/lib/useOrders";
import { useProducts } from "@/lib/useProducts";
import { createClient } from "@/lib/supabase/client";
import {
  fetchAllMemories,
  adminResetMemoryPin,
  adminDeleteMemory,
  cleanOrphanMemoryPhotos,
  saveMemory as dbSaveMemory,
  type PublicMemory,
} from "@/lib/supabase/memories";
import { generateQrDataUrl, memoryUrlFor } from "@/lib/qr";
import {
  PlaceholderJewel,
  kindFromCategory,
} from "@/components/ui/PlaceholderJewel";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";

type Row = {
  token: string;
  slug: string;
  orderId: string;
  createdAt: string;
  productLabel: string;
  productId?: string;
  categoryId?: string;
  placeholderTone?: string;
  hasMemory: boolean;
  title: string;
  photos: number;
};

export default function AdminQrPage() {
  const { t, locale } = useT();
  const storeOrders = useOrders();
  const products = useProducts();
  const [memories, setMemories] = useState<Record<string, PublicMemory>>({});
  const [query, setQuery] = useState("");
  // The QR image is generated on demand (not for every row) and shown in a
  // modal with a download link. `memoryUrlFor` encodes the production URL.
  const [qrModal, setQrModal] = useState<{
    token: string;
    url: string;
    dataUrl: string;
  } | null>(null);

  const reloadMemories = async () => {
    try {
      const all = await fetchAllMemories(createClient());
      setMemories(
        Object.fromEntries(all.map((m) => [m.token, m])),
      );
    } catch {
      /* ignore — RLS or network */
    }
  };

  useEffect(() => {
    void reloadMemories();
  }, []);

  const handleResetPin = async (token: string) => {
    const newPin = window.prompt(t("admin_qr_reset_pin_prompt"), "");
    if (!newPin) return;
    if (!/^\d{4}$/.test(newPin)) {
      toast.error(locale === "ar" ? "PIN غير صالح" : "Invalid PIN");
      return;
    }
    try {
      // Always go through the dedicated reset RPC: it re-hashes the PIN AND
      // clears the failed-attempt lockout. Branching on the cached `memories`
      // map was unsafe — if it was stale for a memory that actually exists we
      // fell through to save_memory, which NEVER changes the PIN (and blanks the
      // title/message), leaving the recipient locked out on the old PIN.
      try {
        await adminResetMemoryPin(createClient(), token, newPin);
      } catch (err) {
        // Only seed a fresh memory when there is genuinely no row yet for this
        // token (admin bypasses the token check). Re-throw any other failure.
        if (/unknown memory token/i.test((err as Error)?.message ?? "")) {
          await dbSaveMemory(createClient(), {
            token,
            pin: newPin,
            title: "",
            message: "",
            photos: [],
          });
        } else {
          throw err;
        }
      }
      await reloadMemories();
      toast.success(t("admin_qr_reset_pin_done"));
    } catch {
      toast.error(locale === "ar" ? "تعذّر التحديث" : "Could not update");
    }
  };

  const handleShowQr = async (token: string) => {
    try {
      const url = memoryUrlFor(token);
      const dataUrl = await generateQrDataUrl(url, 320);
      setQrModal({ token, url, dataUrl });
    } catch {
      toast.error(
        locale === "ar" ? "تعذّر إنشاء الرمز" : "Could not generate QR",
      );
    }
  };

  const [cleaning, setCleaning] = useState(false);

  const handleCleanOrphans = async () => {
    if (!confirm(t("admin_qr_clean_orphans_confirm"))) return;
    setCleaning(true);
    try {
      const { removed } = await cleanOrphanMemoryPhotos();
      // Reflect any freed counts (an edited memory's dropped file is gone now).
      await reloadMemories();
      if (removed > 0) {
        toast.success(
          locale === "ar"
            ? `تم حذف ${removed} صورة يتيمة`
            : `Removed ${removed} orphan photo${removed === 1 ? "" : "s"}`,
        );
      } else {
        toast.info(t("admin_qr_clean_orphans_none"));
      }
    } catch {
      toast.error(locale === "ar" ? "تعذّر التنظيف" : "Could not clean up");
    } finally {
      setCleaning(false);
    }
  };

  const handleDelete = async (token: string) => {
    if (!memories[token]) {
      toast.info(t("admin_qr_no_memory"));
      return;
    }
    if (!confirm(t("admin_qr_delete_confirm"))) return;
    try {
      await adminDeleteMemory(token);
      await reloadMemories();
      toast.success(locale === "ar" ? "تم الحذف" : "Deleted");
    } catch {
      toast.error(locale === "ar" ? "تعذّر الحذف" : "Could not delete");
    }
  };

  const rows: Row[] = useMemo(() => {
    const allOrders = storeOrders;
    return allOrders.flatMap((o) =>
      o.qrTokens.map((token, i) => {
        const memory = memories[token];
        const productId = o.qrTokenProductIds?.[i] ?? o.items[0]?.productId;
        const product = products.find((p) => p.id === productId);
        const fallbackName =
          o.qrTokenLabels?.[i] ?? o.items[0]?.name?.[locale] ?? "—";
        return {
          token,
          slug: token,
          orderId: o.id,
          createdAt: o.createdAt,
          productLabel: product?.name?.[locale] ?? fallbackName,
          productId,
          categoryId: product?.categoryId,
          placeholderTone: product?.placeholderTone,
          hasMemory: !!memory,
          title: memory?.title || t("admin_qr_no_title"),
          photos: memory?.photos?.length ?? 0,
        };
      }),
    );
  }, [storeOrders, memories, locale, t, products]);

  const totalGenerated = rows.length;
  const setUp = rows.filter((r) => r.hasMemory).length;
  const pending = totalGenerated - setUp;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q) ||
        r.productLabel.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const stats = [
    { label: t("admin_qr_total_generated"), value: totalGenerated },
    { label: t("admin_qr_set_up"), value: setUp },
    { label: t("admin_qr_pending_setup"), value: pending },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            {t("admin_qr_codes")}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {totalGenerated} {t("admin_qr_pages_generated")}
          </p>
        </div>
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => void handleCleanOrphans()}
            disabled={cleaning}
            className="inline-flex items-center gap-2 rounded-md bg-white/5 px-3 py-2 text-sm font-medium text-white/70 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-[#c9a96e] disabled:cursor-wait disabled:opacity-60"
            title={t("admin_qr_clean_orphans")}
          >
            {cleaning ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-[#c9a96e]" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {t("admin_qr_clean_orphans")}
          </button>
          <div className="inline-flex items-center gap-2 rounded-md bg-[#1a1508] px-3 py-2 text-sm font-medium text-[#c9a96e] ring-1 ring-[#c9a96e]/20">
            <QrCode className="h-4 w-4" />
            {setUp} {t("admin_qr_active").toLowerCase()}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-white/5 bg-[#141414] p-5"
          >
            <p className="font-display text-3xl font-semibold text-white">
              {s.value}
            </p>
            <p className="mt-2 text-sm text-white/50">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mt-6 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("admin_qr_search")}
            className="w-full rounded-md border border-white/10 bg-[#141414] py-3 ps-10 pe-3 text-sm text-white placeholder:text-white/40 focus:border-[#c9a96e]/40 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-white/5 bg-[#141414]">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-4 py-4 text-start font-medium">
                  {t("admin_qr_memory")}
                </th>
                <th className="px-4 py-4 text-start font-medium">
                  {t("admin_qr_slug")}
                </th>
                <th className="px-4 py-4 text-start font-medium">
                  {locale === "ar" ? "المنتج" : "Product"}
                </th>
                <th className="px-4 py-4 text-start font-medium">
                  {t("admin_qr_photos")}
                </th>
                <th className="px-4 py-4 text-start font-medium">
                  {t("status")}
                </th>
                <th className="px-4 py-4 text-start font-medium">
                  {t("admin_qr_created")}
                </th>
                <th className="px-4 py-4 text-end font-medium">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((r) => (
                <tr key={r.token} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10">
                        <PlaceholderJewel
                          kind={kindFromCategory(r.categoryId ?? "")}
                          tone={r.placeholderTone}
                        />
                      </div>
                      <p className="truncate font-semibold text-[#c9a96e]">
                        {r.title}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-[#c9a96e]/80">
                    {r.slug}
                  </td>
                  <td className="px-4 py-4 text-white/70">{r.productLabel}</td>
                  <td className="px-4 py-4 text-white/80">{r.photos}</td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
                        r.hasMemory
                          ? "bg-emerald-300/15 text-emerald-300 ring-emerald-300/30"
                          : "bg-amber-200/15 text-amber-300 ring-amber-300/30",
                      )}
                    >
                      {r.hasMemory
                        ? t("admin_qr_active")
                        : t("admin_qr_pending")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-white/60">
                    {formatDate(r.createdAt, locale)}
                  </td>
                  <td className="px-4 py-4 text-end">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => void handleShowQr(r.token)}
                        className="grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/[0.06] hover:text-[#c9a96e]"
                        aria-label={t("admin_qr_codes")}
                        title={t("admin_qr_codes")}
                      >
                        <QrCode className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/memory/${r.token}`}
                        target="_blank"
                        className="grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/[0.06] hover:text-[#c9a96e]"
                        aria-label={t("view")}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => void handleResetPin(r.token)}
                        className="grid h-8 w-8 place-items-center rounded-md text-amber-300 hover:bg-amber-500/10"
                        aria-label={t("admin_qr_reset_pin")}
                        title={t("admin_qr_reset_pin")}
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => void handleDelete(r.token)}
                        className="grid h-8 w-8 place-items-center rounded-md text-rose-400 hover:bg-rose-500/10"
                        aria-label={t("admin_qr_delete_memory")}
                        title={t("admin_qr_delete_memory")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-white/40"
                  >
                    {locale === "ar"
                      ? "لا توجد رموز QR بعد. أنشئ طلبًا تجريبيًا لإصدار الرموز."
                      : "No QR codes yet. Place a demo order to generate them."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="divide-y divide-white/5 md:hidden">
          {filtered.map((r) => (
            <li key={r.token} className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10">
                  <PlaceholderJewel
                    kind={kindFromCategory(r.categoryId ?? "")}
                    tone={r.placeholderTone}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#c9a96e]">
                    {r.title}
                  </p>
                  <p className="truncate font-mono text-[11px] text-[#c9a96e]/70">
                    {r.slug}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-white/60">
                    {r.productLabel}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1",
                    r.hasMemory
                      ? "bg-emerald-300/15 text-emerald-300 ring-emerald-300/30"
                      : "bg-amber-200/15 text-amber-300 ring-amber-300/30",
                  )}
                >
                  {r.hasMemory ? t("admin_qr_active") : t("admin_qr_pending")}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-white/50">
                  {r.photos} {t("admin_qr_photos").toLowerCase()} ·{" "}
                  {formatDate(r.createdAt, locale)}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => void handleShowQr(r.token)}
                    className="grid h-9 w-9 place-items-center rounded-md text-white/80 ring-1 ring-white/10 hover:bg-white/[0.06] hover:text-[#c9a96e]"
                    aria-label={t("admin_qr_codes")}
                  >
                    <QrCode className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/memory/${r.token}`}
                    target="_blank"
                    className="grid h-9 w-9 place-items-center rounded-md text-white/80 ring-1 ring-white/10 hover:bg-white/[0.06] hover:text-[#c9a96e]"
                    aria-label={t("view")}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => void handleResetPin(r.token)}
                    className="grid h-9 w-9 place-items-center rounded-md text-amber-300 ring-1 ring-amber-400/20 hover:bg-amber-500/10"
                    aria-label={t("admin_qr_reset_pin")}
                  >
                    <KeyRound className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => void handleDelete(r.token)}
                    className="grid h-9 w-9 place-items-center rounded-md text-rose-400 ring-1 ring-rose-400/20 hover:bg-rose-500/10"
                    aria-label={t("admin_qr_delete_memory")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-8 text-center text-sm text-white/40">
              {locale === "ar" ? "لا توجد رموز QR بعد." : "No QR codes yet."}
            </li>
          )}
        </ul>
      </div>

      {/* QR preview + download modal */}
      {qrModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
          onClick={() => setQrModal(null)}
        >
          <div
            className="relative w-full max-w-xs rounded-2xl bg-[#141414] p-6 text-center ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQrModal(null)}
              className="absolute end-3 top-3 grid h-8 w-8 place-items-center rounded-md text-white/60 hover:bg-white/[0.06] hover:text-white"
              aria-label={t("back")}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto inline-block rounded-lg bg-white p-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URL generated client-side; next/image cannot optimize it */}
              <img src={qrModal.dataUrl} alt="QR" className="h-52 w-52" />
            </div>
            <p className="mt-4 break-all font-mono text-[11px] text-[#c9a96e]/80">
              {qrModal.url}
            </p>
            <a
              href={qrModal.dataUrl}
              download={`hekaya-qr-${qrModal.token}.png`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#c9a96e] px-4 py-2.5 text-sm font-semibold text-[#1a1508] transition hover:bg-[#d8bd8a]"
            >
              <Download className="h-4 w-4" />
              {locale === "ar" ? "تحميل PNG" : "Download PNG"}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
