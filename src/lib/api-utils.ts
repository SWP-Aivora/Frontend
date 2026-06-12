import type { PaginatedResponse, BaseResponse } from '@/shared/types/api';

/**
 * Normalizes an API response that might come in different shapes:
 * 1. { data: { items: [...] } } - Standard Backend PageResult
 * 2. { data: [...] } - BaseResponse with array
 * 3. [...] - Raw array (unlikely from our backend but good for safety)
 * 
 * Returns a PaginatedResponse structure where 'data' is always the array of items.
 */
export function normalizePaginatedResponse<T>(response: unknown): PaginatedResponse<T> {
  const resObj = response as Record<string, unknown> | undefined;
  const axiosData = (resObj?.data as Record<string, unknown>) || resObj;
  
  let items: T[] = [];
  let metadata = {
    pageIndex: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  };

  // Case 1: Backend PageResult shape { data: { items: [], totalItems: 0, ... } }
  if (axiosData?.data && typeof axiosData.data === 'object') {
    const pageResult = axiosData.data as Record<string, unknown>;
    if (pageResult.items && Array.isArray(pageResult.items)) {
      items = pageResult.items as T[];
      metadata = {
        pageIndex: (pageResult.pageIndex as number) || 1,
        pageSize: (pageResult.pageSize as number) || 20,
        totalCount: (pageResult.totalItems as number) || 0,
        totalPages: (pageResult.totalPages as number) || Math.ceil(((pageResult.totalItems as number) || 0) / ((pageResult.pageSize as number) || 20)) || 0,
        hasPreviousPage: ((pageResult.pageIndex as number) || 1) > 1,
        hasNextPage: ((pageResult.pageIndex as number) || 1) < ((pageResult.totalPages as number) || Math.ceil(((pageResult.totalItems as number) || 0) / ((pageResult.pageSize as number) || 20))),
      };
    }
  } 
  // Case 2: Standard BaseResponse with array { data: [...] }
  else if (Array.isArray(axiosData?.data)) {
    items = axiosData.data as T[];
    metadata.totalCount = items.length;
    metadata.totalPages = 1;
  }
  // Case 3: Raw array [...]
  else if (Array.isArray(axiosData)) {
    items = axiosData as T[];
    metadata.totalCount = items.length;
    metadata.totalPages = 1;
  }
  // Case 4: Deep items without data wrapper (unlikely)
  else if (axiosData?.items && Array.isArray(axiosData.items)) {
    items = axiosData.items as T[];
    metadata.totalCount = (axiosData.totalItems as number) || items.length;
    metadata.totalPages = (axiosData.totalPages as number) || 1;
  }

  return {
    success: (axiosData?.success as boolean) ?? true,
    message: (axiosData?.message as string) ?? '',
    statusCode: (axiosData?.statusCode as number) ?? 200,
    data: items,
    metadata
  };
}

/**
 * Normalizes a single item response
 */
export function normalizeBaseResponse<T>(response: unknown): BaseResponse<T> {
  const resObj = response as Record<string, unknown> | undefined;
  const axiosData = (resObj?.data as Record<string, unknown>) || resObj;
  
  return {
    success: (axiosData?.success as boolean) ?? true,
    message: (axiosData?.message as string) ?? '',
    statusCode: (axiosData?.statusCode as number) ?? 200,
    data: (axiosData?.data !== undefined ? axiosData.data : axiosData) as T
  };
}
