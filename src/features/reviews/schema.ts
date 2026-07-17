import { z } from 'zod';

const selectedDetailedRating = (label: string) => (
  z.number().min(1, `${label} must be between 1 and 5`).max(5, `${label} must be between 1 and 5`)
    .nullable()
    .refine((rating) => rating !== null, `Please select a ${label.toLowerCase()} rating`)
);

export const reviewSchema = z.object({
  projectId: z.string().uuid('Invalid project ID'),
  revieweeId: z.string().uuid('Invalid user ID'),
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Feedback must be at least 10 characters').max(1000, 'Feedback is too long'),
  communicationRating: selectedDetailedRating('Communication'),
  qualityRating: selectedDetailedRating('Collaboration'),
  deadlineRating: selectedDetailedRating('Timeline'),
  requirementClarityRating: z.number().min(1).max(5).optional().nullable(),
});

export type ReviewFormData = z.input<typeof reviewSchema>;
