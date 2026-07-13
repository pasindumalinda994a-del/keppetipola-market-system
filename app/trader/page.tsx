"use client";

import Link from "next/link";
import {
  ClipboardList,
  ShoppingBag,
  Users,
  Wallet,
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
import { formatKg, formatLKR } from "@/lib/format";
import {
  applications,
  buyingRequests,
  getPriceHistory,
  purchaseOrders,
  traderDashboardStats,
} from "@/lib/mock";

export default function TraderDashboardPage() {
  const { t } = useLocale();

  return (
    <div>
      <PageHeader
        title={t("trader.dash.title")}
        description={t("trader.dash.description")}
        action={
          <Button asChild>
            <Link href="/trader/requests/new">{t("trader.dash.newRequest")}</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t("trader.dash.buyingRequests")}
          value={String(traderDashboardStats.buyingRequests)}
          icon={ClipboardList}
        />
        <StatCard
          title={t("trader.dash.applications")}
          value={String(traderDashboardStats.applications)}
          icon={Users}
        />
        <StatCard
          title={t("trader.dash.purchasesToday")}
          value={String(traderDashboardStats.purchasesToday)}
          icon={ShoppingBag}
        />
        <StatCard
          title={t("trader.dash.todaySpending")}
          value={formatLKR(traderDashboardStats.todaySpending)}
          icon={Wallet}
        />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t("trader.dash.recentApplications")}
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/trader/applications">{t("common.review")}</Link>
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.farmer")}</TableHead>
                <TableHead>{t("common.vegetable")}</TableHead>
                <TableHead>{t("common.quantity")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.slice(0, 4).map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.farmerName}</TableCell>
                  <TableCell>{a.vegetableName}</TableCell>
                  <TableCell>{formatKg(a.quantityKg)}</TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">
          {t("trader.dash.todaysRequests")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buyingRequests
            .filter((r) => r.traderId === "trader-1")
            .map((r) => (
              <article key={r.id} className="rounded-lg bg-card p-4">
                <h3 className="font-semibold">{r.vegetableName}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("trader.dash.need")} {formatKg(r.quantityKg)} ·{" "}
                  {formatLKR(r.minPrice)}–{formatLKR(r.maxPrice)}
                </p>
                <StatusBadge status={r.status} className="mt-3" />
              </article>
            ))}
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-semibold">
            {t("trader.dash.recentPurchases")}
          </h2>
          <div className="overflow-hidden rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.farmer")}</TableHead>
                  <TableHead>{t("common.vegetable")}</TableHead>
                  <TableHead>{t("common.amount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.farmerName}</TableCell>
                    <TableCell>{p.vegetableName}</TableCell>
                    <TableCell>
                      {formatLKR(p.price * p.quantityKg)}
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
    </div>
  );
}
