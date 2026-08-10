"use client";

import Link from "next/link";
import { BookmarkedPriceChart } from "@/components/market/bookmarked-price-chart";
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
import { translateVegetableName } from "@/lib/i18n/messages";
import {
  applications,
  buyingRequests,
  loyaltyBalances,
  purchaseOrders,
  traderDashboardStats,
} from "@/lib/mock";
import { useAuth } from "@/components/providers/auth-provider";

export default function TraderDashboardPage() {
  const { t, locale } = useLocale();
  const { user: trader } = useAuth();
  if (!trader) return null;
  const loyaltyFarmers = loyaltyBalances.filter(
    (b) => b.traderId === trader.id
  ).length;

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
          change={4.5}
          changeLabel={t("common.thanLastMonth")}
          chartData={[3, 4, 5, 4, 6]}
        />
        <StatCard
          title={t("trader.dash.applications")}
          value={String(traderDashboardStats.applications)}
          change={9.2}
          changeLabel={t("common.thanLastMonth")}
          chartData={[4, 6, 5, 7, 8]}
        />
        <StatCard
          title={t("trader.dash.purchasesToday")}
          value={String(traderDashboardStats.purchasesToday)}
          change={-1.8}
          changeLabel={t("common.thanLastMonth")}
          chartData={[6, 5, 7, 4, 3]}
        />
        <StatCard
          title={t("trader.dash.todaySpending")}
          value={formatLKR(traderDashboardStats.todaySpending, locale)}
          change={3.6}
          changeLabel={t("common.thanLastMonth")}
          chartData={[5, 4, 6, 7, 8]}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-card px-4 py-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {t("trader.dash.loyaltyFarmers")}
          </p>
          <p className="font-heading text-xl font-semibold tabular-nums">
            {loyaltyFarmers}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/trader/loyalty">{t("trader.dash.viewLoyalty")}</Link>
        </Button>
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
                  <TableCell>{translateVegetableName(a.vegetableName, t)}</TableCell>
                  <TableCell>{formatKg(a.quantityKg, locale)}</TableCell>
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
                <h3 className="font-semibold">
                  {translateVegetableName(r.vegetableName, t)}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("trader.dash.need")} {formatKg(r.quantityKg, locale)} ·{" "}
                  {formatLKR(r.minPrice, locale)}–{formatLKR(r.maxPrice, locale)}
                </p>
                <StatusBadge status={r.status} className="mt-3" />
              </article>
            ))}
        </div>
      </section>

      <section className="mt-8">
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
                  <TableCell>{translateVegetableName(p.vegetableName, t)}</TableCell>
                  <TableCell>
                    {formatLKR(p.price * p.quantityKg, locale)}
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
    </div>
  );
}
