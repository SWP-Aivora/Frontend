import { z } from 'zod';

// Schema for Client posting a job via AI Assistant
export const jobIdeaSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Please describe your idea in more detail (min 20 chars)'),
  expectedOutcome: z.string().min(10, 'Please describe what you want to achieve'),
  category: z.string().min(1, 'Please select an AI category'),
  domain: z.string().min(1, 'Please select a business domain'),
  budgetType: z.number().default(0), // 0 for Fixed, 1 for Hourly
  budgetMin: z.number().min(1, 'Please provide a minimum budget estimate'),
  budgetMax: z.number().min(1, 'Please provide a maximum budget estimate'),
  timelineDays: z.number().min(1, 'Please provide a timeline estimate in days'),
  additionalNotes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.budgetMax < data.budgetMin) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Max budget must be greater than or equal to min budget",
      path: ["budgetMax"]
    });
  }
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


