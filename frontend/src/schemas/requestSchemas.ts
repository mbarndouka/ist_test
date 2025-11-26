import { z } from 'zod';

/**
 * Schema for creating a new purchase request
 */
export const createRequestSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters')
    .trim(),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters')
    .trim(),

  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), {
      message: 'Amount must be a valid number'
    })
    .refine((val) => parseFloat(val) > 0, {
      message: 'Amount must be greater than 0'
    })
    .refine((val) => parseFloat(val) <= 1_000_000_000, {
      message: 'Amount must not exceed 1 billion'
    }),

  proforma_file: z
    .instanceof(File, { message: 'Proforma invoice is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size must not exceed 5MB'
    })
    .refine(
      (file) => ['application/pdf'].includes(file.type),
      {
        message: 'Only PDF files are allowed'
      }
    )
});

/**
 * Schema for updating an existing purchase request
 */
export const updateRequestSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters')
    .trim()
    .optional(),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .optional(),

  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)), {
      message: 'Amount must be a valid number'
    })
    .refine((val) => parseFloat(val) > 0, {
      message: 'Amount must be greater than 0'
    })
    .refine((val) => parseFloat(val) <= 1_000_000_000, {
      message: 'Amount must not exceed 1 billion'
    })
    .optional(),

  proforma_file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size must not exceed 5MB'
    })
    .refine(
      (file) => ['application/pdf'].includes(file.type),
      {
        message: 'Only PDF files are allowed'
      }
    )
    .nullable()
    .optional()
});

/**
 * Schema for receipt upload
 */
export const receiptUploadSchema = z.object({
  receipt: z
    .instanceof(File, { message: 'Receipt file is required' })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size must not exceed 5MB'
    })
    .refine(
      (file) => ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type),
      {
        message: 'Only PDF, JPEG, and PNG files are allowed'
      }
    )
});

// Type inference from schemas
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
export type ReceiptUploadInput = z.infer<typeof receiptUploadSchema>;
