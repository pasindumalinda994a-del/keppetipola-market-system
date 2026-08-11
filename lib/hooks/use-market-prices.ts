"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, fetchPrices } from "@/lib/api";
import type { MarketPrice } from "@/types";

export function useMarketPrices() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPrices();
      setPrices(data.prices);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { prices, loading, error, refetch };
}
