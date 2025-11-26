import { useState, useMemo } from 'react';
import { PurchaseRequest, RequestStatus } from '../types';
import { isApproved, normalizeStatus } from '../lib/utils';

interface UseDashboardFiltersReturn {
  statusFilter: RequestStatus | 'ALL';
  setStatusFilter: (status: RequestStatus | 'ALL') => void;
  filteredRequests: PurchaseRequest[];
  filterCount: number;
}

interface UseDashboardFiltersOptions {
  requests: PurchaseRequest[];
  isFinanceUser?: boolean;
}

/**
 * Custom hook to manage dashboard filtering logic
 * Handles status filtering and finance-user specific filtering
 */
export const useDashboardFilters = ({
  requests,
  isFinanceUser = false
}: UseDashboardFiltersOptions): UseDashboardFiltersReturn => {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      // Finance users can only see approved requests
      if (isFinanceUser && !isApproved(request)) {
        return false;
      }

      // If "ALL" is selected, show all (subject to finance rule above)
      if (statusFilter === 'ALL') {
        return true;
      }

      // Match the selected status filter
      return normalizeStatus(request.status) === statusFilter;
    });
  }, [requests, statusFilter, isFinanceUser]);

  const filterCount = useMemo(() => {
    return filteredRequests.length;
  }, [filteredRequests]);

  return {
    statusFilter,
    setStatusFilter,
    filteredRequests,
    filterCount
  };
};
