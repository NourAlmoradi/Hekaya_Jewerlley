"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Lock,
  Camera,
  Heart,
  Pencil,
  Save,
  X,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useT } from "@/lib/useT";
import { createClient } from "@/lib/supabase/client";
import {
  getMemoryMeta,
  unlockMemory,
  fetchMemoryByToken,
  saveMemory as dbSaveMemory,
  type PublicMemory,
  type MemoryMeta,
} from "@/lib/supabase/memories";
import { useProducts } from "@/lib/useProducts";
import { Logo } from "@/components/ui/Logo";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { prepareImageDataUrl } from "@/lib/image";

export default function MemoryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { t, tx, locale } = useT();
  const searchParams = useSearchParams();
  const allProducts = useProducts();
  // `meta` = "a memory exists" (public, no content). `memory` = the unlocked
  // private content, available only after the PIN (or to the owner/admin).
  const [meta, setMeta] = useState<MemoryMeta | null>(null);
  const [memory, setMemory] = useState<PublicMemory | null>(null);
  const [loadingMemory, setLoadingMemory] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [unlockedPin, setUnlockedPin] = useState("");
  const [editing, setEditing] = useState(false);

  // Form state
  const [photos, setPhotos] = useState<string[]>([]);
  const [titleField, setTitleField] = useState("");
  const [messageField, setMessageField] = useState("");
  const [pinField, setPinField] = useState("");

  const applyContent = (m: PublicMemory) => {
    setMemory(m);
    setPhotos(m.photos);
    setTitleField(m.title);
    setMessageField(m.message);
  };

  useEffect(() => {
    // The demo token renders a fixed, read-only showcase (see below) — never
    // hit the database for it.
    if (token === "demo") {
      setLoadingMemory(false);
      return;
    }
    let active = true;
    // Watchdog: the whole tab shares ONE Supabase client and ONE auth-token
    // lock. If a token refresh wedges that lock, every query hangs and the page
    // would spin forever (this also stalls the account page). Never allow an
    // infinite spinner — surface a retry instead.
    const watchdog = setTimeout(() => {
      if (active) {
        setLoadError(true);
        setLoadingMemory(false);
      }
    }, 10000);
    (async () => {
      const supabase = createClient();
      try {
        // Public "does it exist?" read first. The PIN gate only needs this, so
        // render as soon as it resolves — don't block the page on the owner read.
        const m = await getMemoryMeta(supabase, token);
        if (!active) return;
        clearTimeout(watchdog);
        setMeta(m);
        setLoadingMemory(false);
        if (m) {
          // The order owner (or an admin) may read the content directly via RLS
          // — skip the PIN gate for them. Best-effort: if this stalls or fails
          // we just keep showing the PIN prompt rather than hanging the page.
          fetchMemoryByToken(supabase, token)
            .then((owned) => {
              if (active && owned) {
                applyContent(owned);
                setUnlocked(true);
              }
            })
            .catch(() => {});
        }
      } catch {
        if (active) {
          clearTimeout(watchdog);
          setLoadError(true);
          setLoadingMemory(false);
        }
      }
    })();
    return () => {
      active = false;
      clearTimeout(watchdog);
    };
  }, [token]);

  // Deep link from "My Memories" → /memory/[token]?edit=1 opens the editor
  // straight away, but only once the content is actually unlocked.
  useEffect(() => {
    if (unlocked && searchParams.get("edit") === "1") setEditing(true);
  }, [unlocked, searchParams]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await unlockMemory(createClient(), token, pinInput);
      if (res.status === "ok") {
        applyContent(res.memory);
        setUnlocked(true);
        setUnlockedPin(pinInput);
        toast.success(t("welcome_back"));
      } else if (res.status === "locked") {
        // The memory is locked for `minutesLeft` more minutes — the correct PIN
        // won't work until it expires, so say how long rather than "wrong PIN".
        toast.error(
          locale === "ar"
            ? `محاولات كثيرة — حاول بعد ${res.minutesLeft} دقيقة`
            : `Too many attempts — try again in ${res.minutesLeft} min`,
        );
      } else {
        // Wrong PIN, with the tries remaining before a lockout (when known).
        toast.error(
          res.attemptsLeft == null
            ? t("wrong_pin")
            : locale === "ar"
              ? `رمز غير صحيح — بقيت ${res.attemptsLeft} محاولة`
              : `Wrong PIN — ${res.attemptsLeft} attempt${res.attemptsLeft === 1 ? "" : "s"} left`,
        );
      }
    } catch {
      // A wrong/locked PIN resolves (never throws) — reaching here means the
      // request itself failed. Never mislabel that as a lockout.
      toast.error(
        locale === "ar"
          ? "تعذّر الاتصال — حاول مرة أخرى"
          : "Connection problem — please try again",
      );
    }
  };

  const [photoBusy, setPhotoBusy] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const picked = Array.from(files).slice(0, 3 - photos.length);
    if (picked.length === 0) return;
    setPhotoBusy(true);
    try {
      for (const file of picked) {
        if (!file.type.startsWith("image/")) {
          toast.error(
            locale === "ar" ? "الملف ليس صورة" : "That file isn't an image",
          );
          continue;
        }
        try {
          // Compress to ≤1280px JPEG, then upload to the memory-photos bucket
          // via the server route (which validates the token). Store the URL.
          const dataUrl = await prepareImageDataUrl(file, {
            maxDim: 1280,
            quality: 0.85,
          });
          const res = await fetch("/api/memory/upload", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ token, dataUrl }),
          });
          const json = (await res.json()) as { url?: string };
          if (!res.ok || !json.url) throw new Error("upload-failed");
          setPhotos((p) => [...p, json.url!].slice(0, 3));
        } catch {
          toast.error(
            locale === "ar" ? "تعذّر رفع الصورة" : "Could not upload photo",
          );
        }
      }
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleSave = async () => {
    if (!titleField.trim() || !messageField.trim()) {
      toast.error(
        locale === "ar"
          ? "العنوان والرسالة مطلوبان"
          : "Title and message are required",
      );
      return;
    }
    if (
      !meta &&
      (!pinField || pinField.length !== 4 || !/^\d{4}$/.test(pinField))
    ) {
      toast.error(
        locale === "ar" ? "أدخل PIN مكون من ٤ أرقام" : "Enter a 4-digit PIN",
      );
      return;
    }
    // First-time setup uses the freshly chosen PIN; edits reuse the unlock PIN
    // (the order owner/admin may have none — the server lets them edit anyway).
    const pinToUse = meta ? unlockedPin : pinField;
    try {
      const supabase = createClient();
      const saved = await dbSaveMemory(supabase, {
        token,
        pin: pinToUse,
        title: titleField.trim(),
        message: messageField.trim(),
        photos,
      });

      // A wrong or locked PIN comes back as data, not an exception, so the
      // failed-attempt counter the server just wrote actually commits (H1).
      if (saved.status === "locked") {
        setUnlocked(false);
        toast.error(
          locale === "ar"
            ? `تم قفل الذكرى مؤقتًا. حاول بعد ${saved.minutesLeft} دقيقة.`
            : `Locked for ${saved.minutesLeft} minute${saved.minutesLeft === 1 ? "" : "s"} after too many wrong attempts.`,
        );
        return;
      }
      if (saved.status === "wrong") {
        toast.error(
          saved.attemptsLeft === null
            ? t("wrong_pin")
            : locale === "ar"
              ? `${t("wrong_pin")} — تبقّى ${saved.attemptsLeft} محاولة`
              : `Wrong PIN — ${saved.attemptsLeft} attempt${saved.attemptsLeft === 1 ? "" : "s"} left`,
        );
        return;
      }

      // Re-read the saved content: owner/admin via RLS, otherwise via the PIN.
      let fresh = await fetchMemoryByToken(supabase, token);
      if (!fresh) {
        const res = await unlockMemory(supabase, token, pinToUse);
        if (res.status === "ok") fresh = res.memory;
      }
      if (fresh) {
        applyContent(fresh);
        setMeta({
          token: fresh.token,
          orderId: fresh.orderId,
          productId: fresh.productId,
          productLabel: fresh.productLabel,
          createdAt: fresh.createdAt,
          updatedAt: fresh.updatedAt,
        });
      }
      setUnlockedPin(pinToUse);
      setEditing(false);
      setUnlocked(true);
      toast.success(t("memory_saved"));
    } catch {
      toast.error(
        locale === "ar"
          ? "تعذّر حفظ الذكرى"
          : "Could not save the memory",
      );
    }
  };

  // ── Demo showcase: a fixed, read-only preview of a finished memory page — no
  //    PIN gate, no edit button, no save path that can fail (H7). This is what
  //    the QR page's "Try it live" CTA links to (/memory/demo).
  if (token === "demo") {
    const demoPhotos = ["/child.png", "/necklaces.png", "/bracelets.png"];
    const demoTitle =
      locale === "ar" ? "ذكرى ميلاد ليان الأولى" : "Layan's First Birthday";
    const demoMessage =
      locale === "ar"
        ? "إلى ابنتنا الغالية ليان،\nفي عامكِ الأول علّمتِنا معنى الفرح الحقيقي. نُهديكِ هذه القطعة لتكبر معكِ وتبقى شاهدةً على حبٍّ لا ينتهي.\nكل الحب، ماما وبابا."
        : "To our beloved Layan,\nIn your very first year you taught us the meaning of pure joy. This little piece is yours to grow into — a keepsake of a love that never ends.\nAll our love, Mama & Baba.";
    return (
      <Wrapper>
        <Header />
        <div className="mx-auto mt-6 w-fit rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)] px-4 py-1.5 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary-dark)]">
          {locale === "ar" ? "معاينة توضيحية" : "Demo preview"}
        </div>
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-4 rounded-xl bg-white p-6 shadow-md ring-1 ring-[var(--color-border)] sm:p-10"
        >
          <div className="text-center">
            <Heart className="mx-auto h-7 w-7 text-[var(--color-primary)]" />
            <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              {demoTitle}
            </h1>
          </div>
          <PhotoCarousel photos={demoPhotos} />
          <MessageCard
            message={demoMessage}
            createdDate=""
            productName={
              locale === "ar" ? "سوار الأطفال الذهبي" : "Gold Baby Bracelet"
            }
          />
        </motion.article>
      </Wrapper>
    );
  }

  if (loadingMemory) {
    return (
      <Wrapper>
        <Header />
        <div className="mt-16 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-primary-dark)] border-t-transparent" />
        </div>
      </Wrapper>
    );
  }

  // ── 0. The load failed/stalled → retry (never silently fall through to the
  //     setup form, which a non-owner could use to overwrite an existing memory).
  if (loadError) {
    return (
      <Wrapper>
        <Header />
        <div className="mx-auto mt-12 max-w-sm rounded-xl bg-white p-8 text-center shadow-md ring-1 ring-[var(--color-border)]">
          <h2 className="font-display text-xl font-semibold">
            {locale === "ar"
              ? "تعذّر تحميل الذكرى"
              : "Couldn't load this memory"}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            {locale === "ar"
              ? "حدث خطأ مؤقت. حدّث الصفحة وحاول مرة أخرى."
              : "Something went wrong. Please refresh and try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-gold btn-md mt-5 w-full"
          >
            {locale === "ar" ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      </Wrapper>
    );
  }

  // ── 1. No memory yet → setup
  if (!meta) {
    return (
      <Wrapper>
        <Header />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <h1 className="text-center font-display text-3xl font-semibold sm:text-4xl">
            {t("setup_memory_title")}
          </h1>
          <p className="mt-2 text-center text-[var(--color-ink-muted)]">
            {t("setup_memory_d")}
          </p>
        </motion.div>
        <MemoryForm
          photos={photos}
          setPhotos={setPhotos}
          titleField={titleField}
          setTitleField={setTitleField}
          messageField={messageField}
          setMessageField={setMessageField}
          pinField={pinField}
          setPinField={setPinField}
          onPhotoUpload={handlePhotoUpload}
          onSave={handleSave}
          busy={photoBusy}
          isNew
        />
      </Wrapper>
    );
  }

  // ── 2. Memory exists, locked → PIN prompt
  if (!unlocked && !editing) {
    return (
      <Wrapper>
        <Header />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-10 max-w-sm rounded-xl bg-white p-8 text-center shadow-md ring-1 ring-[var(--color-border)]"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold">
            {t("memory_pin_prompt")}
          </h2>
          <form onSubmit={handleUnlock} className="mt-6">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
              placeholder="• • • •"
              className="input text-center text-2xl tracking-[0.5em]"
              autoFocus
            />
            <button type="submit" className="btn btn-gold btn-lg mt-4 w-full">
              {t("unlock")}
            </button>
          </form>
        </motion.div>
      </Wrapper>
    );
  }

  // ── 3. Editing
  if (editing) {
    return (
      <Wrapper>
        <Header />
        <div className="mt-6 flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold">
            {t("edit_memory")}
          </h1>
          <button
            onClick={() => setEditing(false)}
            className="btn btn-ghost btn-sm"
          >
            <X className="h-4 w-4" /> {t("back")}
          </button>
        </div>
        <MemoryForm
          photos={photos}
          setPhotos={setPhotos}
          titleField={titleField}
          setTitleField={setTitleField}
          messageField={messageField}
          setMessageField={setMessageField}
          pinField={pinField}
          setPinField={setPinField}
          onPhotoUpload={handlePhotoUpload}
          onSave={handleSave}
          busy={photoBusy}
          isNew={false}
        />
      </Wrapper>
    );
  }

  // ── 4. Unlocked view
  if (!memory) return null;
  const linkedProduct = memory.productId
    ? allProducts.find((p) => p.id === memory.productId)
    : undefined;
  const createdDate = memory.createdAt
    ? formatDate(memory.createdAt, locale)
    : "";

  return (
    <Wrapper>
      <Header />
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 rounded-xl bg-white p-6 shadow-md ring-1 ring-[var(--color-border)] sm:p-10"
      >
        <div className="text-center">
          <Heart className="mx-auto h-7 w-7 text-[var(--color-primary)]" />
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            {memory.title}
          </h1>
        </div>

        {photos.length > 0 && <PhotoCarousel photos={photos} />}

        <MessageCard
          message={memory.message}
          createdDate={createdDate}
          productName={linkedProduct ? tx(linkedProduct.name) : undefined}
        />

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setEditing(true)}
            className="btn btn-outline-gold"
          >
            <Pencil className="h-4 w-4" /> {t("edit_memory")}
          </button>
        </div>
      </motion.article>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-b from-[var(--color-bg-secondary)] to-[var(--color-bg)]">
      <div className="container-h max-w-3xl py-10 lg:py-16">{children}</div>
    </div>
  );
}

