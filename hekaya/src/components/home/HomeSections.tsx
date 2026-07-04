"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldCheck, QrCode, Sparkles } from "lucide-react";
import { useT } from "@/lib/useT";
import type { TKey } from "@/lib/i18n";
import { useCollections } from "@/lib/useCollections";
import { useProducts } from "@/lib/useProducts";
import { ProductCard } from "@/components/products/ProductCard";
import { FinalCtaBand } from "@/components/ui/FinalCtaBand";
import { FloralPattern } from "@/components/ui/FloralPattern";
import { Logo } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";

/* =============================================================================
 *  HERO — auto-rotating editorial slider (3 slides, text + jewel)
 * ============================================================================*/

type HeroSlide = {
  eyebrowKey: TKey;
  titleAKey: TKey;
  titleBKey: TKey;
  subKey: TKey;
  primaryCta: { href: string; labelAr: string; labelEn: string };
  secondaryCta: { href: string; labelAr: string; labelEn: string };
};

type HeroSlideExtra = HeroSlide & { image: string; alt: string };

const HERO_SLIDES: HeroSlideExtra[] = [
  {
    eyebrowKey: "hero_slide1_eyebrow",
    titleAKey: "hero_slide1_title_a",
    titleBKey: "hero_slide1_title_b",
    subKey: "hero_slide1_sub",
    image: "/logo.jpg",
    alt: "Mashaer Jewellery — premium children's gold jewellery in the UAE | مجوهرات مشاعر للأطفال",
    primaryCta: {
      href: "/products",
      labelAr: "ابدأ التسوق",
      labelEn: "Start Shopping",
    },
    secondaryCta: { href: "/qr", labelAr: "اكتشف QR", labelEn: "Discover QR" },
  },
  {
    eyebrowKey: "hero_slide2_eyebrow",
    titleAKey: "hero_slide2_title_a",
    titleBKey: "hero_slide2_title_b",
    subKey: "hero_slide2_sub",
    image: "/page.png",
    alt: "How the Mashaer QR Memory keepsake card works with children's jewellery | بطاقة ذكرى QR من مشاعر",
    primaryCta: { href: "/qr", labelAr: "كيف تعمل", labelEn: "How It Works" },
    secondaryCta: { href: "/products", labelAr: "تصفّحي", labelEn: "Browse" },
  },
  {
    eyebrowKey: "hero_slide3_eyebrow",
    titleAKey: "hero_slide3_title_a",
    titleBKey: "hero_slide3_title_b",
    subKey: "hero_slide3_sub",
    image: "/child.png",
    alt: "Child wearing Mashaer fine children's jewellery | طفلة ترتدي مجوهرات مشاعر الفاخرة",
    primaryCta: { href: "/products", labelAr: "اكتشفي", labelEn: "Explore" },
    secondaryCta: { href: "/about", labelAr: "قصتنا", labelEn: "Our Story" },
  },
];

// Cream-toned product photography reused as a graceful fallback for collection
// cards that don't yet have their own image uploaded.
const COLLECTION_FALLBACKS = [
  "/necklaces.png",
  "/bracelets.png",
  "/earrings.png",
];

const TITLE_GRADIENT =
  "linear-gradient(135deg,#b58a3e 0%,#c9a96e 40%,#a8853f 75%,#8a6a2f 100%)";

