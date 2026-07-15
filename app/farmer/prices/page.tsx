"use client";

import { useMemo, useState } from "react";
import { BookmarkedPriceChart } from "@/components/market/bookmarked-price-chart";
import { PriceTable } from "@/components/market/price-table";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { marketPrices } from "@/lib/mock";

export default function FarmerPricesPage() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return marketPrices.filter((p) => {
      return !q || p.vegetableName.toLowerCase().includes(q.toLowerCase());
    });
  }, [q]);

  return (
    <div>
      <PageHeader
        title="Market Prices"
        description="Live prices with bookmarks for vegetables you grow."
      />
      <div className="mb-6">
        <SearchBar value={q} onChange={setQ} placeholder="Search vegetable…" />
      </div>
      <BookmarkedPriceChart showRangeFilter searchQuery={q} />
      <div className="mt-8">
        <PriceTable prices={filtered} />
      </div>
    </div>
  );
}
