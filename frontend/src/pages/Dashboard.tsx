import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuth, useDashboardData, useDashboardFilters } from '../hooks';
import { PurchaseRequest } from '../types';
import DashboardHeader from '../components/domain/DashboardHeader';
import DashboardFilters from '../components/domain/DashboardFilters';
import CreateRequestForm from '../components/domain/CreateRequestForm';
import RequestList from '../components/domain/RequestList';
import RequestDetail from '../components/domain/RequestDetail';

/**
 * Main Dashboard Component
 *
 * Responsibilities:
 * - Orchestrate data flow between components
 * - Manage high-level UI state (modals, selected request)
 * - Delegate business logic to custom hooks
 * - Delegate presentation to child components
 *
 * Following SOLID Principles:
 * - Single Responsibility: Only handles component composition
 * - Open/Closed: New features added via new components
 * - Dependency Inversion: Depends on abstractions (hooks)
 */
const Dashboard: React.FC = () => {
  const { user, logout, isStaff, isFinance } = useAuth();

  // Data fetching hook
  const { requests, loading, refreshRequests } = useDashboardData();

  // Filtering hook
  const { statusFilter, setStatusFilter, filteredRequests, filterCount } =
    useDashboardFilters({
      requests,
      isFinanceUser: isFinance
    });

  // UI state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);

  // Event handlers
  const handleViewDetails = (request: PurchaseRequest) => {
    setSelectedRequest(request);
  };

  const handleCreateSuccess = () => {
    setIsCreateOpen(false);
    refreshRequests();
  };

  const handleRequestUpdate = () => {
    refreshRequests();
    setSelectedRequest(null);
  };

  // Compute page title based on user role
  const pageTitle = isStaff
    ? 'My Spend Requests'
    : isFinance
    ? 'Approved Requests'
    : 'Approval Queue';

  return (
    <div className="min-h-screen bg-[#f4f6f8] font-sans text-[#111]">
      {/* Detail Modal */}
      {selectedRequest && (
        <RequestDetail
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onRefresh={handleRequestUpdate}
        />
      )}

      {/* Header */}
      <DashboardHeader user={user} onLogout={logout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page Title & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#111]">
              {pageTitle}
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and track your procurement workflows efficiently.
            </p>
          </div>

          <DashboardFilters
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onRefresh={refreshRequests}
            onCreateNew={() => setIsCreateOpen(true)}
            showCreateButton={isStaff}
            filterCount={filterCount}
          />
        </div>

        {/* Create Request Form */}
        {isCreateOpen && (
          <CreateRequestForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateOpen(false)}
          />
        )}

        {/* Request List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <RefreshCw className="animate-spin w-10 h-10 mb-4" />
            <p>Syncing data...</p>
          </div>
        ) : (
          <RequestList
            requests={filteredRequests}
            onRefresh={refreshRequests}
            onViewDetails={handleViewDetails}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