function Header() {
  const { t } = useT();
  return (
    <div className="flex items-center justify-between">
      <Link href="/" className="btn btn-ghost btn-sm">
        <ArrowLeft className="h-4 w-4" /> {t("back_home")}
      </Link>
      <Logo color="dark" />
    </div>
  );
}

function MemoryForm({
  photos,
  setPhotos,
  titleField,
  setTitleField,
  messageField,
  setMessageField,
  pinField,
  setPinField,
  onPhotoUpload,
  onSave,
  isNew,
  busy,
}: {
  photos: string[];
  setPhotos: (p: string[]) => void;
  titleField: string;
  setTitleField: (v: string) => void;
  messageField: string;
  setMessageField: (v: string) => void;
  pinField: string;
  setPinField: (v: string) => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  isNew: boolean;
  busy?: boolean;
}) {
  const { t } = useT();
  return (
    <div className="mt-8 rounded-xl bg-white p-6 shadow-md ring-1 ring-[var(--color-border)] sm:p-8">
      <label className="label">{t("upload_photos")} (max 3)</label>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="relative aspect-square overflow-hidden rounded-md border border-dashed border-[var(--color-border-strong)]"
          >
            {photos[i] ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL; not eligible for next/image optimization */}
                <img
                  src={photos[i]}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() =>
                    setPhotos(photos.filter((_, idx) => idx !== i))
                  }
                  className="absolute top-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white"
                  aria-label="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <label
                className={cn(
                  "flex h-full w-full flex-col items-center justify-center text-[var(--color-ink-faint)] transition hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-primary)]",
                  busy ? "cursor-wait opacity-60" : "cursor-pointer",
                )}
              >
                {busy ? (
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)]" />
                ) : (
                  <>
                    <Camera className="h-6 w-6" />
                    <span className="mt-1 text-xs">+</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={busy}
                  className="hidden"
                  onChange={onPhotoUpload}
                />
              </label>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4">
        <div>
          <label className="label">
            {t("memory_title_field")}{" "}
            <span className="text-[var(--color-ink-faint)]">
              ({titleField.length}/100)
            </span>
          </label>
          <input
            value={titleField}
            onChange={(e) => setTitleField(e.target.value.slice(0, 100))}
            className="input"
            placeholder="…"
          />
        </div>
        <div>
          <label className="label">
            {t("memory_message")}{" "}
            <span className="text-[var(--color-ink-faint)]">
              ({messageField.length}/500)
            </span>
          </label>
          <textarea
            rows={5}
            value={messageField}
            onChange={(e) => setMessageField(e.target.value.slice(0, 500))}
            className="input resize-none"
            placeholder="…"
          />
        </div>
        {isNew && (
          <div>
            <label className="label">{t("set_pin")}</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinField}
              onChange={(e) => setPinField(e.target.value.replace(/\D/g, ""))}
              className="input max-w-[160px] text-center text-xl tracking-[0.5em]"
              placeholder="• • • •"
            />
          </div>
        )}
      </div>

      <button onClick={onSave} className="btn btn-gold btn-lg mt-6 w-full">
        <Save className="h-4 w-4" />
        {t("save_memory")}
      </button>
    </div>
  );
}

