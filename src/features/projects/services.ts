// Cấu hình các hàm gọi API (axios) quản lý Không gian làm việc chung (Project Workspace) và Mốc tiến độ (Milestone)
import apiClient from '@/lib/axios';
import type { Project, Milestone, Deliverable } from './types';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { API_ENDPOINTS } from '@/shared/constants';
import { normalizePaginatedResponse, normalizeBaseResponse } from '@/lib/api-utils';

export const projectService = {
  // Project endpoints
  getProjects: async (params?: Record<string, string | number | boolean>): Promise<PaginatedResponse<Project>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROJECTS.BASE, { params });
    return normalizePaginatedResponse<Project>(response);
  },

  getProjectById: async (id: string): Promise<BaseResponse<Project>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROJECTS.ID(id));
    return normalizeBaseResponse<Project>(response);
  },

  cancelProject: async (id: string, reason: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put(API_ENDPOINTS.PROJECTS.CANCEL(id), { reason });
    return normalizeBaseResponse<void>(response);
  },

  // Milestone endpoints
  getMilestonesByProject: async (projectId: string): Promise<PaginatedResponse<Milestone>> => {
    const response = await apiClient.get(API_ENDPOINTS.PROJECTS.MILESTONES(projectId));
    return normalizePaginatedResponse<Milestone>(response);
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
