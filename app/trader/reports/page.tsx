"use client";

import { toast } from "sonner";
import { BarSummaryChart } from "@/components/market/bar-summary-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { fetchReports } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import { translateVegetableName } from "@/lib/i18n/messages";
import type { SalesReport } from "@/types";

const emptyReport: SalesReport = {
  daily: [],
  weekly: [],
  monthly: [],
  topVegetables: [],
  exportRows: [],
};

export default function TraderReportsPage() {
  const { t } = useLocale();
  const { token } = useAuth();
  const { data, loading } = useTokenQuery(
    token,
    (authToken) => fetchReports(authToken),
    emptyReport
  );

  function exportCsv() {
    if (!data.exportRows.length) {
      toast.message(t("trader.reports.empty"));
      return;
    }
    downloadCsv(
      "trader-purchases.csv",
      [
        "Date",
        "Farmer",
        "Vegetable",
        "Qty kg",
        "Unit price",
        "Total",
        "Status",
      ],
      data.exportRows.map((row) => [
        row.date,
        row.farmerName,
        row.vegetableName,
        row.quantityKg,
        row.unitPrice,
        row.total,
        row.status,
      ])
    );
    toast.success(t("admin.reports.exported"));
  }

  return (
    <div>
      <PageHeader
        title={t("trader.reports.title")}
        description={t("trader.reports.description")}
        action={
          <Button variant="outline" onClick={exportCsv} disabled={loading}>
            {t("common.exportCsv")}
          </Button>
        }
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : data.exportRows.length === 0 ? (
        <EmptyState title={t("trader.reports.empty")} />
      ) : (
        <>
          <div className="grid gap-8 lg:grid-cols-2">
            <section>
              <h2 className="mb-3 text-lg font-semibold">
                {t("trader.reports.monthlySpending")}
              </h2>
              <BarSummaryChart
                data={data.monthly.map((m) => ({
                  name: m.name,
                  amount: m.amount ?? 0,
                }))}
                dataKey="amount"
                valueIsCurrency
              />
            </section>
            <section>
              <h2 className="mb-3 text-lg font-semibold">
                {t("trader.reports.topVegetables")}
              </h2>
              <BarSummaryChart
                data={data.topVegetables.map((v) => ({
                  name: translateVegetableName(v.name, t),
                  kg: v.kg ?? 0,
                }))}
                dataKey="kg"
              />
            </section>
          </div>
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold">
              {t("trader.reports.purchasesOverview")}
            </h2>
            <BarSummaryChart
              data={data.monthly.map((m) => ({
                name: m.name,
                purchases: m.purchases ?? 0,
              }))}
              dataKey="purchases"
              height={240}
            />
          </section>
        </>
      )}
    </div>
  );
}
