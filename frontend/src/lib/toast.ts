import toast from 'react-hot-toast';

/**
 * Centralized toast notification utilities
 * Provides consistent styling and behavior for all notifications
 */

export const showSuccess = (message: string, duration = 4000) => {
  toast.success(message, {
    duration,
    style: {
      background: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500'
    },
    iconTheme: {
      primary: '#22c55e',
      secondary: '#f0fdf4'
    }
  });
};

export const showError = (message: string, duration = 5000) => {
  toast.error(message, {
    duration,
    style: {
      background: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500'
    },
    iconTheme: {
      primary: '#ef4444',
      secondary: '#fef2f2'
    }
  });
};

export const showInfo = (message: string, duration = 4000) => {
  toast(message, {
    duration,
    icon: 'ℹ️',
    style: {
      background: '#eff6ff',
      color: '#1e40af',
      border: '1px solid #bfdbfe',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500'
    }
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message, {
    style: {
      background: '#f9fafb',
      color: '#374151',
      border: '1px solid #e5e7eb',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '500'
    }
  });
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

export const dismissAll = () => {
  toast.dismiss();
};
