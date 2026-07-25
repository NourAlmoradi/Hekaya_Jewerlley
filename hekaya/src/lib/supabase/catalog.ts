import type { SupabaseClient } from "@supabase/supabase-js";
import type { Bilingual, Category, Collection, Product } from "@/types";
import { slugify, generateToken } from "@/lib/utils";

/**
 * Raw database row shapes (snake_case) for the catalog tables.
 * These mirror the schema in hekaya/supabase/seed.sql.
 */
type CollectionRow = {
  id: string;
  slug: string | null;
  name: Bilingual;
  description: Bilingual;
  tone: string;
  image: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

type CategoryRow = {
  id: string;
  slug: string;
  name: Bilingual;
  description: Bilingual | null;
  image: string | null;
  sort_order: number;
};

type ProductRow = {
  id: string;
  slug: string;
  name: Bilingual;
  short_description: Bilingual | null;
  description: Bilingual | null;
  price: number | string;
  compare_at_price: number | string | null;
  category_id: string | null;
  collection_id: string | null;
  images: string[] | null;
  is_qr_eligible: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  is_featured: boolean;
  is_active: boolean;
  stock: number | null;
  variations: Product["variations"] | null;
  age_range: Bilingual | null;
  material: Bilingual | null;
  placeholder_tone: string | null;
  created_at: string;
};

const num = (v: number | string | null | undefined): number | undefined =>
  v === null || v === undefined ? undefined : Number(v);

export function mapCollection(row: CollectionRow): Collection {
  return {
    id: row.id,
    slug: row.slug ?? undefined,
    name: row.name,
    description: row.description,
    tone: row.tone,
    image: row.image ?? undefined,
    isActive: row.is_active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    image: row.image ?? undefined,
  };
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description ?? undefined,
    description: row.description ?? undefined,
    price: Number(row.price),
    compareAtPrice: num(row.compare_at_price),
    categoryId: row.category_id ?? "",
    collection: row.collection_id ?? "",
    images: row.images ?? [],
    isQrEligible: row.is_qr_eligible,
    isNew: row.is_new,
    isBestseller: row.is_bestseller,
    isFeatured: row.is_featured,
    isActive: row.is_active,
    stock: row.stock ?? undefined,
    variations: row.variations ?? undefined,
    ageRange: row.age_range ?? undefined,
    material: row.material ?? undefined,
    placeholderTone: row.placeholder_tone ?? undefined,
    createdAt: row.created_at,
  };
}

/** Fetch all collections (admin sees inactive too). Sorted by sort_order. */
export async function fetchCollections(
  supabase: SupabaseClient,
): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as CollectionRow[]).map(mapCollection);
}

/** Fetch all categories, sorted by sort_order. */
export async function fetchCategories(
  supabase: SupabaseClient,
): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data as CategoryRow[]).map(mapCategory);
}

/** Fetch all products, newest first. */
export async function fetchProducts(
  supabase: SupabaseClient,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ProductRow[]).map(mapProduct);
}

/** Fetch a single product by slug (used by server metadata). */
export async function fetchProductBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as ProductRow) : null;
}

/**
 * Ensure a slug is unique in the `products` table, appending `-2`, `-3`, … on
 * conflict. `excludeId` skips the row being updated so a product never collides
 * with itself.
 */
async function uniqueProductSlug(
  supabase: SupabaseClient,
  base: string,
  excludeId?: string,
): Promise<string> {
  const { data } = await supabase
    .from("products")
    .select("id, slug")
    .ilike("slug", `${base}%`);
  const taken = new Set(
    (data as { id: string; slug: string }[] | null)
      ?.filter((r) => r.id !== excludeId)
      .map((r) => r.slug) ?? [],
  );
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/** Map an app Product into a writable database row (snake_case, no id/created_at). */
function productToRow(p: Product) {
  return {
    // Derive a stable, URL-safe slug on save (mirrors collectionToRow). An
    // existing real slug is preserved so URLs don't change on rename; the legacy
    // `new-<timestamp>` placeholder and blank slugs get a name-based one.
    slug:
      (p.slug?.trim() && !p.slug.startsWith("new-") ? p.slug.trim() : "") ||
      slugify(p.name.en) ||
      slugify(p.name.ar) ||
      `p-${generateToken(6)}`,
    name: p.name,
    short_description: p.shortDescription ?? null,
    description: p.description ?? null,
    price: p.price,
    compare_at_price: p.compareAtPrice ?? null,
    category_id: p.categoryId || null,
    collection_id: p.collection || null,
    images: p.images ?? [],
    is_qr_eligible: p.isQrEligible,
    is_new: p.isNew ?? false,
    is_bestseller: p.isBestseller ?? false,
    is_featured: p.isFeatured ?? false,
    is_active: p.isActive,
    stock: p.stock ?? null,
    variations: p.variations ?? null,
    age_range: p.ageRange ?? null,
    material: p.material ?? null,
    placeholder_tone: p.placeholderTone ?? null,
  };
}

/** Insert a brand-new product (the DB mints the uuid id). */
export async function createProduct(
  supabase: SupabaseClient,
  product: Product,
): Promise<void> {
  const row = productToRow(product);
  row.slug = await uniqueProductSlug(supabase, row.slug);
  const { error } = await supabase.from("products").insert(row);
  if (error) throw error;
}

/** Update an existing product by id. */
export async function updateProduct(
  supabase: SupabaseClient,
  product: Product,
): Promise<void> {
  const row = productToRow(product);
  row.slug = await uniqueProductSlug(supabase, row.slug, product.id);
  const { error } = await supabase
    .from("products")
    .update(row)
    .eq("id", product.id);
  if (error) throw error;
}

/** Toggle a product's active flag. */
export async function setProductActive(
  supabase: SupabaseClient,
  id: string,
  isActive: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id);
  if (error) throw error;
}

/** Map an app Collection into a writable database row. */
function collectionToRow(c: Collection) {
  return {
    // Preserve an existing slug; otherwise derive one from the name so the
    // schema's unique `slug` column is never left null. Arabic-only names
    // slugify to "" — fall back to a short random key.
    slug:
      c.slug?.trim() ||
      slugify(c.name.en) ||
      slugify(c.name.ar) ||
      `collection-${generateToken(6)}`,
    name: c.name,
    description: c.description,
    tone: c.tone,
    image: c.image ?? null,
    is_active: c.isActive,
    sort_order: c.sortOrder ?? 0,
  };
}

/** Insert a brand-new collection (the DB mints the uuid id). */
export async function createCollection(
  supabase: SupabaseClient,
  collection: Collection,
): Promise<void> {
  const { error } = await supabase
    .from("collections")
    .insert(collectionToRow(collection));
  if (error) throw error;
}

/** Update an existing collection by id. */
export async function updateCollection(
  supabase: SupabaseClient,
  collection: Collection,
): Promise<void> {
  const { error } = await supabase
    .from("collections")
    .update(collectionToRow(collection))
    .eq("id", collection.id);
  if (error) throw error;
}
