import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  adminService, 
  normalizeList, 
  isOngoingStatus, 
  isOpenDisputeStatus, 
  getStatusLabel, 
  countNewInLast7Days, 
  formatActivityDate 
} from '../../../features/admin/services';
import apiClient from '../../../lib/axios';

vi.mock('../../../lib/axios');

describe('adminService helpers', () => {
  describe('normalizeList', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('returns array directly if data is array', () => {
      expect(normalizeList([{ id: 1 }])).toEqual([{ id: 1 }]);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('extracts array from supported wrapper properties', () => {
      expect(normalizeList({ items: [{ id: 1 }] })).toEqual([{ id: 1 }]);
      expect(normalizeList({ Items: [{ id: 2 }] })).toEqual([{ id: 2 }]);
      expect(normalizeList({ data: [{ id: 3 }] })).toEqual([{ id: 3 }]);
      expect(normalizeList({ records: [{ id: 4 }] })).toEqual([{ id: 4 }]);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('extracts array from nested data.items', () => {
      expect(normalizeList({ data: { items: [{ id: 1 }] } })).toEqual([{ id: 1 }]);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('extracts array from nested data.data.items', () => {
      expect(normalizeList({ data: { data: { items: [{ id: 1 }] } } })).toEqual([{ id: 1 }]);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('returns empty array for valid empty data shapes', () => {
      expect(normalizeList([])).toEqual([]);
      expect(normalizeList({ items: [] })).toEqual([]);
      expect(normalizeList({ data: { items: [] } })).toEqual([]);
      expect(normalizeList({})).toEqual([]);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('returns empty array for null and undefined root values', () => {
      expect(normalizeList(null)).toEqual([]);
      expect(normalizeList(undefined)).toEqual([]);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('returns empty array for wrapper keys with null or undefined list values', () => {
      expect(normalizeList({ items: null })).toEqual([]);
      expect(normalizeList({ items: undefined })).toEqual([]);
      expect(normalizeList({ data: null })).toEqual([]);
      expect(normalizeList({ data: undefined })).toEqual([]);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('throws for objects that are not supported list wrappers', () => {
      expect(() => normalizeList({ someOtherProp: [{ id: 1 }] })).toThrow(
        'Admin list response is malformed: no supported list keys found'
      );
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('throws for wrapper keys that are not arrays or nested objects', () => {
      expect(() => normalizeList({ items: 'nope' })).toThrow(
        'Admin list response is malformed: wrapper key "items" is not an array or object'
      );
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('throws for primitive malformed responses', () => {
      expect(() => normalizeList('string')).toThrow(
        'Admin list response is malformed: expected an object, array, null, or undefined'
      );
      expect(() => normalizeList(42)).toThrow(
        'Admin list response is malformed: expected an object, array, null, or undefined'
      );
      expect(() => normalizeList(true)).toThrow(
        'Admin list response is malformed: expected an object, array, null, or undefined'
      );
      expect(warnSpy).toHaveBeenCalledTimes(3);
    });

    it('throws when nested list wrappers exceed the recursion depth limit', () => {
      const deeplyNested = {
        data: {
          data: {
            data: {
              data: {
                data: {
                  data: {
                    items: [{ id: 1 }],
                  },
                },
              },
            },
          },
        },
      };

      expect(() => normalizeList(deeplyNested)).toThrow(
        'Admin list response is malformed: max depth 5 exceeded'
      );
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('isOngoingStatus', () => {
    it('returns true for ongoing numeric statuses', () => {
      [0, 1, 2, 3, 6].forEach(s => expect(isOngoingStatus(s)).toBe(true));
    });

    it('returns false for finished numeric statuses', () => {
      [4, 5].forEach(s => expect(isOngoingStatus(s)).toBe(false));
    });

    it('returns true for ongoing string statuses', () => {
      ['Active', 'In Progress', 'Pending', 'Open'].forEach(s => expect(isOngoingStatus(s)).toBe(true));
    });

    it('returns false for finished string statuses', () => {
      ['Completed', 'Cancelled', 'Closed', 'Refunded', 'Failed'].forEach(s => expect(isOngoingStatus(s)).toBe(false));
    });

    it('returns true for null or undefined', () => {
      expect(isOngoingStatus(null)).toBe(true);
      expect(isOngoingStatus(undefined)).toBe(true);
    });
  });

  describe('isOpenDisputeStatus', () => {
    it('returns true for open statuses', () => {
      ['Open', 'Under Review', 'In Review', 'Pending'].forEach(s => expect(isOpenDisputeStatus(s)).toBe(true));
    });

    it('returns false for closed statuses', () => {
      ['Resolved', 'Closed', 'Cancelled'].forEach(s => expect(isOpenDisputeStatus(s)).toBe(false));
    });

    it('returns true for null or undefined', () => {
      expect(isOpenDisputeStatus(null)).toBe(true);
      expect(isOpenDisputeStatus(undefined)).toBe(true);
    });
  });

  describe('getStatusLabel', () => {
    it('maps numeric statuses correctly', () => {
      expect(getStatusLabel(1)).toBe('Active');
      expect(getStatusLabel(4)).toBe('Completed');
    });

    it('maps string statuses correctly', () => {
      expect(getStatusLabel('IN_PROGRESS')).toBe('Active');
      expect(getStatusLabel('pending_payment')).toBe('Pending Payment');
      expect(getStatusLabel('OTHER')).toBe('Other');
    });
  });

  describe('countNewInLast7Days', () => {
    it('counts items created within 7 days', () => {
      const today = new Date().toISOString();
      const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
      
      const items = [
        { createdAt: today },
        { CreatedAt: today },
        { createdAt: eightDaysAgo },
      ];
      
      expect(countNewInLast7Days(items, 'createdAt')).toBe(2);
    });

    it('returns 0 for empty array', () => {
      expect(countNewInLast7Days([], 'createdAt')).toBe(0);
    });
  });

  describe('formatActivityDate', () => {
    it('formats recent dates correctly', () => {
      const now = new Date();
      expect(formatActivityDate(now.toISOString())).toBe('Just now');
      
      const minAgo = new Date(now.getTime() - 5 * 60000);
      expect(formatActivityDate(minAgo.toISOString())).toBe('5m ago');
      
      const hoursAgo = new Date(now.getTime() - 5 * 60 * 60000);
      expect(formatActivityDate(hoursAgo.toISOString())).toBe('5h ago');
    });
  });
});

describe('adminService.getDashboardSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('aggregates Promise.allSettled correctly with partial failures', async () => {
    // Mock successful backend stats
    (vi.mocked(apiClient.get)).mockImplementation((url: string) => {
      if (url.includes('admin/stats')) {
        return Promise.resolve({ data: { success: true, data: { totalUsers: 10, openDisputes: 5 } } });
      }
      // Mock failure for other endpoints to simulate partial failure
      return Promise.reject(new Error('API failed'));
    });

    const result = await adminService.getDashboardSummary();
    expect(result.success).toBe(true);
    expect(result.data?.totalUsers).toBe(10);
    expect(result.data?.openDisputes).toBe(5);
    // Other fields should have fallback 0 values
    expect(result.data?.totalTransactionsValue).toBe(0);
  });
});

describe('adminService.getExpertReviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes expert reviews from a reviews array response', async () => {
    (vi.mocked(apiClient.get)).mockResolvedValue({
      data: {
        success: true,
        data: {
          reviews: [
            {
              id: 'review-1',
              expertId: 'expert-1',
              fullName: 'Ada Lovelace',
              email: 'ada@example.com',
              status: 'PENDING',
              skills: ['LLM'],
              submittedAt: new Date().toISOString(),
            },
          ],
          totalPending: 1,
        },
      },
    });

    const result = await adminService.getExpertReviews();

    expect(result.success).toBe(true);
    expect(result.data?.reviews).toHaveLength(1);
    expect(result.data?.reviews[0]).toMatchObject({
      id: 'review-1',
      expertId: 'expert-1',
      fullName: 'Ada Lovelace',
      status: 'Pending',
      skills: ['LLM'],
    });
    expect(result.data?.totalPending).toBe(1);
  });

  it('normalizes expert reviews from a paged items response', async () => {
    (vi.mocked(apiClient.get)).mockResolvedValue({
      data: {
        success: true,
        data: {
          items: [
            {
              Id: 'review-2',
              ExpertId: 'expert-2',
              FullName: 'Grace Hopper',
              Email: 'grace@example.com',
              Status: 'REVISION',
              Skills: ['Automation', 'Compiler'],
              ProofCount: 3,
            },
          ],
        },
      },
    });

    const result = await adminService.getExpertReviews();

    expect(result.data?.reviews[0]).toMatchObject({
      id: 'review-2',
      expertId: 'expert-2',
      fullName: 'Grace Hopper',
      email: 'grace@example.com',
      status: 'Revision',
      proofCount: 3,
    });
    expect(result.data?.totalRevisions).toBe(1);
  });
});
