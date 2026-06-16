import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { normalizePaginatedResponse, normalizeBaseResponse } from '../../lib/api-utils';

interface TestItem {
  id: number;
}

const isTestItem = (value: unknown): value is TestItem => (
  typeof value === 'object'
  && value !== null
  && !Array.isArray(value)
  && typeof (value as { id?: unknown }).id === 'number'
);

describe('api-utils', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('normalizePaginatedResponse', () => {
    it('handles Backend PageResult shape', () => {
      const response = {
        data: {
          data: {
            items: [{ id: 1 }, { id: 2 }],
            pageIndex: 2,
            pageSize: 10,
            totalItems: 45,
            totalPages: 5,
          },
          success: true,
          statusCode: 200,
        }
      };
      
      const result = normalizePaginatedResponse(response);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.metadata.pageIndex).toBe(2);
      expect(result.metadata.totalCount).toBe(45);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('handles Standard BaseResponse with array', () => {
      const response = {
        data: {
          data: [{ id: 1 }, { id: 2 }],
          success: true,
        }
      };
      
      const result = normalizePaginatedResponse(response);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.metadata.totalCount).toBe(2);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('handles raw array response', () => {
      const response = [{ id: 1 }, { id: 2 }];

      const result = normalizePaginatedResponse(response, isTestItem);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(response);
      expect(result.metadata.totalCount).toBe(2);
      expect(result.metadata.totalPages).toBe(1);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('handles deep items without data wrapper', () => {
      const response = {
        data: {
          items: [{ id: 1 }],
          totalItems: 1,
          success: true,
        }
      };
      
      const result = normalizePaginatedResponse(response);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('handles explicit failure response', () => {
      const response = {
        data: {
          success: false,
          message: 'Error occurred',
          statusCode: 400
        }
      };
      
      const result = normalizePaginatedResponse(response);
      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.message).toBe('Error occurred');
    });

    it('warns and returns failure for unexpected shape', () => {
      const response = {
        data: {
          someWeirdShape: 'hello',
          success: true
        }
      };
      
      const result = normalizePaginatedResponse(response);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Unexpected paginated response shape'), expect.anything());
      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
    });

    it('handles non-object response', () => {
      const result = normalizePaginatedResponse('not-an-object');
      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
    });

    it('handles malformed success field', () => {
      const response = {
        data: {
          success: 'yes', // should be boolean
          data: [{ id: 1 }]
        }
      };
      const result = normalizePaginatedResponse(response);
      expect(result.success).toBe(true); // defaults to true
      expect(result.data).toHaveLength(1);
    });

    it('handles deep items without data wrapper with custom metadata', () => {
      const response = {
        data: {
          items: [{ id: 1 }],
          totalItems: 100,
          totalPages: 10,
          success: true,
        }
      };
      
      const result = normalizePaginatedResponse(response);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.metadata.totalCount).toBe(100);
      expect(result.metadata.totalPages).toBe(10);
    });

    it('returns failure when array items do not match provided guard', () => {
      const response = {
        data: {
          data: [{ id: 1 }, { id: 'wrong-type' }],
          success: true,
        }
      };

      const result = normalizePaginatedResponse(response, isTestItem);

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Unexpected paginated response shape'), expect.anything());
      expect(result.success).toBe(false);
      expect(result.message).toBe('Unexpected paginated response shape');
      expect(result.data).toEqual([]);
    });
  });

  describe('normalizeBaseResponse', () => {
    it('handles payload in data.data', () => {
      const response = {
        data: {
          data: { id: 1 },
          success: true,
        }
      };
      const result = normalizeBaseResponse(response);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1 });
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('handles empty envelope without data payload', () => {
      const response = {
        data: {
          success: true,
          statusCode: 200,
        }
      };
      const result = normalizeBaseResponse(response);
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('handles explicit failure', () => {
      const response = {
        data: {
          success: false,
          message: 'Not found',
          statusCode: 404
        }
      };
      const result = normalizeBaseResponse(response);
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toBe('Not found');
    });

    it('warns and returns failure for unexpected shape that has success true', () => {
      const response = {
        data: {
          success: true,
          statusCode: 200,
          unexpected1: 1,
          unexpected2: 2,
          unexpected3: 3,
          unexpected4: 4,
          unexpected5: 5,
          unexpected6: 6,
        }
      };
      const result = normalizeBaseResponse(response);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Unexpected base response shape'), expect.anything());
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });

    it('handles primitive payload in data.data', () => {
      const response = {
        data: {
          data: 42,
          success: true
        }
      };
      const result = normalizeBaseResponse(response);
      expect(result.success).toBe(true);
      expect(result.data).toBe(42);
    });

    it('accepts payload when it matches provided guard', () => {
      const response = {
        data: {
          data: { id: 7 },
          success: true
        }
      };

      const result = normalizeBaseResponse(response, isTestItem);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 7 });
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('returns failure when payload does not match provided guard', () => {
      const response = {
        data: {
          data: { id: 'wrong-type' },
          success: true
        }
      };

      const result = normalizeBaseResponse(response, isTestItem);

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Unexpected base response payload'), expect.anything());
      expect(result.success).toBe(false);
      expect(result.message).toBe('Unexpected base response payload');
      expect(result.data).toBeNull();
    });

    it('returns failure when raw payload does not match provided guard', () => {
      const result = normalizeBaseResponse({ id: 'wrong-type' }, isTestItem);

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Unexpected base response payload'), expect.anything());
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });

    it('handles explicit null in data.data', () => {
      const response = {
        data: {
          data: null,
          success: true
        }
      };
      const result = normalizeBaseResponse(response);
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('handles undefined response', () => {
      const result = normalizeBaseResponse(undefined);
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });

    it('handles null response', () => {
      const result = normalizeBaseResponse(null);
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });
  });
});
