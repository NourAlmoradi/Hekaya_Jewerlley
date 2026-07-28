import type { Db } from "@/lib/supabase/types";
import type {
  Bilingual,
  Locale,
  Order,
  OrderItem,
  ShippingAddress,
} from "@/types";

/**
 * Raw database row shapes (snake_case) for the orders tables.
 * Mirrors the schema in SUPABASE_SETUP.md / seed.sql.
 */
type OrderItemRow = {
  product_id: string | null;
  name: Bilingual;
  qty: number;
  price: number | string;
  variation_label: Bilingual | null;
};

type OrderRow = {
  id: string;
  // Nullable in the schema (ON DELETE SET NULL is not used, but legacy rows
  // predate the cascade FK). Needed so the customers screen can key on the
  // account rather than on whichever email was typed at checkout (M9).
  user_id: string | null;
  customer_name: string;
  email: string;
  subtotal: number | string;
  shipping: number | string;
  total: number | string;
  status: Order["status"];
  qr_choice: Order["qrChoice"];
  qr_tokens: string[] | null;
  qr_token_labels: string[] | null;
  qr_token_product_ids: string[] | null;
  shipping_address: ShippingAddress;
  payment_method: Order["paymentMethod"];
  created_at: string;
  order_items?: OrderItemRow[];
};

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.user_id ?? undefined,
    customerName: row.customer_name,
    email: row.email,
    items: (row.order_items ?? []).map((it) => ({
      productId: it.product_id ?? "",
      name: it.name,
      qty: it.qty,
      price: Number(it.price),
      variationLabel: it.variation_label ?? undefined,
    })),
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    status: row.status,
    qrChoice: row.qr_choice,
    qrTokens: row.qr_tokens ?? [],
    qrTokenLabels: row.qr_token_labels ?? [],
    qrTokenProductIds: row.qr_token_product_ids ?? [],
    shippingAddress: row.shipping_address,
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
  };
}

const ORDER_SELECT =
  "*, order_items ( product_id, name, qty, price, variation_label )";

/** All orders visible to the caller (RLS: own orders, or every order for admins). */
export async function fetchOrders(
  supabase: Db,
): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as OrderRow[]).map(mapOrder);
}

/** A single order by id (RLS still applies). */
export async function fetchOrderById(
  supabase: Db,
  id: string,
): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOrder(data as unknown as OrderRow) : null;
}

/** What the client is allowed to decide about an order. */
export type NewOrderInput = {
  customerName: string;
  email: string;
  items: OrderItem[];
  qrChoice: Order["qrChoice"];
  shippingAddress: Order["shippingAddress"];
  paymentMethod: Order["paymentMethod"];
  /** Language used for the server-generated QR token labels. */
  locale: Locale;
};

/**
 * Place an order through the atomic `place_order` RPC, returning the
 * server-minted order id.
 *
 * The server owns everything security-relevant: it validates every item price
 * against the live catalog, recomputes subtotal/shipping/total, forces status
 * to 'pending', MINTS THE ORDER ID AND QR TOKENS, and inserts order + items in
 * one transaction. Requires a signed-in user (the RPC reads auth.uid()).
 *
 * The id and tokens used to be generated in the browser and passed in (H10).
 * The client now sends only the cart, the address and the QR choice.
 */
export async function createOrder(
  supabase: Db,
  input: NewOrderInput,
): Promise<string> {
  const { data, error } = await supabase.rpc("place_order", {
    p_customer_name: input.customerName,
    p_email: input.email,
    p_items: input.items.map((it: OrderItem) => ({
      product_id: it.productId,
      name: it.name,
      qty: it.qty,
      price: it.price,
      variation_label: it.variationLabel ?? null,
    })),
    p_qr_choice: input.qrChoice,
    p_shipping_address: input.shippingAddress,
    p_payment_method: input.paymentMethod,
    p_locale: input.locale,
  });
  if (error) throw error;
  const id = typeof data === "string" ? data : String(data ?? "");
  if (!id) throw new Error("place_order returned no id");
  return id;
}

/** Admin: update an order's status. */
export async function updateOrderStatus(
  supabase: Db,
  id: string,
  status: Order["status"],
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}
