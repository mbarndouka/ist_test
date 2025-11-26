import React from 'react';
import { Plus, RefreshCw, Filter } from 'lucide-react';
import { Button, Dropdown, DropdownOption } from '../ui';
import { RequestStatus } from '../../types';

interface DashboardFiltersProps {
  statusFilter: RequestStatus | 'ALL';
  onStatusFilterChange: (status: RequestStatus | 'ALL') => void;
  onRefresh: () => void;
  onCreateNew?: () => void;
  showCreateButton?: boolean;
  filterCount?: number;
}

const STATUS_OPTIONS: DropdownOption<RequestStatus | 'ALL'>[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' }
];

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  onCreateNew,
  showCreateButton = false,
  filterCount
}) => {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Dropdown
        options={STATUS_OPTIONS}
        value={statusFilter}
        onChange={onStatusFilterChange}
        icon={<Filter className="w-4 h-4" />}
        placeholder="Filter by status"
        className="bg-white shadow-sm"
      />

      {filterCount !== undefined && (
        <span className="text-sm text-gray-500 font-medium">
          {filterCount} {filterCount === 1 ? 'request' : 'requests'}
        </span>
      )}

      <Button variant="secondary" onClick={onRefresh} className="bg-white shadow-sm">
        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
      </Button>

      {showCreateButton && onCreateNew && (
        <Button variant="accent" onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" /> New Request
        </Button>
      )}
    </div>
  );
};

export default DashboardFilters;
