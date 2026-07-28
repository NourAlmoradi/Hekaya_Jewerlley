import "server-only";
import { resend, FROM, REPLY_TO, ADMIN_ALERT } from "@/lib/email/resend";
import {
  adminNewOrder,
  memoriesLinkAll,
  orderConfirmation,
} from "@/lib/email/templates";
import type { Locale, Order } from "@/types";

/**
 * Send the three order emails (customer confirmation, memory links, admin
 * alert) for an already-fetched order.
 *
 * Called by /api/email/order, which owns the idempotency guard: it claims
 * `orders.emails_sent_at` with a conditional UPDATE before calling this, so a
 * replayed request cannot re-send (H7). Do not call this directly without a
 * comparable guard.
 *
 * Returns the list of failed sends (empty = all delivered). Never throws on a
 * single send failure; the caller decides what to do with the failures.
 */
export async function sendOrderEmails(
  order: Order,
  locale: Locale,
): Promise<{ ok: boolean; failures: string[]; reason?: string }> {
  if (!resend) return { ok: false, failures: [], reason: "no_key" };
  const mailer = resend;

  const failures: string[] = [];
  const send = async (
    kind: string,
    msg: { to: string; subject: string; html: string },
  ) => {
    const { error } = await mailer.emails.send({
      from: FROM,
      to: msg.to,
      replyTo: REPLY_TO,
      subject: msg.subject,
      html: msg.html,
    });
    if (error) {
      console.error(`[sendOrderEmails] ${kind} failed:`, error.message);
      failures.push(kind);
    }
    // Resend free tier allows 2 req/sec — pace sequential sends.
    await new Promise((r) => setTimeout(r, 600));
  };

  // 1) Customer order confirmation
  const conf = orderConfirmation(order, locale);
  await send("confirmation", {
    to: order.email,
    subject: conf.subject,
    html: conf.html,
  });

  // 2) One email listing every memory card (link only — PIN is set on the page).
  if (order.qrTokens.length > 0) {
    const m = memoriesLinkAll(order, locale);
    await send("memories", {
      to: order.email,
      subject: m.subject,
      html: m.html,
    });
  }

  // 3) Admin alert
  if (ADMIN_ALERT) {
    const a = adminNewOrder(order);
    await send("admin_alert", {
      to: ADMIN_ALERT,
      subject: a.subject,
      html: a.html,
    });
  }

  return { ok: failures.length === 0, failures };
}
