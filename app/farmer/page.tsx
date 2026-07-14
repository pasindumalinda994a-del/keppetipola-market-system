"use client";

import Link from "next/link";
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
import { formatKg, formatLKR, formatRelativeTime } from "@/lib/format";
import {
  buyingRequests,
  farmerDashboardStats,
  harvests,
  marketPrices,
  notifications,
  offers,
} from "@/lib/mock";

export default function FarmerDashboardPage() {
  const { t } = useLocale();
  const topPrices = [...marketPrices].sort((a, b) => b.highest - a.highest).slice(0, 4);
  const recommended = [...buyingRequests]
    .filter((r) => r.status === "Active")
    .sort((a, b) => b.maxPrice - a.maxPrice)
    .slice(0, 3);
  const recentOffers = offers.filter((o) => o.status !== "Accepted").slice(0, 5);

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
          value={String(farmerDashboardStats.harvestListings)}
          change={12.5}
          changeLabel={t("common.thanLastMonth")}
          chartData={[3, 5, 4, 6, 8]}
        />
        <StatCard
          title={t("farmer.dash.pendingOffers")}
          value={String(farmerDashboardStats.pendingOffers)}
          change={-3.1}
          changeLabel={t("common.thanLastMonth")}
          chartData={[7, 6, 5, 4, 3]}
        />
        <StatCard
          title={t("farmer.dash.acceptedSales")}
          value={String(farmerDashboardStats.acceptedSales)}
          change={8.4}
          changeLabel={t("common.thanLastMonth")}
          chartData={[4, 5, 6, 7, 9]}
        />
        <StatCard
          title={t("farmer.dash.totalEarnings")}
          value={formatLKR(farmerDashboardStats.totalEarnings)}
          change={5.2}
          changeLabel={t("common.thanLastMonth")}
          chartData={[5, 6, 5, 8, 9]}
        />
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t("farmer.dash.recommendedRequests")}
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/farmer/requests">{t("common.viewAll")}</Link>
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {recommended.map((r) => (
            <DemandRequestCard
              key={r.id}
              request={r}
              applyHref="/farmer/requests"
            />
          ))}
        </div>
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
              {recentOffers.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.traderName}</TableCell>
                  <TableCell>{o.vegetableName}</TableCell>
                  <TableCell className="font-semibold text-price-foreground">
                    {formatLKR(o.price)}
                  </TableCell>
                  <TableCell>{formatKg(o.quantityKg)}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/farmer/offers">{t("common.view")}</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
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
                        {h.vegetableName}
                      </Link>
                    </TableCell>
                    <TableCell>{formatKg(h.quantityKg)}</TableCell>
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
        <section>
          <h2 className="mb-4 text-lg font-semibold">
            {t("farmer.dash.notifications")}
          </h2>
          <ul className="space-y-3">
            {notifications
              .filter((n) =>
                ["Offers", "Sales", "Announcements", "System"].includes(n.group)
              )
              .slice(0, 5)
              .map((n) => (
                <li
                  key={n.id}
                  className="rounded-lg bg-card px-4 py-3 text-sm"
                >
                  <div className="flex justify-between gap-2">
                    <p className="font-medium">{n.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-muted-foreground">{n.message}</p>
                </li>
              ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