function PhotoCarousel({ photos }: { photos: string[] }) {
  const { t, dir } = useT();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const total = photos.length;
  const isRtl = dir === "rtl";

  const go = (next: number) => {
    setDirection(next > index ? 1 : -1);
    setIndex((next + total) % total);
  };
  const prev = () => go(index - 1);
  const next = () => go(index + 1);

  // Keyboard navigation
  useEffect(() => {
    if (total <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") (isRtl ? next : prev)();
      else if (e.key === "ArrowRight") (isRtl ? prev : next)();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total, isRtl]);

  return (
    <div className="mt-10">
      <div className="relative mx-auto max-w-2xl">
        {/* Frame */}
        <div className="group relative overflow-hidden rounded-2xl bg-[#0c0a07] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)] ring-1 ring-black/5">
          <div className="relative aspect-[4/5] w-full sm:aspect-[4/3]">
            {/* Blurred backdrop = current photo, fills frame elegantly */}
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={`bg-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${photos[index]})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(28px) saturate(1.1)",
                  transform: "scale(1.15)",
                }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-black/25" />

            {/* Foreground photo, fully visible */}
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.img
                key={index}
                src={photos[index]}
                alt=""
                draggable={false}
                custom={direction}
                initial={{ opacity: 0, x: direction * 60, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: direction * -60, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                drag={total > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) (isRtl ? prev : next)();
                  else if (info.offset.x > 60) (isRtl ? next : prev)();
                }}
                className="absolute inset-0 m-auto max-h-[92%] max-w-[92%] cursor-grab object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)] active:cursor-grabbing"
              />
            </AnimatePresence>

            {/* Bottom gradient + counter */}
            {total > 1 && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100" />
            )}

            {/* Arrows */}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={isRtl ? next : prev}
                  aria-label={t("memory_prev_photo")}
                  className="absolute top-1/2 left-4 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[var(--color-ink)] opacity-0 shadow-lg ring-1 ring-black/5 backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-white hover:text-[var(--color-primary)] focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={isRtl ? prev : next}
                  aria-label={t("memory_next_photo")}
                  className="absolute top-1/2 right-4 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-[var(--color-ink)] opacity-0 shadow-lg ring-1 ring-black/5 backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-white hover:text-[var(--color-primary)] focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Counter pill */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 font-mono text-[11px] tracking-[0.2em] text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(total).padStart(2, "0")}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dot indicators */}
        {total > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index
                    ? "w-8 bg-[var(--color-primary)]"
                    : "w-1.5 bg-[var(--color-border-strong)] hover:bg-[var(--color-ink-faint)]",
                )}
              />
            ))}
          </div>
        )}

        {/* Thumbnail strip */}
        {total > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            {photos.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`${i + 1}`}
                className={cn(
                  "relative h-16 w-16 overflow-hidden rounded-lg transition-all duration-300",
                  i === index
                    ? "scale-105 ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-[var(--color-bg)]"
                    : "opacity-55 ring-1 ring-[var(--color-border)] hover:opacity-100",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded data URL; not eligible for next/image optimization */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageCard({
  message,
  createdDate,
  productName,
}: {
  message: string;
  createdDate: string;
  productName?: string;
}) {
  const { t } = useT();
  return (
    <div className="mt-10">
      <div className="mx-auto h-px w-16 bg-[var(--color-primary)]" />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mx-auto mt-8 max-w-2xl rounded-xl bg-white px-8 py-10 shadow-sm ring-1 ring-[var(--color-border)] sm:px-12 sm:py-14"
      >
        <p
          className={cn(
            "whitespace-pre-line text-center font-display text-xl italic leading-[1.9] text-[var(--color-ink-soft)] sm:text-2xl",
          )}
        >
          <span className="me-1 align-top text-[var(--color-primary)]">“</span>
          {message}
          <span className="ms-1 align-top text-[var(--color-primary)]">”</span>
        </p>
      </motion.div>

      {(createdDate || productName) && (
        <div className="mt-5 text-center text-sm text-[var(--color-ink-faint)]">
          {createdDate && (
            <p>
              {t("memory_created_on")} · {createdDate}
            </p>
          )}
          {productName && (
            <p className="mt-1">
              {t("memory_jewellery_piece")}: {productName}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
