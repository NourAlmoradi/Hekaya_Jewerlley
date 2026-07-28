import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

// Parameterised with <Database> so queries and RPC calls are type-checked
// against the real schema. Without the generic every query returned `any`,
// which is how database.types.ts was able to drift out of sync unnoticed (H3).
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
