"use client";

import { useMemo, useState } from "react";
import { ProduceCategoryFilter } from "@/components/market/produce-category-filter";
import { VegetablePriceCard } from "@/components/market/vegetable-price-card";
import { Button } from "@/components/ui/button";
import type { MarketPrice } from "@/types";
import { matchesProduceCategory } from "@/lib/produce";

const FIRST_ROW = 4;

export function PriceHighlights({ prices }: { prices: MarketPrice[] }) {
  const [expanded, setExpanded] = useState(false);
  const [category, setCategory] = useState("all");
  const filtered = useMemo(
    () => prices.filter((p) => matchesProduceCategory(p.category, category)),
    [prices, category]
  );
  const visible = expanded ? filtered : filtered.slice(0, FIRST_ROW);
  const canExpand = filtered.length > FIRST_ROW;

  return (
    <section id="price-highlights" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-satoshi text-2xl font-semibold tracking-tight">
            Today&apos;s Price Highlights
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Updated as traders buy and sell on the floor.
          </p>
        </div>
        {canExpand ? (
          <Button variant="ghost" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Show less" : "View all"}
          </Button>
        ) : null}
      </div>
      <div className="mb-5">
        <ProduceCategoryFilter value={category} onChange={setCategory} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((p) => (
          <VegetablePriceCard key={p.vegetableId} price={p} />
        ))}
      </div>
    </section>
  );
}
