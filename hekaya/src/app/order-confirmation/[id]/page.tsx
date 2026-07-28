"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, Download, QrCode, Package } from "lucide-react";
import { useT } from "@/lib/useT";
import { createClient } from "@/lib/supabase/client";
import { fetchOrderById } from "@/lib/supabase/orders";
import { formatPrice } from "@/lib/utils";
import { generateQrDataUrl, memoryUrlFor } from "@/lib/qr";
import { toast } from "sonner";
import {
  PlaceholderJewel,
  kindFromCategory,
} from "@/components/ui/PlaceholderJewel";
import { useProducts } from "@/lib/useProducts";
import type { Order } from "@/types";

export default function OrderConfirmation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t, locale } = useT();
  const allProducts = useProducts();
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [qrImages, setQrImages] = useState<
    {
      token: string;
      label: string;
      productId: string;
      url: string;
      dataUrl: string;
    }[]
  >([]);

  useEffect(() => {
    let active = true;
    fetchOrderById(createClient(), id)
      .then((o) => {
        if (active) setOrder(o);
      })
      .catch(() => {
        if (active) setOrder(null);
      })
      .finally(() => {
        if (active) setLoadingOrder(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!order) return;
    Promise.all(
      order.qrTokens.map(async (token, idx) => {
        const url = memoryUrlFor(token);
        const dataUrl = await generateQrDataUrl(url, 320);
        const label = order.qrTokenLabels?.[idx] ?? `QR ${idx + 1}`;
        const productId = order.qrTokenProductIds?.[idx] ?? "all";
        return { token, label, productId, url, dataUrl };
      }),
    ).then(setQrImages);
  }, [order]);

  if (loadingOrder) {
    return (
      <div className="container-h flex min-h-[60vh] items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-primary-dark)] border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-h py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Order not found</h1>
        <Link href="/" className="btn btn-gold btn-lg mt-6">
          {t("back_home")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] py-12 lg:py-20">
      <div className="container-h">
        {/* Hero / success */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full border-2 border-[#5e7c5e] bg-[#e6ece4] text-[#3d5a3d]">
            <CheckCircle2 className="h-10 w-10" strokeWidth={2} />
          </div>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c9a96e]">
            {t("order_confirmed")}
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold text-[#1a1a1a] sm:text-6xl">
            {locale === "ar" ? "شكراً لكم!" : "Thank You!"}
          </h1>
          <p className="mt-4 text-base text-[var(--color-ink-muted)]">
            {locale === "ar"
              ? "تم استلام طلبك بنجاح."
              : "Your order has been placed successfully."}
          </p>

          {/* Order number pill */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-[var(--color-bg-secondary)] px-5 py-2.5">
            <span className="text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">
              {t("order_number")}
            </span>
            <span className="font-mono text-sm font-bold">{order.id}</span>
            {/* navigator.clipboard is undefined on non-HTTPS origins and
                rejects when permission is denied, so the success toast used to
                be able to lie. Only claim success once the write resolves (L13). */}
            <button
              onClick={async () => {
                try {
                  if (!navigator.clipboard) throw new Error("unavailable");
                  await navigator.clipboard.writeText(order.id);
                  toast.success(t("copied"));
                } catch {
                  toast.error(t("copy_failed"));
                }
              }}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-primary)]"
              aria-label={t("copy")}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>

        {/* QR cards */}
        {qrImages.length > 0 && (
          <div className="mx-auto mt-12 max-w-3xl space-y-6">
            {qrImages.map((q, idx) => {
              const product =
                q.productId !== "all"
                  ? allProducts.find((p) => p.id === q.productId)
                  : null;
              const jewel = product
                ? kindFromCategory(product.categoryId)
                : "gem";
              return (
                <motion.div
                  key={q.token}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="overflow-hidden rounded-2xl bg-[#f3ede1] ring-1 ring-[#e8dcc4]"
                >
                  {/* Item header — product image + name */}
                  <div className="flex items-center gap-4 border-b border-[#e8dcc4] bg-white px-6 py-4">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f5f0ea] ring-1 ring-[#e8dcc4]">
                      {product?.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt={product.name[locale]}
                          className="h-full w-full object-cover"
                        />
                      ) : product ? (
                        <PlaceholderJewel
                          kind={jewel}
                          tone={product.placeholderTone ?? "#c9a96e"}
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center">
                          <Package className="h-6 w-6 text-[#c9a96e]" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-[#1a1a1a]">
                        {q.label}
                      </p>
                      {product && (
                        <p className="mt-0.5 text-xs text-gray-400">
                          {product.name[locale]}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 rounded-full bg-[#f3ede1] px-3 py-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b8955a]">
                        {locale === "ar" ? "ذاكرة QR" : "QR Memory"}
                      </span>
                    </div>
                  </div>

                  {/* QR content */}
                  <div className="px-6 py-8 text-center sm:px-12">
                    <div className="mb-2 inline-flex items-center justify-center gap-2">
                      <QrCode
                        className="h-5 w-5 text-[#c9a96e]"
                        strokeWidth={1.5}
                      />
                      <h2 className="font-display text-xl font-semibold text-[#1a1a1a] sm:text-2xl">
                        {locale === "ar"
                          ? "رمز ذاكرتك QR"
                          : "Your QR Memory Code"}
                      </h2>
                    </div>
                    <p className="mx-auto max-w-md text-sm leading-relaxed text-[var(--color-ink-muted)]">
                      {locale === "ar"
                        ? "امسح هذا الرمز بهاتفك لإعداد صفحة الذاكرة لهذه القطعة."
                        : "Scan this QR code to set up the memory page for this piece."}
                    </p>

                    {/* QR image */}
                    <div className="mx-auto mt-6 inline-block rounded-lg bg-white p-5 ring-1 ring-[#e8dcc4]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- data URL generated client-side; next/image cannot optimize it */}
                      <img src={q.dataUrl} alt="QR" className="h-52 w-52" />
                    </div>

                    <p className="mt-3 font-mono text-xs uppercase tracking-wider text-[var(--color-ink-muted)]">
                      {q.token}
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <Link
                        href={`/memory/${q.token}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#b8955a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a07840]"
                      >
                        {locale === "ar" ? "افتح الذاكرة" : "Open Memory Page"}
                      </Link>
                      <a
                        href={q.dataUrl}
                        download={`mashaer-qr-${q.token}.png`}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        <Download className="h-4 w-4" />
                        {locale === "ar" ? "تحميل" : "Download"}
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <p className="mt-10 text-center text-sm text-[var(--color-ink-muted)]">
          {t("cart_total")}:{" "}
          <span className="font-display text-base font-semibold text-[var(--color-primary-dark)]">
            {formatPrice(order.total, locale)}
          </span>
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            {t("back_home")}
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center justify-center rounded-xl bg-[#b8955a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a07840]"
          >
            {t("my_orders")} →
          </Link>
        </div>
      </div>
    </div>
  );
}
