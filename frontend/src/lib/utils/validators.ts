/**
 * File validation utilities
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates file type
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns Validation result
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[]
): FileValidationResult => {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  return { valid: true };
};

/**
 * Validates file size
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in megabytes
 * @returns Validation result
 */
export const validateFileSize = (
  file: File,
  maxSizeMB: number
): FileValidationResult => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`
    };
  }

  return { valid: true };
};

/**
 * Validates a file for upload (type and size)
 * @param file - File to validate
 * @param options - Validation options
 * @returns Validation result
 */
export const validateFile = (
  file: File | null,
  options: {
    required?: boolean;
    allowedTypes?: string[];
    maxSizeMB?: number;
  } = {}
): FileValidationResult => {
  const {
    required = false,
    allowedTypes = ['application/pdf'],
    maxSizeMB = 5
  } = options;

  if (!file) {
    if (required) {
      return { valid: false, error: 'File is required' };
    }
    return { valid: true };
  }

  const typeValidation = validateFileType(file, allowedTypes);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  const sizeValidation = validateFileSize(file, maxSizeMB);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return { valid: true };
};

/**
 * Validates required string field
 * @param value - Value to validate
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export const validateRequired = (
  value: string,
  fieldName: string
): FileValidationResult => {
  if (!value || value.trim().length === 0) {
    return {
      valid: false,
      error: `${fieldName} is required`
    };
  }
  return { valid: true };
};

/**
 * Validates positive number
 * @param value - Value to validate
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export const validatePositiveNumber = (
  value: string | number,
  fieldName: string
): FileValidationResult => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue) || numValue <= 0) {
    return {
      valid: false,
      error: `${fieldName} must be a positive number`
    };
  }

  return { valid: true };
};

/**
 * Validates minimum string length
 * @param value - String to validate
 * @param minLength - Minimum length
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): FileValidationResult => {
  if (value.trim().length < minLength) {
    return {
      valid: false,
      error: `${fieldName} must be at least ${minLength} characters`
    };
  }
  return { valid: true };
};
