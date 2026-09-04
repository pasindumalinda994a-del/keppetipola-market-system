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
import { ApiError, completeSale, fetchSale } from "@/lib/api";
import { formatDate, formatKg, formatLKR } from "@/lib/format";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import { translateVegetableName } from "@/lib/i18n/messages";
import type { Sale } from "@/types";

export default function SaleInvoicePage() {
  const { t, locale } = useLocale();
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const { data: sale, setData: setSale, loading, error } = useTokenQuery(
    token,
    async (authToken) => (await fetchSale(authToken, params.id)).sale,
    null as Sale | null,
    params.id
  );

  async function onComplete() {
    if (!token || !sale) return;
    try {
      const data = await completeSale(token, sale.id);
      setSale(data.sale);
      toast.success(t("farmer.sales.completed"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
  }
  if (error || !sale) {
    return (
      <EmptyState
        title={t("farmer.sales.notFound")}
        action={
          <Button variant="outline" asChild>
            <Link href="/farmer/sales">{t("common.back")}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <PageHeader
        title={t("farmer.sales.invoice")}
        description={sale.id.toUpperCase()}
        action={
          <Button variant="outline" asChild>
            <Link href="/farmer/sales">{t("common.back")}</Link>
          </Button>
        }
      />
      <div className="rounded-lg bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-heading text-lg font-semibold text-primary">
              {t("farmer.sales.marketName")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("farmer.sales.receipt")}
            </p>
          </div>
          <StatusBadge status={sale.status} />
        </div>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t("common.date")}</dt>
            <dd className="font-medium">{formatDate(sale.date, locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t("common.trader")}</dt>
            <dd className="font-medium">{sale.traderName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t("common.vegetable")}</dt>
            <dd className="font-medium">
              {translateVegetableName(sale.vegetableName, t)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t("common.quantity")}</dt>
            <dd className="font-medium">{formatKg(sale.quantityKg, locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t("common.unitPrice")}</dt>
            <dd className="font-medium">{formatLKR(sale.unitPrice, locale)}</dd>
          </div>
          {sale.loyaltyApplied ? (
            <>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t("farmer.sales.originalUnitPrice")}
                </dt>
                <dd className="font-medium text-muted-foreground line-through">
                  {formatLKR(sale.originalUnitPrice ?? sale.unitPrice, locale)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {t("farmer.sales.loyaltyDiscount")}
                </dt>
                <dd className="font-medium text-primary">
                  {sale.loyaltyDiscountPercent ?? 0}%
                </dd>
              </div>
            </>
          ) : null}
          <div className="flex justify-between border-t pt-3 text-base">
            <dt className="font-semibold">{t("common.total")}</dt>
            <dd className="font-semibold text-price-foreground">
              {formatLKR(sale.total, locale)}
            </dd>
          </div>
        </dl>
        {sale.loyaltyApplied ? (
          <p className="mt-4 text-sm font-medium text-primary">
            {t("farmer.sales.loyaltyAppliedNote").replace(
              "{percent}",
              String(sale.loyaltyDiscountPercent ?? 0)
            )}
          </p>
        ) : null}
        {sale.status === "Accepted" ? (
          <Button className="mt-6 w-full" onClick={() => void onComplete()}>
            {t("common.markCompleted")}
          </Button>
        ) : null}
        {sale.status === "Completed" ? (
          <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm">
            <p className="text-foreground">
              {t("farmer.sales.loyaltyNote").replace("{trader}", sale.traderName)}
            </p>
            <Link
              href="/farmer/loyalty"
              className="mt-2 inline-block font-medium text-primary hover:underline"
            >
              {t("farmer.sales.viewLoyalty")}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
