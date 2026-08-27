"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, fetchHarvest, respondToOffer } from "@/lib/api";
import { formatDate, formatKg, formatLKR } from "@/lib/format";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import { fillTemplate, translateVegetableName } from "@/lib/i18n/messages";
import type { Harvest, Offer } from "@/types";

type HarvestDetail = { harvest: Harvest | null; offers: Offer[] };

export default function HarvestDetailPage() {
  const { t, locale } = useLocale();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { token } = useAuth();
  const { data, loading, error, refetch } = useTokenQuery<HarvestDetail>(
    token,
    async (authToken) => {
      const result = await fetchHarvest(authToken, id);
      return { harvest: result.harvest, offers: result.offers ?? [] };
    },
    { harvest: null, offers: [] },
    id
  );
  const harvest = data.harvest;
  const offers = data.offers;

  async function onRespond(offerId: string, action: "accept" | "reject") {
    if (!token) return;
    try {
      await respondToOffer(token, offerId, action);
      toast.success(
        action === "accept" ? t("farmer.offers.accepted") : t("farmer.offers.rejected")
      );
      await refetch();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
  }
  if (error || !harvest) {
    return (
      <EmptyState
        title={t("farmer.harvest.loadError")}
        action={
          <Button variant="outline" asChild>
            <Link href="/farmer/harvest">{t("common.back")}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <PageHeader
        title={fillTemplate(t("farmer.harvest.detailTitle"), {
          vegetable: translateVegetableName(harvest.vegetableName, t),
        })}
        description={fillTemplate(t("farmer.harvest.detailDescription"), {
          date: formatDate(harvest.harvestDate, locale),
          grade: harvest.qualityGrade,
        })}
        action={
          <Button variant="outline" asChild>
            <Link href="/farmer/harvest">{t("common.back")}</Link>
          </Button>
        }
      />

      <div className="grid gap-4 rounded-lg bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm text-muted-foreground">{t("common.quantity")}</p>
          <p className="font-semibold">
            {formatKg(harvest.remainingKg ?? harvest.quantityKg, locale)}
            {harvest.remainingKg != null && harvest.remainingKg !== harvest.quantityKg
              ? ` / ${formatKg(harvest.quantityKg, locale)}`
              : ""}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("common.delivery")}</p>
          <p className="font-semibold">
            {formatDate(harvest.expectedDelivery, locale)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            {t("farmer.harvest.availableUntil")}
          </p>
          <p className="font-semibold">
            {formatDate(harvest.availableUntil, locale)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("common.status")}</p>
          <StatusBadge status={harvest.status} className="mt-1" />
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t("farmer.harvest.offers")}</h2>
        {offers.length === 0 ? (
          <EmptyState title={t("farmer.harvest.offersEmpty")} />
        ) : (
          <div className="overflow-hidden rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.trader")}</TableHead>
                  <TableHead>{t("common.price")}</TableHead>
                  <TableHead>{t("common.qty")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="text-right">{t("common.action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.traderName}</TableCell>
                    <TableCell>{formatLKR(o.price, locale)}</TableCell>
                    <TableCell>{formatKg(o.quantityKg, locale)}</TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      {o.status === "Pending" ? (
                        <>
                          <Button size="sm" onClick={() => void onRespond(o.id, "accept")}>
                            {t("common.accept")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void onRespond(o.id, "reject")}
                          >
                            {t("common.reject")}
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t("farmer.harvest.timeline")}</h2>
        <ol className="space-y-3 border-l-2 border-primary/30 pl-4">
          <li className="text-sm">
            <span className="font-medium">{t("farmer.harvest.listed")}</span> —{" "}
            {formatDate(harvest.harvestDate, locale)}
          </li>
          <li className="text-sm">
            <span className="font-medium">
              {fillTemplate(t("farmer.harvest.offersFromTraders"), {
                n: offers.length,
              })}
            </span>
          </li>
        </ol>
      </section>
    </div>
  );
}
