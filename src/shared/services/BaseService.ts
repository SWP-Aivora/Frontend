import apiClient from '@/lib/axios';
import type { BaseResponse, PaginatedResponse } from '@/shared/types/api';

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
    // In our interceptor, we might have unwrapped the data, but if we haven't, it returns the whole response.
    // Assuming interceptor unwraps `response.data` or `response.data.data` as per standard.
    // If we use standard axios without interceptor unwrap, we'd do response.data.
    return response.data as unknown as PaginatedResponse<TEntity>;
  }

  /**
   * Get a single item by ID.
   */
  async getById(id: string): Promise<BaseResponse<TEntity>> {
    const response = await apiClient.get<BaseResponse<TEntity>>(`${this.endpoint}/${id}`);
    return response.data as unknown as BaseResponse<TEntity>;
  }

  /**
   * Create a new item.
   */
  async create(data: TCreateDto): Promise<BaseResponse<TEntity>> {
    const response = await apiClient.post<BaseResponse<TEntity>>(this.endpoint, data);
    return response.data as unknown as BaseResponse<TEntity>;
  }

  /**
   * Update an existing item by ID.
   */
  async update(id: string, data: TUpdateDto): Promise<BaseResponse<TEntity>> {
    const response = await apiClient.put<BaseResponse<TEntity>>(`${this.endpoint}/${id}`, data);
    return response.data as unknown as BaseResponse<TEntity>;
  }

  /**
   * Delete an item by ID.
   */
  async delete(id: string): Promise<BaseResponse<null>> {
    const response = await apiClient.delete<BaseResponse<null>>(`${this.endpoint}/${id}`);
    return response.data as unknown as BaseResponse<null>;
  }
}
