"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { FilterPanel } from "@/components/shared/filter-panel";
import { PriceTable } from "@/components/market/price-table";
import { PriceTrendChart } from "@/components/market/price-trend-chart";
import { getPriceHistory, marketPrices, vegetables } from "@/lib/mock";

export default function LivePricesPage() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<{ vegetable?: string }>({});

  const filtered = useMemo(() => {
    return marketPrices.filter((p) => {
      const matchQ =
        !q || p.vegetableName.toLowerCase().includes(q.toLowerCase());
      const matchV =
        !filters.vegetable || p.vegetableName === filters.vegetable;
      return matchQ && matchV;
    });
  }, [q, filters]);

  const chartVeg = filters.vegetable
    ? vegetables.find((v) => v.name === filters.vegetable)?.id ?? "veg-1"
    : "veg-1";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Live Market Prices"
        description="Today's lowest, highest, and average wholesale prices."
      />
      <div className="mb-6 space-y-4">
        <SearchBar
          placeholder="Search vegetable…"
          value={q}
          onChange={setQ}
        />
        <FilterPanel
          vegetables={vegetables.map((v) => v.name)}
          values={filters}
          onChange={setFilters}
        />
      </div>
      <PriceTable prices={filtered} />
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Last 7 days</h2>
        <PriceTrendChart data={getPriceHistory(chartVeg)} />
      </div>
    </div>
  );
}
