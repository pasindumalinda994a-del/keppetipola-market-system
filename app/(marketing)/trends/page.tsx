"use client";

import { useEffect, useState } from "react";
import { ProducePicker } from "@/components/market/produce-picker";
import { PriceTrendChart } from "@/components/market/price-trend-chart";
import { AnimatedPageHeader } from "@/components/marketing/animated-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLKR } from "@/lib/format";
import { useMarketPrices } from "@/lib/hooks/use-market-prices";
import { useVegetables } from "@/lib/hooks/use-vegetables";
import { fetchPriceHistory } from "@/lib/api";
import { translateVegetableName } from "@/lib/i18n/messages";
import { useLocale } from "@/components/providers/locale-provider";
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
  const { t } = useLocale();
  const [selected, setSelected] = useState("");
  const { vegetables, loading: vegLoading } = useVegetables();
  const { prices, loading: pricesLoading } = useMarketPrices();
  const [history, setHistory] = useState<PriceHistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
  const selectedName = vegetables.find((v) => v.id === selected)?.name;
  const loading = vegLoading || pricesLoading;

  return (
    <div className="guest-wrap py-10">
      <AnimatedPageHeader
        title="Price Trends"
        description="Seven-day wholesale price history by produce."
      />
      <div className="mb-6 sm:max-w-lg">
        <ProducePicker
          vegetables={vegetables}
          value={selected}
          onChange={setSelected}
          loading={vegLoading}
          defaultCategory="Vegetables"
          selectFirstOnChange
        />
      </div>
      {loading ? (
        <Skeleton className="mb-4 h-5 w-64" />
      ) : current ? (
        <p className="mb-4 text-sm text-muted-foreground">
          {translateVegetableName(selectedName ?? current.vegetableName, t)}{" "}
          average today:{" "}
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
      <div className="guest-card mt-8 overflow-hidden">
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
