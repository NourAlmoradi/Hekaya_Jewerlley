import type { Order, Locale } from "@/types";
import { formatPrice } from "@/lib/utils";

/**
 * Base URL for every link in an email (order + memory cards). In production
 * this MUST come from env — a silent localhost fallback would email dead links
 * to customers. We accept NEXT_PUBLIC_SITE_URL, then Vercel's own URL, and only
 * fall back to localhost in dev. In production with neither set we log loudly.
 */
function resolveSite(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  if (process.env.NODE_ENV === "production") {
    console.error(
      "[email] NEXT_PUBLIC_SITE_URL is not set — email links will be broken.",
    );
    return "";
  }
  return "http://localhost:3000";
}

const SITE = resolveSite();

/* Brand palette (kept in sync with globals.css @theme) */
const GOLD = "#c9a96e";
const GOLD_DARK = "#a8853f";
const CREAM = "#faf6ef";
const BLUSH = "#f4e4dc";
const INK = "#1a1a1a";
const INK_MUTED = "#666666";
const BORDER = "#eae6e0";

/**
 * Shared branded shell — bilingual, RTL-aware, email-client-safe
 * (inline styles + table layout only).
 */
function shell(locale: Locale, bodyHtml: string, preheader: string) {
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const tagline = isAr
    ? "بعض المشاعر تستحق الخلود"
    : "Some Feelings Deserve Eternity";
  return `<!DOCTYPE html>
<html dir="${dir}" lang="${isAr ? "ar" : "en"}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${CREAM};">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${BORDER};">
        <!-- Header -->
        <tr>
          <td align="center" style="background:linear-gradient(135deg,#f8efe4,${BLUSH});padding:28px 24px 22px;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:700;letter-spacing:4px;color:${GOLD_DARK};">MASHAER</div>
            <div style="font-family:Georgia,serif;font-size:13px;color:${INK_MUTED};letter-spacing:2px;margin-top:2px;">${isAr ? "مشاعر — مجوهرات" : "J E W E L L E R Y"}</div>
            <div style="width:48px;height:2px;background:${GOLD};margin:14px auto 10px;"></div>
            <div style="font-family:Georgia,serif;font-style:italic;font-size:12px;color:${INK_MUTED};">${tagline}</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 28px;font-family:system-ui,'Segoe UI',Tahoma,sans-serif;color:${INK};font-size:15px;line-height:1.7;text-align:start;">
            ${bodyHtml}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td align="center" style="background:${CREAM};border-top:1px solid ${BORDER};padding:18px 24px;">
            <div style="font-family:system-ui,sans-serif;font-size:11px;color:${INK_MUTED};">
              © ${new Date().getFullYear()} Mashaer Jewellery — <a href="${SITE}" style="color:${GOLD_DARK};text-decoration:none;">mashaerjewellery.com</a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function goldButton(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px auto;"><tr><td align="center" style="border-radius:999px;background:linear-gradient(135deg,${GOLD},${GOLD_DARK});">
    <a href="${href}" style="display:inline-block;padding:13px 32px;font-family:system-ui,sans-serif;font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none;">${label}</a>
  </td></tr></table>`;
}

