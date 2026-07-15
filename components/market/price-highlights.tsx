"use client";

import { useState } from "react";
import { VegetablePriceCard } from "@/components/market/vegetable-price-card";
import { Button } from "@/components/ui/button";
import type { MarketPrice } from "@/types";

const FIRST_ROW = 4;

export function PriceHighlights({ prices }: { prices: MarketPrice[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? prices : prices.slice(0, FIRST_ROW);
  const canExpand = prices.length > FIRST_ROW;

  return (
    <section id="price-highlights" className="mx-auto max-w-6xl px-4 py-14">
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((p) => (
          <VegetablePriceCard key={p.vegetableId} price={p} />
        ))}
      </div>
    </section>
  );
}
