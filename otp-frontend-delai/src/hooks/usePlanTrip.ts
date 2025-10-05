import { useState, useCallback } from 'react';
import { TripService } from '../lib/services/tripService';
import { PlanTripVariables, PlanTripResponse } from '../lib/queries/trip';

interface UsePlanTripReturn {
  planTrip: (variables: PlanTripVariables) => Promise<void>;
  data: PlanTripResponse | null;
  loading: boolean;
  error: string | null;
}

export function usePlanTrip(): UsePlanTripReturn {
  const [data, setData] = useState<PlanTripResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planTrip = useCallback(async (variables: PlanTripVariables) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await TripService.planTrip(variables);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    planTrip,
    data,
    loading,
    error,
  };
}