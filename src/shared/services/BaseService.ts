import apiClient from '@/lib/axios';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';
import { normalizeBaseResponse, normalizePaginatedResponse } from '@/lib/api-utils';

/**
 * Generic Base Service for CRUD operations.
 * 
 * @template TEntity The model returned by the API
 * @template TCreateDto The DTO used for creation
 * @template TUpdateDto The DTO used for updating
 */
export class BaseService<TEntity, TCreateDto = Partial<TEntity>, TUpdateDto = Partial<TEntity>> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Get all items with optional query parameters.
   */
  async getAll(params?: Record<string, unknown>): Promise<PaginatedResponse<TEntity>> {
    const response = await apiClient.get<PaginatedResponse<TEntity>>(this.endpoint, { params });
    return normalizePaginatedResponse<TEntity>(response);
  }

  /**
   * Get a single item by ID.
   */
  async getById(id: string): Promise<BaseResponse<TEntity>> {
    const response = await apiClient.get<BaseResponse<TEntity>>(`${this.endpoint}/${id}`);
    return normalizeBaseResponse<TEntity>(response);
  }

  /**
   * Create a new item.
   */
  async create(data: TCreateDto): Promise<BaseResponse<TEntity>> {
    const response = await apiClient.post<BaseResponse<TEntity>>(this.endpoint, data);
    return normalizeBaseResponse<TEntity>(response);
  }

  /**
   * Update an existing item by ID.
   */
  async update(id: string, data: TUpdateDto): Promise<BaseResponse<TEntity>> {
    const response = await apiClient.put<BaseResponse<TEntity>>(`${this.endpoint}/${id}`, data);
    return normalizeBaseResponse<TEntity>(response);
  }

  /**
   * Delete an item by ID.
   */
  async delete(id: string): Promise<BaseResponse<null>> {
    const response = await apiClient.delete<BaseResponse<null>>(`${this.endpoint}/${id}`);
    return normalizeBaseResponse<null>(response);
  }
}
