"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Search,
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/useT";
import { useCatalogStore } from "@/stores/catalog.store";
import { useCollections } from "@/lib/useCollections";
import { useProducts } from "@/lib/useProducts";
import { PlaceholderJewel } from "@/components/ui/PlaceholderJewel";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { prepareImage, ImageError } from "@/lib/image";
import {
  uploadCollectionImage,
  deleteImagesByUrl,
} from "@/lib/supabase/storage";
import type { Collection } from "@/types";

const DEFAULT_TONE = "#e8dfcc";

export default function AdminCollections() {
  const { t, locale } = useT();
  const collections = useCollections({ includeInactive: true });
  const allProducts = useProducts();
  const saveCollection = useCatalogStore((s) => s.saveCollection);
  const deleteCatalogProduct = useCatalogStore((s) => s.deleteProduct);
  const deleteCatalogCollection = useCatalogStore((s) => s.deleteCollection);

  const [editing, setEditing] = useState<Collection | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // The image saved when the modal opened — used to avoid orphaning storage
  // objects when the admin replaces/removes an image or cancels the modal.
  const [origImage, setOrigImage] = useState<string | undefined>(undefined);
  const [imgBusy, setImgBusy] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const sorted = useMemo(
    () => [...collections].sort((a, b) => a.sortOrder - b.sortOrder),
    [collections],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (c) =>
        c.name.en.toLowerCase().includes(q) ||
        c.name.ar.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q),
    );
  }, [sorted, query]);

  const productCount = (id: string) =>
    allProducts.filter((p) => p.collection === id).length;

  const openNew = () => {
    setEditing({
      id: "",
      name: { ar: "", en: "" },
      description: { ar: "", en: "" },
      tone: DEFAULT_TONE,
      isActive: true,
      sortOrder: collections.length,
      createdAt: new Date().toISOString(),
    });
    setOrigImage(undefined);
    setOpen(true);
  };

  const openEdit = (c: Collection) => {
    setEditing({ ...c });
    setOrigImage(c.image);
    setOpen(true);
  };

  const isExisting = editing
    ? collections.some((c) => c.id === editing.id)
    : false;

  // Validate + downscale, upload to Storage, store the public URL (not base64).
  const onPickImage = async (file: File | undefined) => {
    if (!file || !editing) return;
    setImgBusy(true);
    try {
      const blob = await prepareImage(file, { maxDim: 1600, quality: 0.9 });
      const url = await uploadCollectionImage(createClient(), blob);
      // If we're replacing an unsaved upload, delete the previous one.
      const prev = editing.image;
      if (prev && prev !== origImage) {
        void deleteImagesByUrl(createClient(), [prev]).catch(() => {});
      }
      setEditing((cur) => (cur ? { ...cur, image: url } : cur));
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
    } finally {
      setImgBusy(false);
    }
  };

  const clearImage = () => {
    if (!editing) return;
    const prev = editing.image;
    if (prev && prev !== origImage) {
      void deleteImagesByUrl(createClient(), [prev]).catch(() => {});
    }
    setEditing({ ...editing, image: undefined });
  };

  // Cancel the modal, deleting any freshly-uploaded (unsaved) image so it isn't
  // orphaned in Storage (the product-images bucket has no sweep).
  const closeModal = () => {
    if (editing?.image && editing.image !== origImage) {
      void deleteImagesByUrl(createClient(), [editing.image]).catch(() => {});
    }
    setOpen(false);
    setEditing(null);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name.ar || !editing.name.en) {
      toast.error(locale === "ar" ? "أكمل الاسم" : "Name is required");
      return;
    }
    try {
      await saveCollection(editing, !isExisting);
    } catch {
      toast.error(locale === "ar" ? "تعذّر الحفظ" : "Could not save");
      return;
    }
    // A replaced saved image is now unreferenced — remove it from Storage.
    if (origImage && origImage !== editing.image) {
      void deleteImagesByUrl(createClient(), [origImage]).catch(() => {});
    }
    setOpen(false);
    setEditing(null);
    toast.success(locale === "ar" ? "تم الحفظ" : "Saved");
  };

  // One-time migration: move any legacy base64 collection images to Storage.
  const base64Count = collections.filter((c) =>
    c.image?.startsWith("data:"),
  ).length;

  const migrateBase64Images = async () => {
    const targets = collections.filter((c) => c.image?.startsWith("data:"));
    if (targets.length === 0) return;
    if (
      !confirm(
        locale === "ar"
          ? `ترحيل ${targets.length} صورة إلى التخزين؟`
          : `Migrate ${targets.length} base64 image(s) to Storage?`,
      )
    )
      return;
    setMigrating(true);
    const supabase = createClient();
    let ok = 0;
    for (const c of targets) {
      try {
        const raw = await (await fetch(c.image!)).blob();
        const file = new File([raw], "collection", {
          type: raw.type || "image/jpeg",
        });
        const blob = await prepareImage(file, { maxDim: 1600, quality: 0.9 });
        const url = await uploadCollectionImage(supabase, blob);
        await saveCollection({ ...c, image: url }, false);
        ok++;
      } catch {
        // Skip this row; keep migrating the rest.
      }
    }
    setMigrating(false);
    toast.success(
      locale === "ar" ? `تم ترحيل ${ok} صورة` : `Migrated ${ok} image(s)`,
    );
  };

  const remove = async (c: Collection) => {
    const linkedIds = allProducts
      .filter((p) => p.collection === c.id)
      .map((p) => p.id);
    const count = linkedIds.length;
    const msg =
      count > 0
        ? locale === "ar"
          ? `سيتم حذف المجموعة و‏${count} منتج مرتبط بها. هل أنت متأكد؟`
          : `This will also delete ${count} linked product${count > 1 ? "s" : ""}. Continue?`
        : locale === "ar"
          ? "هل أنت متأكد من الحذف؟"
          : "Are you sure you want to delete?";
    if (!confirm(msg)) return;
    try {
      for (const id of linkedIds) await deleteCatalogProduct(id);
      await deleteCatalogCollection(c.id);
    } catch {
      toast.error(locale === "ar" ? "تعذّر الحذف" : "Could not delete");
      return;
    }
    toast.success(
      count > 0
        ? locale === "ar"
          ? `تم حذف المجموعة و‏${count} منتج`
          : `Deleted collection and ${count} product${count > 1 ? "s" : ""}`
        : locale === "ar"
          ? "تم الحذف"
          : "Deleted",
    );
  };

  const move = async (id: string, dir: -1 | 1) => {
    const i = sorted.findIndex((c) => c.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= sorted.length) return;
    const a = sorted[i];
    const b = sorted[j];
    try {
      await saveCollection({ ...a, sortOrder: b.sortOrder }, false);
      await saveCollection({ ...b, sortOrder: a.sortOrder }, false);
    } catch {
      toast.error(locale === "ar" ? "تعذّر التحديث" : "Could not update");
    }
  };

  const toggleActive = async (c: Collection) => {
    try {
      await saveCollection({ ...c, isActive: !c.isActive }, false);
    } catch {
      toast.error(locale === "ar" ? "تعذّر التحديث" : "Could not update");
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            {locale === "ar" ? "المجموعات" : "Collections"}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {collections.length} {locale === "ar" ? "مجموعة" : "collections"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {base64Count > 0 && (
            <button
              onClick={migrateBase64Images}
              disabled={migrating}
              className="inline-flex items-center gap-2 rounded-md border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/20 disabled:opacity-60"
              title={
                locale === "ar"
                  ? "نقل صور المجموعات القديمة (base64) إلى التخزين"
                  : "Move legacy base64 collection images to Storage"
              }
            >
              <Upload className="h-4 w-4" />
              {migrating
                ? locale === "ar"
                  ? "جارٍ الترحيل…"
                  : "Migrating…"
                : locale === "ar"
                  ? `ترحيل الصور (${base64Count})`
                  : `Migrate images (${base64Count})`}
            </button>
          )}
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-md bg-[#c9a96e] px-5 py-2.5 text-sm font-semibold text-[#1a1a1a] shadow-[0_4px_14px_rgba(201,169,110,0.25)] transition hover:bg-[#b8944d]"
          >
            <Plus className="h-4 w-4" />
            {locale === "ar" ? "إضافة مجموعة" : "Add Collection"}
          </button>
        </div>
      </div>

      <div className="mt-6 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={locale === "ar" ? "ابحث..." : "Search collections..."}
            className="w-full rounded-md border border-white/10 bg-[#141414] py-3 ps-10 pe-3 text-sm text-white placeholder:text-white/40 focus:border-[#c9a96e]/40 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => {
          const count = productCount(c.id);
          return (
            <div
              key={c.id}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-[#141414] transition",
                c.isActive
                  ? "border-white/10 hover:border-white/20"
                  : "border-white/5 opacity-60",
              )}
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.image}
                    alt={locale === "ar" ? c.name.ar : c.name.en}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PlaceholderJewel kind="gem" tone={c.tone} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute end-2 top-2 flex gap-1">
                  <button
                    onClick={() => toggleActive(c)}
                    className="grid h-8 w-8 place-items-center rounded-md bg-black/60 text-white/80 backdrop-blur transition hover:bg-black/80"
                    title={c.isActive ? "Deactivate" : "Activate"}
                  >
                    {c.isActive ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="absolute start-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur">
                  <Layers className="h-3 w-3" />
                  {count} {locale === "ar" ? "منتج" : "products"}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-semibold text-white">
                      {locale === "ar" ? c.name.ar : c.name.en}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-white/40">
                      /{c.id}
                    </p>
                  </div>
                  <span
                    className="inline-block h-5 w-5 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10"
                    style={{ background: c.tone }}
                  >
                    {c.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-white/50">
                  {locale === "ar" ? c.description.ar : c.description.en}
                </p>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="inline-flex rounded-md ring-1 ring-white/10">
                    <button
                      onClick={() => move(c.id, -1)}
                      disabled={i === 0 || query.trim() !== ""}
                      title={
                        query.trim() !== ""
                          ? locale === "ar"
                            ? "امسح البحث لإعادة الترتيب"
                            : "Clear search to reorder"
                          : undefined
                      }
                      className="grid h-8 w-8 place-items-center text-white/70 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => move(c.id, 1)}
                      disabled={i === filtered.length - 1 || query.trim() !== ""}
                      title={
                        query.trim() !== ""
                          ? locale === "ar"
                            ? "امسح البحث لإعادة الترتيب"
                            : "Clear search to reorder"
                          : undefined
                      }
                      className="grid h-8 w-8 place-items-center text-white/70 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="inline-flex gap-1">
                    <button
                      onClick={() => openEdit(c)}
                      className="grid h-8 w-8 place-items-center rounded-md text-white/80 ring-1 ring-white/10 transition hover:bg-white/[0.06]"
                      aria-label={t("edit")}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(c)}
                      className="grid h-8 w-8 place-items-center rounded-md text-rose-400 ring-1 ring-rose-400/20 transition hover:bg-rose-500/10"
                      aria-label={t("delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-white/5 bg-[#141414] p-10 text-center text-sm text-white/40">
            {locale === "ar"
              ? "لا توجد نتائج."
              : "No collections match your search."}
          </div>
        )}
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
                  {isExisting
                    ? locale === "ar"
                      ? "تعديل المجموعة"
                      : "Edit Collection"
                    : locale === "ar"
                      ? "إضافة مجموعة"
                      : "Add Collection"}
                </h3>
                <button
                  onClick={closeModal}
                  className="grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/[0.06]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
                <Field
                  label={locale === "ar" ? "الاسم (عربي)" : "Name (AR)"}
                  value={editing.name.ar}
                  onChange={(v) =>
                    setEditing({
                      ...editing,
                      name: { ...editing.name, ar: v },
                    })
                  }
                />
                <Field
                  label={locale === "ar" ? "الاسم (إنجليزي)" : "Name (EN)"}
                  value={editing.name.en}
                  onChange={(v) =>
                    setEditing({
                      ...editing,
                      name: { ...editing.name, en: v },
                    })
                  }
                />

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar" ? "الوصف (عربي)" : "Description (AR)"}
                  </label>
                  <textarea
                    rows={2}
                    value={editing.description.ar}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        description: {
                          ...editing.description,
                          ar: e.target.value,
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
                    rows={2}
                    dir="ltr"
                    value={editing.description.en}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        description: {
                          ...editing.description,
                          en: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
                  />
                </div>

                {/* Image upload */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                    {locale === "ar" ? "صورة المجموعة" : "Collection Image"}
                  </label>
                  {editing.image ? (
                    <div className="relative overflow-hidden rounded-lg ring-1 ring-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editing.image}
                        alt=""
                        className="aspect-[16/9] w-full object-cover"
                      />
                      {imgBusy && (
                        <div className="absolute inset-0 grid place-items-center bg-black/50">
                          <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#c9a96e]/30 border-t-[#c9a96e]" />
                        </div>
                      )}
                      <div className="absolute end-2 top-2 flex gap-1">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-black/70 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/85">
                          <Upload className="h-3.5 w-3.5" />
                          {locale === "ar" ? "استبدال" : "Replace"}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={imgBusy}
                            className="sr-only"
                            onChange={(e) => {
                              void onPickImage(e.target.files?.[0]);
                              e.currentTarget.value = "";
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={clearImage}
                          className="grid h-8 w-8 place-items-center rounded-md bg-black/70 text-white backdrop-blur transition hover:bg-rose-500/80"
                          aria-label={t("delete")}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      className={cn(
                        "flex aspect-[16/9] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/15 bg-[#0a0a0a] text-sm text-white/60 transition hover:border-[#c9a96e]/50 hover:text-white",
                        imgBusy ? "cursor-wait opacity-60" : "cursor-pointer",
                      )}
                    >
                      {imgBusy ? (
                        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#c9a96e]/30 border-t-[#c9a96e]" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6" />
                          <span className="font-medium">
                            {locale === "ar" ? "ارفع صورة" : "Upload image"}
                          </span>
                          <span className="text-[11px] text-white/40">
                            {locale === "ar"
                              ? "يفضل بأبعاد أفقية (16:9)"
                              : "Wide / landscape (16:9) recommended"}
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={imgBusy}
                        className="sr-only"
                        onChange={(e) => {
                          void onPickImage(e.target.files?.[0]);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Active toggle */}
                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-center justify-between rounded-md border border-white/10 bg-[#0a0a0a] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {locale === "ar" ? "نشطة" : "Active"}
                      </p>
                      <p className="mt-0.5 text-xs text-white/50">
                        {locale === "ar"
                          ? "تظهر للعملاء على الصفحة الرئيسية والمتجر."
                          : "Visible to customers on the storefront."}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={editing.isActive}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          isActive: e.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-[#c9a96e]"
                    />
                  </label>
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
    </>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-[#0a0a0a] px-3 py-2.5 text-sm text-white focus:border-[#c9a96e]/40 focus:outline-none"
      />
    </div>
  );
}
