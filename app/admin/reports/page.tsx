"use client";

import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { BarSummaryChart } from "@/components/market/bar-summary-chart";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchReports } from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import { translateVegetableName } from "@/lib/i18n/messages";
import type { SalesReport } from "@/types";

const WEEKDAY_KEYS = [
  "admin.reports.sun",
  "admin.reports.mon",
  "admin.reports.tue",
  "admin.reports.wed",
  "admin.reports.thu",
  "admin.reports.fri",
  "admin.reports.sat",
] as const;

const WEEK_KEYS = [
  "admin.reports.w1",
  "admin.reports.w2",
  "admin.reports.w3",
  "admin.reports.w4",
] as const;

const emptyReport: SalesReport = {
  daily: [],
  weekly: [],
  monthly: [],
  topVegetables: [],
  exportRows: [],
};

export default function AdminReportsPage() {
  const { t } = useLocale();
  const { token } = useAuth();
  const { data, loading } = useTokenQuery(
    token,
    (authToken) => fetchReports(authToken),
    emptyReport
  );

  function exportCsv() {
    if (!data.exportRows.length) {
      toast.message(t("admin.reports.empty"));
      return;
    }
    downloadCsv(
      "market-sales.csv",
      [
        "Date",
        "Farmer",
        "Trader",
        "Vegetable",
        "Qty kg",
        "Unit price",
        "Total",
        "Status",
      ],
      data.exportRows.map((row) => [
        row.date,
        row.farmerName,
        row.traderName,
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
        title={t("admin.reports.title")}
        description={t("admin.reports.description")}
        action={
          <Button variant="outline" onClick={exportCsv} disabled={loading}>
            {t("common.exportCsv")}
          </Button>
        }
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : data.exportRows.length === 0 ? (
        <EmptyState
          title={t("admin.reports.empty")}
          description={t("admin.reports.emptyDescription")}
        />
      ) : (
        <Tabs defaultValue="monthly">
          <TabsList>
            <TabsTrigger value="daily">{t("admin.reports.daily")}</TabsTrigger>
            <TabsTrigger value="weekly">{t("admin.reports.weekly")}</TabsTrigger>
            <TabsTrigger value="monthly">{t("admin.reports.monthly")}</TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="mt-6 space-y-6">
            <BarSummaryChart
              data={data.daily.map((d) => ({
                name: t(WEEKDAY_KEYS[d.weekday ?? 0]),
                amount: d.amount ?? 0,
              }))}
              dataKey="amount"
              valueIsCurrency
            />
          </TabsContent>
          <TabsContent value="weekly" className="mt-6 space-y-6">
            <BarSummaryChart
              data={data.weekly.map((w, i) => ({
                name: t(WEEK_KEYS[i] ?? "admin.reports.w1"),
                amount: w.amount ?? 0,
              }))}
              dataKey="amount"
              valueIsCurrency
            />
          </TabsContent>
          <TabsContent value="monthly" className="mt-6 grid gap-8 lg:grid-cols-2">
            <section>
              <h2 className="mb-3 font-semibold">
                {t("admin.reports.monthlySales")}
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
              <h2 className="mb-3 font-semibold">
                {t("admin.reports.topVegetables")}
              </h2>
              <BarSummaryChart
                data={data.topVegetables.map((v) => ({
                  name: translateVegetableName(v.name, t),
                  kg: v.kg ?? 0,
                }))}
                dataKey="kg"
              />
            </section>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
