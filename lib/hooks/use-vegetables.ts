"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, fetchVegetables } from "@/lib/api";
import type { Vegetable } from "@/types";

export function useVegetables() {
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVegetables();
      setVegetables(data.vegetables);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { vegetables, loading, error, refetch };
}
