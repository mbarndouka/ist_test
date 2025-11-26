import React, { useState, useRef } from 'react';
import { PurchaseRequest } from '../../types';
import { formatCurrency, normalizeStatus } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { CheckCircle, XCircle, Upload } from 'lucide-react';
import { requestsAPI } from '../../lib/api';
import { showSuccess, showError } from '../../lib/toast';
import ConfirmDialog from './actions/ConfirmDialog';
import { useAuth } from '../../context/useAuth';

interface RequestCardProps {
  request: PurchaseRequest;
  onClick?: () => void;
  onRefresh?: () => void;
}

const statusConfig = {
  APPROVED: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-700 border-red-500/20',
  PENDING: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
};

// VARIANT 1: Dark with Gradient (Default)
export const RequestCardDark: React.FC<RequestCardProps> = ({ request, onClick }) => {
  const status = normalizeStatus(request.status);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer",
        "bg-[#111] rounded-3xl p-14",
        "transition-all duration-300",
        "hover:ring-2 hover:ring-[#ccff00]/40"
      )}
    >
      <div className="absolute top-6 right-6">
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-medium border",
          statusConfig[status]
        )}>
          {status}
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-6xl font-bold bg-linear-to-r from-[#ccff00] to-[#a3ff00] bg-clip-text text-transparent">
          {formatCurrency(request.amount)}
        </h2>
      </div>

      <h3 className="text-2xl font-semibold text-white mb-4">
        {request.title}
      </h3>

      <p className="text-base text-gray-400 leading-relaxed line-clamp-2">
        {request.description}
      </p>

      <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {new Date(request.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
        {request.approver_details && (
          <span className="text-xs text-gray-500">
            {request.approver_details.full_name}
          </span>
        )}
      </div>
    </div>
  );
};

// VARIANT 2: Light with Accent Color
export const RequestCardLight: React.FC<RequestCardProps> = ({ request, onClick, onRefresh }) => {
  const status = normalizeStatus(request.status);
  const { isApprover, isStaff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPending = status === 'PENDING';
  const isApproved = status === 'APPROVED';
  const showManagementActions = isApprover && isPending;
  const showStaffUploadReceipt = isStaff && isApproved && !request.receipt;

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await requestsAPI.approve(request.id);
      const approvalData = response.data;

      // Show appropriate message based on PO generation status
      if (approvalData.po_generated) {
        showSuccess('Request approved and Purchase Order generated successfully!');
      } else {
        showSuccess('Request approved successfully');
      }

      setShowApproveDialog(false);
      onRefresh?.();
    } catch (error) {
      showError('Failed to approve request');
      console.error('Approval failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await requestsAPI.reject(request.id);
      showSuccess('Request rejected successfully');
      setShowRejectDialog(false);
      onRefresh?.();
    } catch (error) {
      showError('Failed to reject request');
      console.error('Rejection failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReceipt = async () => {
    if (!receipt) return;

    setLoading(true);
    try {
      const response = await requestsAPI.uploadReceipt(request.id, receipt);
      const validationData = response.data;

      // Show appropriate message based on validation status
      if (validationData.validation_status === 'valid') {
        showSuccess('Receipt uploaded and validated successfully!');
      } else if (validationData.validation_status === 'invalid') {
        showError('Receipt uploaded but discrepancies found. Check details.');
      } else if (validationData.validation_status === 'error') {
        showError(`Receipt uploaded but validation failed: ${validationData.error || 'Unknown error'}`);
      } else {
        showSuccess('Receipt uploaded and validation is pending');
      }

      setReceipt(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onRefresh?.();
    } catch (error) {
      showError('Failed to upload receipt');
      console.error('Receipt upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if clicking on action buttons or upload area
    const target = e.target as HTMLElement;
    if (target.closest('.action-button') || target.closest('.finance-upload-area')) {
      return;
    }
    onClick?.();
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={cn(
          "group relative cursor-pointer",
          "bg-white rounded-3xl p-14",
          "transition-all duration-300",
          "hover:ring-2 hover:ring-[#111]/10"
        )}
      >
        <div className="absolute top-6 right-6">
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border",
            statusConfig[status]
          )}>
            {status}
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-6xl font-bold text-[#111]">
            {formatCurrency(request.amount)}
          </h2>
        </div>

        <h3 className="text-2xl font-semibold text-[#111] mb-4">
          {request.title}
        </h3>

        <p className="text-base text-gray-500 leading-relaxed line-clamp-2">
          {request.description}
        </p>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {new Date(request.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          {request.approver_details && (
            <span className="text-xs text-gray-400">
              {request.approver_details.full_name}
            </span>
          )}
        </div>

        {/* Action Buttons for Management */}
        {showManagementActions && (
          <div className="mt-6 pt-6 border-t border-gray-100 flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowApproveDialog(true);
              }}
              disabled={loading}
              className={cn(
                "action-button flex-1 flex items-center justify-center gap-2",
                "px-4 py-3 rounded-xl font-medium text-sm",
                "bg-emerald-50 text-emerald-700 border border-emerald-200",
                "hover:bg-emerald-100 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowRejectDialog(true);
              }}
              disabled={loading}
              className={cn(
                "action-button flex-1 flex items-center justify-center gap-2",
                "px-4 py-3 rounded-xl font-medium text-sm",
                "bg-red-50 text-red-700 border border-red-200",
                "hover:bg-red-100 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}

        {/* Receipt Upload for Staff */}
        {showStaffUploadReceipt && (
          <div className="mt-6 pt-6 border-t border-gray-100 finance-upload-area">
            <div className="flex flex-col gap-3">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="application/pdf,image/jpeg,image/png"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setReceipt(e.target.files[0]);
                  }
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className={cn(
                  "action-button flex items-center justify-center gap-2",
                  "px-4 py-3 rounded-xl font-medium text-sm",
                  "bg-blue-50 text-blue-700 border border-blue-200",
                  "hover:bg-blue-100 transition-colors"
                )}
              >
                <Upload className="w-4 h-4" />
                {receipt ? receipt.name : 'Select Receipt File'}
              </button>
              {receipt && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUploadReceipt();
                  }}
                  disabled={loading}
                  className={cn(
                    "action-button flex items-center justify-center gap-2",
                    "px-4 py-3 rounded-xl font-medium text-sm",
                    "bg-[#ccff00] text-[#111] border border-[#ccff00]",
                    "hover:bg-[#b8e600] transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {loading ? 'Uploading...' : 'Run AI Validation'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleApprove}
        title="Approve Request"
        message={`Are you sure you want to approve "${request.title}" for ${formatCurrency(request.amount)}?`}
        confirmText="Approve"
        confirmVariant="accent"
        isLoading={loading}
      />

      <ConfirmDialog
        isOpen={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={handleReject}
        title="Reject Request"
        message={`Are you sure you want to reject "${request.title}"? This action cannot be undone.`}
        confirmText="Reject"
        confirmVariant="danger"
        isLoading={loading}
      />
    </>
  );
};

// VARIANT 3: Minimal with Solid Accent
export const RequestCardMinimal: React.FC<RequestCardProps> = ({ request, onClick }) => {
  const status = normalizeStatus(request.status);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer",
        "bg-white border-2 border-gray-100 rounded-2xl p-12",
        "transition-all duration-300",
        "hover:border-[#ccff00]"
      )}
    >
      <div className="absolute top-5 right-5">
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-medium border",
          statusConfig[status]
        )}>
          {status}
        </span>
      </div>

      <div className="mb-5">
        <h2 className="text-5xl font-bold text-[#ccff00]">
          {formatCurrency(request.amount)}
        </h2>
      </div>

      <h3 className="text-xl font-semibold text-[#111] mb-3">
        {request.title}
      </h3>

      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
        {request.description}
      </p>

      <div className="mt-6 flex items-center justify-between text-xs text-gray-400">
        <span>
          {new Date(request.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </span>
        {request.approver_details && (
          <span>{request.approver_details.full_name}</span>
        )}
      </div>
    </div>
  );
};

// VARIANT 4: Ultra Minimal (No border on base)
export const RequestCardUltraMinimal: React.FC<RequestCardProps> = ({ request, onClick }) => {
  const status = normalizeStatus(request.status);

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer",
        "bg-gray-50 rounded-2xl p-12",
        "transition-all duration-300",
        "hover:bg-white hover:shadow-lg"
      )}
    >
      <div className="absolute top-5 right-5">
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          statusConfig[status]
        )}>
          {status}
        </span>
      </div>

      <div className="mb-5">
        <h2 className="text-5xl font-bold text-[#111]">
          {formatCurrency(request.amount)}
        </h2>
      </div>

      <h3 className="text-xl font-medium text-[#111] mb-3">
        {request.title}
      </h3>

      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
        {request.description}
      </p>

      {(request.approver_details || request.created_at) && (
        <div className="mt-6 text-xs text-gray-400">
          {new Date(request.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      )}
    </div>
  );
};
