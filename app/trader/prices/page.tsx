"use client";

import { useMemo, useState } from "react";
import { BookmarkedPriceChart } from "@/components/market/bookmarked-price-chart";
import { ProduceCategoryFilter } from "@/components/market/produce-category-filter";
import { PriceTable } from "@/components/market/price-table";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/components/providers/locale-provider";
import { useMarketPrices } from "@/lib/hooks/use-market-prices";
import { useVegetables } from "@/lib/hooks/use-vegetables";
import { vegetableMatchesQuery } from "@/lib/i18n/messages";
import { matchesProduceCategory } from "@/lib/produce";

export default function TraderPricesPage() {
  const { t } = useLocale();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const { prices, loading: pricesLoading } = useMarketPrices();
  const { vegetables, loading: vegLoading } = useVegetables();

  const filtered = useMemo(() => {
    return prices.filter(
      (p) =>
        vegetableMatchesQuery(p.vegetableName, q, t) &&
        matchesProduceCategory(p.category, category)
    );
  }, [prices, q, t, category]);

  const loading = pricesLoading || vegLoading;

  return (
    <div>
      <PageHeader
        title={t("trader.prices.title")}
        description={t("trader.prices.description")}
      />
      <div className="mb-6 space-y-4">
        <SearchBar value={q} onChange={setQ} placeholder={t("common.search")} />
        <ProduceCategoryFilter value={category} onChange={setCategory} />
      </div>
      {loading ? (
        <Skeleton className="mb-8 h-[340px] w-full" />
      ) : (
        <BookmarkedPriceChart
          showRangeFilter
          searchQuery={q}
          vegetables={vegetables}
        />
      )}
      <div className="mt-8">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <PriceTable prices={filtered} />
        )}
      </div>
    </div>
  );
}
