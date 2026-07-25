import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { fetchCollections, fetchProducts } from "@/lib/supabase/catalog";
import type { Collection, Product } from "@/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://mashaerjewellery.com";

// Regenerate at most daily so products added via the admin show up in the
// sitemap without needing a redeploy.
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let products: Product[] = [];
  let collections: Collection[] = [];
  try {
    const supabase = createPublicClient();
    [products, collections] = await Promise.all([
      fetchProducts(supabase),
      fetchCollections(supabase),
    ]);
  } catch {
    // DB unreachable at build/request time — emit static routes only.
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/collections`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/qr`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/policies`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = products
    .filter((p) => p.isActive)
    .map((p) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  const collectionRoutes: MetadataRoute.Sitemap = collections
    .filter((c) => c.isActive)
    // /products?collection=<id> is the real working filter (ProductsExplorer);
    // /collections ignores query params, so don't emit dead-end URLs.
    .map((c) => ({
      url: `${SITE_URL}/products?collection=${c.id}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...staticRoutes, ...productRoutes, ...collectionRoutes];
}
