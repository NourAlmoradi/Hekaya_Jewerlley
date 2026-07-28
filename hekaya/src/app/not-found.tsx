import Link from "next/link";
import { cookies } from "next/headers";
import { t, type TKey } from "@/lib/i18n";
import type { Locale } from "@/types";

/**
 * 404 page.
 *
 * Two fixes (M1):
 *  - Localised. This is a server component, so it reads the locale cookie the
 *    same way the root layout does. It was hardcoded English on a site that
 *    defaults to Arabic with RTL, so most visitors met an error page in a
 *    language the rest of the site never used.
 *  - The buttons carry the `btn` base class. `btn-gold` / `btn-outline` set only
 *    colours; `.btn` is what supplies inline-flex, padding, radius and font
 *    size, so without it these rendered as unpadded square gold text.
 */
export default async function NotFound() {
  const cookieStore = await cookies();
  // Same cookie name the root layout reads (layout.tsx:121).
  const locale: Locale =
    cookieStore.get("mashaer-locale")?.value === "en" ? "en" : "ar";
  const tr = (k: TKey) => t(k, locale);

  return (
    <div
      className="container-h flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary-dark)]">
        404
      </p>
      <h1 className="fs-display-md max-w-xl text-[var(--color-ink)]">
        {tr("not_found_title")}
      </h1>
      <p className="max-w-md text-[var(--color-ink-muted)]">
        {tr("not_found_body")}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn btn-gold btn-lg">
          {tr("back_to_home")}
        </Link>
        <Link href="/products" className="btn btn-outline btn-lg">
          {tr("shop_jewellery")}
        </Link>
      </div>
    </div>
  );
}
