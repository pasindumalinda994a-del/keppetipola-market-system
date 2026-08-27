"use client";

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
import { ApiError, fetchOffers, respondToOffer } from "@/lib/api";
import { formatDate, formatKg, formatLKR } from "@/lib/format";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import { cn } from "@/lib/utils";
import type { Offer } from "@/types";

export default function FarmerOffersPage() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const { data: offers, loading, refetch } = useTokenQuery(
    token,
    async (authToken) => (await fetchOffers(authToken)).offers,
    [] as Offer[]
  );
  const pendingOffers = offers.filter(
    (o) => o.status === "Pending" || o.status === "Offered"
  );
  const highest = pendingOffers.length
    ? Math.max(...pendingOffers.map((o) => o.price))
    : 0;

  async function accept(id: string) {
    if (!token) return;
    try {
      await respondToOffer(token, id, "accept");
      toast.success(t("farmer.offers.accepted"));
      await refetch();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  async function reject(id: string) {
    if (!token) return;
    try {
      await respondToOffer(token, id, "reject");
      toast.message(t("farmer.offers.rejected"));
      await refetch();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  return (
    <div>
      <PageHeader
        title={t("farmer.offers.title")}
        description={t("farmer.offers.description")}
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : offers.length === 0 ? (
        <EmptyState title={t("farmer.offers.empty")} />
      ) : (
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.trader")}</TableHead>
                <TableHead>{t("common.price")}</TableHead>
                <TableHead>{t("common.quantity")}</TableHead>
                <TableHead>{t("common.delivery")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-right">{t("common.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...offers]
                .sort((a, b) => b.price - a.price)
                .map((o) => (
                  <TableRow
                    key={o.id}
                    className={cn(
                      o.price === highest &&
                        o.status !== "Cancelled" &&
                        o.status !== "Accepted" &&
                        "bg-price/10"
                    )}
                  >
                    <TableCell className="font-medium">{o.traderName}</TableCell>
                    <TableCell className="font-semibold text-price-foreground">
                      {formatLKR(o.price, locale)}
                      {o.price === highest &&
                      o.status !== "Cancelled" &&
                      o.status !== "Accepted" ? (
                        <span className="ml-2 text-xs font-medium text-primary">
                          {t("farmer.offers.highest")}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>{formatKg(o.quantityKg, locale)}</TableCell>
                    <TableCell>{formatDate(o.delivery, locale)}</TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="space-x-1 text-right">
                      {o.status === "Pending" || o.status === "Offered" ? (
                        <>
                          <Button size="sm" onClick={() => void accept(o.id)}>
                            {t("common.accept")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void reject(o.id)}
                          >
                            {t("common.reject")}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              toast.message(t("farmer.offers.counterTitle"), {
                                description: t("common.comingSoonLater"),
                              })
                            }
                          >
                            {t("farmer.offers.counter")}
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
    </div>
  );
}
