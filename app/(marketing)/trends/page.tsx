"use client";

import { useEffect, useMemo, useState } from "react";
import { ProduceCategoryFilter } from "@/components/market/produce-category-filter";
import { PriceTrendChart } from "@/components/market/price-trend-chart";
import { AnimatedPageHeader } from "@/components/marketing/animated-page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLKR } from "@/lib/format";
import { useMarketPrices } from "@/lib/hooks/use-market-prices";
import { useVegetables } from "@/lib/hooks/use-vegetables";
import { fetchPriceHistory } from "@/lib/api";
import { filterProduceByCategory } from "@/lib/produce";
import type { PriceHistoryPoint } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PriceTrendsPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const { vegetables, loading: vegLoading } = useVegetables();
  const { prices, loading: pricesLoading } = useMarketPrices();
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const visibleVegetables = useMemo(
    () => filterProduceByCategory(vegetables, category),
    [vegetables, category]
  );

  const selected = useMemo(() => {
    if (!visibleVegetables.length) return "";
    if (!q.trim()) return visibleVegetables[0]?.id ?? "";
    const match = visibleVegetables.find((v) =>
      v.name.toLowerCase().includes(q.toLowerCase())
    );
    return match?.id ?? visibleVegetables[0]?.id ?? "";
  }, [q, visibleVegetables]);

  useEffect(() => {
    if (!selected) {
      setHistory([]);
      return;
    }
    let cancelled = false;
    setHistoryLoading(true);
    fetchPriceHistory([selected], "week")
      .then((data) => {
        if (!cancelled) setHistory(data.histories[selected] ?? []);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const current = prices.find((p) => p.vegetableId === selected);
  const loading = vegLoading || pricesLoading;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <AnimatedPageHeader
        title="Price Trends"
        description="Seven-day wholesale price history by produce."
      />
      <div className="mb-6 space-y-4">
        <SearchBar
          placeholder="Search produce…"
          value={q}
          onChange={setQ}
          className="sm:max-w-xs"
        />
        <ProduceCategoryFilter value={category} onChange={setCategory} />
      </div>
      {loading ? (
        <Skeleton className="mb-4 h-5 w-64" />
      ) : current ? (
        <p className="mb-4 text-sm text-muted-foreground">
          {current.vegetableName} average today:{" "}
          <span className="font-semibold text-price-foreground">
            {formatLKR(current.average)}
          </span>
        </p>
      ) : null}
      {loading || historyLoading ? (
        <Skeleton className="h-[360px] w-full" />
      ) : (
        <PriceTrendChart data={history} height={360} />
      )}
      <div className="mt-8 overflow-hidden rounded-xl bg-card">
        {history.length === 0 && !loading && !historyLoading ? (
          <p className="p-5 text-sm text-muted-foreground">
            No price history yet for this item.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Lowest</TableHead>
                <TableHead>Highest</TableHead>
                <TableHead>Average</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...history].reverse().map((row) => (
                <TableRow key={row.date}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{formatLKR(row.lowest)}</TableCell>
                  <TableCell>{formatLKR(row.highest)}</TableCell>
                  <TableCell className="font-medium">
                    {formatLKR(row.average)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
