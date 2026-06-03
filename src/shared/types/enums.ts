/**
 * User Roles in AIVORA
 */
export enum Role {
  CLIENT = 'Client',
  EXPERT = 'Expert',
  ADMIN = 'Admin',
}

/**
 * Project Status based on backend schema
 */
export enum ProjectStatus {
  DRAFT = 0,
  PENDING_FUNDING = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
  CANCELLED = 4,
  DISPUTED = 5,
}

/**
 * Job Status (Marketplace context)
 */
export enum JobStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

/**
 * Payment and Milestone Status
 */
export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  REFUNDED = 'Refunded',
  FAILED = 'Failed',
}

/**
 * Skill Level (from API)
 */
export enum SkillLevel {
  BEGINNER = 0,
  INTERMEDIATE = 1,
  EXPERT = 2,
}

/**
 * Budget Type
 */
export enum BudgetType {
  FIXED = 0,
  HOURLY = 1,
}

/**
 * Job Visibility
 */
export enum JobVisibility {
  PUBLIC = 0,
  PRIVATE = 1,
}
