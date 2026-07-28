import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  amount: number,
  locale: "ar" | "en" = "en",
): string {
  const symbol = locale === "ar" ? "د.إ" : "AED";
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  return locale === "ar" ? `${formatted} ${symbol}` : `${symbol} ${formatted}`;
}

export function formatDate(
  date: Date | string,
  locale: "ar" | "en" = "en",
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-AE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Cryptographically-strong random bytes with a graceful fallback.
 * Uses Web Crypto (browser + Node 19+); falls back to Math.random only when
 * `crypto.getRandomValues` is unavailable (very old runtimes).
 */
function randomValues(len: number): Uint8Array {
  const out = new Uint8Array(len);
  const c = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (c?.getRandomValues) {
    c.getRandomValues(out);
  } else {
    for (let i = 0; i < len; i++) out[i] = Math.floor(Math.random() * 256);
  }
  return out;
}

// NOTE: `generateOrderId` used to live here. Order ids are now minted by
// `place_order` in the database, along with the QR tokens, so the browser never
// chooses a security-relevant identifier (H10).

/**
 * URL-safe slug from text: lowercase, runs of non-alphanumerics collapse to a
 * single hyphen, accents stripped. Non-Latin scripts (e.g. Arabic) yield "" —
 * callers should fall back to the other language or a random suffix.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining accents
    .replace(/[^a-z0-9]+/g, "-") // anything else → hyphen
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .slice(0, 60);
}

/**
 * Short random string over an ambiguity-free alphabet (no 0/o/1/l/i), used for
 * unique slug suffixes. QR tokens themselves are minted by the database (H10).
 *
 * Uses rejection sampling rather than `byte % 31`: 256 is not divisible by 31,
 * so a plain modulo over-represents the first eight characters of the alphabet
 * (L8). 248 = 31 × 8, so bytes 248-255 are discarded and redrawn.
 */
export function generateToken(len = 8): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789"; // 31 chars
  const limit = 248; // largest multiple of 31 that fits in a byte
  let out = "";
  while (out.length < len) {
    // Over-draw a little so a run of rejections rarely needs a second batch.
    for (const b of randomValues(len - out.length + 4)) {
      if (b < limit) out += chars[b % chars.length];
      if (out.length === len) break;
    }
  }
  return out;
}

/**
 * Minimum length for a NEW password (signup, reset). These accounts hold order
 * history, home addresses, phone numbers and family photographs, so the bare
 * Supabase default of 6 was too low (M20).
 *
 * Sign-in deliberately keeps the old minimum: existing accounts may still have
 * a 6-character password, and locking them out of their own data is worse than
 * the weak password. They are upgraded on their next reset.
 *
 * This is the client-side half. Raise Supabase's own minimum and enable its
 * HaveIBeenPwned check in Dashboard → Authentication → Policies — the server is
 * the only place the rule is actually enforced.
 */
/**
 * Max units of one product per order. Must stay in sync with the
 * `v_qty > 50` check in `place_order` — the server rejects anything above this
 * with 'Bad quantity', which checkout maps to a specific message.
 */
export const MAX_QTY_PER_ITEM = 50;

export const MIN_PASSWORD_NEW = 8;
export const MIN_PASSWORD_SIGNIN = 6;

/**
 * Validate a post-auth redirect target, falling back to `/`.
 *
 * Only same-origin absolute paths are allowed. Rejected:
 *   - "//evil.example"  protocol-relative → another origin
 *   - "/\evil.example"  browsers normalise the backslash and treat it the same
 *   - "https://…"       absolute URL
 *   - anything relative, which could resolve unpredictably
 *
 * Shared by AuthForm, GoogleSignInButton and the OAuth callback route so the
 * three cannot drift — the callback route previously did no validation at all
 * beyond prefixing the origin (M19).
 */
export function safeRedirectPath(value: string | null | undefined): string {
  if (!value) return "/";
  if (!value.startsWith("/")) return "/";
  if (value.startsWith("//") || value.startsWith("/\\")) return "/";
  return value;
}

/**
 * Strip non-digits from a phone string and build a wa.me deep link, or return
 * `null` when no usable number is configured.
 *
 * This deliberately has NO placeholder fallback. It used to default to
 * "971500000000", which meant the floating WhatsApp button — the most-used
 * contact route on a mobile jewellery site — silently pointed at a fake number
 * on every page, and kept doing so even at call sites that correctly read the
 * admin setting. Returning null forces callers to hide the affordance instead
 * of offering the customer a dead link.
 */
export function whatsappUrl(phone?: string, message?: string): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  // A UAE mobile is 12 digits with the country code (971 5X XXX XXXX). Anything
  // shorter than a plausible international number is treated as unconfigured.
  if (digits.length < 8) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
