import type { Role } from '@/shared/types/enums';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  phone?: string;
  location?: string;
  language?: string;
  timezone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  proposals: boolean;
  projectUpdates: boolean;
  paymentUpdates: boolean;
  emailAlerts: boolean;
  inAppAlerts: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
}
