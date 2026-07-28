"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Mail, Phone, Package } from "lucide-react";
import { useT } from "@/lib/useT";
import { useOrders } from "@/lib/useOrders";
import { createClient } from "@/lib/supabase/client";
import { fetchProfiles, type Profile } from "@/lib/supabase/profiles";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import type { Order } from "@/types";

type Customer = {
  /** Account id when known; otherwise the lowercased email (legacy rows). */
  key: string;
  email: string;
  name: string;
  phone: string;
  city: string;
  emirate: string;
  orderCount: number;
  lastOrderAt: string;
  totalSpent: number;
  ordersByStatus: Record<string, number>;
  /** True when there is a `profiles` row — i.e. a registered account. */
  registered: boolean;
  registeredAt: string | null;
};

/**
 * Build the customer list from registered profiles JOINED with order stats.
 *
 * Two fixes over the previous version (M9):
 *  1. Identity is keyed on `user_id`, not the checkout email. Keying on email
 *     meant one account that used two addresses at checkout showed up as two
 *     separate customers.
 *  2. Registered accounts with no orders yet are included. They were previously
 *     invisible — and they are precisely the segment worth re-marketing to.
 *
 * Orders with no user_id (legacy rows) still fall back to email keying so
 * nothing disappears from the screen.
 */
function aggregateCustomers(orders: Order[], profiles: Profile[]): Customer[] {
  const map = new Map<string, Customer>();

  // Seed with every registered account, so non-buyers appear.
  for (const p of profiles) {
    map.set(p.id, {
      key: p.id,
      email: "",
      name: p.fullName || "—",
      phone: p.phone || "",
      city: "",
      emirate: "",
      orderCount: 0,
      lastOrderAt: "",
      totalSpent: 0,
      ordersByStatus: {},
      registered: true,
      registeredAt: p.createdAt,
    });
  }

  for (const o of orders) {
    const email = (o.email || o.shippingAddress?.email || "").toLowerCase();
    const key = o.userId || email;
    if (!key) continue;
    const status = o.status || "pending";
    const existing = map.get(key);

    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += o.total;
      existing.ordersByStatus[status] =
        (existing.ordersByStatus[status] ?? 0) + 1;
      // Keep the most-recent contact info as the canonical record.
      if (!existing.lastOrderAt || o.createdAt > existing.lastOrderAt) {
        existing.lastOrderAt = o.createdAt;
        existing.email = email || existing.email;
        existing.name = o.customerName || existing.name;
        existing.phone = o.shippingAddress?.phone || existing.phone;
        existing.city = o.shippingAddress?.city || existing.city;
        existing.emirate = o.shippingAddress?.emirate || existing.emirate;
      }
    } else {
      map.set(key, {
        key,
        email,
        name: o.customerName || "—",
        phone: o.shippingAddress?.phone || "",
        city: o.shippingAddress?.city || "",
        emirate: o.shippingAddress?.emirate || "",
        orderCount: 1,
        lastOrderAt: o.createdAt,
        totalSpent: o.total,
        ordersByStatus: { [status]: 1 },
        registered: false,
        registeredAt: null,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

export default function AdminCustomers() {
  const { locale } = useT();
  const orders = useOrders();
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // RLS returns every profile to admins. Failure is non-fatal: the screen still
  // renders the order-derived customers, just without registered non-buyers.
  useEffect(() => {
    fetchProfiles(createClient())
      .then(setProfiles)
      .catch(() => setProfiles([]));
  }, []);

  const customers = useMemo(
    () => aggregateCustomers(orders, profiles),
    [orders, profiles],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.email.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q),
    );
  }, [customers, query]);

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgOrderValue = orders.length === 0 ? 0 : totalRevenue / orders.length;

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
          {locale === "ar" ? "العملاء" : "Customers"}
        </h1>
        <p className="mt-1 text-sm text-white/50">
          {locale === "ar"
            ? "الحسابات المسجّلة مع إحصاءات طلباتها."
            : "Registered accounts, joined with their order history."}
        </p>
      </div>

      {/* Stat tiles */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label={locale === "ar" ? "إجمالي العملاء" : "Total customers"}
          value={String(customers.length)}
        />
        <Stat
          label={locale === "ar" ? "متوسط قيمة الطلب" : "Avg order value"}
          value={formatPrice(avgOrderValue, locale)}
        />
        <Stat
          label={locale === "ar" ? "إجمالي الإيرادات" : "Total revenue"}
          value={formatPrice(totalRevenue, locale)}
        />
      </div>

      {/* Search */}
      <div className="mt-6 relative w-full max-w-xs">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            locale === "ar"
              ? "ابحث بالاسم أو البريد"
              : "Search by name or email"
          }
          className="w-full rounded-md border border-white/10 bg-[#141414] py-3 ps-10 pe-3 text-sm text-white placeholder:text-white/40 focus:border-[#c9a96e]/40 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-lg border border-white/10 bg-[#141414]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/40">
                <th className="px-4 py-3 font-medium">
                  {locale === "ar" ? "الاسم" : "Customer"}
                </th>
                <th className="px-4 py-3 font-medium">
                  {locale === "ar" ? "تواصل" : "Contact"}
                </th>
                <th className="px-4 py-3 font-medium">
                  {locale === "ar" ? "العنوان" : "Location"}
                </th>
                <th className="px-4 py-3 font-medium text-center">
                  {locale === "ar" ? "الطلبات" : "Orders"}
                </th>
                <th className="px-4 py-3 font-medium text-right">
                  {locale === "ar" ? "الإجمالي" : "Spent"}
                </th>
                <th className="px-4 py-3 font-medium">
                  {locale === "ar" ? "آخر طلب" : "Last order"}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-white/40"
                  >
                    {locale === "ar" ? "لا يوجد عملاء بعد" : "No customers yet"}
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr
                  key={c.key}
                  className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="text-[11px] text-white/40">{c.email}</p>
                  </td>
                  <td className="px-4 py-4 text-white/70">
                    <p className="flex items-center gap-1.5 text-xs">
                      <Mail className="h-3 w-3 text-white/40" /> {c.email}
                    </p>
                    {c.phone && (
                      <p className="mt-1 flex items-center gap-1.5 text-xs">
                        <Phone className="h-3 w-3 text-white/40" /> {c.phone}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-white/60">
                    {[c.city, c.emirate].filter(Boolean).join("، ") || "—"}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c9a96e]/15 px-2.5 py-1 text-xs font-semibold text-[#c9a96e] ring-1 ring-[#c9a96e]/30">
                      <Package className="h-3 w-3" /> {c.orderCount}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-white">
                    {formatPrice(c.totalSpent, locale)}
                  </td>
                  <td className="px-4 py-4 text-xs text-white/50">
                    {/* Registered accounts that have never ordered have no
                        last-order date — show why, not an invalid date. */}
                    {c.lastOrderAt ? (
                      formatDate(c.lastOrderAt, locale)
                    ) : (
                      <span className="text-white/30">
                        {locale === "ar" ? "لم يطلب بعد" : "No orders yet"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("rounded-lg border border-white/10 bg-[#141414] p-4")}>
      <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}
