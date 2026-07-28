import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * A Supabase client parameterised with the generated schema.
 *
 * Data-access helpers must take THIS, not a bare `SupabaseClient`. The bare
 * type defaults its generic to `any`, so a function typed with it silently
 * discards the schema even when the caller passes a fully typed client — which
 * is how `database.types.ts` was able to drift for so long without a single
 * compile error (H3).
 *
 * Regenerate the underlying types after every migration:
 *   npx supabase gen types typescript --project-id gaigpimjpwsewkinxavt \
 *     > src/lib/supabase/database.types.ts
 */
export type Db = SupabaseClient<Database>;
