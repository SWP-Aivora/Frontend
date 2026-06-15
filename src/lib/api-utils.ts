import type { PaginatedResponse, BaseResponse } from '@/shared/types/api';

/**
 * Type guard for record objects
 */
function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

/**
 * Normalizes an API response that might come in different shapes:
 * 1. { data: { items: [...] } } - Standard Backend PageResult
 * 2. { data: [...] } - BaseResponse with array
 * 3. [...] - Raw array (unlikely from our backend but good for safety)
 * 
 * Returns a PaginatedResponse structure where 'data' is always the array of items.
 */
export function normalizePaginatedResponse<T>(response: unknown): PaginatedResponse<T> {
  const axiosData = isRecord(response) && isRecord(response.data) ? response.data : (isRecord(response) ? response : null);
  
  if (!axiosData) {
    console.warn('[api-utils] Unexpected paginated response shape (no axiosData):', response);
    return {
      success: false,
      message: 'Invalid response shape',
      statusCode: 500,
      data: [],
      metadata: {
        pageIndex: 1, pageSize: 20, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false
      }
    };
  }

  const success = (typeof axiosData.success === 'boolean') ? axiosData.success : true;
  const statusCode = (typeof axiosData.statusCode === 'number') ? axiosData.statusCode : 200;
  const message = (typeof axiosData.message === 'string') ? axiosData.message : '';

  // If backend returns failure, preserve it
  if (success === false) {
    return {
      success: false,
      message: message || 'An error occurred',
      statusCode: statusCode || 500,
      data: [],
      metadata: {
        pageIndex: 1, pageSize: 20, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false
      }
    };
  }

  let items: T[] = [];
  let metadata = {
    pageIndex: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  };

  let shapeMatched = false;

  // Case 1: Backend PageResult shape { data: { items: [], totalItems: 0, ... } }
  if (isRecord(axiosData.data)) {
    const pageResult = axiosData.data;
    if (Array.isArray(pageResult.items)) {
      items = pageResult.items as T[];
      const pageIndex = (typeof pageResult.pageIndex === 'number') ? pageResult.pageIndex : 1;
      const pageSize = (typeof pageResult.pageSize === 'number') ? pageResult.pageSize : 20;
      const totalItems = (typeof pageResult.totalItems === 'number') ? pageResult.totalItems : items.length;
      const totalPages = (typeof pageResult.totalPages === 'number') ? pageResult.totalPages : Math.ceil(totalItems / pageSize) || 0;

      metadata = {
        pageIndex,
        pageSize,
        totalCount: totalItems,
        totalPages,
        hasPreviousPage: pageIndex > 1,
        hasNextPage: pageIndex < totalPages,
      };
      shapeMatched = true;
    } else if (Array.isArray(axiosData.data)) {
      // Case 2: Standard BaseResponse with array { data: [...] }
      items = axiosData.data as T[];
      metadata.totalCount = items.length;
      metadata.totalPages = 1;
      shapeMatched = true;
    }
  } 
  // Case 3: Standard BaseResponse with array { data: [...] } directly under axiosData
  else if (Array.isArray(axiosData.data)) {
    items = axiosData.data as T[];
    metadata.totalCount = items.length;
    metadata.totalPages = 1;
    shapeMatched = true;
  }
  // Case 4: Raw array [...]
  else if (Array.isArray(axiosData)) {
    items = axiosData as T[];
    metadata.totalCount = items.length;
    metadata.totalPages = 1;
    shapeMatched = true;
  }
  // Case 5: Deep items without data wrapper (unlikely)
  else if (Array.isArray(axiosData.items)) {
    items = axiosData.items as T[];
    metadata.totalCount = (typeof axiosData.totalItems === 'number') ? axiosData.totalItems : items.length;
    metadata.totalPages = (typeof axiosData.totalPages === 'number') ? axiosData.totalPages : 1;
    shapeMatched = true;
  }

  if (!shapeMatched) {
    console.warn('[api-utils] Unexpected paginated response shape:', axiosData);
    return {
      success: false,
      message: 'Unexpected paginated response shape',
      statusCode: 500,
      data: [],
      metadata: { pageIndex: 1, pageSize: 20, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false }
    };
  }

  return {
    success,
    message,
    statusCode,
    data: items,
    metadata
  };
}

/**
 * Normalizes a single item response
 */
export function normalizeBaseResponse<T>(response: unknown): BaseResponse<T> {
  const axiosData = isRecord(response) && isRecord(response.data) ? response.data : (isRecord(response) ? response : null);
  
  if (axiosData === null && response !== undefined && response !== null) {
     // Might be raw primitive data
     return {
        success: true,
        message: '',
        statusCode: 200,
        data: response as T
     };
  }

  if (!axiosData) {
     console.warn('[api-utils] Unexpected base response shape (no axiosData):', response);
     return {
        success: false,
        message: 'Invalid response shape',
        statusCode: 500,
        data: null
     };
  }
  
  const success = (typeof axiosData.success === 'boolean') ? axiosData.success : true;
  const statusCode = (typeof axiosData.statusCode === 'number') ? axiosData.statusCode : 200;
  const message = (typeof axiosData.message === 'string') ? axiosData.message : '';

  if (success === false) {
    return {
      success: false,
      message: message || 'An error occurred',
      statusCode: statusCode || 500,
      data: null
    };
  }

  let finalData: T | null = null;
  let shapeMatched = false;

  if ('data' in axiosData) {
    finalData = axiosData.data as T;
    shapeMatched = true;
  } else if (('success' in axiosData || 'statusCode' in axiosData) && Object.keys(axiosData).length <= 5) {
    // Looks like an empty envelope without a 'data' payload
    finalData = null;
    shapeMatched = true;
  } else if (!('success' in axiosData) && !('statusCode' in axiosData)) {
    // Likely raw data without an envelope
    finalData = axiosData as unknown as T;
    shapeMatched = true;
  }

  if (!shapeMatched) {
    console.warn('[api-utils] Unexpected base response shape:', axiosData);
    return {
      success: false,
      message: 'Unexpected base response shape',
      statusCode: 500,
      data: null
    };
  }

  return {
    success,
    message,
    statusCode,
    data: finalData
  };
}
