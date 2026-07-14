import { z } from 'zod';

/**
 * Zod Schema for Opening a Dispute
 */
export const openDisputeSchema = z.object({
  projectId: z.string().min(1, 'Project must be selected'),
  milestoneId: z.string().min(1, 'Milestone must be selected'),
  reason: z.string().trim().min(1, 'Reason must be selected or provided'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(2000, 'Description cannot exceed 2000 characters'),
  evidenceUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

export type OpenDisputeFormData = z.infer<typeof openDisputeSchema>;

/**
 * Zod Schema for Adding Evidence
 */
export const addEvidenceSchema = z.object({
  content: z.string().min(20, 'Evidence content must be at least 20 characters'),
  fileUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

export type AddEvidenceFormData = z.infer<typeof addEvidenceSchema>;

/**
 * Zod Schema for Resolving a Dispute (Admin)
 */
export const resolveDisputeSchema = z.object({
  resolutionNote: z.string().min(50, 'Resolution note must be at least 50 characters'),
});

export type ResolveDisputeFormData = z.infer<typeof resolveDisputeSchema>;
