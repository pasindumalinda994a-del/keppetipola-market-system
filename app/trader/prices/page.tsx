"use client";

import { useMemo, useState } from "react";
import { BookmarkedPriceChart } from "@/components/market/bookmarked-price-chart";
import { PriceTable } from "@/components/market/price-table";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/components/providers/locale-provider";
import { useMarketPrices } from "@/lib/hooks/use-market-prices";
import { useVegetables } from "@/lib/hooks/use-vegetables";
import { vegetableMatchesQuery } from "@/lib/i18n/messages";

export default function TraderPricesPage() {
  const { t } = useLocale();
  const [q, setQ] = useState("");
  const { prices, loading: pricesLoading } = useMarketPrices();
  const { vegetables, loading: vegLoading } = useVegetables();

  const filtered = useMemo(() => {
    return prices.filter((p) => vegetableMatchesQuery(p.vegetableName, q, t));
  }, [prices, q, t]);

  const loading = pricesLoading || vegLoading;

  return (
    <div>
      <PageHeader
        title={t("trader.prices.title")}
        description={t("trader.prices.description")}
      />
      <div className="mb-6">
        <SearchBar value={q} onChange={setQ} placeholder={t("common.search")} />
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
