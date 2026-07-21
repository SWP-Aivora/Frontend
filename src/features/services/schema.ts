import { z } from 'zod';
import { PackageTier } from './types';

export const servicePackageSchema = z.object({
  tier: z.enum([PackageTier.BASIC, PackageTier.STANDARD, PackageTier.PREMIUM]),
  title: z.string().min(2, 'Package title is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  deliveryDays: z.coerce.number().int().min(1, 'Delivery must be at least 1 day').max(3650, 'Delivery is too long'),
  features: z.string().optional(),
});

export const serviceFaqSchema = z.object({
  question: z.string().min(3, 'FAQ question is required'),
  answer: z.string().min(3, 'FAQ answer is required'),
});

export const serviceFormSchema = z.object({
  title: z.string().min(3, 'Service title is required').max(255, 'Title is too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description is too long'),
  attachmentUrl: z.string().url('Attachment must be a valid URL').optional().or(z.literal('')),
  packages: z.array(servicePackageSchema).min(1, 'At least one package is required'),
  faqs: z.array(serviceFaqSchema).min(1, 'At least one FAQ is required'),
});

export const serviceRequestFormSchema = z.object({
  packageId: z.string().min(1, 'Please select a package'),
  note: z.string().max(2000, 'Note is too long').optional(),
});

export const aiServiceGenerationSchema = z.object({
  rawInput: z.string().min(20, 'Describe your service in at least 20 characters').max(4000, 'Prompt is too long'),
  skills: z.string().min(1, 'Add at least one skill'),
  priceFrom: z.coerce.number().min(1, 'Starting price must be greater than 0').max(100000, 'Starting price is too high'),
  deliveryDays: z.coerce.number().int().min(1, 'Delivery must be at least 1 day').max(365, 'Delivery is too long'),
  tone: z.enum(['professional', 'friendly', 'premium', 'technical']),
  targetClient: z.enum(['startup', 'sme', 'enterprise', 'individual']),
  language: z.enum(['vi', 'en']),
});

export const serviceOfferMilestoneSchema = z.object({
  title: z.string().min(2, 'Milestone title is required'),
  description: z.string().optional(),
  amount: z.coerce.number().min(1, 'Milestone amount must be greater than 0'),
  dueDays: z.coerce.number().int().min(1, 'Due days must be at least 1').max(3650, 'Due days is too long'),
  acceptanceCriteria: z.string().optional(),
  orderIndex: z.coerce.number().int().min(0),
});

export const serviceOfferSchema = z.object({
  amount: z.coerce.number().min(1, 'Offer amount must be greater than 0'),
  milestones: z.array(serviceOfferMilestoneSchema).min(1, 'At least one milestone is required'),
}).superRefine((value, ctx) => {
  const total = value.milestones.reduce((sum, milestone) => sum + Number(milestone.amount || 0), 0);
  if (total !== Number(value.amount)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['amount'],
      message: 'Offer amount must equal the total milestone amount',
    });
  }
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
export type ServiceRequestFormValues = z.infer<typeof serviceRequestFormSchema>;
export type AiServiceGenerationValues = z.infer<typeof aiServiceGenerationSchema>;
export type ServiceOfferFormValues = z.infer<typeof serviceOfferSchema>;

