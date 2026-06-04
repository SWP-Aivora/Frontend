import { z } from 'zod';

// Schema for Client posting a job via AI Assistant
export const jobIdeaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please describe your idea in more detail (min 20 chars)'),
  expectedOutcome: z.string().min(10, 'Please describe what you want to achieve'),
  category: z.string().min(1, 'Please select an AI category'),
  domain: z.string().min(1, 'Please select a business domain'),
  budgetType: z.enum(['fixed', 'hourly']).default('fixed'),
  budgetRange: z.string().min(1, 'Please provide a budget estimate'),
  timeline: z.string().min(1, 'Please provide a timeline estimate'),
  additionalNotes: z.string().optional(),
});

export type JobIdeaFormValues = z.infer<typeof jobIdeaSchema>;

// Schema for Job display on the Expert Job Board
export const jobCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  businessDomain: z.string().nullable(),
  budgetType: z.number(), // 0 for Fixed, 1 for Hourly
  budgetMin: z.number().nullable(),
  budgetMax: z.number().nullable(),
  timelineDays: z.number().nullable(),
  experienceLevel: z.number().nullable(),
  createdAt: z.string(),
  skills: z.array(z.string()),
  proposalsCount: z.number(),
  clientName: z.string().nullable(),
  clientVerified: z.boolean().default(false),
});

export type JobCard = z.infer<typeof jobCardSchema>;

// Schema for Proposal Milestone
export const proposalMilestoneSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional().nullable(),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  dueDays: z.coerce.number().int().min(1, 'Days must be greater than 0'),
  acceptanceCriteria: z.string().optional().nullable(),
  orderIndex: z.number().int(),
});

// Schema for Proposal Submission (aligned with POST /api/v1/jobs/{id}/proposals)
export const createProposalSchema = z.object({
  jobId: z.string().uuid(),
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters to stand out.'),
  proposedBudget: z.coerce.number().min(1, 'Budget must be greater than 0'),
  proposedTimelineDays: z.coerce.number().int().min(1, 'Timeline must be at least 1 day').optional().nullable(),
  milestones: z.array(proposalMilestoneSchema).optional(),
});

export type CreateProposalFormValues = z.infer<typeof createProposalSchema>;