export const orderConfirmation = (o: Order, locale: Locale) => {
  const isAr = locale === "ar";
  const rows = o.items
    .map(
      (i) => `<tr>
        <td style="padding:10px 8px;border-bottom:1px solid ${BORDER};font-size:14px;">${i.name[locale]}</td>
        <td align="center" style="padding:10px 8px;border-bottom:1px solid ${BORDER};font-size:14px;color:${INK_MUTED};">×${i.qty}</td>
        <td align="${isAr ? "left" : "right"}" style="padding:10px 8px;border-bottom:1px solid ${BORDER};font-size:14px;font-weight:600;">${formatPrice(i.price * i.qty, locale)}</td>
      </tr>`,
    )
    .join("");
  const subject = isAr
    ? `تأكيد طلبك ${o.id} ✨`
    : `Order confirmed — ${o.id} ✨`;
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 6px;color:${INK};">${isAr ? `شكراً لكِ، ${o.customerName}` : `Thank you, ${o.customerName}`}</h1>
    <p style="margin:0 0 18px;color:${INK_MUTED};">${isAr ? "تم استلام طلبك وسنبدأ بتحضيره بكل عناية." : "We've received your order and will prepare it with care."}</p>
    <div style="background:${CREAM};border:1px solid ${BORDER};border-radius:10px;padding:14px 16px;margin-bottom:18px;">
      <span style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${INK_MUTED};">${isAr ? "رقم الطلب" : "Order number"}</span><br>
      <strong style="font-size:17px;letter-spacing:1px;color:${GOLD_DARK};">${o.id}</strong>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
      <tr>
        <td colspan="2" style="padding:14px 8px 0;font-weight:700;">${isAr ? "الإجمالي" : "Total"}</td>
        <td align="${isAr ? "left" : "right"}" style="padding:14px 8px 0;font-weight:700;color:${GOLD_DARK};font-size:16px;">${formatPrice(o.total, locale)}</td>
      </tr>
    </table>
    ${goldButton(`${SITE}/order-confirmation/${o.id}`, isAr ? "عرض الطلب" : "View order")}
    <p style="margin:0;font-size:12px;color:${INK_MUTED};text-align:center;">${isAr ? "سنرسل لك بريداً آخر عند شحن الطلب." : "We'll email you again when your order ships."}</p>`;
  return {
    subject,
    html: shell(
      locale,
      body,
      isAr ? `تم تأكيد طلبك ${o.id}` : `Your order ${o.id} is confirmed`,
    ),
  };
};

/**
 * Memory-link email. `pin` is optional: in the current MVP the customer sets
 * their PIN on the /memory/[token] page after they open the link, so we send
 * the link only. Once PINs are minted at checkout (RESEND_SETUP step 9) the
 * plaintext PIN can be passed here and it will be shown.
 */
export const memoryLink = (
  o: Order,
  token: string,
  label: string,
  locale: Locale,
  pin?: string,
) => {
  const isAr = locale === "ar";
  const url = `${SITE}/memory/${token}`;
  const subject = isAr
    ? `بطاقة الذكرى — ${label}`
    : `Your QR Memory — ${label}`;
  const pinBlock = pin
    ? `<div style="background:${BLUSH};border-radius:10px;padding:14px;text-align:center;margin:18px 0;">
         <span style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${INK_MUTED};">${isAr ? "الرمز السري" : "Your PIN"}</span><br>
         <strong style="font-size:26px;letter-spacing:8px;color:${GOLD_DARK};">${pin}</strong>
       </div>`
    : "";
  const intro = pin
    ? isAr
      ? "اضغطي الزر ثم أدخلي الرمز السري لإضافة الصور والرسالة."
      : "Open the link, then enter the PIN to add photos and a message."
    : isAr
      ? "اضغطي الزر لإنشاء رمز سري ثم أضيفي الصور والرسالة الخاصة بكِ."
      : "Open the link to set a PIN, then add your photos and message.";
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 6px;color:${INK};">${isAr ? "بطاقة الذكرى الخاصة بكِ" : "Your private memory card"}</h1>
    <p style="margin:0 0 6px;color:${INK_MUTED};">${isAr ? "القطعة:" : "For:"} <strong style="color:${INK};">${label}</strong></p>
    <p style="margin:0 0 4px;color:${INK_MUTED};">${intro}</p>
    ${pinBlock}
    ${goldButton(url, isAr ? "فتح بطاقة الذكرى" : "Open memory card")}
    <p style="margin:0 0 6px;font-size:12px;color:${INK_MUTED};text-align:center;word-break:break-all;"><a href="${url}" style="color:${GOLD_DARK};">${url}</a></p>
    <p style="margin:0;font-size:12px;color:${INK_MUTED};text-align:center;">${isAr ? "احتفظي بهذا البريد في مكان آمن — أي شخص لديه الرابط والرمز يمكنه مشاهدة الذكرى." : "Keep this email safe — anyone with the link + PIN can view the memory."}</p>`;
  return {
    subject,
    html: shell(
      locale,
      body,
      isAr ? "بطاقة ذكرى جديدة بانتظارك" : "A new memory card awaits you",
    ),
  };
};

