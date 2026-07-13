"use client";

import { useMemo, useState } from "react";
import { PriceTable } from "@/components/market/price-table";
import { FilterPanel } from "@/components/shared/filter-panel";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { marketPrices, vegetables } from "@/lib/mock";

export default function TraderPricesPage() {
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

  return (
    <div>
      <PageHeader
        title="Market Prices"
        description="Use live averages when setting your buying range."
      />
      <div className="mb-6 space-y-4">
        <SearchBar value={q} onChange={setQ} placeholder="Search…" />
        <FilterPanel
          vegetables={vegetables.map((v) => v.name)}
          values={filters}
          onChange={setFilters}
        />
      </div>
      <PriceTable prices={filtered} />
    </div>
  );
}
