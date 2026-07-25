"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useProductBySlug, useCatalogLoading } from "@/lib/useProducts";
import { ProductDetail } from "@/components/products/ProductDetail";
import type { Product } from "@/types";

export default function ProductPageClient({
  params,
  initialProduct,
}: {
  params: Promise<{ slug: string }>;
  initialProduct: Product | null;
}) {
  const { slug } = use(params);
  const loading = useCatalogLoading();
  const fromStore = useProductBySlug(slug);
  // Render the server-fetched product immediately (no spinner) and prefer the
  // store copy once the catalog hydrates, so edits/related products stay fresh.
  const product = fromStore ?? initialProduct;

  if (!product) {
    // Only decide "missing" once the catalog has loaded, otherwise a valid
    // product with no server copy would briefly 404 on first render.
    if (loading) {
      return (
        <div className="container-h flex min-h-[60vh] items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-primary-dark)] border-t-transparent" />
        </div>
      );
    }
    notFound();
  }
  return <ProductDetail product={product} />;
}
