import { describe, it, expect, vi, beforeEach } from 'vitest';
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
    it('returns array directly if data is array', () => {
      expect(normalizeList([{ id: 1 }])).toEqual([{ id: 1 }]);
    });
    
    it('extracts array from common wrapping properties', () => {
      expect(normalizeList({ items: [{ id: 1 }] })).toEqual([{ id: 1 }]);
      expect(normalizeList({ Items: [{ id: 2 }] })).toEqual([{ id: 2 }]);
      expect(normalizeList({ data: [{ id: 3 }] })).toEqual([{ id: 3 }]);
      expect(normalizeList({ records: [{ id: 4 }] })).toEqual([{ id: 4 }]);
    });

    it('handles nested data.data.items', () => {
      expect(normalizeList({ data: { items: [{ id: 1 }] } })).toEqual([{ id: 1 }]);
    });

    it('returns empty array for invalid input', () => {
      expect(normalizeList(null)).toEqual([]);
      expect(normalizeList(undefined)).toEqual([]);
      expect(normalizeList('string')).toEqual([]);
      expect(normalizeList({ someOtherProp: [{ id: 1 }] })).toEqual([]);
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
