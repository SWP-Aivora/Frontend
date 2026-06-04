/**
 * User Roles in AIVORA
 */
export const Role = {
  CLIENT: 'Client',
  EXPERT: 'Expert',
  ADMIN: 'Admin',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

/**
 * Project Status based on backend schema
 */
export const ProjectStatus = {
  DRAFT: 0,
  PENDING_FUNDING: 1,
  IN_PROGRESS: 2,
  COMPLETED: 3,
  CANCELLED: 4,
  DISPUTED: 5,
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

/**
 * Job Status (Marketplace context)
 */
export const JobStatus = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  IN_PROGRESS: 'InProgress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

/**
 * Payment and Milestone Status
 */
export const PaymentStatus = {
  PENDING: 'Pending',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
  FAILED: 'Failed',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

/**
 * Skill Level (from API)
 */
export const SkillLevel = {
  BEGINNER: 0,
  INTERMEDIATE: 1,
  EXPERT: 2,
} as const;
export type SkillLevel = (typeof SkillLevel)[keyof typeof SkillLevel];

/**
 * Budget Type
 */
export const BudgetType = {
  FIXED: 0,
  HOURLY: 1,
} as const;
export type BudgetType = (typeof BudgetType)[keyof typeof BudgetType];

/**
 * Job Visibility
 */
export const JobVisibility = {
  PUBLIC: 0,
  PRIVATE: 1,
} as const;
export type JobVisibility = (typeof JobVisibility)[keyof typeof JobVisibility];
