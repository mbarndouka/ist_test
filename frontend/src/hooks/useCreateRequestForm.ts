import { useState } from 'react';
import { requestsAPI } from '../lib/api';
import { CreateRequestPayload } from '../types';
import { createRequestSchema } from '../schemas/requestSchemas';
import { z } from 'zod';

interface UseCreateRequestFormReturn {
  formData: CreateRequestPayload;
  isSubmitting: boolean;
  validationErrors: Record<string, string>;
  updateField: <K extends keyof CreateRequestPayload>(
    field: K,
    value: CreateRequestPayload[K]
  ) => void;
  handleSubmit: (onSuccess: () => void) => Promise<void>;
  resetForm: () => void;
  validateForm: () => boolean;
}

const initialFormState: CreateRequestPayload = {
  title: '',
  description: '',
  amount: '',
  proforma_file: null
};

/**
 * Custom hook to manage create request form state and validation
 * Handles form data, validation with zod, and submission
 */
export const useCreateRequestForm = (): UseCreateRequestFormReturn => {
  const [formData, setFormData] = useState<CreateRequestPayload>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof CreateRequestPayload>(
    field: K,
    value: CreateRequestPayload[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field when user updates it
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    try {
      createRequestSchema.parse(formData);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          errors[path] = issue.message;
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (onSuccess: () => void) => {
    // Validate before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await requestsAPI.create(formData);
      resetForm();
      onSuccess();
    } catch (error) {
      console.error('Failed to create request:', error);
      throw error; // Re-throw to let caller handle error display
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setValidationErrors({});
  };

  return {
    formData,
    isSubmitting,
    validationErrors,
    updateField,
    handleSubmit,
    resetForm,
    validateForm
  };
};
