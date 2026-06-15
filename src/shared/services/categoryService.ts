import apiClient from '@/lib/axios';
import { API_ENDPOINTS } from '@/shared/constants';
import type { BaseResponse } from '@/shared/types/api';

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
      const normalizedData = normalizeList(response?.data?.data) as unknown as Category[];
      
      return {
        ...(response?.data || {}),
        success: response?.data?.success ?? true,
        message: response?.data?.message ?? '',
        statusCode: response?.status ?? 200,
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
  }
};

