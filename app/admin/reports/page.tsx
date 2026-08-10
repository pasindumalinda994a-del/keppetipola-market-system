"use client";

import { toast } from "sonner";
import { useLocale } from "@/components/providers/locale-provider";
import { BarSummaryChart } from "@/components/market/bar-summary-chart";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { translateVegetableName } from "@/lib/i18n/messages";
import { monthlySpending, topVegetablesPurchased } from "@/lib/mock";

export default function AdminReportsPage() {
  const { t } = useLocale();

  return (
    <div>
      <PageHeader
        title={t("admin.reports.title")}
        description={t("admin.reports.description")}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => toast.message(t("admin.reports.exportPdfStub"))}
            >
              {t("common.exportPdf")}
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.message(t("admin.reports.exportExcelStub"))}
            >
              {t("common.exportExcel")}
            </Button>
          </div>
        }
      />
      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="daily">{t("admin.reports.daily")}</TabsTrigger>
          <TabsTrigger value="weekly">{t("admin.reports.weekly")}</TabsTrigger>
          <TabsTrigger value="monthly">{t("admin.reports.monthly")}</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="mt-6 space-y-6">
          <BarSummaryChart
            data={[
              { name: t("admin.reports.mon"), amount: 420000 },
              { name: t("admin.reports.tue"), amount: 510000 },
              { name: t("admin.reports.wed"), amount: 390000 },
              { name: t("admin.reports.thu"), amount: 580000 },
              { name: t("admin.reports.fri"), amount: 620000 },
              { name: t("admin.reports.sat"), amount: 710000 },
              { name: t("admin.reports.sun"), amount: 340000 },
            ]}
            dataKey="amount"
            valueIsCurrency
          />
        </TabsContent>
        <TabsContent value="weekly" className="mt-6 space-y-6">
          <BarSummaryChart
            data={[
              { name: t("admin.reports.w1"), amount: 2100000 },
              { name: t("admin.reports.w2"), amount: 2450000 },
              { name: t("admin.reports.w3"), amount: 1980000 },
              { name: t("admin.reports.w4"), amount: 2860000 },
            ]}
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
              data={monthlySpending.map((m) => ({
                name: m.month,
                amount: m.amount * 4,
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
              data={topVegetablesPurchased.map((v) => ({
                name: translateVegetableName(v.name, t),
                kg: v.kg,
              }))}
              dataKey="kg"
            />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
