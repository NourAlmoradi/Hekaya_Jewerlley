import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "./AdminShell";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Server-side admin gate. Verifies `profiles.is_admin` before any admin
 * JavaScript is sent to the browser — a non-admin (or signed-out) request is
 * redirected here, not merely hidden by the client shell. `AdminShell` keeps a
 * client-side gate for session changes during navigation.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) redirect("/");

  return <AdminShell>{children}</AdminShell>;
}
