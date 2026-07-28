/**
 * HTML escaping for values interpolated into email templates.
 *
 * Every template in this folder builds HTML by string concatenation, and much of
 * what it interpolates comes straight from the checkout form: `customerName`,
 * every shipping-address field, and the QR token labels. `place_order` stores
 * those without sanitisation.
 *
 * Email clients strip `<script>`, so this is not XSS. It is HTML and link
 * injection into trusted-looking transactional mail — a phishing primitive. A
 * customer who enters `<a href="https://evil.example">Confirm delivery</a>` as
 * their name gets that rendered as a live link inside the ADMIN's order
 * notification, and inside their own confirmation, which they can forward on as
 * apparently-legitimate Mashaer correspondence.
 *
 * Rule: every `${...}` in a template that carries user or catalogue data goes
 * through `esc()`. Values we generate ourselves (prices, counts, palette
 * constants) do not need it.
 */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escape a value for interpolation into HTML text or a quoted attribute. */
export function esc(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) => HTML_ENTITIES[c]);
}

/**
 * Note on URLs: templates that interpolate an id or QR token into a link run it
 * through `encodeURIComponent` first (so it cannot smuggle a path or query
 * string), then `esc()` the finished URL before it goes into the `href`.
 */
