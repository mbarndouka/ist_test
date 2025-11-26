import React, { useState } from 'react';
import { PurchaseRequest} from '../../types';
import { X, Clock, UserCheck, FileText, Edit2, Save } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { requestsAPI } from '../../lib/api';
import { cn } from '../../lib/utils';
import { formatCurrency, normalizeStatus } from '../../lib/utils';
import { showSuccess, showError } from '../../lib/toast';
import ReceiptValidation from './ReceiptValidation';
import PODataDisplay from './PODataDisplay';

interface RequestDetailProps {
  request: PurchaseRequest;
  onClose: () => void;
  onRefresh: () => void;
}

const statusConfig = {
  APPROVED: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-700 border-red-500/20',
  PENDING: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
};

const RequestDetail: React.FC<RequestDetailProps> = ({ request, onClose, onRefresh }) => {
  const { user } = useAuth();
  const status = normalizeStatus(request.status);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: request.title,
    amount: request.amount,
    description: request.description,
    proforma_file: null as File | null
  });

  // Check if current user can edit
  const requesterId = request.requester_details?.id;
  const isOwner = String(user?.id) === String(requesterId);
  const canEdit = isOwner && status === 'PENDING';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await requestsAPI.update(request.id, editForm);
      showSuccess('Request updated successfully');
      setIsEditing(false);
      onRefresh();
      onClose();
    } catch (error) {
      showError('Failed to update request');
      console.error("Update failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

        {/* Hero Header - Minimalist Design */}
        <div className="relative bg-[#111] px-12 pt-12 pb-16">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Status Badge */}
          <div className="mb-8">
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border",
              statusConfig[status]
            )}>
              {status}
            </span>
          </div>

          {/* Hero Amount */}
          <div className="mb-6">
            {isEditing ? (
              <input
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-5xl font-bold text-white focus:outline-none focus:border-[#ccff00]"
              />
            ) : (
              <h1 className="text-6xl font-bold bg-linear-to-r from-[#ccff00] to-[#a3ff00] bg-clip-text text-transparent">
                {formatCurrency(request.amount)}
              </h1>
            )}
          </div>

          {/* Title */}
          <div className="mb-4">
            {isEditing ? (
              <input
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-2xl font-semibold text-white focus:outline-none focus:border-[#ccff00]"
                placeholder="Request Title"
              />
            ) : (
              <h2 className="text-3xl font-semibold text-white">
                {request.title}
              </h2>
            )}
          </div>

          {/* Request ID - Subtle */}
          <div className="text-xs text-gray-400 font-mono">
            ID: {typeof request.id === 'string' ? request.id.substring(0, 8) : request.id}
          </div>
        </div>

        {/* Body - Light Background */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-12 space-y-8">

            {/* Edit Button */}
            {canEdit && !isEditing && (
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-sm font-medium text-gray-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Request
                </button>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3 block">
                Description
              </label>
              {isEditing ? (
                <textarea
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#ccff00] min-h-[120px]"
                  rows={5}
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  placeholder="Describe the purpose of this request..."
                />
              ) : (
                <p className="text-gray-700 text-base leading-relaxed">
                  {request.description}
                </p>
              )}
            </div>

            {/* Requester Info */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3 block">
                Requested By
              </label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {request.requester_details.full_name}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(request.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Approver Info */}
            {!isEditing && request.approver_details && (
              <div className={cn(
                "rounded-2xl p-8 border",
                status === 'REJECTED'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-emerald-50 border-emerald-200'
              )}>
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-3 block">
                  {status === 'REJECTED' ? 'Rejected By' : 'Approved By'}
                </label>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    status === 'REJECTED' ? 'bg-red-100' : 'bg-emerald-100'
                  )}>
                    <UserCheck className={cn(
                      "w-5 h-5",
                      status === 'REJECTED' ? 'text-red-600' : 'text-emerald-600'
                    )} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {request.approver_details.full_name}
                    </p>
                    {request.logs && request.logs.length > 0 && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(request.logs[request.logs.length - 1].timestamp).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Documents */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-4 block">
                Documents
              </label>

              {isEditing && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="block text-sm text-gray-600 mb-2 font-medium">
                    Replace Proforma (Optional)
                  </label>
                  <input
                    type="file"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#ccff00] file:text-[#111] hover:file:bg-[#b8e600] file:cursor-pointer"
                    onChange={(e) => {
                      if(e.target.files?.[0]) setEditForm({...editForm, proforma_file: e.target.files[0]})
                    }}
                  />
                </div>
              )}

              <div className="space-y-3">
                {request.proforma && (
                  <a
                    href={request.proforma}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <FileText className="w-5 h-5 text-gray-400 mr-3 group-hover:text-blue-500" />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600">
                        Proforma Invoice
                      </span>
                    </div>
                  </a>
                )}

                {request.purchase_order && (
                  <a
                    href={request.purchase_order}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center p-4 border-2 border-emerald-200 bg-emerald-50 rounded-xl hover:border-emerald-300 hover:bg-emerald-100 transition-all"
                  >
                    <FileText className="w-5 h-5 text-emerald-600 mr-3" />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-emerald-900">
                        Purchase Order
                      </span>
                    </div>
                  </a>
                )}

                {request.receipt && (
                  <a
                    href={request.receipt}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center p-4 border-2 border-purple-200 bg-purple-50 rounded-xl hover:border-purple-300 hover:bg-purple-100 transition-all"
                  >
                    <FileText className="w-5 h-5 text-purple-600 mr-3" />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-purple-900">
                        Receipt
                      </span>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Purchase Order Data Display */}
            {!isEditing && request.purchase_order && (
              <PODataDisplay
                poData={request.po_data || null}
                purchaseOrderUrl={request.purchase_order}
              />
            )}

            {/* Receipt Validation Results */}
            {!isEditing && request.receipt && request.receipt_validation_status && (
              <ReceiptValidation
                validationStatus={request.receipt_validation_status}
                validationResult={request.receipt_validation_result}
              />
            )}

            {/* Timeline */}
            {!isEditing && request.logs && request.logs.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-6 block">
                  Activity Timeline
                </label>
                <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                  {/* Created Node */}
                  <div className="relative">
                    <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-blue-500 border-4 border-white ring-2 ring-gray-100"></div>
                    <p className="text-sm font-semibold text-gray-900">Request Created</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {request.requester_details.full_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(request.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Logs */}
                  {request.logs.map((log, idx) => (
                    <div key={idx} className="relative">
                      <div className={cn(
                        "absolute -left-[29px] top-1 w-4 h-4 rounded-full border-4 border-white ring-2 ring-gray-100",
                        log.action.toUpperCase().includes('APPROVED') ? 'bg-emerald-500' : 'bg-red-500'
                      )}></div>
                      <p className="text-sm font-semibold text-gray-900">
                        {log.action.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {log.approver_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(log.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-200 bg-white">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-6 py-3 rounded-xl bg-[#ccff00] border-2 border-[#ccff00] font-medium text-[#111] hover:bg-[#b8e600] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-6 py-3 rounded-xl bg-gray-100 border-2 border-gray-200 font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
