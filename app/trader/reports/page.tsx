"use client";

import { BarSummaryChart } from "@/components/market/bar-summary-chart";
import { PageHeader } from "@/components/shared/page-header";
import { useLocale } from "@/components/providers/locale-provider";
import { translateVegetableName } from "@/lib/i18n/messages";
import { monthlySpending, topVegetablesPurchased } from "@/lib/mock";

export default function TraderReportsPage() {
  const { t } = useLocale();

  return (
    <div>
      <PageHeader
        title={t("trader.reports.title")}
        description={t("trader.reports.description")}
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            {t("trader.reports.monthlySpending")}
          </h2>
          <BarSummaryChart
            data={monthlySpending.map((m) => ({
              name: m.month,
              amount: m.amount,
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
            data={topVegetablesPurchased.map((v) => ({
              name: translateVegetableName(v.name, t),
              kg: v.kg,
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
          data={monthlySpending.map((m) => ({
            name: m.month,
            purchases: Math.round(m.amount / 45000),
          }))}
          dataKey="purchases"
          height={240}
        />
      </section>
    </div>
  );
}
