"use client";

import { useMemo, useState } from "react";
import { DemandRequestCard } from "@/components/market/demand-request-card";
import { FilterPanel } from "@/components/shared/filter-panel";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { buyingRequests, vegetables } from "@/lib/mock";

export default function MarketDemandPage() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<{
    vegetable?: string;
    trader?: string;
  }>({});

  const traders = [...new Set(buyingRequests.map((r) => r.traderName))];

  const filtered = useMemo(() => {
    return buyingRequests.filter((r) => {
      const matchQ =
        !q ||
        r.vegetableName.toLowerCase().includes(q.toLowerCase()) ||
        r.traderName.toLowerCase().includes(q.toLowerCase());
      const matchV =
        !filters.vegetable || r.vegetableName === filters.vegetable;
      const matchT = !filters.trader || r.traderName === filters.trader;
      return matchQ && matchV && matchT;
    });
  }, [q, filters]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Market Demand"
        description="Trader buying requests — apply if you have matching harvest."
      />
      <div className="mb-6 space-y-4">
        <SearchBar
          placeholder="Search vegetable or trader…"
          value={q}
          onChange={setQ}
        />
        <FilterPanel
          vegetables={vegetables.map((v) => v.name)}
          traders={traders}
          values={filters}
          onChange={setFilters}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <DemandRequestCard key={r.id} request={r} />
        ))}
      </div>
    </div>
  );
}
