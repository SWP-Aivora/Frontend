import type { JobCard } from './schema';
import type { Job } from './types';

export const normalizeBudgetType = (value: unknown) => {
  if (value === 0) return 'FIXED';
  if (value === 1) return 'HOURLY';

  const normalized = String(value ?? '').toUpperCase();
  if (normalized === 'FIXED' || normalized === 'HOURLY') return normalized;

  return null;
};

export const normalizeSkillLevel = (value: unknown) => {
  if (value === 0) return 'BEGINNER';
  if (value === 1) return 'INTERMEDIATE';
  if (value === 2) return 'ADVANCED';
  if (value === 3) return 'EXPERT';

  const normalized = String(value ?? '').toUpperCase();
  if (normalized === 'EXPERIENCED') return 'ADVANCED';
  if (['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(normalized)) return normalized;

  return null;
};

export const mapBudgetTypeToCardValue = (value: unknown) => {
  const normalized = normalizeBudgetType(value);
  return normalized === 'HOURLY' ? 1 : 0;
};

export const mapSkillLevelToCardValue = (value: unknown) => {
  const normalized = normalizeSkillLevel(value);
  if (normalized === 'BEGINNER') return 0;
  if (normalized === 'INTERMEDIATE') return 1;
  if (normalized === 'ADVANCED') return 2;
  if (normalized === 'EXPERT') return 3;
  return null;
};

export const getNumberField = (value: Record<string, unknown>, ...keys: string[]): number | null => {
  for (const key of keys) {
    const fieldValue = value[key];
    if (typeof fieldValue === 'number' && Number.isFinite(fieldValue)) return fieldValue;
    if (typeof fieldValue === 'string' && fieldValue.trim() !== '' && Number.isFinite(Number(fieldValue))) {
      return Number(fieldValue);
    }
  }

  return null;
};

export const getBooleanField = (value: Record<string, unknown>, ...keys: string[]): boolean | null => {
  for (const key of keys) {
    const fieldValue = value[key];
    if (typeof fieldValue === 'boolean') return fieldValue;
  }

  return null;
};

export const isOpenJob = (status: unknown): boolean => {
  if (typeof status === 'number') return status === 1;

  const normalized = String(status ?? '').toUpperCase().replace(/[\s_-]/g, '');
  return normalized === 'OPEN' || normalized === 'PUBLISHED';
};

export const mapJobToJobCard = (job: Job): JobCard => {
  const rawJob = job as Job & Record<string, unknown>;

  return {
    id: job.id,
    status: job.status,
    title: job.title,
    description: job.finalDescription || job.originalDescription,
    businessDomain: job.businessDomain,
    budgetType: mapBudgetTypeToCardValue(job.budgetType),
    budgetMin: job.budgetMin,
    budgetMax: job.budgetMax,
    timelineDays: job.timelineDays,
    experienceLevel: mapSkillLevelToCardValue(job.experienceLevel),
    createdAt: new Date(job.createdAt).toLocaleDateString(),
    skills: job.skills?.map(skill => skill.name) || [],
    proposalsCount: getNumberField(rawJob, 'proposalsCount', 'ProposalsCount'),
    clientName: job.client?.fullName || ('clientName' in rawJob ? String(rawJob.clientName || '') : '') || 'Anonymous Client',
    clientVerified: getBooleanField(rawJob, 'clientVerified', 'ClientVerified', 'isClientVerified', 'IsClientVerified'),
  };
};
