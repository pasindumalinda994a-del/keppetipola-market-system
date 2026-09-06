"use client";

import Link from "next/link";
import { Award } from "lucide-react";
import { BookmarkedPriceChart } from "@/components/market/bookmarked-price-chart";
import { PageHeader } from "@/components/shared/page-header";
import { STAT_ICONS, StatCard, StatCardRow } from "@/components/shared/stat-card";
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
import { useAuth } from "@/components/providers/auth-provider";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import {
  fetchApplications,
  fetchLoyaltyBalances,
  fetchRequests,
  fetchSales,
} from "@/lib/api";
import type { Application, BuyingRequest, Sale } from "@/types";

export default function TraderDashboardPage() {
  const { t, locale } = useLocale();
  const { user: trader, token } = useAuth();
  const { data } = useTokenQuery(
    token,
    async (authToken) => {
      const [requestData, appData, saleData, loyaltyData] = await Promise.all([
        fetchRequests(authToken, { mine: true }),
        fetchApplications(authToken),
        fetchSales(authToken),
        fetchLoyaltyBalances(authToken).catch(() => ({
          balances: [],
          stats: { enrolled: 0, rewardsReady: 0, avgTokens: 0 },
        })),
      ]);
      return {
        requests: requestData.requests,
        applications: appData.applications,
        sales: saleData.sales,
        loyaltyFarmers: loyaltyData.stats.enrolled,
      };
    },
    {
      requests: [] as BuyingRequest[],
      applications: [] as Application[],
      sales: [] as Sale[],
      loyaltyFarmers: 0,
    }
  );
  const requests = data.requests;
  const applications = data.applications;
  const sales = data.sales;
  const loyaltyFarmers = data.loyaltyFarmers;

  if (!trader) return null;
  const today = new Date().toISOString().slice(0, 10);
  const todaySales = sales.filter((s) => s.date.slice(0, 10) === today);
  const todaySpending = todaySales.reduce((sum, s) => sum + s.total, 0);

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
      <StatCardRow>
        <StatCard
          icon={STAT_ICONS.wheat}
          title={t("trader.dash.buyingRequests")}
          value={String(requests.length)}
        />
        <StatCard
          icon={STAT_ICONS.priceCheck}
          title={t("trader.dash.applications")}
          value={String(applications.length)}
        />
        <StatCard
          icon={STAT_ICONS.sell}
          title={t("trader.dash.purchasesToday")}
          value={String(todaySales.length)}
        />
        <StatCard
          icon={STAT_ICONS.finance}
          title={t("trader.dash.todaySpending")}
          value={formatLKR(todaySpending, locale)}
        />
        <Link href="/trader/loyalty" className="block h-full">
          <StatCard
            icon={<Award strokeWidth={1.5} />}
            title={t("trader.dash.loyaltyFarmers")}
            value={String(loyaltyFarmers)}
          />
        </Link>
      </StatCardRow>

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
                  <TableCell>
                    {translateVegetableName(a.vegetableName, t)}
                  </TableCell>
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
          {requests.map((r) => (
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
              {sales.slice(0, 5).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.farmerName}</TableCell>
                  <TableCell>
                    {translateVegetableName(p.vegetableName, t)}
                  </TableCell>
                  <TableCell>{formatLKR(p.total, locale)}</TableCell>
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
