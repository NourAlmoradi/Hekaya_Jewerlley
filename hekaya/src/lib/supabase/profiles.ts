import type { Db } from "@/lib/supabase/types";

/**
 * A registered account, from the `profiles` table populated by the
 * `handle_new_user` trigger on auth.users.
 */
export type Profile = {
  id: string;
  fullName: string | null;
  phone: string | null;
  isAdmin: boolean;
  createdAt: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string | null;
};

/**
 * Every registered profile. RLS returns all rows to admins and only their own
 * to everyone else, so this is safe to call from the admin screens.
 *
 * The customers screen used to ignore this table entirely, with a stale caption
 * claiming there was "no users database yet" (M9). Registered customers who had
 * not ordered were invisible — exactly the segment worth re-marketing to.
 */
export async function fetchProfiles(
  supabase: Db,
): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, phone, is_admin, created_at");
  if (error) throw error;
  return (data as ProfileRow[]).map((r) => ({
    id: r.id,
    fullName: r.full_name,
    phone: r.phone,
    isAdmin: r.is_admin,
    createdAt: r.created_at,
  }));
}
