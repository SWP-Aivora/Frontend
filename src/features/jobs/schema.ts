import { z } from 'zod';

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
