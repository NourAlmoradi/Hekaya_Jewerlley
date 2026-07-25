"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useT } from "@/lib/useT";
import { useAdminSettings } from "@/stores/adminSettings.store";
import { whatsappUrl } from "@/lib/utils";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M20.52 3.48A11.78 11.78 0 0 0 12.05 0C5.5 0 .2 5.3.2 11.85a11.8 11.8 0 0 0 1.6 5.93L0 24l6.4-1.68a11.85 11.85 0 0 0 5.65 1.43h.01c6.55 0 11.85-5.3 11.85-11.85 0-3.16-1.23-6.13-3.39-8.42zM12.05 21.6h-.01a9.74 9.74 0 0 1-4.97-1.36l-.36-.21-3.8 1 1.02-3.7-.23-.38a9.78 9.78 0 0 1-1.5-5.2c0-5.4 4.4-9.8 9.83-9.8 2.62 0 5.08 1.02 6.93 2.88a9.7 9.7 0 0 1 2.88 6.93c0 5.42-4.4 9.84-9.79 9.84zm5.39-7.34c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.66-1.6-.91-2.18-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.5.07-.77.37-.27.3-1.02 1-1.02 2.43 0 1.43 1.05 2.82 1.2 3.02.15.2 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.7.22 1.34.19 1.85.12.56-.08 1.75-.71 2-1.4.25-.7.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35z" />
  </svg>
);

export function Footer() {
  const { t } = useT();
  const whatsapp = useAdminSettings((s) => s.store.whatsapp);
  const instagram = useAdminSettings((s) => s.store.instagram);
  const facebook = useAdminSettings((s) => s.store.facebook);
  // Strip leading "@" or "/" so we can safely compose social URLs.
  const igHandle = instagram.replace(/^[@/]+/, "").trim();
  const fbHandle = facebook.replace(/^[@/]+/, "").trim();
  const igUrl = igHandle
    ? `https://instagram.com/${igHandle}`
    : "https://instagram.com";
  const fbUrl = fbHandle
    ? `https://facebook.com/${fbHandle}`
    : "https://facebook.com";
  return (
    <footer className="mt-1 bg-[var(--color-bg-dark)] text-white/80">
      <div className="container-h grid grid-cols-1 gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="space-y-4">
          <Logo color="light" />
          <p className="max-w-xs text-sm leading-relaxed text-white/60">
            {t("footer_about_d")}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <SocialLink href={igUrl} label="Instagram">
              <InstagramIcon className="h-4 w-4" />
            </SocialLink>
            <SocialLink href={fbUrl} label="Facebook">
              <FacebookIcon className="h-4 w-4" />
            </SocialLink>
            <SocialLink
              href={whatsappUrl(whatsapp)}
              label={t("footer_whatsapp_label")}
            >
              <WhatsAppIcon className="h-4 w-4" />
            </SocialLink>
          </div>
        </div>

        {/* Shop */}
        <FooterCol title={t("footer_shop")}>
          <FLink href="/products">{t("nav_shop")}</FLink>
          <FLink href="/collections">{t("nav_collections")}</FLink>
          <FLink href="/qr">{t("nav_qr")}</FLink>
          <FLink href="/about">{t("nav_about")}</FLink>
        </FooterCol>

        {/* Help */}
        <FooterCol title={t("footer_help")}>
          <FLink href="/contact">{t("nav_contact")}</FLink>
          <FLink href="/policies?tab=shipping">{t("policy_shipping")}</FLink>
          <FLink href="/policies?tab=returns">{t("policy_returns")}</FLink>
          <FLink href="/policies?tab=privacy">{t("policy_privacy")}</FLink>
          <FLink href="/policies?tab=terms">{t("policy_terms")}</FLink>
        </FooterCol>

        {/* Newsletter / Contact */}
        <div className="space-y-4">
          <h4 className="font-display text-lg font-semibold text-white">
            {t("footer_newsletter")}
          </h4>
          <p className="text-sm text-white/60">{t("footer_newsletter_d")}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="flex w-full overflow-hidden rounded-full border border-white/15 bg-white/5"
          >
            <input
              type="email"
              required
              placeholder={t("email")}
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-white/40 outline-none"
            />
            <button
              type="submit"
              className="shrink-0 whitespace-nowrap bg-[var(--color-primary)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[var(--color-primary-dark)] sm:px-6"
            >
              {t("subscribe")}
            </button>
          </form>
          <ul className="space-y-2 pt-2 text-sm text-white/60">
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" />
              hello@mashaerjewellery.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" />
              +971 50 000 0000
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--color-primary)]" />
              Dubai, UAE
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-h flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/45 md:flex-row">
          <p>
            © {new Date().getFullYear()} Mashaer Jewellery. {t("footer_rights")}
            .
          </p>
          <div className="flex items-center gap-3">
            <PaymentBadge>VISA</PaymentBadge>
            <PaymentBadge>MASTER</PaymentBadge>
            <PaymentBadge>APPLE PAY</PaymentBadge>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-4 font-display text-lg font-semibold text-white">
        {title}
      </h4>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  );
}

function FLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-white/60 transition hover:text-[var(--color-primary)]"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
    >
      {children}
    </a>
  );
}

function PaymentBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-white/15 px-2 py-0.5 text-[9px] font-bold tracking-widest text-white/70">
      {children}
    </span>
  );
}
