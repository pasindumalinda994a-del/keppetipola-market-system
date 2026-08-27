"use client";

import { useEffect, useState } from "react";
import { DemandRequestCard } from "@/components/market/demand-request-card";
import { Button } from "@/components/ui/button";
import { fetchRequests } from "@/lib/api";
import type { BuyingRequest } from "@/types";

const FIRST_ROW = 3;

export function MarketDemandHighlights({
  requests: initialRequests,
}: {
  requests?: BuyingRequest[];
}) {
  const [requests, setRequests] = useState<BuyingRequest[]>(initialRequests ?? []);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchRequests()
      .then((data) => {
        if (!cancelled) setRequests(data.requests);
      })
      .catch(() => {
        if (!cancelled && !initialRequests) setRequests([]);
      });
    return () => {
      cancelled = true;
    };
  }, [initialRequests]);

  const visible = expanded ? requests : requests.slice(0, FIRST_ROW);
  const canExpand = requests.length > FIRST_ROW;

  if (requests.length === 0) return null;

  return (
    <section id="market-demand" className="scroll-mt-20 border-y bg-card/40 py-14">
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
