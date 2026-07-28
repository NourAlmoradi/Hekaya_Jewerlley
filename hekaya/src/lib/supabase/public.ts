import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Cookie-free Supabase client for PUBLIC, read-only data (catalog, product
 * pages, sitemap). Unlike the `server.ts` client it never touches `cookies()`,
 * so it can be used inside statically-generated routes (`generateStaticParams`,
 * `generateMetadata`, RSC) WITHOUT triggering Next's `DYNAMIC_SERVER_USAGE`
 * error. Use this only for anon-readable data — it carries no user session.
 */
export const createPublicClient = () =>
  createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
