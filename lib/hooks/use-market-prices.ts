"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, fetchPrices } from "@/lib/api";
import type { MarketPrice } from "@/types";

export function useMarketPrices() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const data = await fetchPrices();
    setPrices(data.prices);
    setError(null);
    return data.prices;
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchPrices()
      .then((data) => {
        if (cancelled) return;
        setPrices(data.prices);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Request failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { prices, loading, error, refetch };
}
