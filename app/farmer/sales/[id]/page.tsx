"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatKg, formatLKR } from "@/lib/format";
import { translateVegetableName } from "@/lib/i18n/messages";
import { sales } from "@/lib/mock";

export default function SaleInvoicePage() {
  const { t, locale } = useLocale();
  const params = useParams<{ id: string }>();
  const sale = sales.find((s) => s.id === params.id);
  if (!sale) notFound();

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
          <div className="flex justify-between border-t pt-3 text-base">
            <dt className="font-semibold">{t("common.total")}</dt>
            <dd className="font-semibold text-price-foreground">
              {formatLKR(sale.total, locale)}
            </dd>
          </div>
        </dl>
        {sale.status === "Completed" ? (
          <div className="mt-6 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm">
            <p className="text-foreground">
              {t("farmer.sales.loyaltyNote").replace(
                "{trader}",
                sale.traderName
              )}
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
