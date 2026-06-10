/**
 * TODO: Temporary UI Preview Data
 * - This data is for temporary UI preview only.
 * - It is used only when the backend is not connected or during a Network Error.
 * - This is NOT production fallback data.
 * - REMOVE/REPLACE once the backend API is ready for integration.
 */
import type { DashboardSummary, AdminUserManagementData, AdminExpertReviewsData, ExpertReviewDetail } from '../types';

export const ADMIN_DASHBOARD_PREVIEW_DATA: DashboardSummary = {
  totalUsers: 12540,
  newUsersThisMonth: 450,
  openJobs: 86,
  activeProjects: 142,
  totalTransactionsValue: 450800,
  pendingReviews: 12,
  openDisputes: 4,
  userOverview: [
    { role: 'Client', count: 8400, fillPercentage: 67 },
    { role: 'Expert', count: 3200, fillPercentage: 25 },
    { role: 'Admin', count: 940, fillPercentage: 8 },
  ],
  transactionSummary: [
    { type: 'Escrow Funded', amount: 280500 },
    { type: 'Released to Experts', amount: 145000 },
    { type: 'Frozen/Disputed', amount: 25300 },
  ],
  activeProjectsList: [
    {
      id: '1',
      title: 'E-commerce Platform Redesign',
      clientName: 'Sarah Johnson',
      expertName: 'Alex Rivera',
      status: 'Active',
      amount: 4500,
      paymentStatus: 'Funded',
    },
    {
      id: '2',
      title: 'Mobile App Development (iOS)',
      clientName: 'TechCorp Solutions',
      expertName: 'Michael Chen',
      status: 'Active',
      amount: 12000,
      paymentStatus: 'Milestone 1 Paid',
    },
    {
      id: '3',
      title: 'Machine Learning Model for Risk',
      clientName: 'Global Finance Inc.',
      expertName: 'Elena Rodriguez',
      status: 'Review',
      amount: 8500,
      paymentStatus: 'Funded',
    },
    {
      id: '4',
      title: 'Content Strategy & SEO',
      clientName: 'Creative Bloom',
      expertName: 'David Smith',
      status: 'Active',
      amount: 2200,
      paymentStatus: 'Funded',
    },
  ],
  reviewQueue: [
    { label: 'Pending Verification', count: 18 },
    { label: 'New Portfolio Items', count: 24 },
    { label: 'Flagged Content', count: 3 },
  ],
  healthAlerts: [
    {
      title: 'High Dispute Rate in "Design" Category',
      description: 'Disputes in this category have increased by 15% this week.',
      severity: 'warning',
    },
    {
      title: 'Payment Gateway Latency',
      description: 'Minor delays reported in transaction processing (avg 4s).',
      severity: 'info',
    },
  ],
  topCategories: [
    { name: 'Development', jobCount: 45, totalValue: 180000 },
    { name: 'Design', jobCount: 22, totalValue: 45000 },
    { name: 'Marketing', jobCount: 12, totalValue: 15000 },
  ],
  recentActivity: [
    {
      title: 'New Expert Registered',
      description: 'Elena Rodriguez joined the platform.',
      type: 'info',
    },
    {
      title: 'Dispute Resolution',
      description: 'Project #402 resolved in favor of Expert.',
      type: 'info',
    },
    {
      title: 'Security Alert',
      description: 'Failed login attempts detected on Admin #2.',
      type: 'alert',
    },
  ],
};

