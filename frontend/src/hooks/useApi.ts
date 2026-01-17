'use client';

import { useState, useCallback } from 'react';

type ApiFunction<T extends any[], R> = (...args: T) => Promise<R>;

interface UseApiReturn<T extends any[], R> {
  data: R | null;
  loading: boolean;
  error: string | null;
  execute: (...args: T) => Promise<R>;
}

export function useApi<T extends any[], R>(
  apiFunc: ApiFunction<T, R>
): UseApiReturn<T, R> {
  const [data, setData] = useState<R | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: T) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunc(...args);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  return { data, loading, error, execute };
}
