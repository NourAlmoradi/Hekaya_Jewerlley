export type Locale = "ar" | "en";

export type Bilingual = { ar: string; en: string };

export type Category = {
  id: string;
  slug: string;
  name: Bilingual;
  description?: Bilingual;
  image?: string;
};

export type Collection = {
  id: string;
  slug?: string; // URL-safe key derived from the name; auto-filled on save
  name: Bilingual;
  description: Bilingual;
  tone: string; // hex colour used as a fallback when no image is set
  image?: string; // public Storage URL (legacy rows may still hold a base64 data URL)
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

export type ProductVariation = {
  id: string;
  size?: string;
  material?: string;
  priceOverride?: number;
};

export type Product = {
  id: string;
  slug: string;
  name: Bilingual;
  shortDescription?: Bilingual;
  description?: Bilingual;
  price: number;
  compareAtPrice?: number;
  categoryId: string;
  collection: string;
  images: string[];
  isQrEligible: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isActive: boolean;
  // NOTE: there is deliberately no `stock` field. Every piece is made to order,
  // so there is no inventory to track. A `stock` column previously existed here
  // and in the database but no admin screen could edit it and no checkout path
  // enforced it — see migration 0003.
  variations?: ProductVariation[];
  createdAt?: string;
  // Visual placeholder colour for shimmer cards (no real images yet)
  placeholderTone?: string;
  // Suitable age group, admin-editable, shown as a chip on the product page
  // ("مناسب للفئة العمرية"). The store is fixed-size, so there is no size picker.
  ageRange?: Bilingual;
  // Material label (shown as a chip on the product page); falls back to "18k Gold"
  material?: Bilingual;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: Bilingual;
  price: number;
  qty: number;
  image?: string;
  variationId?: string;
  variationLabel?: Bilingual;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

/** Every status, in lifecycle order. Iterate this rather than hardcoding a
 *  subset — the admin dashboard chart used to omit `paid` and `cancelled`, so
 *  paid orders silently vanished from it (M3). */
export const ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

/**
 * Which statuses an order may move to from its current one.
 *
 * Mirrors the `guard_order_status` trigger in migration 0009 — the database is
 * the enforcement point; this map exists so the UI offers only valid options
 * instead of letting an admin pick a move the server will reject. `delivered`
 * and `cancelled` are terminal.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "processing", "cancelled"],
  paid: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export type OrderItem = {
  productId: string;
  name: Bilingual;
  qty: number;
  price: number;
  variationLabel?: Bilingual;
};

export type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  city: string;
  emirate: string;
  postalCode?: string;
  notes?: string;
};

export type Order = {
  id: string;
  /** Owning account. Absent only on legacy rows placed before it was required. */
  userId?: string;
  customerName: string;
  email: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  qrChoice: "per_order" | "per_piece";
  qrTokens: string[];
  qrTokenLabels?: string[]; // human-readable label per token (same index)
  qrTokenProductIds?: string[]; // productId per token (same index)
  shippingAddress: ShippingAddress;
  paymentMethod: "card" | "apple_pay" | "paypal";
  createdAt: string;
};

// Memory rows are modelled by `PublicMemory` / `MemoryMeta` in
// src/lib/supabase/memories.ts (the PIN never leaves the database, so the app
// type deliberately has no `pin` field).
