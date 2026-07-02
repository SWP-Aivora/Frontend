import { z } from 'zod';
import { Role } from '@/shared/types/enums';

export const loginSchema = z.object({
  email: z.string().min(1, 'Please enter your email').email('Invalid email address'),
  password: z.string().min(1, 'Please enter your password'),
});

const passwordRules = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().min(1, 'Please enter your email').email('Invalid email address'),
  password: passwordRules,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum([Role.CLIENT, Role.EXPERT], {
    required_error: 'Please select a role',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
