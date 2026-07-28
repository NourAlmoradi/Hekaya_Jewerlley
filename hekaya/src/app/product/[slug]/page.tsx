import { cache } from "react";
import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { fetchProductBySlug } from "@/lib/supabase/catalog";
import { formatPrice } from "@/lib/utils";
import ProductPageClient from "./ProductPageClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://mashaerjewellery.com";

// Render on demand. The root layout reads `cookies()` (for the locale), so this
// route can never be fully static anyway — like every other page in the app it
// is server-rendered per request. Forcing dynamic (instead of using
// `generateStaticParams`) is what stops Next trying to statically prerender a
// cookie-dependent tree, which threw `DYNAMIC_SERVER_USAGE` (a 500) for any
// product that wasn't baked into the build.
export const dynamic = "force-dynamic";

// Shared per-request so `generateMetadata` and the page component hit the
// database once instead of fetching the same product twice. Uses the
// cookie-free public client (no user session needed for public catalog data).
const getProduct = cache(async (slug: string) => {
  const supabase = createPublicClient();
  return fetchProductBySlug(supabase, slug);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) {
    return { title: "Product not found" };
  }
  const title = `${product.name.en} | ${product.name.ar}`;
  const description =
    product.shortDescription?.en ||
    product.description?.en ||
    `${product.name.en} — ${formatPrice(product.price, "en")}. Premium children's jewellery with a private QR Memory keepsake.`;
  const url = `${SITE_URL}/product/${product.slug}`;
  const images = product.images.filter(Boolean).slice(0, 1);

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: images.length ? images : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const jsonLd = product
    ? [
        {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name.en,
          alternateName: product.name.ar,
          description:
            product.shortDescription?.en ||
            product.description?.en ||
            undefined,
          image: product.images.filter(Boolean),
          sku: product.id,
          brand: { "@type": "Brand", name: "Mashaer Jewellery" },
          offers: {
            "@type": "Offer",
            priceCurrency: "AED",
            price: product.price,
            // Every piece is made to order, so nothing is ever "out of stock".
            // This used to read a `stock` column that no admin screen could set
            // and no checkout path enforced, so it was always the `?? 1`
            // fallback anyway. (schema.org/MadeToOrder is also valid and more
            // precise, but InStock has the broadest rich-result support.)
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/product/${product.slug}`,
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${SITE_URL}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Shop All Jewellery",
              item: `${SITE_URL}/products`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: product.name.en,
              item: `${SITE_URL}/product/${product.slug}`,
            },
          ],
        },
      ]
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductPageClient params={params} initialProduct={product} />
    </>
  );
}
