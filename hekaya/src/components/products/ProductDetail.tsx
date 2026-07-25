"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  QrCode,
} from "lucide-react";
import type { Product } from "@/types";
import { useT } from "@/lib/useT";
import { formatPrice, cn } from "@/lib/utils";
import {
  PlaceholderJewel,
  kindFromCategory,
} from "@/components/ui/PlaceholderJewel";
import { useCartStore } from "@/stores/cart.store";
import { useWishlistToggle } from "@/lib/useWishlistToggle";
import { toast } from "sonner";
import { useCategory } from "@/lib/useCategories";
import { useProducts } from "@/lib/useProducts";
import { ProductCard } from "./ProductCard";

export function ProductDetail({ product }: { product: Product }) {
  const { t, tx, locale } = useT();
  const { addItem, setOpen } = useCartStore();
  const { inWishlist, toggle: toggleWishlist } = useWishlistToggle(product.id);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<"description" | "shipping" | "care">(
    "description",
  );
  const category = useCategory(product.categoryId);
  const allProducts = useProducts();
  const materialLabel = product.material
    ? tx(product.material)
    : t("pdp_material_default");

  // Fixed-size store: no variation picker, price is always the product's price.
  const price = product.price;

  const handleAdd = (openCart = false) => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price,
      qty,
    });
    toast.success(`${tx(product.name)} — ${t("added_to_cart")}`);
    if (openCart) setOpen(true);
  };

  const related = allProducts
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId)
    .slice(0, 4);

  return (
    <div className="container-h py-10 lg:py-14">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-xs text-[var(--color-ink-muted)]">
        <Link href="/" className="hover:text-[var(--color-primary-dark)]">
          {t("nav_home")}
        </Link>
        <span>/</span>
        <Link
          href="/products"
          className="hover:text-[var(--color-primary-dark)]"
        >
          {t("nav_shop")}
        </Link>
        <span>/</span>
        <span className="text-[var(--color-ink)]">{tx(product.name)}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div>
          <motion.div
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="aspect-square overflow-hidden rounded-lg ring-1 ring-[var(--color-border)]"
          >
            {product.images?.[activeImage] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[activeImage]}
                alt={tx(product.name)}
                className="h-full w-full object-cover"
              />
            ) : (
              <PlaceholderJewel
                kind={kindFromCategory(product.categoryId)}
                tone={product.placeholderTone}
              />
            )}
          </motion.div>
          {product.images && product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {product.images.slice(0, 4).map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "aspect-square overflow-hidden rounded ring-1 transition",
                    activeImage === i
                      ? "ring-2 ring-[var(--color-primary)]"
                      : "ring-[var(--color-border)] hover:ring-[var(--color-primary)]",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${tx(product.name)} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.isNew && (
              <span className="badge badge-new">
                {locale === "ar" ? "جديد" : "New"}
              </span>
            )}
            {product.isBestseller && (
              <span className="badge badge-soft">
                {locale === "ar" ? "الأكثر مبيعًا" : "Bestseller"}
              </span>
            )}
            {product.isQrEligible && (
              <span className="badge badge-gold inline-flex items-center gap-1">
                <QrCode className="h-3 w-3" /> {t("qr_eligible")}
              </span>
            )}
          </div>

          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
            {tx(product.name)}
          </h1>
          {category && (
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-primary-dark)]">
              {tx(category.name)}
            </p>
          )}
          <p className="mt-3 text-[var(--color-ink-muted)]">
            {tx(product.shortDescription ?? { ar: "", en: "" })}
          </p>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold text-[var(--color-primary-dark)]">
              {formatPrice(price, locale)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-[var(--color-ink-faint)] line-through">
                {formatPrice(product.compareAtPrice, locale)}
              </span>
            )}
          </div>

          {/* Age + Material chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {product.ageRange && tx(product.ageRange) && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-xs font-medium text-[var(--color-primary-dark)]">
                <span className="text-[10px] uppercase tracking-wider opacity-70">
                  {t("pdp_age")}
                </span>
                <span>·</span>
                <span>{tx(product.ageRange)}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg-secondary)] px-3 py-1 text-xs font-medium text-[var(--color-ink)] ring-1 ring-[var(--color-border)]">
              <span className="text-[10px] uppercase tracking-wider opacity-70">
                {t("pdp_material")}
              </span>
              <span>·</span>
              <span>{materialLabel}</span>
            </span>
          </div>

          <div className="my-6 h-px bg-[var(--color-border)]" />

          {/* Quantity */}
          <div className="mb-6">
            <p className="label">{t("quantity")}</p>
            <div className="inline-flex items-center rounded border border-[var(--color-border)] bg-white">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="grid h-11 w-11 place-items-center transition hover:bg-[var(--color-bg-secondary)]"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-semibold">
                {qty}
              </span>
              <button
                onClick={() => setQty(qty + 1)}
                className="grid h-11 w-11 place-items-center transition hover:bg-[var(--color-bg-secondary)]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleAdd(false)}
              className="btn btn-outline btn-lg flex-1"
            >
              <ShoppingBag className="h-4 w-4" />
              {t("add_to_cart")}
            </button>
            <button
              onClick={() => handleAdd(true)}
              className="btn btn-gold btn-lg flex-1"
            >
              {t("buy_now")}
            </button>
            <button
              onClick={() => {
                toggleWishlist();
              }}
              className={cn(
                "btn btn-lg !px-4",
                inWishlist ? "btn-gold" : "btn-outline",
              )}
              aria-label={t("my_wishlist")}
              aria-pressed={inWishlist}
            >
              <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
            </button>
          </div>

          {/* QR Memory callout */}
          {product.isQrEligible && (
            <div className="mt-6 rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--color-ink)] text-white">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">
                    {t("qr_section_title")}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                    {t("qr_section_desc")}
                  </p>
                  <Link
                    href="/qr"
                    className="mt-2 inline-block text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-dark)] underline-offset-4 hover:underline"
                  >
                    {t("qr_section_cta")} →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Tabs: Description / Shipping / Care */}
          <div className="mt-8">
            <div
              role="tablist"
              className="flex gap-6 border-b border-[var(--color-border)]"
            >
              {(
                [
                  { id: "description", label: t("pdp_tab_description") },
                  { id: "shipping", label: t("pdp_tab_shipping") },
                  { id: "care", label: t("pdp_tab_care") },
                ] as const
              ).map((it) => {
                const active = tab === it.id;
                return (
                  <button
                    key={it.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(it.id)}
                    className={cn(
                      "relative pb-3 text-sm font-semibold transition",
                      active
                        ? "text-[var(--color-ink)]"
                        : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]",
                    )}
                  >
                    {it.label}
                    {active && (
                      <span className="absolute -bottom-px left-0 h-0.5 w-full bg-[var(--color-primary)]" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="pt-5 leading-relaxed text-[var(--color-ink-muted)]">
              {tab === "description" && (
                <p>{tx(product.description ?? { ar: "", en: "" })}</p>
              )}
              {tab === "shipping" && <p>{t("pdp_shipping_copy")}</p>}
              {tab === "care" && <p>{t("pdp_care_copy")}</p>}
            </div>
          </div>

          {/* Trust strip */}
          <ul className="mt-6 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <li className="flex items-center gap-2 text-[var(--color-ink-muted)]">
              <ShieldCheck className="h-4 w-4 text-[var(--color-primary)]" />
              {t("trust_quality")}
            </li>
            <li className="flex items-center gap-2 text-[var(--color-ink-muted)]">
              <QrCode className="h-4 w-4 text-[var(--color-primary)]" />
              {t("trust_qr")}
            </li>
          </ul>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="mb-8 text-center font-display text-3xl font-semibold sm:text-4xl">
            {t("related")}
          </h2>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