export function Hero() {
  const { t, locale, dir } = useT();
  const [index, setIndex] = useState(0);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % HERO_SLIDES.length),
    [],
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length),
    [],
  );

  useEffect(() => {
    const id = window.setInterval(next, 5000);
    return () => window.clearInterval(id);
  }, [next]);

  const slide = HERO_SLIDES[index];

  return (
    <section
      className="relative -mt-[72px] overflow-hidden bg-[#f2e3d3] pt-[72px] text-[var(--color-ink)]"
    >
      {/* Backdrop — cream wash + soft light & gold accents (cheap CSS only) */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8efe4_0%,#f4e6d6_55%,#ecd9c6_100%)]" />
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.65),transparent_55%),radial-gradient(circle_at_85%_85%,rgba(201,169,110,0.16),transparent_60%)]" />
      </div>
      <FloralPattern
        className="absolute -top-24 h-[420px] w-[420px] ltr:-right-24 rtl:-left-24"
        opacity={0.06}
      />

      <div className="container-h relative grid items-center gap-10 py-12 sm:gap-12 sm:py-16 lg:min-h-[calc(100svh-72px)] lg:grid-cols-2 lg:gap-16 lg:py-20">
        {/* ── TEXT (below image on mobile, source order on lg) ── */}
        <div className="relative z-10 order-2 text-center lg:order-none lg:text-start">
          {/* initial={false} → the first slide renders in its final (visible)
              state on the server, so the hero text is never blank while the JS
              bundle loads. Crossfades still play on subsequent slide changes. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`text-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <span className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.32em] text-[var(--color-primary-dark)]">
                <Sparkles className="h-3.5 w-3.5" />
                {t(slide.eyebrowKey)}
              </span>

              <h1 className="mt-5 font-display font-semibold">
                <span className="fs-display-xl block text-[var(--color-ink)]">
                  {t(slide.titleAKey)}
                </span>
                <span
                  className="fs-display-xl block"
                  style={{
                    background: TITLE_GRADIENT,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {t(slide.titleBKey)}
                </span>
              </h1>

              <p className="fs-body-lg mx-auto mt-5 max-w-lg text-[var(--color-ink-soft)] lg:mx-0">
                {t(slide.subKey)}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Link
                  href={slide.primaryCta.href}
                  className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--color-primary)] px-7 text-[13px] font-semibold uppercase tracking-[0.22em] text-white shadow-[var(--shadow-gold)] transition hover:bg-[var(--color-primary-dark)]"
                >
                  {locale === "ar"
                    ? slide.primaryCta.labelAr
                    : slide.primaryCta.labelEn}
                  <ArrowRight
                    className={`h-4 w-4 transition group-hover:translate-x-1 ${dir === "rtl" ? "flip-rtl group-hover:-translate-x-1" : ""}`}
                  />
                </Link>
                <Link
                  href={slide.secondaryCta.href}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--color-ink)]/20 bg-white/70 px-7 text-[13px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink)] transition hover:border-[var(--color-primary)] hover:bg-white hover:text-[var(--color-primary-dark)]"
                >
                  {locale === "ar"
                    ? slide.secondaryCta.labelAr
                    : slide.secondaryCta.labelEn}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider controls — arrows + animated progress + counter */}
          <div className="mt-9 flex items-center justify-center gap-4 lg:mt-12 lg:justify-start">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous slide"
                className="group grid h-10 w-10 place-items-center rounded-full border border-[var(--color-ink)]/10 bg-white/85 text-[var(--color-ink)] shadow-[var(--shadow-soft)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
              >
                <ArrowRight
                  className={`h-4 w-4 ${dir === "rtl" ? "" : "rotate-180"}`}
                />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next slide"
                className="group grid h-10 w-10 place-items-center rounded-full border border-[var(--color-ink)]/10 bg-white/85 text-[var(--color-ink)] shadow-[var(--shadow-soft)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
              >
                <ArrowRight
                  className={`h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`}
                />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="relative h-1.5 w-10 overflow-hidden rounded-full bg-[var(--color-ink)]/15 sm:w-12"
                >
                  <span
                    key={`fill-${index}-${i}`}
                    className={`absolute inset-y-0 ltr:left-0 rtl:right-0 bg-[var(--color-primary)] ${
                      i === index
                        ? "animate-[heroProgress_6s_linear_forwards]"
                        : i < index
                          ? "w-full"
                          : "w-0"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--color-ink-muted)]">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* ── IMAGE (on top on mobile) — framed rotating jewelry photography ── */}
        <div className="relative order-1 lg:order-none">
          {/* soft gold halo behind the frame */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-md scale-110 rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.28),transparent_70%)] blur-2xl"
          />
          <div className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-md">
            <Link
              href={slide.primaryCta.href}
              className="group relative block aspect-square overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#f6ead9_0%,#ecd9c4_100%)] shadow-[0_30px_70px_-25px_rgba(168,133,63,0.6)] ring-1 ring-[var(--color-primary)]/25"
            >
              {HERO_SLIDES.map((s, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={s.image}
                  src={s.image}
                  alt={s.alt}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  decoding="async"
                  aria-hidden={i !== index}
                  className={`absolute inset-0 h-full w-full object-contain transition-all duration-[1100ms] ease-out ${
                    i === index ? "scale-100 opacity-100" : "scale-105 opacity-0"
                  }`}
                />
              ))}
              {/* legibility + warmth wash */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1207]/35 via-transparent to-transparent" />
              {/* gold corner brackets */}
              {[
                "left-4 top-4 border-l-2 border-t-2",
                "right-4 top-4 border-r-2 border-t-2",
                "bottom-4 left-4 border-b-2 border-l-2",
                "bottom-4 right-4 border-b-2 border-r-2",
              ].map((cls, idx) => (
                <span
                  key={idx}
                  aria-hidden
                  className={`pointer-events-none absolute h-8 w-8 border-white/70 ${cls}`}
                />
              ))}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =============================================================================
 *  TRUST BADGES — blush wash, pills row + 2 quality cards
 * ============================================================================*/

export function TrustBadges() {
  const { t } = useT();
  const items = [
    { Icon: ShieldCheck, t: t("trust_quality"), d: t("trust_quality_d") },
    { Icon: QrCode, t: t("trust_qr"), d: t("trust_qr_d") },
  ];
  return (
    <section className="bg-blush-wash relative overflow-hidden border-y border-[var(--color-border)]">
      <FloralPattern
        className="absolute -top-16 ltr:-left-20 rtl:-right-20 h-[420px] w-[420px]"
        opacity={0.07}
      />
      <FloralPattern
        className="absolute -bottom-24 ltr:-right-24 rtl:-left-24 h-[480px] w-[480px]"
        color="#c98a7a"
        opacity={0.06}
      />
      <div className="container-h relative py-14 sm:py-20">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          {items.map(({ Icon, t: title, d }, i) => (
            <Reveal
              key={title}
              delay={i * 0.08}
              className="group relative flex items-start gap-5 rounded-2xl bg-white p-6 shadow-[var(--shadow-card)] ring-1 ring-[var(--color-border)] transition hover:shadow-[var(--shadow-lift)] sm:p-8"
            >
              {/* Dual ring icon */}
              <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[var(--color-blush-soft)] ring-1 ring-[var(--color-blush-deep)]/60 sm:h-20 sm:w-20">
                <span className="absolute inset-1.5 rounded-full ring-1 ring-[var(--color-primary)]/40" />
                <Icon
                  className="relative h-7 w-7 text-[var(--color-primary-dark)] sm:h-8 sm:w-8"
                  strokeWidth={1.5}
                />
              </span>
              <div className="min-w-0">
                <h3 className="fs-display-md font-display font-semibold text-[var(--color-ink)]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  {d}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =============================================================================
 *  COLLECTIONS — 4-up grid, warm cards
 * ============================================================================*/

export function CollectionShowcase() {
  const { t, tx, dir } = useT();
  const collections = useCollections();
  const products = useProducts();

  if (collections.length === 0) return null;

  return (
    <section className="section-fluid relative overflow-hidden bg-gradient-to-b from-[var(--color-cream)] via-white to-[var(--color-cream)]">
      <FloralPattern
        className="absolute top-10 ltr:right-0 rtl:left-0 h-[360px] w-[360px]"
        opacity={0.05}
      />
      <FloralPattern
        className="absolute bottom-10 ltr:left-0 rtl:right-0 h-[300px] w-[300px]"
        color="#c98a7a"
        opacity={0.04}
      />

      <div className="container-h relative">
        {/* Header */}
        <Reveal className="mb-12 flex flex-col items-center gap-3 text-center sm:mb-14">
          <span className="eyebrow">{t("collections_title")}</span>
          <h2 className="fs-display-lg font-display font-semibold">
            {t("collections_title")}
          </h2>
          <div className="divider-gold w-20" />
          <p className="max-w-xl text-[var(--color-ink-muted)]">
            {t("collections_sub")}
          </p>
        </Reveal>

        {/* Uniform cards in a centered wrap — stays balanced for any number of
            collections the admin publishes (2, 3, 4, 6 …). */}
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-5 sm:gap-6">
          {collections.map((c, i) => {
            const count = products.filter(
              (p) => p.collection === c.id && p.isActive,
            ).length;
            const image = c.image ?? COLLECTION_FALLBACKS[i % COLLECTION_FALLBACKS.length];
            return (
              <Reveal
                key={c.id}
                delay={Math.min(i * 0.08, 0.4)}
                className="group w-full sm:w-[330px] lg:w-[360px]"
              >
                <Link
                  href={`/products?collection=${c.id}`}
                  className="relative block aspect-[4/5] w-full overflow-hidden rounded-3xl shadow-[0_10px_40px_-18px_rgba(26,18,7,0.35)] ring-1 ring-[var(--color-blush-deep)]/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_-15px_rgba(168,133,63,0.45)] hover:ring-[var(--color-primary)]/60"
                >
                  {/* Image */}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={tx(c.name)}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Dark gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1207]/90 via-[#1a1207]/25 to-transparent" />
                  {/* Subtle gold glow at top */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[var(--color-primary)]/15 to-transparent opacity-80" />

                  {/* Index numeral */}
                  <span className="absolute top-5 font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-white/75 ltr:left-6 rtl:right-6">
                    {String(i + 1).padStart(2, "0")} —
                  </span>

                  {/* Live count badge */}
                  <span className="absolute top-5 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)] backdrop-blur ltr:right-6 rtl:left-6">
                    <Sparkles className="h-3 w-3 text-[var(--color-primary)]" />
                    {count} {t("products_count_label")}
                  </span>

                  {/* Gold corner brackets */}
                  {[
                    "left-3 top-3 border-l-2 border-t-2",
                    "right-3 top-3 border-r-2 border-t-2",
                    "bottom-3 left-3 border-b-2 border-l-2",
                    "bottom-3 right-3 border-b-2 border-r-2",
                  ].map((cls, idx) => (
                    <span
                      key={idx}
                      aria-hidden
                      className={`pointer-events-none absolute h-7 w-7 border-[var(--color-primary)] opacity-90 ${cls}`}
                    />
                  ))}

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                    <h3 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
                      {tx(c.name)}
                    </h3>

                    {/* Gold underline — grows on hover */}
                    <span
                      aria-hidden
                      className="mt-3 block h-[2px] w-16 origin-left bg-[var(--color-primary)] transition-transform duration-500 ease-out group-hover:scale-x-125 rtl:origin-right sm:w-24"
                    />

                    <p className="mt-3 line-clamp-2 max-w-md text-sm text-white/85">
                      {tx(c.description)}
                    </p>

                    {/* CTA pill */}
                    <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-[var(--shadow-gold)] transition group-hover:bg-[var(--color-primary-dark)]">
                      {t("view_all")}
                      <ArrowRight
                        className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 ${dir === "rtl" ? "rotate-180 group-hover:-translate-x-0.5" : ""}`}
                      />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <Reveal delay={0.2} className="mt-12 flex justify-center">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/40 bg-white/70 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--color-ink)] backdrop-blur transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:shadow-[var(--shadow-gold)]"
          >
            {t("view_all")}
            <ArrowRight
              className={`h-4 w-4 ${dir === "rtl" ? "rotate-180" : ""}`}
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* =============================================================================
 *  FEATURED — soft cream-blush gradient section
 * ============================================================================*/

