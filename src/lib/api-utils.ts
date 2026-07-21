import type { PaginatedResponse, BaseResponse } from '@/shared/types/api';

/**
 * Type guard for record objects
 */
function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

type TypeGuard<T> = (value: unknown) => value is T;

function acceptsUnknown<T>(value: unknown): value is T {
  void value;
  return true;
}

function normalizeArrayItems<T>(value: unknown, itemGuard: TypeGuard<T>): T[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const items = value.filter(itemGuard);
  return items.length === value.length ? items : null;
}

/**
 * Normalizes an API response that might come in different shapes:
 * 1. { data: { items: [...] } } - Standard Backend PageResult
 * 2. { data: [...] } - BaseResponse with array
 * 3. [...] - Raw array (unlikely from our backend but good for safety)
 * 
 * Returns a PaginatedResponse structure where 'data' is always the array of items.
 */
export function normalizePaginatedResponse<T>(
  response: unknown,
  itemGuard: TypeGuard<T> = acceptsUnknown
): PaginatedResponse<T> {
  if (Array.isArray(response)) {
    const rawItems = normalizeArrayItems(response, itemGuard);

    if (!rawItems) {
      console.warn('[api-utils] Unexpected paginated response shape:', response);
      return {
        success: false,
        message: 'Unexpected paginated response shape',
        statusCode: 500,
        data: [],
        metadata: { pageIndex: 1, pageSize: 20, totalCount: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false }
      };
    }

    return {
      success: true,
      message: '',
      statusCode: 200,
      data: rawItems,
      metadata: {
        pageIndex: 1,
        pageSize: 20,
        totalCount: rawItems.length,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false
      }
    };
  }

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
    const pageItems = normalizeArrayItems(pageResult.items, itemGuard);
    if (pageItems) {
      items = pageItems;
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
    }
  } 
  // Case 3: Standard BaseResponse with array { data: [...] } directly under axiosData
  else if (normalizeArrayItems(axiosData.data, itemGuard)) {
    items = normalizeArrayItems(axiosData.data, itemGuard) ?? [];
    metadata.totalCount = items.length;
    metadata.totalPages = 1;
    shapeMatched = true;
  }
  // Case 4: Raw array [...]
  else if (normalizeArrayItems(axiosData, itemGuard)) {
    items = normalizeArrayItems(axiosData, itemGuard) ?? [];
    metadata.totalCount = items.length;
    metadata.totalPages = 1;
    shapeMatched = true;
  }
  // Case 5: Deep items without data wrapper (unlikely)
  else if (normalizeArrayItems(axiosData.items, itemGuard)) {
    items = normalizeArrayItems(axiosData.items, itemGuard) ?? [];
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
export function normalizeBaseResponse<T>(
  response: unknown,
  dataGuard: TypeGuard<T> = acceptsUnknown
): BaseResponse<T> {
  const axiosData = isRecord(response) && isRecord(response.data) ? response.data : (isRecord(response) ? response : null);
  
  if (axiosData === null && response !== undefined && response !== null) {
     if (!dataGuard(response)) {
        console.warn('[api-utils] Unexpected base response payload:', response);
        return {
           success: false,
           message: 'Unexpected base response payload',
           statusCode: 500,
           data: null
        };
     }

     // Might be raw primitive data
     return {
        success: true,
        message: '',
        statusCode: 200,
        data: response
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
    if (axiosData.data !== null && !dataGuard(axiosData.data)) {
      console.warn('[api-utils] Unexpected base response payload:', axiosData.data);
      return {
        success: false,
        message: 'Unexpected base response payload',
        statusCode: 500,
        data: null
      };
    }

    finalData = axiosData.data;
    shapeMatched = true;
  } else if (('success' in axiosData || 'statusCode' in axiosData) && Object.keys(axiosData).length <= 5) {
    // Looks like an empty envelope without a 'data' payload
    finalData = null;
    shapeMatched = true;
  } else if (!('success' in axiosData) && !('statusCode' in axiosData)) {
    if (!dataGuard(axiosData)) {
      console.warn('[api-utils] Unexpected base response payload:', axiosData);
      return {
        success: false,
        message: 'Unexpected base response payload',
        statusCode: 500,
        data: null
      };
    }

    // Likely raw data without an envelope
    finalData = axiosData;
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

export function getErrorMessage(error: unknown, defaultMessage = 'An error occurred'): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const err = error as { response?: { data?: { message?: string } } };
    return err.response?.data?.message || defaultMessage;
  }
  return defaultMessage;
}
