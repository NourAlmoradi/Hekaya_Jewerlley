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
  stock?: number;
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
