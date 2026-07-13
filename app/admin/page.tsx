"use client";

import Link from "next/link";
import {
  Building2,
  Leaf,
  ShoppingBag,
  Users,
} from "lucide-react";
import { PriceTrendChart } from "@/components/market/price-trend-chart";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatKg, formatLKR, formatRelativeTime } from "@/lib/format";
import {
  adminDashboardStats,
  getPriceHistory,
  stalls,
  systemLogs,
  transactions,
  users,
} from "@/lib/mock";

export default function AdminDashboardPage() {
  const { t } = useLocale();
  const pendingFarmers = users.filter(
    (u) => u.role === "farmer" && u.status === "Pending"
  ).length;
  const pendingStalls = stalls.filter((s) => s.status === "Pending").length;

  return (
    <div>
      <PageHeader
        title={t("admin.dash.title")}
        description={t("admin.dash.description")}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t("admin.dash.farmers")}
          value={String(adminDashboardStats.farmers)}
          icon={Users}
        />
        <StatCard
          title={t("admin.dash.traders")}
          value={String(adminDashboardStats.traders)}
          icon={Building2}
        />
        <StatCard
          title={t("admin.dash.transactions")}
          value={String(adminDashboardStats.transactions)}
          icon={ShoppingBag}
        />
        <StatCard
          title={t("admin.dash.todaySales")}
          value={formatLKR(adminDashboardStats.todaySales)}
          icon={Leaf}
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">
          {t("admin.dash.pendingApprovals")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-lg bg-card p-4">
            <p className="text-sm text-muted-foreground">{t("common.farmers")}</p>
            <p className="mt-1 text-2xl font-semibold">{pendingFarmers}</p>
            <Button variant="link" className="px-0" asChild>
              <Link href="/admin/users">{t("common.review")}</Link>
            </Button>
          </article>
          <article className="rounded-lg bg-card p-4">
            <p className="text-sm text-muted-foreground">{t("common.traders")}</p>
            <p className="mt-1 text-2xl font-semibold">0</p>
            <Button variant="link" className="px-0" asChild>
              <Link href="/admin/users">{t("common.review")}</Link>
            </Button>
          </article>
          <article className="rounded-lg bg-card p-4">
            <p className="text-sm text-muted-foreground">{t("common.stalls")}</p>
            <p className="mt-1 text-2xl font-semibold">{pendingStalls}</p>
            <Button variant="link" className="px-0" asChild>
              <Link href="/admin/stalls">{t("common.review")}</Link>
            </Button>
          </article>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {t("admin.dash.recentTransactions")}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/transactions">{t("common.viewAll")}</Link>
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.id")}</TableHead>
                  <TableHead>{t("common.parties")}</TableHead>
                  <TableHead>{t("common.amount")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 4).map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-xs">{txn.id}</TableCell>
                    <TableCell className="text-sm">
                      {txn.farmerName} → {txn.traderName}
                      <br />
                      <span className="text-muted-foreground">
                        {txn.vegetableName} · {formatKg(txn.quantityKg)}
                      </span>
                    </TableCell>
                    <TableCell>{formatLKR(txn.amount)}</TableCell>
                    <TableCell>
                      <StatusBadge status={txn.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
        <section>
          <h2 className="mb-4 text-lg font-semibold">{t("common.priceTrend")}</h2>
          <PriceTrendChart data={getPriceHistory("veg-1")} height={260} />
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("admin.dash.activityLog")}</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/logs">{t("admin.dash.allLogs")}</Link>
          </Button>
        </div>
        <ul className="space-y-2">
          {systemLogs.slice(0, 5).map((log) => (
            <li
              key={log.id}
              className="flex items-start justify-between gap-3 rounded-lg bg-card px-4 py-3 text-sm"
            >
              <div>
                <span className="font-medium text-primary">{log.type}</span>
                <span className="text-muted-foreground"> — {log.message}</span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(log.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
