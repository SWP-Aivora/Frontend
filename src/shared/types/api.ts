/**
 * Standard API Response structure from Backend
 */
export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

/**
 * Standard API Error structure
 */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

/**
 * Pagination structure for list responses
 */
export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  metadata: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
