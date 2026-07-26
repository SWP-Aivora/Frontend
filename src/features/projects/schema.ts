// Zod schemas for the projects feature.
import { z } from 'zod';

/**
 * Validation schema for creating a new milestone in a hired project.
 * Backend endpoint: POST /projects/{id}/milestones
 */
export const createMilestoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Milestone title is required'),
  description: z
    .string()
    .optional()
    .default(''),
  amount: z
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be greater than 0'),
  dueDate: z
    .string()
    .optional()
    .default(''),
  acceptanceCriteria: z
    .string()
    .optional()
    .default(''),
});

export type CreateMilestoneFormValues = z.infer<typeof createMilestoneSchema>;

export const editMilestoneSchema = createMilestoneSchema;

export type EditMilestoneFormValues = z.infer<typeof editMilestoneSchema>;