/**
 * One email listing EVERY memory card in the order (instead of one email per
 * token). Keeps a per-piece order from sending a flurry of separate emails.
 */
export const memoriesLinkAll = (o: Order, locale: Locale) => {
  const isAr = locale === "ar";
  const count = o.qrTokens.length;
  const cards = o.qrTokens
    .map((token, i) => {
      const label = o.qrTokenLabels?.[i] ?? "Mashaer";
      const url = `${SITE}/memory/${token}`;
      return `<div style="border:1px solid ${BORDER};border-radius:10px;padding:14px 16px;margin-bottom:12px;">
        <p style="margin:0 0 8px;color:${INK};font-weight:600;font-size:14px;">${label}</p>
        <a href="${url}" style="display:inline-block;padding:9px 20px;border-radius:999px;background:linear-gradient(135deg,${GOLD},${GOLD_DARK});color:#ffffff;text-decoration:none;font-size:12px;font-weight:600;letter-spacing:1px;">${isAr ? "فتح بطاقة الذكرى" : "Open memory card"}</a>
        <p style="margin:8px 0 0;font-size:11px;color:${INK_MUTED};word-break:break-all;"><a href="${url}" style="color:${GOLD_DARK};">${url}</a></p>
      </div>`;
    })
    .join("");
  const subject = isAr
    ? `بطاقات الذكرى الخاصة بطلبك — ${o.id}`
    : `Your QR Memory cards — ${o.id}`;
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 6px;color:${INK};">${isAr ? "بطاقات الذكرى الخاصة بكِ" : "Your private memory cards"}</h1>
    <p style="margin:0 0 16px;color:${INK_MUTED};">${
      isAr
        ? `طلبك يحتوي على ${count} بطاقة ذكرى. افتحي كل بطاقة لتعيين رمز سري ثم أضيفي الصور والرسالة.`
        : `Your order includes ${count} memory card${count === 1 ? "" : "s"}. Open each one to set a PIN, then add your photos and message.`
    }</p>
    ${cards}
    <p style="margin:14px 0 0;font-size:12px;color:${INK_MUTED};text-align:center;">${isAr ? "احتفظي بهذا البريد في مكان آمن — أي شخص لديه الرابط والرمز يمكنه مشاهدة الذكرى." : "Keep this email safe — anyone with the link + PIN can view the memory."}</p>`;
  return {
    subject,
    html: shell(
      locale,
      body,
      isAr ? "بطاقات الذكرى بانتظارك" : "Your memory cards await you",
    ),
  };
};

export const adminNewOrder = (o: Order) => {
  const rows = o.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid ${BORDER};font-size:13px;">${i.name.en}</td><td align="center" style="padding:6px 8px;border-bottom:1px solid ${BORDER};font-size:13px;">×${i.qty}</td><td align="right" style="padding:6px 8px;border-bottom:1px solid ${BORDER};font-size:13px;">${formatPrice(i.price * i.qty, "en")}</td></tr>`,
    )
    .join("");
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:20px;margin:0 0 10px;">🔔 New order <span style="color:${GOLD_DARK};">${o.id}</span></h1>
    <p style="margin:0 0 4px;"><strong>${o.customerName}</strong> &lt;${o.email}&gt;</p>
    <p style="margin:0 0 14px;color:${INK_MUTED};font-size:13px;">${o.shippingAddress.addressLine}, ${o.shippingAddress.city}, ${o.shippingAddress.emirate}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
      <tr><td colspan="2" style="padding:10px 8px 0;font-weight:700;">Total</td><td align="right" style="padding:10px 8px 0;font-weight:700;color:${GOLD_DARK};">${formatPrice(o.total, "en")}</td></tr>
    </table>
    ${goldButton(`${SITE}/admin/orders`, "Open admin → Orders")}`;
  return {
    subject: `🔔 New order ${o.id} — ${formatPrice(o.total, "en")}`,
    html: shell("en", body, `New order ${o.id} from ${o.customerName}`),
  };
};
