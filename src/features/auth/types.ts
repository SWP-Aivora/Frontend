import type { Role } from '@/shared/types/enums';
import { z } from 'zod';
import { loginSchema } from './schema';

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
