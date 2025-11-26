import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../ui';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  confirmVariant?: 'accent' | 'danger';
  isLoading?: boolean;
  showReasonInput?: boolean;
  reason?: string;
  onReasonChange?: (value: string) => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmVariant = 'accent',
  isLoading = false,
  showReasonInput = false,
  reason = '',
  onReasonChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`p-2 rounded-full ${
              confirmVariant === 'danger' ? 'bg-red-50' : 'bg-green-50'
            }`}
          >
            <AlertCircle
              className={`w-6 h-6 ${
                confirmVariant === 'danger' ? 'text-red-600' : 'text-green-600'
              }`}
            />
          </div>
          <div className="flex-1">
            <h3 id="dialog-title" className="text-lg font-bold text-gray-900 mb-1">
              {title}
            </h3>
            <p id="dialog-description" className="text-sm text-gray-600">
              {message}
            </p>
          </div>
        </div>

        {showReasonInput && (
          <div className="mb-4">
            <label
              htmlFor="rejection-reason"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Reason (optional)
            </label>
            <textarea
              id="rejection-reason"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-20 resize-none"
              placeholder="Provide a reason for rejection..."
              value={reason}
              onChange={(e) => onReasonChange?.(e.target.value)}
              disabled={isLoading}
            />
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Cancel action"
          >
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            isLoading={isLoading}
            aria-label={confirmText}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
