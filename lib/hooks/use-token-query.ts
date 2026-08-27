"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useTokenQuery<T>(
  token: string | null | undefined,
  fetcher: (token: string) => Promise<T>,
  initial: T,
  extraKey?: string
) {
  const fetcherRef = useRef(fetcher);
  const initialRef = useRef(initial);

  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetcherRef.current = fetcher;
    initialRef.current = initial;
  });

  const refetch = useCallback(async () => {
    if (!token) return initialRef.current;
    const result = await fetcherRef.current(token);
    setData(result);
    setError(null);
    return result;
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    let cancelled = false;
    fetcherRef
      .current(token)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setData(initialRef.current);
        setError(err instanceof Error ? err.message : "Request failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, extraKey]);

  return { data, setData, loading, error, refetch };
}
