import { useState, useEffect, useCallback } from 'react';
import { requestsAPI } from '../lib/api';
import { PurchaseRequest } from '../types';

interface UseDashboardDataReturn {
  requests: PurchaseRequest[];
  loading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  refreshRequests: () => Promise<void>;
}

/**
 * Custom hook to manage dashboard data fetching and state
 * Handles loading, error states, and provides refresh functionality
 */
export const useDashboardData = (): UseDashboardDataReturn => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await requestsAPI.list();
      setRequests(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load requests';
      setError(errorMessage);
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRequests = useCallback(async () => {
    // Refresh without showing loading state (for background updates)
    try {
      const response = await requestsAPI.list();
      setRequests(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh requests';
      setError(errorMessage);
      console.error('Failed to refresh requests:', err);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    fetchRequests,
    refreshRequests
  };
};
