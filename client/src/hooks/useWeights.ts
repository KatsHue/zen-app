import { useCallback, useEffect, useState } from 'react';
import { fetchWeights, logWeight as logWeightApi, type WeightsResponse } from '../api/weights';

export function useWeights(limit = 30) {
  const [data, setData] = useState<WeightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWeights(limit);
      setData(res);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    reload();
  }, [reload]);

  const addWeight = useCallback(
    async (weightKg: number, date?: string) => {
      await logWeightApi(weightKg, date);
      await reload();
    },
    [reload]
  );

  return { data, isLoading, addWeight, reload };
}
