"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookmarkedPriceChart } from "@/components/market/bookmarked-price-chart";
import { PageHeader } from "@/components/shared/page-header";
import { STAT_ICONS, StatCard, StatCardRow } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/components/providers/auth-provider";
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
import { fetchLogs, fetchSales, fetchStalls, fetchUsers } from "@/lib/api";
import { formatKg, formatLKR, formatRelativeTime } from "@/lib/format";
import { statusMessageKeys, translateVegetableName } from "@/lib/i18n/messages";
import type { Sale, Stall, SystemLog, User } from "@/types";

export default function AdminDashboardPage() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    Promise.all([
      fetchUsers(token).catch(() => ({ users: [] as User[] })),
      fetchSales(token).catch(() => ({ sales: [] as Sale[] })),
      fetchStalls(token).catch(() => ({ stalls: [] as Stall[] })),
      fetchLogs(token).catch(() => ({ logs: [] as SystemLog[] })),
    ]).then(([userData, saleData, stallData, logData]) => {
      if (cancelled) return;
      setUsers(userData.users);
      setSales(saleData.sales);
      setStalls(stallData.stalls);
      setLogs(logData.logs);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const pendingFarmers = users.filter(
    (u) => u.role === "farmer" && u.status === "Pending"
  ).length;
  const pendingTraders = users.filter(
    (u) => u.role === "trader" && u.status === "Pending"
  ).length;
  const pendingStalls = stalls.filter((s) => s.status === "Pending").length;
  const activeFarmers = users.filter(
    (u) => u.role === "farmer" && u.status === "Active"
  ).length;
  const activeTraders = users.filter(
    (u) => u.role === "trader" && u.status === "Active"
  ).length;
  const today = new Date().toISOString().slice(0, 10);
  const todaySales = sales.filter((s) => s.date.slice(0, 10) === today);
  const todaySalesTotal = todaySales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div>
      <PageHeader
        title={t("admin.dash.title")}
        description={t("admin.dash.description")}
      />
      <StatCardRow>
        <StatCard
          icon={STAT_ICONS.wheat}
          title={t("admin.dash.farmers")}
          value={String(activeFarmers)}
        />
        <StatCard
          icon={STAT_ICONS.sell}
          title={t("admin.dash.traders")}
          value={String(activeTraders)}
        />
        <StatCard
          icon={STAT_ICONS.priceCheck}
          title={t("admin.dash.transactions")}
          value={String(sales.length)}
        />
        <StatCard
          icon={STAT_ICONS.finance}
          title={t("admin.dash.todaySales")}
          value={formatLKR(todaySalesTotal, locale)}
        />
      </StatCardRow>

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
            <p className="mt-1 text-2xl font-semibold">{pendingTraders}</p>
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

      <section className="mt-8">
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
              {sales.slice(0, 4).map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono text-xs">{txn.id}</TableCell>
                  <TableCell className="text-sm">
                    {txn.farmerName} → {txn.traderName}
                    <br />
                    <span className="text-muted-foreground">
                      {translateVegetableName(txn.vegetableName, t)} ·{" "}
                      {formatKg(txn.quantityKg, locale)}
                    </span>
                  </TableCell>
                  <TableCell>{formatLKR(txn.total, locale)}</TableCell>
                  <TableCell>
                    <StatusBadge status={txn.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-8">
        <BookmarkedPriceChart title={t("common.priceTrend")} height={260} showRangeFilter />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("admin.dash.activityLog")}</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/logs">{t("admin.dash.allLogs")}</Link>
          </Button>
        </div>
        <ul className="space-y-2">
          {logs.slice(0, 5).length === 0 ? (
            <li className="rounded-lg bg-card px-4 py-3 text-sm text-muted-foreground">
              {t("admin.dash.noActivity")}
            </li>
          ) : (
            logs.slice(0, 5).map((log) => (
            <li
              key={log.id}
              className="flex items-start justify-between gap-3 rounded-lg bg-card px-4 py-3 text-sm"
            >
              <div>
                <span className="font-medium text-primary">
                  {statusMessageKeys[log.type]
                    ? t(statusMessageKeys[log.type])
                    : log.type}
                </span>
                <span className="text-muted-foreground"> — {log.message}</span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(log.createdAt, locale)}
              </span>
            </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
