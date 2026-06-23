// Cấu hình các hàm gọi API (axios) quản lý Không gian làm việc chung (Project Workspace) và Mốc tiến độ (Milestone)
import apiClient from '@/lib/axios';
import type { Project, Milestone, Deliverable } from './types';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { API_ENDPOINTS } from '@/shared/constants';
import { normalizePaginatedResponse, normalizeBaseResponse } from '@/lib/api-utils';
import { normalizeMilestoneStatus, normalizeProjectStatus } from './utils';

type ProjectRecord = Project & Record<string, unknown>;
type MilestoneRecord = Milestone & Record<string, unknown>;

const getString = (value: unknown, fallback = ''): string => (
  typeof value === 'string' ? value : fallback
);

const normalizeMilestone = (milestone: Milestone): Milestone => {
  const raw = milestone as MilestoneRecord;
  return {
    ...milestone,
    projectId: milestone.projectId || getString(raw.ProjectId),
    title: milestone.title || getString(raw.Title, 'Untitled milestone'),
    description: milestone.description ?? getString(raw.Description, ''),
    amount: Number(milestone.amount ?? raw.Amount ?? 0),
    dueDate: milestone.dueDate ?? getString(raw.DueDate, ''),
    dueDays: milestone.dueDays ?? null,
    acceptanceCriteria: milestone.acceptanceCriteria ?? getString(raw.AcceptanceCriteria, ''),
    orderIndex: Number(milestone.orderIndex ?? raw.OrderIndex ?? 0),
    status: normalizeMilestoneStatus(milestone.status ?? raw.Status),
    createdAt: milestone.createdAt || getString(raw.CreatedAt),
    updatedAt: milestone.updatedAt || getString(raw.UpdatedAt),
  };
};

const normalizeProject = (project: Project): Project => {
  const raw = project as ProjectRecord;
  const clientName = project.clientName || getString(raw.ClientName, 'Client');
  const expertName = project.expertName || getString(raw.ExpertName, 'Expert');
  const clientId = project.clientId || getString(raw.ClientId);
  const expertId = project.expertId || getString(raw.ExpertId);
  const sourceMilestones = Array.isArray(project.milestones)
    ? project.milestones
    : (Array.isArray(raw.Milestones) ? raw.Milestones as Milestone[] : []);
  const milestones = sourceMilestones.map(normalizeMilestone);

  return {
    ...project,
    id: project.id || getString(raw.Id),
    jobId: project.jobId || getString(raw.JobId),
    acceptedProposalId: project.acceptedProposalId || getString(raw.AcceptedProposalId),
    clientId,
    expertId,
    clientName,
    expertName,
    title: project.title || getString(raw.Title, 'Untitled project'),
    description: project.description ?? getString(raw.Description, ''),
    totalBudget: Number(project.totalBudget ?? raw.TotalBudget ?? 0),
    remainingBudget: Number(project.remainingBudget ?? raw.RemainingBudget ?? 0),
    currency: project.currency || getString(raw.Currency, 'USD'),
    status: normalizeProjectStatus(project.status ?? raw.Status),
    startDate: project.startDate || getString(raw.StartDate),
    endDate: project.endDate ?? getString(raw.EndDate, ''),
    createdAt: project.createdAt || getString(raw.CreatedAt),
    updatedAt: project.updatedAt || getString(raw.UpdatedAt),
    milestones,
    client: project.client ?? {
      id: clientId,
      fullName: clientName,
      avatarUrl: null,
      role: 'CLIENT',
    },
    expert: project.expert ?? {
      id: expertId,
      fullName: expertName,
      avatarUrl: null,
      role: 'EXPERT',
    },
  };
};

export const projectService = {
  // Project endpoints
  getProjects: async (params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<Project>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROJECTS.BASE, { params });
    const normalized = normalizePaginatedResponse<Project>(response);
    return {
      ...normalized,
      data: normalized.data.map(normalizeProject),
    };
  },

  getProjectById: async (id: string): Promise<BaseResponse<Project>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROJECTS.ID(id));
    const normalized = normalizeBaseResponse<Project>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeProject(normalized.data) : null,
    };
  },

  cancelProject: async (id: string, reason: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put(API_ENDPOINTS.PROJECTS.CANCEL(id), { reason });
    return normalizeBaseResponse<void>(response);
  },

  completeProject: async (id: string): Promise<BaseResponse<Project>> => {
    const response = await apiClient.post(`${API_ENDPOINTS.PROJECTS.ID(id)}/complete`);
    const normalized = normalizeBaseResponse<Project>(response);
    return {
      ...normalized,
      data: normalized.data ? normalizeProject(normalized.data) : null,
    };
  },

  // Milestone endpoints
  getMilestonesByProject: async (projectId: string): Promise<PaginatedResponse<Milestone>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROJECTS.ID(projectId));
    const normalized = normalizeBaseResponse<Project>(response);
    const milestones = normalized.data ? normalizeProject(normalized.data).milestones : [];

    return {
      success: normalized.success,
      message: normalized.message,
      statusCode: normalized.statusCode,
      data: milestones,
      metadata: {
        pageIndex: 1,
        pageSize: milestones.length,
        totalCount: milestones.length,
        totalPages: milestones.length > 0 ? 1 : 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  },

  fundMilestone: async (id: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put(API_ENDPOINTS.MILESTONES.FUND(id));
    return normalizeBaseResponse<void>(response);
  },

  approveMilestone: async (id: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put(API_ENDPOINTS.MILESTONES.APPROVE(id));
    return normalizeBaseResponse<void>(response);
  },

  requestRevision: async (id: string, reason: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put(API_ENDPOINTS.MILESTONES.REVISION(id), { reason });
    return normalizeBaseResponse<void>(response);
  },

  // Deliverable endpoints
  getDeliverables: async (milestoneId: string): Promise<PaginatedResponse<Deliverable>> => {
    const response = await apiClient.get(API_ENDPOINTS.MILESTONES.DELIVERABLES(milestoneId));
    return normalizePaginatedResponse<Deliverable>(response);
  },

  submitDeliverable: async (milestoneId: string, data: Partial<Deliverable>): Promise<BaseResponse<Deliverable>> => {
    const response = await apiClient.post(API_ENDPOINTS.MILESTONES.DELIVERABLES(milestoneId), data);
    return normalizeBaseResponse<Deliverable>(response);
  },
};
