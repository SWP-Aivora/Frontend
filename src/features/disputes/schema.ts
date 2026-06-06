import { z } from 'zod';

/**
 * Zod Schema for Opening a Dispute
 */
export const openDisputeSchema = z.object({
  reason: z.string().min(10, 'Dispute reason must be at least 10 characters'),
  description: z.string().min(50, 'Detailed description must be at least 50 characters').optional().or(z.literal('')),
});

export type OpenDisputeFormData = z.infer<typeof openDisputeSchema>;

/**
 * Zod Schema for Adding Evidence
 */
export const addEvidenceSchema = z.object({
  content: z.string().min(20, 'Evidence content must be at least 20 characters'),
  fileUrl: z.string().url('Invalid file URL format').optional().nullable(),
});

export type AddEvidenceFormData = z.infer<typeof addEvidenceSchema>;

/**
 * Zod Schema for Resolving a Dispute (Admin)
 */
export const resolveDisputeSchema = z.object({
  resolutionType: z.number({ required_error: 'Please select a resolution type' }),
  resolutionNote: z.string().min(50, 'Resolution note must be at least 50 characters'),
  releaseAmount: z.number().min(0).optional().nullable(),
  refundAmount: z.number().min(0).optional().nullable(),
});

export type ResolveDisputeFormData = z.infer<typeof resolveDisputeSchema>;
