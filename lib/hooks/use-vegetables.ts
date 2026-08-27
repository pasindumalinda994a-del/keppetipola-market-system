"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, fetchVegetables } from "@/lib/api";
import type { Vegetable } from "@/types";

export function useVegetables() {
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const data = await fetchVegetables();
    setVegetables(data.vegetables);
    setError(null);
    return data.vegetables;
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchVegetables()
      .then((data) => {
        if (cancelled) return;
        setVegetables(data.vegetables);
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

  return { vegetables, loading, error, refetch };
}
