"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  DollarSign,
  QrCode,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import { useT } from "@/lib/useT";
import { useOrders } from "@/lib/useOrders";
import { createClient } from "@/lib/supabase/client";
import { fetchAllMemories } from "@/lib/supabase/memories";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { ORDER_STATUSES, type OrderStatus } from "@/types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "#d4a437",
  paid: "#8b7cf6",
  processing: "#3b82f6",
  shipped: "#a78bfa",
  delivered: "#5e7c5e",
  cancelled: "#c45b5b",
};

const STATUS_PILL: Record<OrderStatus, string> = {
  pending: "bg-amber-200/15 text-amber-300 ring-amber-300/30",
  paid: "bg-violet-300/15 text-violet-300 ring-violet-300/30",
  processing: "bg-blue-300/15 text-blue-300 ring-blue-300/30",
  shipped: "bg-purple-300/15 text-purple-300 ring-purple-300/30",
  delivered: "bg-emerald-300/15 text-emerald-300 ring-emerald-300/30",
  cancelled: "bg-rose-300/15 text-rose-300 ring-rose-300/30",
};

export default function AdminDashboard() {
  const { t, locale } = useT();
  const allOrders = useOrders();
  const [activeQr, setActiveQr] = useState(0);

  useEffect(() => {
    fetchAllMemories(createClient())
      .then((m) => setActiveQr(m.length))
      .catch(() => setActiveQr(0));
  }, []);

  const totalRevenue = allOrders.reduce((s, o) => s + o.total, 0);
  const totalOrders = allOrders.length;
  // Distinct order emails across ALL time — i.e. total customers who have
  // ordered, not new ones. The tile was labelled "New Customers" (M3).
  const totalCustomers = new Set(
    allOrders.map((o) => (o.email || "").toLowerCase()).filter(Boolean),
  ).size;

  // Month-over-month deltas computed from real orders (current vs previous
  // calendar month). Null when there is no previous-month baseline.
  const deltas = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    let curOrders = 0,
      prevOrders = 0,
      curRevenue = 0,
      prevRevenue = 0;
    const curCustomers = new Set<string>();
    const prevCustomers = new Set<string>();
    for (const o of allOrders) {
      const d = new Date(o.createdAt);
      const email = (o.email || "").toLowerCase();
      if (d >= startOfMonth) {
        curOrders++;
        curRevenue += o.total;
        if (email) curCustomers.add(email);
      } else if (d >= startOfPrev) {
        prevOrders++;
        prevRevenue += o.total;
        if (email) prevCustomers.add(email);
      }
    }
    const pct = (cur: number, prev: number) =>
      prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null;
    return {
      orders: pct(curOrders, prevOrders),
      revenue: pct(curRevenue, prevRevenue),
      customers: pct(curCustomers.size, prevCustomers.size),
    };
  }, [allOrders]);

  const stats = [
    {
      label: t("admin_total_orders"),
      value: totalOrders.toLocaleString(),
      delta: deltas.orders,
      Icon: Package,
    },
    {
      label: t("admin_total_revenue"),
      value: formatPrice(totalRevenue, locale),
      delta: deltas.revenue,
      Icon: DollarSign,
    },
    {
      label: t("admin_active_qr"),
      value: activeQr.toLocaleString(),
      delta: null,
      Icon: QrCode,
    },
    {
      label: t("admin_total_customers"),
      value: totalCustomers.toLocaleString(),
      delta: deltas.customers,
      Icon: Users,
    },
  ];

  // Orders-by-status data (real counts).
  //
  // Built by iterating ORDER_STATUSES so it cannot drift from the enum again.
  // The previous version hardcoded four buckets and omitted `paid` and
  // `cancelled` — and since every order starts `pending` and the admin marks it
  // `paid` by hand, PAID ORDERS VANISHED from the chart entirely, making the
  // totals silently fail to add up (M3).
  const statusData = useMemo(() => {
    const counts = new Map<OrderStatus, number>(
      ORDER_STATUSES.map((s) => [s, 0]),
    );
    for (const o of allOrders) {
      counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
    }
    return ORDER_STATUSES.map((s) => ({
      name: t(`status_${s}` as never),
      value: counts.get(s) ?? 0,
      fill: STATUS_COLORS[s],
    }));
  }, [allOrders, t]);

  // Revenue trend: real revenue summed per month over the last 12 months
  const revenueData = useMemo(() => {
    const monthNames =
      locale === "ar"
        ? [
            "يناير",
            "فبراير",
            "مارس",
            "أبريل",
            "مايو",
            "يونيو",
            "يوليو",
            "أغسطس",
            "سبتمبر",
            "أكتوبر",
            "نوفمبر",
            "ديسمبر",
          ]
        : [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
    const now = new Date();
    // Last 12 calendar months ending with the current one
    const buckets = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        month: monthNames[d.getMonth()],
        revenue: 0,
      };
    });
    const byKey = new Map(buckets.map((b) => [b.key, b]));
    for (const o of allOrders) {
      const d = new Date(o.createdAt);
      const b = byKey.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (b) b.revenue += o.total;
    }
    return buckets;
  }, [allOrders, locale]);

  return (
    <>
      <div>
        <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
          {t("admin_dashboard")}
        </h1>
        <p className="mt-1 text-sm text-white/50">{t("admin_subtitle")}</p>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => {
          const positive = (s.delta ?? 0) >= 0;
          const TrendIcon = positive ? TrendingUp : TrendingDown;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/5 bg-[#141414] p-5"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-white/[0.04] text-[#c9a96e]">
                  <s.Icon className="h-5 w-5" />
                </div>
                {s.delta !== null && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-semibold",
                      positive ? "text-emerald-400" : "text-rose-400",
                    )}
                  >
                    <TrendIcon className="h-3.5 w-3.5" />
                    {positive ? "+" : ""}
                    {s.delta}%
                  </span>
                )}
              </div>
              <p className="mt-5 font-display text-3xl font-semibold text-white">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-white/50">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-white/5 bg-[#141414] p-5">
          <h2 className="font-display text-lg font-semibold text-white">
            {t("admin_orders_by_status")}
          </h2>
          <p className="mt-1 text-sm text-white/50">
            {t("admin_orders_by_status_sub")}
          </p>
          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart
                data={statusData}
                margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  contentStyle={{
                    background: "#0a0a0a",
                    border: "1px solid rgba(201,169,110,0.3)",
                    borderRadius: 8,
                    color: "#c9a96e",
                  }}
                  labelStyle={{ color: "#fff", fontWeight: 600 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-white/5 bg-[#141414] p-5">
          <h2 className="font-display text-lg font-semibold text-white">
            {t("admin_revenue_trend")}
          </h2>
          <p className="mt-1 text-sm text-white/50">
            {t("admin_revenue_trend_sub")}
          </p>
          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
              >
                <defs>
                  <linearGradient id="revGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c9a96e" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#c9a96e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(201,169,110,0.4)" }}
                  contentStyle={{
                    background: "#0a0a0a",
                    border: "1px solid rgba(201,169,110,0.3)",
                    borderRadius: 8,
                    color: "#c9a96e",
                  }}
                  labelStyle={{ color: "#fff", fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#c9a96e"
                  strokeWidth={2}
                  fill="url(#revGold)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-6 rounded-xl border border-white/5 bg-[#141414] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-white">
            {t("admin_recent_orders")}
          </h2>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-[#c9a96e] hover:underline"
          >
            {t("view_all")}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-3 py-3 text-start font-medium">
                  {t("order")}
                </th>
                <th className="px-3 py-3 text-start font-medium">
                  {t("date")}
                </th>
                <th className="px-3 py-3 text-start font-medium">
                  {t("items")}
                </th>
                <th className="px-3 py-3 text-start font-medium">
                  {t("total")}
                </th>
                <th className="px-3 py-3 text-start font-medium">
                  {t("status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allOrders.slice(0, 5).map((o) => {
                const itemsCount = o.items.reduce((s, i) => s + i.qty, 0);
                return (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-4 font-mono text-sm font-bold text-white">
                      {o.id}
                    </td>
                    <td className="px-3 py-4 text-white/60">
                      {formatDate(o.createdAt, locale)}
                    </td>
                    <td className="px-3 py-4 text-white/80">{itemsCount}</td>
                    <td className="px-3 py-4 font-semibold text-white">
                      {formatPrice(o.total, locale)}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
                          STATUS_PILL[o.status],
                        )}
                      >
                        {t(`status_${o.status}` as never)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
