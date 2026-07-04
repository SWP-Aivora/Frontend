import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { BaseResponse } from '@/shared/types/api';
import { normalizeBaseResponse } from '@/lib/api-utils';

export interface Category {
  id: string;
  name: string;
  description: string | null;
  slug?: string;
}

/**
 * Robustly normalize various list shapes from backend
 */
const normalizeList = (data: unknown): Record<string, unknown>[] => {
  if (!data || typeof data !== 'object') return [];
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  
  const d = data as Record<string, unknown>;
  const list = d.items || d.Items || d.data || d.result || d.records || d.reviews || d.Reviews;
  if (list && Array.isArray(list)) return list as Record<string, unknown>[];
  
  if (d.data && typeof d.data === 'object' && !Array.isArray(d.data)) return normalizeList(d.data);
  
  return [];
};

export const categoryService = {
  /**
   * Fetch all categories from the backend
   */
  getCategories: async (): Promise<BaseResponse<Category[]>> => {
    try {
      const response = await apiClient.get<BaseResponse<unknown>>(API_ENDPOINTS.CATEGORIES.BASE);
      const normalized = normalizeBaseResponse<unknown>(response);
      const normalizedData = normalizeList(normalized.data) as unknown as Category[];

      return {
        ...normalized,
        data: normalizedData
      };
    } catch (error) {
      console.error('[categoryService] getCategories failed:', error);
      return {
        success: false,
        message: 'Failed to fetch categories',
        statusCode: 500,
        data: []
      };
    }
  },

  /**
   * Create a new category (Admin only)
   */
  createCategory: async (data: { name: string; description?: string }): Promise<BaseResponse<Category>> => {
    const response = await apiClient.post<BaseResponse<Category>>(API_ENDPOINTS.CATEGORIES.BASE, data);
    return normalizeBaseResponse<Category>(response);
  }
};

