"use client";

import { toast } from "sonner";
import { BarSummaryChart } from "@/components/market/bar-summary-chart";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { monthlySpending, topVegetablesPurchased } from "@/lib/mock";

export default function AdminReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Daily, weekly, and monthly market summaries."
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => toast.message("Export PDF (stub)")}
            >
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => toast.message("Export Excel (stub)")}
            >
              Export Excel
            </Button>
          </div>
        }
      />
      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="mt-6 space-y-6">
          <BarSummaryChart
            data={[
              { name: "Mon", amount: 420000 },
              { name: "Tue", amount: 510000 },
              { name: "Wed", amount: 390000 },
              { name: "Thu", amount: 580000 },
              { name: "Fri", amount: 620000 },
              { name: "Sat", amount: 710000 },
              { name: "Sun", amount: 340000 },
            ]}
            dataKey="amount"
            valueIsCurrency
          />
        </TabsContent>
        <TabsContent value="weekly" className="mt-6 space-y-6">
          <BarSummaryChart
            data={[
              { name: "W1", amount: 2100000 },
              { name: "W2", amount: 2450000 },
              { name: "W3", amount: 1980000 },
              { name: "W4", amount: 2860000 },
            ]}
            dataKey="amount"
            valueIsCurrency
          />
        </TabsContent>
        <TabsContent value="monthly" className="mt-6 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 font-semibold">Monthly sales</h2>
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
            <h2 className="mb-3 font-semibold">Top vegetables</h2>
            <BarSummaryChart
              data={topVegetablesPurchased.map((v) => ({
                name: v.name,
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
