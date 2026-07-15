"use client";

import { useState } from "react";
import { DemandRequestCard } from "@/components/market/demand-request-card";
import { Button } from "@/components/ui/button";
import type { BuyingRequest } from "@/types";

const FIRST_ROW = 3;

export function MarketDemandHighlights({
  requests,
}: {
  requests: BuyingRequest[];
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? requests : requests.slice(0, FIRST_ROW);
  const canExpand = requests.length > FIRST_ROW;

  return (
    <section id="market-demand" className="border-y bg-card/40 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-satoshi text-2xl font-semibold tracking-tight">
              Today&apos;s Market Demand
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Active buying requests from traders right now.
            </p>
          </div>
          {canExpand ? (
            <Button variant="ghost" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Show less" : "View all"}
            </Button>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => (
            <DemandRequestCard key={r.id} request={r} />
          ))}
        </div>
      </div>
    </section>
  );
}
