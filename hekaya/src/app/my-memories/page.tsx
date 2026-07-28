"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, QrCode, Pencil, Eye, Calendar } from "lucide-react";
import { useT } from "@/lib/useT";
import { createClient } from "@/lib/supabase/client";
import { fetchMyMemories, type PublicMemory } from "@/lib/supabase/memories";
import { useProducts } from "@/lib/useProducts";
import { generateQrDataUrl, memoryUrlFor } from "@/lib/qr";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { AuthForm } from "@/components/account/AuthForm";
import { useAuth } from "@/lib/supabase/useAuth";
import { formatDate } from "@/lib/utils";

// Brand gold — matches --color-primary in globals.css
const QR_COLOR = "#C9A96E";

export default function MyMemoriesPage() {
  const { t, locale, tx } = useT();
  const allProducts = useProducts();
  const { user, loading: authLoading } = useAuth();
  const qrColor = QR_COLOR;
  const [memories, setMemories] = useState<PublicMemory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Signed out, RLS returns [] — don't bother asking, and don't let the
    // result be mistaken for "you have no memories" (M18).
    if (authLoading) return;
    if (!user) {
      setMemories([]);
      setLoading(false);
      return;
    }
    let active = true;
    fetchMyMemories(createClient())
      .then((m) => {
        if (active) setMemories(m);
      })
      .catch(() => {
        if (active) setMemories([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const entries = useMemo(
    () =>
      [...memories].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [memories],
  );

  if (authLoading) {
    return (
      <div className="container-h flex min-h-[60vh] items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-primary-dark)] border-t-transparent" />
      </div>
    );
  }

  // Signed out gets the sign-in form, matching account/page.tsx. Previously a
  // signed-out visitor — including someone whose session had simply expired —
  // saw "You haven't created any memories yet", indistinguishable from having
  // none, and could reasonably conclude their keepsakes had been deleted (M18).
  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="container-h py-12 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow align="start">{t("my_memories_eyebrow")}</Eyebrow>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            {t("my_memories_title")}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            {entries.length} {locale === "ar" ? "ذكرى نشطة" : "active memories"}
          </p>
        </div>
        <Link href="/products" className="btn btn-gold">
          <Plus className="h-4 w-4" />
          {t("my_memories_new")}
        </Link>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-primary-dark)] border-t-transparent" />
        </div>
      ) : entries.length === 0 ? (
        <div className="mt-12 rounded-xl bg-white p-12 text-center ring-1 ring-[var(--color-border)]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]">
            <QrCode className="h-7 w-7" />
          </div>
          <p className="mx-auto mt-5 max-w-md text-sm text-[var(--color-ink-muted)]">
            {t("my_memories_empty")}
          </p>
          <Link href="/products" className="btn btn-gold mt-6">
            {t("account_quick_shop")}
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((m, i) => {
            const product = m.productId
              ? allProducts.find((p) => p.id === m.productId)
              : undefined;
            return (
              <MemoryCard
                key={m.token}
                token={m.token}
                memory={m}
                productName={product ? tx(product.name) : undefined}
                qrColor={qrColor}
                index={i}
                locale={locale}
                t={t}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function MemoryCard({
  token,
  memory,
  productName,
  qrColor,
  index,
  locale,
  t,
}: {
  token: string;
  memory: PublicMemory;
  productName?: string;
  qrColor: string;
  index: number;
  locale: "ar" | "en";
  t: ReturnType<typeof useT>["t"];
}) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    generateQrDataUrl(memoryUrlFor(token), 200, { dark: qrColor })
      .then((url) => {
        if (!cancelled) setQrUrl(url);
      })
      .catch(() => {
        /* ignore — placeholder shows */
      });
    return () => {
      cancelled = true;
    };
  }, [token, qrColor]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="overflow-hidden rounded-xl bg-white ring-1 ring-[var(--color-border)] transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 flex-1">
          <span className="badge badge-new">
            {t("my_memories_status_active")}
          </span>
          <h3 className="mt-2 truncate font-display text-lg font-semibold">
            {memory.title}
          </h3>
          {productName && (
            <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
              {t("memory_linked_product")}{" "}
              <span className="font-medium text-[var(--color-ink)]">
                {productName}
              </span>
            </p>
          )}
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--color-ink-faint)]">
            <Calendar className="h-3 w-3" />
            {formatDate(memory.createdAt, locale)}
          </p>
        </div>
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-md bg-white ring-1 ring-[var(--color-border)]">
          {qrUrl ? (
            <Image
              src={qrUrl}
              alt={`QR ${token}`}
              width={80}
              height={80}
              unoptimized
            />
          ) : (
            <QrCode className="h-8 w-8 text-[var(--color-ink-faint)]" />
          )}
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-5 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--color-ink-muted)]">
            {t("memory_pin_label")}:{" "}
            <span className="font-mono tracking-widest text-[var(--color-ink)]">
              ●●●●
            </span>
          </span>
          <span className="font-mono text-[var(--color-ink-faint)]">
            {token}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4 pt-2">
        <Link href={`/memory/${token}`} className="btn btn-outline btn-sm">
          <Eye className="h-3.5 w-3.5" />
          {t("memory_view")}
        </Link>
        <Link href={`/memory/${token}?edit=1`} className="btn btn-gold btn-sm">
          <Pencil className="h-3.5 w-3.5" />
          {t("memory_edit")}
        </Link>
      </div>
    </motion.div>
  );
}
