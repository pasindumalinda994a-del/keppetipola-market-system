import { BarSummaryChart } from "@/components/market/bar-summary-chart";
import { PageHeader } from "@/components/shared/page-header";
import { monthlySpending, topVegetablesPurchased } from "@/lib/mock";

export default function TraderReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Purchases, top vegetables, and monthly spending."
      />
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Monthly spending</h2>
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
          <h2 className="mb-3 text-lg font-semibold">Top vegetables</h2>
          <BarSummaryChart
            data={topVegetablesPurchased.map((v) => ({
              name: v.name,
              kg: v.kg,
            }))}
            dataKey="kg"
          />
        </section>
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Purchases overview</h2>
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
