"use client";

import { useMemo, useState } from "react";
import { ProduceCategoryFilter } from "@/components/market/produce-category-filter";
import SplitText from "@/components/marketing/split-text";
import { VegetablePriceCard } from "@/components/market/vegetable-price-card";
import { Button } from "@/components/ui/button";
import type { MarketPrice } from "@/types";
import { matchesProduceCategory } from "@/lib/produce";

const INITIAL_VISIBLE = 8;

export function PriceHighlights({ prices }: { prices: MarketPrice[] }) {
  const [expanded, setExpanded] = useState(false);
  const [category, setCategory] = useState("all");
  const filtered = useMemo(
    () => prices.filter((p) => matchesProduceCategory(p.category, category)),
    [prices, category]
  );
  const visible = expanded ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const canExpand = filtered.length > INITIAL_VISIBLE;

  return (
    <section id="price-highlights" className="guest-wrap scroll-mt-28 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <SplitText
            text="Today's Price Highlights"
            tag="h2"
            className="font-satoshi text-xl font-bold tracking-tight sm:text-2xl"
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Updated as traders buy and sell on the floor.
          </p>
        </div>
        {canExpand ? (
          <Button
            variant="ghost"
            onClick={() => setExpanded((v) => !v)}
            className="text-primary hover:bg-secondary hover:text-primary"
          >
            {expanded ? "Show less" : "View all"}
          </Button>
        ) : null}
      </div>
      <div className="mb-5">
        <ProduceCategoryFilter value={category} onChange={setCategory} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((p) => (
          <VegetablePriceCard key={p.vegetableId} price={p} variant="guest" />
        ))}
      </div>
    </section>
  );
}
