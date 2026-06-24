import { z } from 'zod';

export const proposalMilestoneSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional().nullable(),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  dueDays: z.coerce.number().int().min(1, 'Days must be greater than 0'),
  acceptanceCriteria: z.string().optional().nullable(),
  orderIndex: z.number().int(),
});

export const createProposalSchema = z.object({
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters to stand out.'),
  proposedBudget: z.coerce.number().min(1, 'Budget must be greater than 0'),
  proposedTimelineDays: z.coerce.number().int().min(1, 'Timeline must be at least 1 day').optional().nullable(),
  attachments: z.string().max(1000, 'Keep portfolio links under 1000 characters.').optional().nullable(),
  milestones: z.array(proposalMilestoneSchema)
    .min(1, 'At least one milestone is required')
    .refine(milestones => milestones.every(m => m.title.length >= 3), {
      message: 'Each milestone must have a title of at least 3 characters',
    })
    .optional(),
});

export type CreateProposalFormValues = z.infer<typeof createProposalSchema>;
