"use client";

import { useEffect, useState } from "react";
import { DemandRequestCard } from "@/components/market/demand-request-card";
import SplitText from "@/components/marketing/split-text";
import { Button } from "@/components/ui/button";
import { fetchRequests } from "@/lib/api";
import type { BuyingRequest } from "@/types";

const INITIAL_VISIBLE = 6;

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

  const visible = expanded ? requests : requests.slice(0, INITIAL_VISIBLE);
  const canExpand = requests.length > INITIAL_VISIBLE;

  if (requests.length === 0) return null;

  return (
    <section id="market-demand" className="scroll-mt-28 py-10">
      <div className="guest-wrap">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <SplitText
              text="Today's Market Demand"
              tag="h2"
              className="font-satoshi text-xl font-bold tracking-tight sm:text-2xl"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Active buying requests from traders right now.
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => (
            <DemandRequestCard key={r.id} request={r} variant="guest" />
          ))}
        </div>
      </div>
    </section>
  );
}
