import apiClient from '@/lib/axios';
import type { Project, Milestone, Deliverable } from './types';
import type { BaseResponse } from '@/shared/types/api';

export const projectService = {
  // Project endpoints
  getProjects: async (params?: Record<string, string | number | boolean>): Promise<BaseResponse<Project[]>> => {
    const response = await apiClient.get<BaseResponse<Project[]>>('/projects', { params });
    return response.data;
  },

  getProjectById: async (id: string): Promise<BaseResponse<Project>> => {
    const response = await apiClient.get<BaseResponse<Project>>(`/projects/${id}`);
    return response.data;
  },

  cancelProject: async (id: string, reason: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(`/projects/${id}/cancel`, { reason });
    return response.data;
  },

  // Milestone endpoints
  getMilestonesByProject: async (projectId: string): Promise<BaseResponse<Milestone[]>> => {
    const response = await apiClient.get<BaseResponse<Milestone[]>>(`/projects/${projectId}/milestones`);
    return response.data;
  },

  fundMilestone: async (id: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(`/milestones/${id}/fund`);
    return response.data;
  },

  approveMilestone: async (id: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(`/milestones/${id}/approve`);
    return response.data;
  },

  requestRevision: async (id: string, reason: string): Promise<BaseResponse<void>> => {
    const response = await apiClient.put<BaseResponse<void>>(`/milestones/${id}/request-revision`, { reason });
    return response.data;
  },

  // Deliverable endpoints
  getDeliverables: async (milestoneId: string): Promise<BaseResponse<Deliverable[]>> => {
    const response = await apiClient.get<BaseResponse<Deliverable[]>>(`/milestones/${milestoneId}/deliverables`);
    return response.data;
  },

  submitDeliverable: async (milestoneId: string, data: Partial<Deliverable>): Promise<BaseResponse<Deliverable>> => {
    const response = await apiClient.post<BaseResponse<Deliverable>>(`/milestones/${milestoneId}/deliverables`, data);
    return response.data;
  },
};
