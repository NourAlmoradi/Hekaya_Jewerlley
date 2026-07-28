"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/useT";
import {
  useCartStore,
  useCartSubtotal,
  useCartCount,
} from "@/stores/cart.store";
import { useAuth } from "@/lib/supabase/useAuth";
import { formatPrice } from "@/lib/utils";
import {
  PlaceholderJewel,
  kindFromCategory,
} from "@/components/ui/PlaceholderJewel";
import { useProducts } from "@/lib/useProducts";

export function CartDrawer() {
  const { t, tx, locale, dir } = useT();
  const router = useRouter();
  const { user } = useAuth();
  const products = useProducts();
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const setOpen = useCartStore((s) => s.setOpen);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const fromSide = dir === "rtl" ? "-100%" : "100%";

  // Gate checkout behind auth: ask the customer to sign in / sign up the moment
  // they press "إتمام الشراء", rather than letting them fill the whole checkout
  // form and hit the wall at the final step.
  const goToCheckout = () => {
    setOpen(false);
    if (!user) {
      toast.error(
        locale === "ar"
          ? "يرجى تسجيل الدخول أو إنشاء حساب لإتمام الشراء"
          : "Please sign in or create an account to checkout",
      );
      router.push("/account?redirect=/checkout");
      return;
    }
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: fromSide }}
            animate={{ x: 0 }}
            exit={{ x: fromSide }}
            transition={{
              type: "tween",
              duration: 0.32,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="fixed inset-y-0 z-[61] flex w-full max-w-md flex-col bg-[var(--color-bg)] shadow-2xl"
            style={dir === "rtl" ? { left: 0 } : { right: 0 }}
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-5">
              <h3 className="font-display text-2xl font-semibold">
                {t("cart_title")}
                {/* Sum of quantities, matching the header badge. This rendered
                    items.length, so three of one bracelet showed "3" in the
                    header and "(1)" here (M17). */}
                <span className="ms-2 text-base text-[var(--color-ink-faint)]">
                  ({count})
                </span>
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 transition hover:bg-[var(--color-bg-secondary)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]">
                  <ShoppingBag className="h-8 w-8 text-[var(--color-primary)]" />
                </div>
                <h4 className="font-display text-xl font-semibold">
                  {t("cart_empty")}
                </h4>
                <p className="mt-2 max-w-xs text-sm text-[var(--color-ink-muted)]">
                  {t("cart_empty_d")}
                </p>
                <Link
                  href="/products"
                  onClick={() => setOpen(false)}
                  className="btn btn-gold btn-lg mt-6"
                >
                  {t("cart_continue")}
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto px-6 py-4">
                  {items.map((item) => {
                    const product = products.find(
                      (p) => p.id === item.productId,
                    );
                    return (
                      <li
                        key={`${item.productId}-${item.variationId ?? ""}`}
                        className="flex gap-4 border-b border-[var(--color-border)] py-4"
                      >
                        <div className="h-24 w-24 shrink-0 overflow-hidden rounded">
                          {product?.images?.[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.images[0]}
                              alt={tx(item.name)}
                              className="h-full w-full object-cover"
                            />
                          ) : product ? (
                            <PlaceholderJewel
                              kind={kindFromCategory(product.categoryId)}
                              tone={product.placeholderTone}
                            />
                          ) : (
                            <div className="placeholder-img h-full w-full" />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/product/${item.slug}`}
                              onClick={() => setOpen(false)}
                              className="line-clamp-2 text-sm font-medium hover:text-[var(--color-primary-dark)]"
                            >
                              {tx(item.name)}
                            </Link>
                            <button
                              onClick={() =>
                                removeItem(item.productId, item.variationId)
                              }
                              aria-label={t("remove")}
                              className="text-[var(--color-ink-faint)] transition hover:text-[var(--color-error)]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {item.variationLabel && (
                            <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                              {tx(item.variationLabel)}
                            </p>
                          )}
                          <div className="mt-auto flex items-end justify-between pt-2">
                            <div className="inline-flex items-center rounded border border-[var(--color-border)]">
                              {/* Disabled at 1: updateQty clamps with
                                  Math.max(1, qty), so this used to look
                                  active while doing nothing (M17). */}
                              <button
                                disabled={item.qty <= 1}
                                onClick={() =>
                                  updateQty(
                                    item.productId,
                                    item.qty - 1,
                                    item.variationId,
                                  )
                                }
                                className="grid h-8 w-8 place-items-center transition hover:bg-[var(--color-bg-secondary)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                                aria-label={t("decrease_qty")}
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.qty}
                              </span>
                              <button
                                onClick={() =>
                                  updateQty(
                                    item.productId,
                                    item.qty + 1,
                                    item.variationId,
                                  )
                                }
                                className="grid h-8 w-8 place-items-center transition hover:bg-[var(--color-bg-secondary)]"
                                aria-label={t("increase_qty")}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <p className="font-display text-base font-semibold text-[var(--color-primary-dark)]">
                              {formatPrice(item.price * item.qty, locale)}
                            </p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="border-t border-[var(--color-border)] bg-white px-6 py-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-ink-muted)]">
                      {t("cart_subtotal")}
                    </span>
                    <span className="font-display text-xl font-semibold">
                      {formatPrice(subtotal, locale)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
                    {t("cart_shipping_calc")}
                  </p>
                  <button
                    type="button"
                    onClick={goToCheckout}
                    className="btn btn-gold btn-lg mt-4 w-full"
                  >
                    {t("cart_checkout")} →
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="btn btn-ghost mt-2 w-full text-sm"
                  >
                    {t("cart_continue")}
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
