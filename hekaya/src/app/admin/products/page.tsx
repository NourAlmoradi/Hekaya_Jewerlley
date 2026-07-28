"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Pencil, Trash2, Search, QrCode } from "lucide-react";
import { useT } from "@/lib/useT";
import { useCollections } from "@/lib/useCollections";
import { useCategories } from "@/lib/useCategories";
import { useCatalogStore } from "@/stores/catalog.store";
import { useProducts } from "@/lib/useProducts";
import { createClient } from "@/lib/supabase/client";
import { uploadProductImage, deleteImagesByUrl } from "@/lib/supabase/storage";
import { prepareImage, ImageError } from "@/lib/image";
import {
  PlaceholderJewel,
  kindFromCategory,
} from "@/components/ui/PlaceholderJewel";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatPrice, cn } from "@/lib/utils";
import type { Product } from "@/types";
import { toast } from "sonner";

export default function AdminProducts() {
  const { t, locale } = useT();
  const allCollections = useCollections({ includeInactive: true });
  const categories = useCategories();
  const merged = useProducts();
  const saveProduct = useCatalogStore((s) => s.saveProduct);
  const deleteCatalogProduct = useCatalogStore((s) => s.deleteProduct);
  const setCatalogProductActive = useCatalogStore((s) => s.setProductActive);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  // Images present when the modal opened — used to clean up only the images that
  // were uploaded *this* session if the admin removes them again.
  const [origImages, setOrigImages] = useState<string[]>([]);
  // Product id the delete dialog is asking about (null = closed).
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isNewProduct = (id: string) => !merged.some((p) => p.id === id);

  // Localized category name for the table (falls back to the raw id).
  const categoryName = (id: string) => {
    const c = categories.find((cat) => cat.id === id);
    return c ? (locale === "ar" ? c.name.ar : c.name.en) : id;
  };

  const visible = merged;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter(
      (p) =>
        p.name.en.toLowerCase().includes(q) ||
        p.name.ar.toLowerCase().includes(q) ||
        p.categoryId.toLowerCase().includes(q),
    );
  }, [visible, query]);

  const openNew = () => {
    setEditing({
      id: `p${Date.now()}`,
      slug: "", // derived from the name on save (see productToRow)
      name: { ar: "", en: "" },
      description: { ar: "", en: "" },
      price: 0,
      categoryId: categories[0]?.id ?? "cat-rings",
      collection: allCollections[0]?.id ?? "",
      images: [],
      placeholderTone: "gold",
      isActive: true,
      isQrEligible: true,
      isFeatured: false,
      material: { ar: "", en: "" },
      createdAt: new Date().toISOString(),
    });
    setOrigImages([]);
    setOpen(true);
  };

  const onPickImages = async (files: FileList | null) => {
    if (!editing || !files || files.length === 0) return;
    const slots = Math.max(0, 4 - editing.images.length);
    const picked = Array.from(files).slice(0, slots);
    if (picked.length === 0) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const urls: string[] = [];
      for (const f of picked) {
        try {
          // Validate + downscale to ≤1600px at high quality, then upload the
          // URL (not base64) to the public product-images bucket.
          const blob = await prepareImage(f, { maxDim: 1600, quality: 0.92 });
          urls.push(await uploadProductImage(supabase, blob));
        } catch (e) {
          if (e instanceof ImageError && e.code === "not-image") {
            toast.error(
              locale === "ar" ? "الملف ليس صورة" : "That file isn't an image",
            );
          } else if (e instanceof ImageError && e.code === "too-large") {
            toast.error(
              locale === "ar"
                ? "الصورة كبيرة جدًا (الحد 12 ميغابايت)"
                : "Image too large (12 MB max)",
            );
          } else {
            toast.error(
              locale === "ar" ? "تعذّر رفع الصورة" : "Could not upload image",
            );
          }
        }
      }
      if (urls.length) {
        setEditing((cur) =>
          cur ? { ...cur, images: [...cur.images, ...urls] } : cur,
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => {
    if (!editing) return;
    const url = editing.images[idx];
    // Only delete from the bucket if this image was uploaded in this session
    // (not part of the saved product) — avoids orphaning an in-use file if the
    // admin later cancels the edit.
    if (url && !origImages.includes(url)) {
      void deleteImagesByUrl(createClient(), [url]).catch(() => {});
    }
    setEditing({
      ...editing,
      images: editing.images.filter((_, i) => i !== idx),
    });
  };

  const openEdit = (p: Product) => {
    setEditing({ ...p });
    setOrigImages(p.images ?? []);
    setOpen(true);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name.ar || !editing.name.en || !editing.price) {
      toast.error(locale === "ar" ? "أكمل الحقول" : "Complete required fields");
      return;
    }
    try {
      await saveProduct(editing, isNewProduct(editing.id));
    } catch {
      toast.error(locale === "ar" ? "تعذّر الحفظ" : "Could not save");
      return;
    }
    setOpen(false);
    setEditing(null);
    toast.success(locale === "ar" ? "تم الحفظ" : "Saved");
  };

  // Cancel the modal (X / backdrop / Back), deleting any images uploaded this
  // session that were never saved — the product-images bucket has no orphan
  // sweep, so unsaved uploads would otherwise leak forever (M8).
  const closeModal = () => {
    if (editing) {
      const orphans = editing.images.filter((u) => !origImages.includes(u));
      if (orphans.length)
        void deleteImagesByUrl(createClient(), orphans).catch(() => {});
    }
    setOpen(false);
    setEditing(null);
  };

  // Styled confirm rather than native confirm() — which some corporate browser
  // policies suppress, in which case it returns false and the delete silently
  // does nothing (M14).
  const confirmRemove = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteCatalogProduct(pendingDelete);
      toast.success(locale === "ar" ? "تم الحذف" : "Deleted");
      setPendingDelete(null);
    } catch {
      toast.error(locale === "ar" ? "تعذّر الحذف" : "Could not delete");
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (id: string) => {
    const p = merged.find((x) => x.id === id);
    if (!p) return;
    try {
      await setCatalogProductActive(id, !p.isActive);
    } catch {
      toast.error(locale === "ar" ? "تعذّر التحديث" : "Could not update");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            {locale === "ar" ? "المنتجات" : "Products"}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {visible.length} {t("admin_products_count")}
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-md bg-[#c9a96e] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] shadow-[0_4px_14px_rgba(201,169,110,0.25)] transition hover:bg-[#b8944d]"
        >
          <Plus className="h-4 w-4" />
          {t("add_product")}
        </button>
      </div>

      {/* Search */}
      <div className="mt-6 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("admin_search_products")}
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
                  {t("product_name")}
                </th>
                <th className="px-4 py-4 text-start font-medium">
                  {t("category")}
                </th>
                <th className="px-4 py-4 text-start font-medium">
                  {t("product_price")}
                </th>
                <th className="px-4 py-4 text-start font-medium">QR</th>
                <th className="px-4 py-4 text-start font-medium">
                  {t("status")}
                </th>
                <th className="px-4 py-4 text-end font-medium">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10">
                        {p.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0]}
                            alt={p.name.en || p.name.ar}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <PlaceholderJewel
                            kind={kindFromCategory(p.categoryId)}
                            tone={p.placeholderTone}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">
                          {p.name.en || p.name.ar}
                        </p>
                        <p className="truncate text-xs text-white/40">
                          {p.name.ar}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-white/60">
                    {categoryName(p.categoryId)}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white">
                      {formatPrice(p.price, locale)}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {p.isQrEligible ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#c9a96e]">
                        <QrCode className="h-3.5 w-3.5" />
                        {locale === "ar" ? "نعم" : "Yes"}
                      </span>
                    ) : (
                      <span className="text-xs text-white/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleActive(p.id)}
                      role="switch"
                      aria-checked={p.isActive}
                      className={cn(
                        "relative inline-flex h-5 w-10 items-center rounded-full transition",
                        p.isActive
                          ? "bg-emerald-500/80 ring-1 ring-emerald-400/60"
                          : "bg-white/10 ring-1 ring-white/15",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-3.5 w-3.5 rounded-full bg-white transition",
                          p.isActive ? "translate-x-5" : "translate-x-1",
                          locale === "ar" &&
                            (p.isActive ? "-translate-x-5" : "-translate-x-1"),
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-4 text-end">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="grid h-8 w-8 place-items-center rounded-md text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                        aria-label={t("edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setPendingDelete(p.id)}
                        className="grid h-8 w-8 place-items-center rounded-md text-rose-400 transition hover:bg-rose-500/10"
                        aria-label={t("delete")}
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
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-white/40"
                  >
                    {locale === "ar"
                      ? "لا توجد نتائج."
                      : "No products match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="divide-y divide-white/5 md:hidden">
          {filtered.map((p) => (
            <li key={p.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10">
                  {p.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt={p.name.en || p.name.ar}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PlaceholderJewel
                      kind={kindFromCategory(p.categoryId)}
                      tone={p.placeholderTone}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">
                    {p.name.en || p.name.ar}
                  </p>
                  <p className="truncate text-xs text-white/40">{p.name.ar}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="text-white/60">
                      {categoryName(p.categoryId)}
                    </span>
                    <span className="font-semibold text-white">
                      {formatPrice(p.price, locale)}
                    </span>
                    {p.isQrEligible && (
                      <span className="inline-flex items-center gap-1 text-[#c9a96e]">
                        <QrCode className="h-3 w-3" /> QR
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => toggleActive(p.id)}
                  role="switch"
                  aria-checked={p.isActive}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition",
                    p.isActive
                      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
                      : "bg-white/[0.04] text-white/50 ring-1 ring-white/10",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      p.isActive ? "bg-emerald-300" : "bg-white/40",
                    )}
                  />
                  {p.isActive ? t("active") : t("inactive")}
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(p)}
                    className="grid h-9 w-9 place-items-center rounded-md text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.06]"
                    aria-label={t("edit")}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPendingDelete(p.id)}
                    className="grid h-9 w-9 place-items-center rounded-md text-rose-400 ring-1 ring-rose-400/20 transition hover:bg-rose-500/10"
                    aria-label={t("delete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="p-8 text-center text-sm text-white/40">
              {locale === "ar"
                ? "لا توجد نتائج."
                : "No products match your search."}
            </li>
          )}
        </ul>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-xl border border-white/10 bg-[#141414] text-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
                <h3 className="font-display text-2xl font-semibold">
                  {!isNewProduct(editing.id) ? t("edit") : t("add_product")}
                </h3>
                <button
                  onClick={closeModal}
                  className="grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/[0.06]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
                <FieldDark
                  label={`${t("product_name")} (AR)`}
                  value={editing.name.ar}
                  onChange={(v) =>
                    setEditing({
                      ...editing,
                      name: { ...editing.name, ar: v },
                    })
                  }
                />
                <FieldDark
                  label={`${t("product_name")} (EN)`}
                  value={editing.name.en}
                  onChange={(v) =>
                    setEditing({
                      ...editing,
                      name: { ...editing.name, en: v },
                    })
                  }
                />
                <FieldDark
                  label={`${t("product_price")} (AED)`}
                  type="number"
                  forceLtr
                  value={String(editing.price)}
                  onChange={(v) => setEditing({ ...editing, price: Number(v) })}
                />
                {/* Sale "was" price. Without this field the strikethrough in
                    ProductDetail could never render, so running a sale was
                    impossible (H4). Blank clears it. */}
                <FieldDark
                  label={
                    locale === "ar"
                      ? "السعر قبل الخصم (AED) — اختياري"
                      : "Compare-at price (AED) — optional"
                  }
                  type="number"
                  forceLtr
                  value={
                    editing.compareAtPrice ? String(editing.compareAtPrice) : ""
                  }
                  onChange={(v) =>
                    setEditing({
                      ...editing,
                      compareAtPrice: v.trim() ? Number(v) : undefined,
                    })
                  }
                />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {t("category")}
                  </label>
                  <select
                    value={editing.categoryId}
                    onChange={(e) =>
                      setEditing({ ...editing, categoryId: e.target.value })
                    }
                    className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {locale === "ar" ? c.name.ar : c.name.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar" ? "المجموعة" : "Collection"}
                  </label>
                  <select
                    value={editing.collection}
                    onChange={(e) =>
                      setEditing({ ...editing, collection: e.target.value })
                    }
                    className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
                  >
                    {allCollections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {locale === "ar" ? c.name.ar : c.name.en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Short description — the PDP subtitle AND the <meta
                    description> / OG description for this product's page. With
                    no field to set it, every product page fell back to the
                    generic site description (H4). */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar"
                      ? "وصف مختصر (عربي) — يظهر في نتائج البحث"
                      : "Short description (AR) — used as the search snippet"}
                  </label>
                  <input
                    value={editing.shortDescription?.ar ?? ""}
                    maxLength={160}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        shortDescription: {
                          ar: e.target.value,
                          en: editing.shortDescription?.en ?? "",
                        },
                      })
                    }
                    className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar"
                      ? "وصف مختصر (إنجليزي) — يظهر في نتائج البحث"
                      : "Short description (EN) — used as the search snippet"}
                  </label>
                  <input
                    dir="ltr"
                    maxLength={160}
                    value={editing.shortDescription?.en ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        shortDescription: {
                          ar: editing.shortDescription?.ar ?? "",
                          en: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar" ? "الوصف (عربي)" : "Description (AR)"}
                  </label>
                  <textarea
                    rows={3}
                    value={editing.description?.ar ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        description: {
                          ar: e.target.value,
                          en: editing.description?.en ?? "",
                        },
                      })
                    }
                    className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar" ? "الوصف (إنجليزي)" : "Description (EN)"}
                  </label>
                  <textarea
                    rows={3}
                    dir="ltr"
                    value={editing.description?.en ?? ""}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        description: {
                          ar: editing.description?.ar ?? "",
                          en: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
                  />
                </div>

                {/* Suitable Age Group — free-text bilingual chip on the PDP
                    ("مناسب للفئة العمرية"). Fixed-size store: no size picker. */}
                <FieldDark
                  label={
                    locale === "ar"
                      ? "الفئة العمرية المناسبة (عربي)"
                      : "Suitable Age Group (AR)"
                  }
                  value={editing.ageRange?.ar ?? ""}
                  onChange={(v) =>
                    setEditing({
                      ...editing,
                      ageRange: { ar: v, en: editing.ageRange?.en ?? "" },
                    })
                  }
                />
                <FieldDark
                  label={
                    locale === "ar"
                      ? "الفئة العمرية المناسبة (إنجليزي)"
                      : "Suitable Age Group (EN)"
                  }
                  value={editing.ageRange?.en ?? ""}
                  onChange={(v) =>
                    setEditing({
                      ...editing,
                      ageRange: { ar: editing.ageRange?.ar ?? "", en: v },
                    })
                  }
                />

                {/* Material */}
                <FieldDark
                  label={locale === "ar" ? "الخامة (عربي)" : "Material (AR)"}
                  value={editing.material?.ar ?? ""}
                  onChange={(v) =>
                    setEditing({
                      ...editing,
                      material: {
                        ar: v,
                        en: editing.material?.en ?? "",
                      },
                    })
                  }
                />
                <FieldDark
                  label={locale === "ar" ? "الخامة (إنجليزي)" : "Material (EN)"}
                  value={editing.material?.en ?? ""}
                  onChange={(v) =>
                    setEditing({
                      ...editing,
                      material: {
                        ar: editing.material?.ar ?? "",
                        en: v,
                      },
                    })
                  }
                />

                {/* Includes Memory toggle */}
                <div className="sm:col-span-2">
                  <ToggleDark
                    title={
                      locale === "ar"
                        ? "يتضمن ذاكرة QR"
                        : "Includes QR Memory"
                    }
                    hint={
                      locale === "ar"
                        ? "يسمح للعميل بربط رسالة وصور بالقطعة"
                        : "Lets the customer attach a message & photos to this piece"
                    }
                    checked={editing.isQrEligible}
                    onChange={(v) =>
                      setEditing({ ...editing, isQrEligible: v })
                    }
                  />
                </div>

                {/* Merchandising flags. All three were readable by the
                    storefront but settable nowhere, so the "New" and "Best
                    Seller" badges could never appear and the "Best Sellers"
                    sort was a permanent no-op (H4). */}
                <div className="grid gap-2 sm:col-span-2">
                  <ToggleDark
                    title={
                      locale === "ar" ? "مميّز في الرئيسية" : "Featured on home"
                    }
                    hint={
                      locale === "ar"
                        ? "يظهر في قسم «قطع مختارة» بالصفحة الرئيسية"
                        : "Shows in the Featured Pieces section on the homepage"
                    }
                    checked={editing.isFeatured ?? false}
                    onChange={(v) => setEditing({ ...editing, isFeatured: v })}
                  />
                  <ToggleDark
                    title={locale === "ar" ? "جديد" : "New"}
                    hint={
                      locale === "ar"
                        ? "يعرض شارة «جديد» على صفحة المنتج"
                        : "Shows the New badge on the product page"
                    }
                    checked={editing.isNew ?? false}
                    onChange={(v) => setEditing({ ...editing, isNew: v })}
                  />
                  <ToggleDark
                    title={locale === "ar" ? "الأكثر مبيعًا" : "Best seller"}
                    hint={
                      locale === "ar"
                        ? "يعرض الشارة ويرفع ترتيبه في فرز «الأكثر مبيعًا»"
                        : "Shows the badge and ranks it in the Best Sellers sort"
                    }
                    checked={editing.isBestseller ?? false}
                    onChange={(v) =>
                      setEditing({ ...editing, isBestseller: v })
                    }
                  />
                </div>

                {/* Image upload (1–4) */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar"
                      ? `صور المنتج (${editing.images.length}/4)`
                      : `Product Images (${editing.images.length}/4)`}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {editing.images.map((src, i) => (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-md ring-1 ring-white/10"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute end-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white hover:bg-rose-500/80"
                          aria-label={t("delete")}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    {editing.images.length < 4 && (
                      <label
                        className={cn(
                          "grid aspect-square place-items-center rounded-md border border-dashed border-white/15 bg-[#0a0a0a] text-xs text-white/50 transition hover:border-[#c9a96e]/50 hover:text-white",
                          uploading
                            ? "cursor-wait opacity-60"
                            : "cursor-pointer",
                        )}
                      >
                        <span className="text-center leading-tight">
                          {uploading ? (
                            <span className="mx-auto block h-5 w-5 animate-spin rounded-full border-2 border-[#c9a96e]/30 border-t-[#c9a96e]" />
                          ) : (
                            <Plus className="mx-auto h-5 w-5" />
                          )}
                          <span className="mt-1 block">
                            {uploading
                              ? locale === "ar"
                                ? "جارٍ الرفع…"
                                : "Uploading…"
                              : locale === "ar"
                                ? "إضافة"
                                : "Add"}
                          </span>
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={uploading}
                          className="sr-only"
                          onChange={(e) => {
                            onPickImages(e.target.files);
                            e.currentTarget.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] text-white/40">
                    {locale === "ar"
                      ? "ارفع من صورة واحدة حتى 4 صور."
                      : "Upload 1 to 4 images."}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-white/5 px-6 py-4">
                <button
                  onClick={closeModal}
                  className="rounded-md px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/[0.06]"
                >
                  {t("back")}
                </button>
                <button
                  onClick={save}
                  className="rounded-md bg-[#c9a96e] px-5 py-2 text-sm font-semibold text-[#1a1a1a] hover:bg-[#b8944d]"
                >
                  {locale === "ar" ? "حفظ" : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={pendingDelete !== null}
        busy={deleting}
        title={t("confirm_delete_title")}
        message={
          locale === "ar"
            ? "سيتم حذف المنتج وصوره نهائيًا. لا يمكن التراجع."
            : "This permanently deletes the product and its images. This cannot be undone."
        }
        onConfirm={confirmRemove}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

/** Labelled checkbox row matching the dark admin surface. */
function ToggleDark({
  title,
  hint,
  checked,
  onChange,
}: {
  title: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-white/10 bg-[#0a0a0a] px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        {hint && <p className="mt-0.5 text-xs text-white/50">{hint}</p>}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 accent-[#c9a96e]"
      />
    </label>
  );
}

function FieldDark({
  label,
  value,
  onChange,
  type = "text",
  forceLtr = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  forceLtr?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={forceLtr ? "ltr" : undefined}
        inputMode={type === "number" ? "decimal" : undefined}
        lang={forceLtr ? "en" : undefined}
        className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
      />
    </div>
  );
}

