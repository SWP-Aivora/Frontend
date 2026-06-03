import { z } from 'zod';
import type { Role } from '@/shared/types/enums';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
