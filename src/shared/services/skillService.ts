import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { BaseResponse } from '@/shared/types/api';
import { normalizeBaseResponse } from '@/lib/api-utils';

export interface Skill {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName?: string | null;
}

const normalizeList = (data: unknown): Record<string, unknown>[] => {
  if (!data || typeof data !== 'object') return [];
  if (Array.isArray(data)) return data as Record<string, unknown>[];

  const d = data as Record<string, unknown>;
  const list = d.items || d.Items || d.data;
  if (list && Array.isArray(list)) return list as Record<string, unknown>[];

  return [];
};

export const skillService = {
  /**
   * Fetch all skills, optionally filtered by category
   */
  getSkills: async (categoryId?: string): Promise<BaseResponse<Skill[]>> => {
    try {
      const response = await apiClient.get<BaseResponse<unknown>>(API_ENDPOINTS.SKILLS.BASE, {
        params: categoryId ? { categoryId } : undefined,
      });
      const normalized = normalizeBaseResponse<unknown>(response);
      const normalizedData = normalizeList(normalized.data) as unknown as Skill[];

      return {
        ...normalized,
        data: normalizedData
      };
    } catch (error) {
      console.error('[skillService] getSkills failed:', error);
      return {
        success: false,
        message: 'Failed to fetch skills',
        statusCode: 500,
        data: []
      };
    }
  },

  /**
   * Create a new skill (Admin only)
   */
  createSkill: async (data: { name: string; categoryId?: string }): Promise<BaseResponse<Skill>> => {
    const response = await apiClient.post<BaseResponse<Skill>>(API_ENDPOINTS.SKILLS.BASE, data);
    return normalizeBaseResponse<Skill>(response);
  }
};
