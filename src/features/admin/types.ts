export interface DashboardSummary {
  totalUsers: number;
  newUsersThisMonth: number;
  openJobs: number;
  activeProjects: number;
  totalTransactionsValue: number;
  pendingReviews: number;
  openDisputes: number;
  userOverview: UserOverviewItem[];
  transactionSummary: TransactionSummaryItem[];
  activeProjectsList: AdminProjectItem[];
  reviewQueue: ReviewQueueItem[];
  healthAlerts: HealthAlertItem[];
  topCategories: TopCategoryItem[];
  recentActivity: RecentActivityItem[];
}

export interface UserOverviewItem {
  role: string;
  count: number;
  fillPercentage: number;
}

export interface TransactionSummaryItem {
  type: string;
  amount: number;
}

export interface AdminProjectItem {
  id: string;
  title: string;
  clientName: string;
  expertName: string;
  status: string;
  amount: number;
  paymentStatus: string;
}

export interface ReviewQueueItem {
  label: string;
  count: number;
}

export interface HealthAlertItem {
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface TopCategoryItem {
  name: string;
  jobCount: number;
  totalValue: number;
}

export interface RecentActivityItem {
  title: string;
  description: string;
  type: 'info' | 'alert';
}

export interface AdminUserItem {
  id: string;
  fullName: string;
  email: string;
  role: 'Admin' | 'Expert' | 'Client';
  status: 'Active' | 'Suspended' | 'Pending';
  verificationState: 'Verified' | 'N/A' | 'Rejected' | 'Pending' | 'Review' | 'Internal';
  createdAt: string;
  lastLoginAt: string;
  avatarUrl?: string | null;
  initials?: string;
  // Details drawer info
  projectsCount?: number;
  proposalsCount?: number;
  completionRate?: string;
  riskLevel?: 'Low' | 'Med' | 'High';
}

export interface AdminUserReviewQueueItem {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  initials?: string;
  reason: string;
  severity: 'High' | 'Med' | 'Review';
}

export interface AdminUserManagementData {
  users: AdminUserItem[];
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  pendingVerify: number;
  totalClients: number;
  totalExperts: number;
  reviewQueue: AdminUserReviewQueueItem[];
  recentActions: RecentActivityItem[];
}

export type ExpertReviewStatus = 'Pending' | 'Approved' | 'Rejected' | 'Revision';

export interface ExpertReviewItem {
  id: string;
  expertId: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  initials: string;
  status: ExpertReviewStatus;
  submittedAt: string;
  title: string;
  skills: string[];
  experienceYears: number;
  proofCount: number;
}

export interface ComparisonValue<T> {
  current: T;
  requested: T;
  isChanged: boolean;
}

export interface ExpertReviewDetail extends ExpertReviewItem {
  bio: ComparisonValue<string>;
  hourlyRate: ComparisonValue<number>;
  skillsComparison: ComparisonValue<string[]>;
  categories: ComparisonValue<string[]>;
  experience: ComparisonValue<string>;
  portfolio: {
    id: string;
    title: string;
    type: string;
    url: string;
    status: 'Verified' | 'Review' | 'Strong';
  }[];
  adminNote?: string;
}

export interface ExpertReviewActionParams {
  id: string;
  status: 'Approved' | 'Rejected' | 'Revision';
  note?: string;
}

export interface AdminExpertReviewsData {
  reviews: ExpertReviewItem[];
  totalPending: number;
  totalRevisions: number;
  newToday: number;
  totalRejected: number;
}
