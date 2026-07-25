"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  QrCode,
  Settings,
  ChevronRight,
  Menu,
  X,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { Monogram } from "@/components/ui/Logo";
import { useT } from "@/lib/useT";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/supabase/useAuth";
import { toast } from "sonner";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { t, locale } = useT();
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut: authSignOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Gate the whole admin area on a real admin profile.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/account");
      return;
    }
    // Treat a missing profile as "not admin". `profile` is null both for a
    // genuinely non-admin row and for a failed/hung profile read (see
    // AuthProvider's 8s watchdog) — either way the admin UI must not show.
    if (!profile?.isAdmin) {
      router.replace("/");
    }
  }, [loading, user, profile, router]);

  const items = [
    {
      href: "/admin",
      label: t("admin_dashboard"),
      Icon: LayoutDashboard,
      match: (p: string) => p === "/admin",
    },
    {
      href: "/admin/products",
      label: locale === "ar" ? "المنتجات" : "Products",
      Icon: Package,
      match: (p: string) => p.startsWith("/admin/products"),
    },
    {
      href: "/admin/collections",
      label: locale === "ar" ? "المجموعات" : "Collections",
      Icon: Layers,
      match: (p: string) => p.startsWith("/admin/collections"),
    },
    {
      href: "/admin/orders",
      label: locale === "ar" ? "الطلبات" : "Orders",
      Icon: ShoppingBag,
      match: (p: string) => p.startsWith("/admin/orders"),
    },
    {
      href: "/admin/customers",
      label: locale === "ar" ? "العملاء" : "Customers",
      Icon: Users,
      match: (p: string) => p.startsWith("/admin/customers"),
    },
    {
      href: "/admin/qr",
      label: t("admin_qr_codes"),
      Icon: QrCode,
      match: (p: string) => p.startsWith("/admin/qr"),
    },
    {
      href: "/admin/settings",
      label: t("admin_settings"),
      Icon: Settings,
      match: (p: string) => p.startsWith("/admin/settings"),
    },
  ];

  const signOut = async () => {
    await authSignOut();
    toast.success(t("admin_signed_out"));
    setMobileOpen(false);
    router.push("/");
  };

  const ChevronInline = locale === "ar" ? ChevronLeft : ChevronRight;

  // Block render until we've confirmed an admin session. A null profile (failed
  // read or non-admin) never renders the shell — only a confirmed `isAdmin`.
  if (loading || !user || !profile?.isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0f0f0f] text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#c9a96e] border-t-transparent" />
      </div>
    );
  }

  const Sidebar = (
    <div className="flex h-full flex-col bg-[#0a0a0a] text-white">
      {/* Brand */}
      <div className="border-b border-white/5 p-5">
        <Link
          href="/admin"
          onClick={() => setMobileOpen(false)}
          className="flex flex-col items-center gap-2"
        >
          <Monogram size={56} />
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/50">
            {t("admin_title")}
          </p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((it) => {
          const active = it.match(pathname);
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center justify-between rounded-md px-3.5 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[#1a1508] text-[#c9a96e] ring-1 ring-[#c9a96e]/20"
                  : "text-white/60 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              <span className="flex items-center gap-3">
                <it.Icon
                  className={cn(
                    "h-[18px] w-[18px]",
                    active ? "text-[#c9a96e]" : "text-white/40",
                  )}
                />
                {it.label}
              </span>
              {active && <ChevronInline className="h-4 w-4 text-[#c9a96e]" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer actions */}
      <div className="space-y-1 border-t border-white/5 p-3">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/[0.04] hover:text-white"
        >
          <ChevronLeft
            className={cn("h-4 w-4", locale === "ar" && "rotate-180")}
          />
          {t("admin_view_store")}
        </Link>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/[0.04] hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          {t("admin_sign_out")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:sticky lg:top-0 lg:block lg:h-screen lg:overflow-y-auto">
          {Sidebar}
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/5 bg-[#0a0a0a] px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-md text-white/80 hover:bg-white/[0.06]"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="flex items-center">
            <Monogram size={36} />
          </Link>
        </header>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute inset-y-0 start-0 w-72 max-w-[85vw] shadow-2xl">
              <div className="flex items-center justify-end border-b border-white/5 bg-[#0a0a0a] px-4 py-3">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-md text-white/70 hover:bg-white/[0.06]"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="h-[calc(100%-49px)] overflow-y-auto">
                {Sidebar}
              </div>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="min-h-screen px-4 pb-12 pt-6 sm:px-6 lg:px-10 lg:pt-10">
          {children}
        </main>
      </div>
    </div>
  );
}
