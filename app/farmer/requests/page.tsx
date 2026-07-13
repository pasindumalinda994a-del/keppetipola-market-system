"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { formatDateTime, formatKg, formatLKR } from "@/lib/format";
import { FilterPanel } from "@/components/shared/filter-panel";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { buyingRequests, vegetables } from "@/lib/mock";

export default function FarmerRequestsPage() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<{ vegetable?: string; trader?: string }>(
    {}
  );

  const traders = [...new Set(buyingRequests.map((r) => r.traderName))];
  const filtered = useMemo(() => {
    return buyingRequests
      .filter((r) => {
        const matchQ =
          !q ||
          r.vegetableName.toLowerCase().includes(q.toLowerCase()) ||
          r.traderName.toLowerCase().includes(q.toLowerCase());
        const matchV =
          !filters.vegetable || r.vegetableName === filters.vegetable;
        const matchT = !filters.trader || r.traderName === filters.trader;
        return matchQ && matchV && matchT;
      })
      .sort((a, b) => b.maxPrice - a.maxPrice);
  }, [q, filters]);

  return (
    <div>
      <PageHeader
        title="Trader Requests"
        description="Apply to buying requests sorted by highest price."
      />
      <div className="mb-6 space-y-4">
        <SearchBar value={q} onChange={setQ} placeholder="Search…" />
        <FilterPanel
          vegetables={vegetables.map((v) => v.name)}
          traders={traders}
          values={filters}
          onChange={setFilters}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => (
          <article key={r.id} className="flex flex-col rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Trader</p>
                <h3 className="font-semibold">{r.traderName}</h3>
              </div>
              <span className="rounded-lg bg-secondary px-2 py-1 text-xs font-medium">
                Grade {r.preferredGrade}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Needs</dt>
                <dd className="font-medium">
                  {r.vegetableName} · {formatKg(r.quantityKg)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Price range</dt>
                <dd className="font-semibold text-price-foreground">
                  {formatLKR(r.minPrice)}–{formatLKR(r.maxPrice)}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-muted-foreground">Closes</dt>
                <dd className="font-medium">{formatDateTime(r.closingTime)}</dd>
              </div>
            </dl>
            <Button
              className="mt-4 w-full"
              onClick={() => toast.success(`Applied to ${r.traderName}`)}
            >
              Apply
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
