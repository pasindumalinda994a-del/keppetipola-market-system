"use client";

import { useMemo, useState } from "react";
import { PriceTrendChart } from "@/components/market/price-trend-chart";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { formatLKR } from "@/lib/format";
import { getPriceHistory, marketPrices, vegetables } from "@/lib/mock";
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

  const selected = useMemo(() => {
    if (!q.trim()) return vegetables[0]?.id ?? "veg-1";
    const match = vegetables.find((v) =>
      v.name.toLowerCase().includes(q.toLowerCase())
    );
    return match?.id ?? vegetables[0]?.id ?? "veg-1";
  }, [q]);

  const history = getPriceHistory(selected);
  const current = marketPrices.find((p) => p.vegetableId === selected);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <PageHeader
        title="Price Trends"
        description="Seven-day wholesale price history by vegetable."
      />
      <div className="mb-6">
        <SearchBar
          placeholder="Search vegetable…"
          value={q}
          onChange={setQ}
          className="sm:max-w-xs"
        />
      </div>
      {current ? (
        <p className="mb-4 text-sm text-muted-foreground">
          {current.vegetableName} average today:{" "}
          <span className="font-semibold text-price-foreground">
            {formatLKR(current.average)}
          </span>
        </p>
      ) : null}
      <PriceTrendChart data={history} height={360} />
      <div className="mt-8 overflow-hidden rounded-xl bg-card">
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
      </div>
    </div>
  );
}
