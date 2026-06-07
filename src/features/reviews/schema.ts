import { z } from 'zod';

export const reviewSchema = z.object({
  projectId: z.string().min(1, 'Invalid project ID'),
  revieweeId: z.string().min(1, 'Invalid user ID'),
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Feedback must be at least 10 characters').max(1000, 'Feedback is too long'),
  communicationRating: z.number().min(1).max(5).optional().nullable(),
  qualityRating: z.number().min(1).max(5).optional().nullable(),
  deadlineRating: z.number().min(1).max(5).optional().nullable(),
  requirementClarityRating: z.number().min(1).max(5).optional().nullable(),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
