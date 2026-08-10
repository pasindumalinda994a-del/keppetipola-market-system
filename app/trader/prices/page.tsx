"use client";

import { useMemo, useState } from "react";
import { BookmarkedPriceChart } from "@/components/market/bookmarked-price-chart";
import { PriceTable } from "@/components/market/price-table";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { useLocale } from "@/components/providers/locale-provider";
import { vegetableMatchesQuery } from "@/lib/i18n/messages";
import { marketPrices } from "@/lib/mock";

export default function TraderPricesPage() {
  const { t } = useLocale();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return marketPrices.filter((p) => vegetableMatchesQuery(p.vegetableName, q, t));
  }, [q, t]);

  return (
    <div>
      <PageHeader
        title={t("trader.prices.title")}
        description={t("trader.prices.description")}
      />
      <div className="mb-6">
        <SearchBar value={q} onChange={setQ} placeholder={t("common.search")} />
      </div>
      <BookmarkedPriceChart showRangeFilter searchQuery={q} />
      <div className="mt-8">
        <PriceTable prices={filtered} />
      </div>
    </div>
  );
}