export const ADMIN_USER_MANAGEMENT_PREVIEW_DATA: AdminUserManagementData = {
  totalUsers: 2450,
  activeUsers: 2180,
  suspendedUsers: 32,
  pendingVerify: 24,
  totalClients: 1680,
  totalExperts: 770,
  users: [
    {
      id: 'u1',
      fullName: 'An Nguyen',
      email: 'annguyen@example.com',
      role: 'Expert',
      status: 'Active',
      verificationState: 'Verified',
      createdAt: 'May 20',
      lastLoginAt: 'Today',
      initials: 'AN',
      projectsCount: 8,
      proposalsCount: 15,
      completionRate: '90%',
      riskLevel: 'Low'
    },
    {
      id: 'u2',
      fullName: 'Linh Tran',
      email: 'linhtran@example.com',
      role: 'Client',
      status: 'Active',
      verificationState: 'N/A',
      createdAt: 'May 18',
      lastLoginAt: 'May 30',
      initials: 'LT',
      projectsCount: 3,
      proposalsCount: 0,
      completionRate: '100%',
      riskLevel: 'Low'
    },
    {
      id: 'u3',
      fullName: 'Test Expert',
      email: 'testexpert@example.com',
      role: 'Expert',
      status: 'Suspended',
      verificationState: 'Rejected',
      createdAt: 'May 10',
      lastLoginAt: 'May 20',
      initials: 'TE',
      projectsCount: 0,
      proposalsCount: 5,
      completionRate: '0%',
      riskLevel: 'High'
    },
    {
      id: 'u4',
      fullName: 'Mai Pham',
      email: 'maipham@example.com',
      role: 'Expert',
      status: 'Pending',
      verificationState: 'Review',
      createdAt: 'May 28',
      lastLoginAt: 'Today',
      initials: 'MP',
      projectsCount: 0,
      proposalsCount: 0,
      completionRate: '0%',
      riskLevel: 'Med'
    },
    {
      id: 'u5',
      fullName: 'Admin User',
      email: 'admin@aivora.app',
      role: 'Admin',
      status: 'Active',
      verificationState: 'Internal',
      createdAt: 'Apr 12',
      lastLoginAt: 'Today',
      initials: 'AD',
      projectsCount: 0,
      proposalsCount: 0,
      completionRate: 'N/A',
      riskLevel: 'Low'
    }
  ],
  reviewQueue: [
    {
      id: 'rq1',
      userId: 'u3',
      fullName: 'Test Expert',
      initials: 'TE',
      reason: 'Suspicious proposals',
      severity: 'High'
    },
    {
      id: 'rq2',
      userId: 'u4',
      fullName: 'Mai Pham',
      initials: 'MP',
      reason: 'Verification pending',
      severity: 'Review'
    },
    {
      id: 'rq3',
      userId: 'u6',
      fullName: 'Khoa Le',
      initials: 'KL',
      reason: 'Multiple reports',
      severity: 'Med'
    }
  ],
  recentActions: [
    {
      title: 'Suspended account',
      description: 'Test Expert • suspicious activity',
      type: 'alert'
    },
    {
      title: 'Activated account',
      description: 'Linh Tran • cleared review',
      type: 'info'
    },
    {
      title: 'Rejected evidence',
      description: 'Profile proof did not match skills',
      type: 'alert'
    }
  ]
};

export const ADMIN_EXPERT_REVIEWS_PREVIEW_DATA: AdminExpertReviewsData = {
  reviews: [
    {
      id: 'rev1',
      expertId: 'u1',
      fullName: 'An Nguyen',
      email: 'an@example.com',
      initials: 'AN',
      status: 'Pending',
      submittedAt: 'Jun 1',
      title: 'AI Chatbot Expert',
      skills: ['Chatbot', 'NLP'],
      experienceYears: 3,
      proofCount: 4
    },
    {
      id: 'rev2',
      expertId: 'u4',
      fullName: 'Mai Pham',
      email: 'mai@example.com',
      initials: 'MP',
      status: 'Pending',
      submittedAt: 'Today',
      title: 'RAG Engineer',
      skills: ['RAG', 'Python'],
      experienceYears: 2,
      proofCount: 3
    },
    {
      id: 'rev3',
      expertId: 'u6',
      fullName: 'Khoa Le',
      email: 'khoa@example.com',
      initials: 'KL',
      status: 'Pending',
      submittedAt: 'May 31',
      title: 'Prompt Engineer',
      skills: ['Prompt', 'LLM'],
      experienceYears: 4,
      proofCount: 5
    },
    {
      id: 'rev4',
      expertId: 'u7',
      fullName: 'Hoa Nguyen',
      email: 'hoa@example.com',
      initials: 'HN',
      status: 'Revision',
      submittedAt: 'May 29',
      title: 'ML Specialist',
      skills: ['ML', 'Python'],
      experienceYears: 5,
      proofCount: 6
    }
  ],
  totalPending: 24,
  totalRevisions: 12,
  newToday: 6,
  totalRejected: 38
};

export const ADMIN_EXPERT_REVIEW_DETAIL_PREVIEW_DATA: Record<string, ExpertReviewDetail> = {
  'rev1': {
    id: 'rev1',
    expertId: 'u1',
    fullName: 'An Nguyen',
    email: 'annguyen@example.com',
    initials: 'AN',
    status: 'Pending',
    submittedAt: 'Jun 1',
    title: 'AI Chatbot Expert',
    skills: ['Chatbot', 'NLP'],
    experienceYears: 3,
    proofCount: 4,
    bio: {
      current: 'I build chatbots.',
      requested: 'Helping businesses build practical chatbot and automation solutions with LLMs.',
      isChanged: true
    },
    hourlyRate: {
      current: 20,
      requested: 25,
      isChanged: true
    },
    skillsComparison: {
      current: ['Python', 'Chatbot'],
      requested: ['Python', 'Chatbot', 'NLP', 'LLM'],
      isChanged: true
    },
    categories: {
      current: ['Development'],
      requested: ['Development', 'AI & Machine Learning'],
      isChanged: true
    },
    experience: {
      current: '2 years',
      requested: '3 years of building production-grade RAG systems.',
      isChanged: true
    },
    portfolio: [
      { id: 'p1', title: 'Chatbot Demo', type: 'Portfolio', url: '#', status: 'Strong' },
      { id: 'p2', title: 'ML Certificate', type: 'Certificate', url: '#', status: 'Verified' },
      { id: 'p3', title: 'Project Screenshot', type: 'Screenshot', url: '#', status: 'Review' }
    ]
  }
};
