"use client";

import { useMemo, useState } from "react";
import { Bookmark } from "lucide-react";
import { PriceTable } from "@/components/market/price-table";
import { PriceTrendChart } from "@/components/market/price-trend-chart";
import { FilterPanel } from "@/components/shared/filter-panel";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { getPriceHistory, marketPrices, vegetables as vegSeed } from "@/lib/mock";
import type { Vegetable } from "@/types";
import { toast } from "sonner";

export default function FarmerPricesPage() {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<{ vegetable?: string }>({});
  const [vegs, setVegs] = useState<Vegetable[]>(vegSeed);

  const filtered = useMemo(() => {
    return marketPrices.filter((p) => {
      const matchQ =
        !q || p.vegetableName.toLowerCase().includes(q.toLowerCase());
      const matchV =
        !filters.vegetable || p.vegetableName === filters.vegetable;
      return matchQ && matchV;
    });
  }, [q, filters]);

  const bookmarked = vegs.filter((v) => v.bookmarked);

  function toggleBookmark(id: string) {
    setVegs((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, bookmarked: !v.bookmarked } : v
      )
    );
    toast.success("Bookmarks updated");
  }

  return (
    <div>
      <PageHeader
        title="Market Prices"
        description="Live prices with bookmarks for vegetables you grow."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {vegs.map((v) => (
          <Button
            key={v.id}
            size="sm"
            variant={v.bookmarked ? "default" : "outline"}
            className="gap-1"
            onClick={() => toggleBookmark(v.id)}
          >
            <Bookmark className="size-3.5" />
            {v.name}
          </Button>
        ))}
      </div>
      {bookmarked.length > 0 ? (
        <p className="mb-4 text-sm text-muted-foreground">
          Watching: {bookmarked.map((v) => v.name).join(", ")}
        </p>
      ) : null}
      <div className="mb-6 space-y-4">
        <SearchBar value={q} onChange={setQ} placeholder="Search vegetable…" />
        <FilterPanel
          vegetables={vegs.map((v) => v.name)}
          values={filters}
          onChange={setFilters}
        />
      </div>
      <PriceTable prices={filtered} />
      <div className="mt-8">
        <PriceTrendChart data={getPriceHistory("veg-1")} />
      </div>
    </div>
  );
}
