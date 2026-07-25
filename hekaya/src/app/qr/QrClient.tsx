"use client";

import Link from "next/link";
import { QrCode, Camera, Lock, Heart, Sparkles, ScanLine } from "lucide-react";
import { useT } from "@/lib/useT";
import { Reveal } from "@/components/ui/Reveal";

export default function QrInfoPage() {
  const { t, locale } = useT();
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--color-bg-dark)] py-24 text-white">
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_30%_50%,#c9a96e33,transparent_50%),radial-gradient(circle_at_80%_30%,#c9a96e22,transparent_50%)]" />
        <div className="container-h relative text-center">
          <Reveal>
            <span className="eyebrow text-[var(--color-primary)]">
              {t("qr_section_eyebrow")}
            </span>
            <h1 className="mt-3 font-display text-5xl font-semibold sm:text-6xl">
              {t("qr_section_title")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-white/70">
              {t("qr_section_desc")}
            </p>
            <Link href="/products" className="btn btn-gold btn-lg mt-8">
              {t("hero_cta_shop")}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Steps */}
      <section className="section-pad">
        <div className="container-h">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { Icon: ScanLine, t: t("qr_step1_t"), d: t("qr_step1_d") },
              { Icon: Camera, t: t("qr_step2_t"), d: t("qr_step2_d") },
              { Icon: Heart, t: t("qr_step3_t"), d: t("qr_step3_d") },
            ].map((s, i) => (
              <Reveal
                key={s.t}
                delay={i * 0.1}
                className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-[var(--color-border)]"
              >
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]">
                  <s.Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">
                  {s.t}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                  {s.d}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Try it */}
      <section className="section-pad bg-[var(--color-bg-secondary)]">
        <div className="container-h text-center">
          <Sparkles className="mx-auto h-7 w-7 text-[var(--color-primary)]" />
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            {locale === "ar" ? "جربها الآن" : "Try It Live"}
          </h2>
          <p className="mt-3 text-[var(--color-ink-muted)]">
            {locale === "ar"
              ? "افتح صفحة ذكرى تجريبية واختبر التجربة كاملة."
              : "Open a demo memory page and experience the full flow."}
          </p>
          <Link href="/memory/demo" className="btn btn-gold btn-lg mt-6">
            <QrCode className="h-4 w-4" />
            {locale === "ar" ? "افتح ذكرى تجريبية" : "Open Demo Memory"}
          </Link>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3 sm:text-start">
            <Feature
              Icon={Lock}
              title={locale === "ar" ? "محمية بـ PIN" : "PIN Protected"}
              d={
                locale === "ar"
                  ? "٤ أرقام لحماية الخصوصية"
                  : "4 digits to protect privacy"
              }
            />
            <Feature
              Icon={Camera}
              title={locale === "ar" ? "حتى ٣ صور" : "Up to 3 photos"}
              d={
                locale === "ar"
                  ? "ذكرى مع صور حقيقية"
                  : "Real photos that matter"
              }
            />
            <Feature
              Icon={Heart}
              title={locale === "ar" ? "للأبد" : "Lasts Forever"}
              d={
                locale === "ar"
                  ? "تعديل في أي وقت"
                  : "Edit anytime, lives forever"
              }
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Feature({
  Icon,
  title,
  d,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  d: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-[var(--color-ink-muted)]">{d}</p>
      </div>
    </div>
  );
}
