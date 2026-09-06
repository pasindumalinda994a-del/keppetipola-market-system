"use client";

import { PriceHighlights } from "@/components/market/price-highlights";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarketPrices } from "@/lib/hooks/use-market-prices";

export function HomePriceHighlights() {
  const { prices, loading } = useMarketPrices();

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-14">
        <Skeleton className="mb-6 h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (prices.length === 0) return null;

  return <PriceHighlights prices={prices} />;
}
