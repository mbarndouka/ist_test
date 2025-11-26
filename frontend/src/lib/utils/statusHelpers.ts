import { RequestStatus, PurchaseRequest } from '../../types';

/**
 * Normalizes status strings to uppercase RequestStatus type
 * @param status - Status string from API (can be lowercase/uppercase)
 * @returns Normalized RequestStatus
 */
export const normalizeStatus = (status: string): RequestStatus => {
  const normalized = status.toUpperCase() as RequestStatus;
  if (!['PENDING', 'APPROVED', 'REJECTED'].includes(normalized)) {
    console.warn(`Invalid status received: ${status}`);
    return 'PENDING';
  }
  return normalized;
};

/**
 * Type guard to check if request is pending
 */
export const isPending = (request: PurchaseRequest): boolean => {
  return normalizeStatus(request.status) === 'PENDING';
};

/**
 * Type guard to check if request is approved
 */
export const isApproved = (request: PurchaseRequest): boolean => {
  return normalizeStatus(request.status) === 'APPROVED';
};

/**
 * Type guard to check if request is rejected
 */
export const isRejected = (request: PurchaseRequest): boolean => {
  return normalizeStatus(request.status) === 'REJECTED';
};

/**
 * Gets human-readable label for status filter
 * @param status - Status value or "ALL"
 * @returns Formatted label
 */
export const getStatusLabel = (status: RequestStatus | 'ALL'): string => {
  if (status === 'ALL') return 'All Statuses';

  const labels: Record<RequestStatus, string> = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected'
  };

  return labels[status] || status;
};

/**
 * Gets color class for status badge
 * @param status - Request status
 * @returns Tailwind color classes
 */
export const getStatusColorClasses = (status: RequestStatus) => {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200'
  };

  return colors[status] || colors.PENDING;
};
