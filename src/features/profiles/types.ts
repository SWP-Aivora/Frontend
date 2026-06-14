import type { Role } from '@/shared/types/enums';

export interface UserProfile {
  id: string;
  fullName: string | null;
  email: string;
  role: Role;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientProfile {
  id: string;
  companyName: string | null;
  industry: string | null;
  companySize: string | null;
  website: string | null;
  description: string | null;
  user: UserProfile;
}

export interface ExpertProfile {
  id: string;
  title: string | null;
  bio: string | null;
  hourlyRate: number | null;
  experienceYears: number | null;
  availabilityStatus: number | null;
  user: UserProfile;
}

export interface ExpertProfileResponse {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  title: string | null;
  bio: string | null;
  hourlyRate: number | null;
  experienceYears: number;
  availabilityStatus: number;
  rating: number;
  totalReviews: number;
  completedProjects: number;
  successRate: number;
}
