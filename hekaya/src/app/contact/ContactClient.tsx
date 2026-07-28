"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { useT } from "@/lib/useT";
import { useAdminSettings } from "@/stores/adminSettings.store";
import { whatsappUrl, cn } from "@/lib/utils";
import { toast } from "sonner";

const MAX_MESSAGE = 500;

export default function ContactPage() {
  const { t, locale } = useT();
  const whatsapp = useAdminSettings((s) => s.store.whatsapp);
  const storeEmail = useAdminSettings((s) => s.store.email);
  const storePhone = useAdminSettings((s) => s.store.phone);
  const storeAddress = useAdminSettings((s) => s.store.address);
  const waUrl = whatsappUrl(whatsapp);
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "general",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const topics = useMemo(
    () =>
      [
        { id: "order", label: t("contact_topic_order") },
        { id: "qr", label: t("contact_topic_qr") },
        { id: "custom", label: t("contact_topic_custom") },
        { id: "general", label: t("contact_topic_general") },
        { id: "other", label: t("contact_topic_other") },
      ] as const,
    [t],
  );

  const faq = [
    { q: t("contact_faq_q1"), a: t("contact_faq_a1") },
    { q: t("contact_faq_q2"), a: t("contact_faq_a2") },
    { q: t("contact_faq_q3"), a: t("contact_faq_a3") },
    { q: t("contact_faq_q4"), a: t("contact_faq_a4") },
  ];

  const overLimit = form.message.length > MAX_MESSAGE;

  return (
    <div className="container-h py-14 lg:py-20">
      <div className="text-center">
        <span className="eyebrow">{t("contact_title")}</span>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">
          {t("contact_title")}
        </h1>
        <p className="mt-3 text-[var(--color-ink-muted)]">{t("contact_sub")}</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (overLimit || sending) return;
            setSending(true);
            try {
              const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, locale }),
              });
              if (!res.ok) {
                // Only ever claim success on a 2xx. The previous version
                // reported "message sent" unconditionally after a setTimeout.
                const { error } = await res
                  .json()
                  .catch(() => ({ error: "" }));
                toast.error(
                  error === "rate_limited"
                    ? t("contact_rate_limited")
                    : t("contact_send_failed"),
                );
                return;
              }
              toast.success(t("message_sent"));
              setForm({ name: "", email: "", topic: "general", message: "" });
            } catch {
              toast.error(t("contact_send_failed"));
            } finally {
              setSending(false);
            }
          }}
          className="rounded-xl bg-white p-7 shadow-sm ring-1 ring-[var(--color-border)]"
        >
          <div className="grid gap-4">
            <div>
              <label className="label">{t("full_name")}</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">{t("email")}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="input"
              />
            </div>
            <div>
              <label className="label">{t("contact_topic_label")}</label>
              <select
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="input"
              >
                {topics.map((tp) => (
                  <option key={tp.id} value={tp.id}>
                    {tp.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t("message")}</label>
              <textarea
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                className="input resize-none"
                maxLength={MAX_MESSAGE * 2}
              />
              <p
                className={cn(
                  "mt-1 text-end text-xs",
                  overLimit
                    ? "text-[var(--color-error)]"
                    : "text-[var(--color-ink-faint)]",
                )}
              >
                {form.message.length}/{MAX_MESSAGE} {t("message_counter")}
              </p>
            </div>
            <button
              type="submit"
              disabled={sending || overLimit}
              className="btn btn-gold btn-lg"
            >
              <Send className="h-4 w-4" />
              {sending ? t("loading") : t("send")}
            </button>
          </div>
        </motion.form>

        <aside className="space-y-5">
          {/* WhatsApp banner — only when a real number is configured */}
          {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl bg-gradient-to-br from-[#25d366]/15 to-[#128c7e]/10 p-5 ring-1 ring-[#25d366]/30 transition hover:from-[#25d366]/25"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#25d366] text-white">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--color-ink)]">
                  {t("contact_whatsapp_title")}
                </p>
                <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                  {t("contact_whatsapp_sub")}
                </p>
                <span className="mt-2 inline-block text-xs font-semibold uppercase tracking-wider text-[#0e7461]">
                  {t("contact_whatsapp_btn")} →
                </span>
              </div>
            </div>
          </a>
          )}

          {/* Showroom card */}
          <div className="rounded-xl bg-white p-5 ring-1 ring-[var(--color-border)]">
            <div className="mb-3 aspect-[16/9] overflow-hidden rounded-lg bg-gradient-to-br from-[#f5efe6] via-[#ece4d2] to-[#dfd2b8] ring-1 ring-[var(--color-border)]">
              <div className="flex h-full items-center justify-center">
                <MapPin className="h-10 w-10 text-[var(--color-primary)]" />
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
              {t("contact_showroom_title")}
            </p>
            <p className="mt-1 text-sm font-medium">
              {storeAddress || t("contact_showroom_addr")}
            </p>
          </div>

          {/* Email and phone come from Admin → Settings; each card is omitted
              when unset rather than showing a placeholder. */}
          {storeEmail && (
            <ContactCard
              Icon={Mail}
              title={locale === "ar" ? "البريد" : "Email"}
              value={storeEmail}
              href={`mailto:${storeEmail}`}
            />
          )}
          {storePhone && (
            <ContactCard
              Icon={Phone}
              title={locale === "ar" ? "الهاتف" : "Phone"}
              value={storePhone}
              href={`tel:${storePhone.replace(/[^\d+]/g, "")}`}
            />
          )}
          <ContactCard
            Icon={Clock}
            title={locale === "ar" ? "ساعات العمل" : "Hours"}
            value={
              locale === "ar"
                ? "السبت – الخميس · 10ص – 8م"
                : "Sat – Thu · 10am – 8pm"
            }
          />
        </aside>
      </div>

      {/* FAQ */}
      <section className="mt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">{t("contact_faq_title")}</span>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            {t("contact_faq_title")}
          </h2>
        </div>
        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {faq.map((it, i) => (
            <details
              key={i}
              className="group rounded-lg bg-white p-5 ring-1 ring-[var(--color-border)] open:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[var(--color-ink)]">
                <span>{it.q}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-[var(--color-primary)] transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                {it.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function ContactCard({
  Icon,
  title,
  value,
  href,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  /** When set, the value becomes a mailto:/tel: link. */
  href?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-white p-5 ring-1 ring-[var(--color-border)]">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
          {title}
        </p>
        {href ? (
          <a
            href={href}
            dir="ltr"
            className="mt-0.5 block text-sm font-medium transition hover:text-[var(--color-primary-dark)] rtl:text-end"
          >
            {value}
          </a>
        ) : (
          <p className="mt-0.5 text-sm font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}
