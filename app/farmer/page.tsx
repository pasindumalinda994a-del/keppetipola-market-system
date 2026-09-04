"use client";

import Link from "next/link";
import { BookmarkedPriceChart } from "@/components/market/bookmarked-price-chart";
import { DemandRequestCard } from "@/components/market/demand-request-card";
import { VegetablePriceCard } from "@/components/market/vegetable-price-card";
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
import { useAuth } from "@/components/providers/auth-provider";
import { useMarketPrices } from "@/lib/hooks/use-market-prices";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import {
  fetchHarvests,
  fetchLoyaltyBalances,
  fetchOffers,
  fetchRequests,
  fetchSales,
} from "@/lib/api";
import type { BuyingRequest, Harvest, Offer, Sale } from "@/types";

export default function FarmerDashboardPage() {
  const { t, locale } = useLocale();
  const { user: farmer, token } = useAuth();
  const { prices } = useMarketPrices();
  const { data } = useTokenQuery(
    token,
    async (authToken) => {
      const [harvestData, offerData, saleData, requestData, loyaltyData] =
        await Promise.all([
          fetchHarvests(authToken, { mine: true }),
          fetchOffers(authToken),
          fetchSales(authToken),
          fetchRequests(authToken),
          fetchLoyaltyBalances(authToken).catch(() => ({
            balances: [],
            stats: { enrolled: 0, rewardsReady: 0, avgTokens: 0 },
          })),
        ]);
      return {
        harvests: harvestData.harvests,
        offers: offerData.offers,
        sales: saleData.sales,
        requests: requestData.requests,
        loyaltyTokens: loyaltyData.balances.reduce(
          (sum, b) => sum + b.tokenCount,
          0
        ),
      };
    },
    {
      harvests: [] as Harvest[],
      offers: [] as Offer[],
      sales: [] as Sale[],
      requests: [] as BuyingRequest[],
      loyaltyTokens: 0,
    }
  );
  const harvests = data.harvests;
  const offers = data.offers;
  const sales = data.sales;
  const requests = data.requests;
  const farmerLoyaltyTokens = data.loyaltyTokens;

  if (!farmer) return null;
  const topPrices = [...prices].sort((a, b) => b.highest - a.highest).slice(0, 4);
  const recommended = [...requests]
    .filter((r) => r.status === "Active")
    .sort((a, b) => b.maxPrice - a.maxPrice)
    .slice(0, 3);
  const recentOffers = offers.filter((o) => o.status === "Pending").slice(0, 5);
  const pendingOffers = offers.filter((o) => o.status === "Pending").length;
  const acceptedSales = sales.filter(
    (s) => s.status === "Accepted" || s.status === "Completed"
  ).length;
  const totalEarnings = sales
    .filter((s) => s.status === "Completed")
    .reduce((sum, s) => sum + s.total, 0);

  return (
    <div>
      <PageHeader
        title={t("farmer.dash.title")}
        description={t("farmer.dash.description")}
        action={
          <Button asChild>
            <Link href="/farmer/harvest/new">{t("farmer.dash.createListing")}</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t("farmer.dash.harvestListings")}
          value={String(harvests.length)}
        />
        <StatCard
          title={t("farmer.dash.pendingOffers")}
          value={String(pendingOffers)}
        />
        <StatCard
          title={t("farmer.dash.acceptedSales")}
          value={String(acceptedSales)}
        />
        <StatCard
          title={t("farmer.dash.totalEarnings")}
          value={formatLKR(totalEarnings, locale)}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-card px-4 py-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {t("farmer.dash.loyaltyTokens")}
          </p>
          <p className="font-heading text-xl font-semibold tabular-nums">
            {farmerLoyaltyTokens}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/farmer/loyalty">{t("farmer.dash.viewLoyalty")}</Link>
        </Button>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("farmer.dash.highestPrices")}</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/farmer/prices">{t("farmer.dash.allPrices")}</Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topPrices.map((p) => (
            <VegetablePriceCard
              key={p.vegetableId}
              price={p}
              href="/farmer/prices"
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <BookmarkedPriceChart title={t("common.priceTrend")} height={260} showRangeFilter />
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t("farmer.dash.recommendedRequests")}
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/farmer/requests">{t("common.viewAll")}</Link>
          </Button>
        </div>
        {recommended.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("farmer.requests.empty")}</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {recommended.map((r) => (
              <DemandRequestCard
                key={r.id}
                request={r}
                applyHref="/farmer/requests"
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("farmer.dash.recentOffers")}</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/farmer/offers">{t("farmer.dash.compareOffers")}</Link>
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.trader")}</TableHead>
                <TableHead>{t("common.vegetable")}</TableHead>
                <TableHead>{t("farmer.dash.offeredPrice")}</TableHead>
                <TableHead>{t("common.quantity")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-right">{t("common.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOffers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    {t("farmer.offers.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                recentOffers.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.traderName}</TableCell>
                    <TableCell>
                      {translateVegetableName(o.vegetableName, t)}
                    </TableCell>
                    <TableCell className="font-semibold text-price-foreground">
                      {formatLKR(o.price, locale)}
                    </TableCell>
                    <TableCell>{formatKg(o.quantityKg, locale)}</TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/farmer/offers">{t("common.view")}</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">{t("farmer.dash.myHarvest")}</h2>
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.vegetable")}</TableHead>
                <TableHead>{t("common.quantity")}</TableHead>
                <TableHead>{t("common.applications")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {harvests.slice(0, 4).map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/farmer/harvest/${h.id}`}
                      className="hover:underline"
                    >
                      {translateVegetableName(h.vegetableName, t)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {formatKg(h.remainingKg ?? h.quantityKg, locale)}
                  </TableCell>
                  <TableCell>{h.applications}</TableCell>
                  <TableCell>
                    <StatusBadge status={h.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
