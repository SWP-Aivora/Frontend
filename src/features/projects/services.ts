import apiClient from '@/lib/axios';
import type { Project, Milestone, Deliverable } from './types';
import type { BaseResponse } from '@/shared/types/api';
import { API_ENDPOINTS } from '@/shared/constants';

export const projectService = {
  // Project endpoints
  getProjects: async (params?: Record<string, string | number | boolean>): Promise<BaseResponse<Project[]>> => {
    const response = await apiClient.get<BaseResponse<Project[]>>(API_ENDPOINTS.PROJECTS.BASE, { params });
    return response.data;
  },

  getProjectById: async (id: string): Promise<BaseResponse<Project>> => {
    const response = await apiClient.get<BaseResponse<Project>>(API_ENDPOINTS.PROJECTS.ID(id));
    return response.data;
  },

  cancelProject: async (id: string, reason: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(API_ENDPOINTS.PROJECTS.CANCEL(id), { reason });
    return response.data;
  },

  // Milestone endpoints
  getMilestonesByProject: async (projectId: string): Promise<BaseResponse<Milestone[]>> => {
    const response = await apiClient.get<BaseResponse<Milestone[]>>(API_ENDPOINTS.PROJECTS.MILESTONES(projectId));
    return response.data;
  },

  fundMilestone: async (id: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(API_ENDPOINTS.MILESTONES.FUND(id));
    return response.data;
  },

  approveMilestone: async (id: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(API_ENDPOINTS.MILESTONES.APPROVE(id));
    return response.data;
  },

  requestRevision: async (id: string, reason: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(API_ENDPOINTS.MILESTONES.REVISION(id), { reason });
    return response.data;
  },

  // Deliverable endpoints
  getDeliverables: async (milestoneId: string): Promise<BaseResponse<Deliverable[]>> => {
    const response = await apiClient.get<BaseResponse<Deliverable[]>>(API_ENDPOINTS.MILESTONES.DELIVERABLES(milestoneId));
    return response.data;
  },

  submitDeliverable: async (milestoneId: string, data: Partial<Deliverable>): Promise<BaseResponse<Deliverable>> => {
    const response = await apiClient.post<BaseResponse<Deliverable>>(API_ENDPOINTS.MILESTONES.DELIVERABLES(milestoneId), data);
    return response.data;
  },
};
