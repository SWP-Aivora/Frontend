import { z } from 'zod';

/**
 * Reusable helper for optional URL fields.
 * - Allows valid URLs.
 * - Allows empty strings (converts to null or keeps as-is depending on requirement).
 * - Allows null or undefined.
 */
const optionalUrlSchema = z
  .union([
    z.string().url('Invalid URL format'),
    z.literal(''),
    z.null(),
    z.undefined()
  ])
  .transform((val) => (val === '' ? null : val));

// Base User Schema (PUT /api/v1/users/me)
export const userUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').trim().optional().nullable(),
  avatarUrl: optionalUrlSchema,
  phone: z.string().trim().optional().nullable(),
});

// Client Profile Schema (PUT /api/v1/profiles/client)
export const clientProfileSchema = z.object({
  companyName: z.string().trim().optional().nullable(),
  industry: z.string().trim().optional().nullable(),
  companySize: z.string().optional().nullable(),
  website: optionalUrlSchema,
  description: z.string().trim().optional().nullable(),
});

// Expert Profile Schema (PUT /api/v1/profiles/expert)
export const expertProfileSchema = z.object({
  title: z.string().trim().optional().nullable(),
  bio: z.string().trim().optional().nullable(),
  hourlyRate: z.coerce.number().min(0, 'Rate cannot be negative').optional().nullable(),
  experienceYears: z.coerce.number().int().min(0).optional().nullable(),
  availabilityStatus: z.coerce.number().int().optional().nullable(),
});

// Security Schema (Placeholder for future)
export const securitySchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmNewPassword: z.string().min(6, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});

export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;
export type ClientProfileFormValues = z.infer<typeof clientProfileSchema>;
export type ExpertProfileFormValues = z.infer<typeof expertProfileSchema>;
export type SecurityFormValues = z.infer<typeof securitySchema>;