export function FeaturedProducts() {
  const { t } = useT();
  const all = useProducts();
  const featured = all.filter((p) => p.isActive).slice(0, 8);
  if (featured.length === 0) return null;
  return (
    <section className="bg-cream-diagonal section-fluid relative overflow-hidden">
      <FloralPattern
        className="absolute -top-20 ltr:-left-20 rtl:-right-20 h-[460px] w-[460px]"
        opacity={0.06}
      />
      <FloralPattern
        className="absolute -bottom-20 ltr:-right-20 rtl:-left-20 h-[420px] w-[420px]"
        color="#c98a7a"
        opacity={0.05}
      />
      <div className="container-h relative">
        <Reveal className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full text-center sm:text-start">
            <span className="eyebrow">{t("featured_title")}</span>
            <h2 className="fs-display-lg mt-2 font-display font-semibold">
              {t("featured_title")}
            </h2>
            <p className="mt-3 max-w-xl text-[var(--color-ink-muted)]">
              {t("featured_sub")}
            </p>
          </div>
          <Link
            href="/products"
            className="btn btn-outline-gold inline-flex shrink-0 self-center sm:self-end"
          >
            {t("view_all")} →
          </Link>
        </Reveal>

        {/* Centered wrap — 2-up on mobile, fixed-width centered cards on
            desktop. Stays balanced whether there are 2, 3, 4 or 8 products. */}
        <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-5 gap-y-8 sm:gap-x-6 lg:gap-x-7">
          {featured.map((p, i) => (
            <div
              key={p.id}
              className="w-[calc(50%-0.625rem)] sm:w-[240px] lg:w-[260px]"
            >
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =============================================================================
 *  QR BANNER — dark warm espresso with rose + gold halos
 * ============================================================================*/

export function QRBanner() {
  const { t, dir } = useT();
  return (
    <section className="section-fluid relative overflow-hidden bg-[#1f1610] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_25%_45%,rgba(201,169,110,0.22),transparent_55%),radial-gradient(circle_at_80%_25%,rgba(201,138,122,0.18),transparent_55%)]" />
      <div className="container-h relative grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <Reveal variant="left">
          <span className="eyebrow text-[var(--color-primary)]">
            {t("qr_section_eyebrow")}
          </span>
          <h2 className="fs-display-lg mt-3 font-display font-semibold leading-tight">
            {t("qr_section_title")}
          </h2>
          <p className="fs-body-lg mt-5 max-w-xl text-white/70">
            {t("qr_section_desc")}
          </p>

          <ol className="mt-8 space-y-5">
            {[
              { n: "01", t: t("qr_step1_t"), d: t("qr_step1_d") },
              { n: "02", t: t("qr_step2_t"), d: t("qr_step2_d") },
              { n: "03", t: t("qr_step3_t"), d: t("qr_step3_d") },
            ].map((s, i) => (
              <Reveal
                as="li"
                key={s.n}
                variant="left"
                delay={i * 0.1}
                className="flex gap-4"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] font-display text-sm font-bold text-[#1f1610] sm:h-13 sm:w-13">
                  {s.n}
                </span>
                <div>
                  <h4 className="font-display text-lg font-semibold">{s.t}</h4>
                  <p className="text-sm text-white/60">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </ol>

          <Link
            href="/qr"
            className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] px-7 text-[13px] font-semibold uppercase tracking-[0.22em] text-[#1f1610] shadow-[var(--shadow-gold)] transition hover:brightness-110"
          >
            {t("qr_section_cta")}
            <ArrowRight
              className={`h-4 w-4 ${dir === "rtl" ? "flip-rtl" : ""}`}
            />
          </Link>
        </Reveal>

        <Reveal
          variant="scale"
          className="relative mx-auto w-full max-w-[300px] sm:max-w-sm"
        >
          <div className="relative aspect-[3/4] rotate-0 rounded-2xl bg-gradient-to-br from-white to-[#f5efe2] p-8 shadow-2xl ring-1 ring-white/10 transition-transform duration-500 lg:rotate-[-2deg] lg:hover:rotate-0">
            <div className="flex flex-col items-center text-center text-[var(--color-ink)]">
              <Logo color="dark" variant="mark" className="h-12 w-12" />
              <p className="mt-3 font-display text-sm tracking-wider">
                MASHAER
              </p>
              <div className="my-6 h-44 w-44 rounded-md bg-white p-3 shadow-inner ring-1 ring-[var(--color-border)]">
                <FakeQR />
              </div>
              <p className="font-display text-lg font-semibold">
                {t("memory_title")}
              </p>
              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                mashaerjewellery.com/memory
              </p>
              <div className="divider-gold w-12" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-primary-dark)]">
                Scan • Share • Keep
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FakeQR() {
  const cells = Array.from({ length: 15 * 15 }, (_, i) => {
    const x = i % 15;
    const y = Math.floor(i / 15);
    const corner =
      (x < 3 && y < 3) ||
      (x > 11 && y < 3) ||
      (x < 3 && y > 11) ||
      (x === 1 && y === 1) ||
      (x === 13 && y === 1) ||
      (x === 1 && y === 13);
    const fill = corner || (x * 7 + y * 13) % 5 < 2;
    return fill;
  });
  return (
    <div
      className="grid h-full w-full gap-px"
      style={{ gridTemplateColumns: "repeat(15, 1fr)" }}
    >
      {cells.map((on, i) => (
        <div
          key={i}
          className={on ? "bg-[var(--color-ink)]" : "bg-transparent"}
        />
      ))}
    </div>
  );
}

/* =============================================================================
 *  STORY STRIP — blush wash, editorial quote
 * ============================================================================*/

export function StoryStrip() {
  const { t } = useT();
  return (
    <section className="bg-blush-wash section-fluid relative overflow-hidden">
      <FloralPattern
        className="absolute top-1/2 left-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2"
        opacity={0.05}
      />
      <div className="container-h relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="divider-rose mx-auto">
            <span className="text-[11px] font-semibold uppercase tracking-[0.3em]">
              Mashaer — مشاعر
            </span>
          </div>
          <h2 className="fs-display-lg mt-3 font-display font-semibold">
            {t("story_title")}
          </h2>
          <div className="relative mt-6">
            <span
              aria-hidden
              className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 font-display text-6xl leading-none text-[var(--color-primary)]/40"
            >
              “
            </span>
            <p className="fs-body-lg relative italic text-[var(--color-ink-soft)]">
              {t("story_text")}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="badge btn-outline-rose !rounded-full !border !px-3 !py-1 !text-[11px]">
              {t("value_meaning")}
            </span>
            <span className="badge btn-outline-rose !rounded-full !border !px-3 !py-1 !text-[11px]">
              {t("value_timeless")}
            </span>
            <span className="badge btn-outline-rose !rounded-full !border !px-3 !py-1 !text-[11px]">
              {t("value_quiet")}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* =============================================================================
 *  FINAL CTA — wrapper around shared band
 * ============================================================================*/

export function HomeFinalCta() {
  const { t } = useT();
  return (
    <FinalCtaBand
      eyebrow={t("cta_ready_eyebrow")}
      title={t("cta_ready_title")}
      subtitle={t("cta_ready_sub")}
      ctaLabel={t("cta_ready_btn")}
      ctaHref="/products"
    />
  );
}
