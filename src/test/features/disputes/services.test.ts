import { describe, it, expect, vi, beforeEach } from 'vitest';
import { disputeService } from '../../../features/disputes/services';
import apiClient from '../../../lib/axios';
import { DisputeResolutionType } from '../../../features/disputes/types';

vi.mock('../../../lib/axios');

describe('disputeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDisputes', () => {
    it('normalizes paginated response successfully', async () => {
      (vi.mocked(apiClient.get)).mockResolvedValue({
        data: {
          success: true,
          data: {
            items: [{ id: '1', reason: 'Late delivery' }],
            totalItems: 1
          }
        }
      });

      const result = await disputeService.getDisputes({ PageIndex: 1 });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      if (result.data) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0].id).toBe('1');
      }
    });

    it('throws error if API call fails', async () => {
      (vi.mocked(apiClient.get)).mockRejectedValue(new Error('Network error'));
      await expect(disputeService.getDisputes({})).rejects.toThrow('Network error');
    });
  });

  describe('getDisputeById', () => {
    it('returns dispute details with project enrichment', async () => {
      (vi.mocked(apiClient.get)).mockImplementation((url: string) => {
        if (url.includes('projects')) {
          return Promise.resolve({
            data: {
              success: true,
              data: {
                title: 'Project Title',
                clientName: 'Client Name',
                expertName: 'Expert Name',
                milestones: [{ id: 'm1', amount: 500 }]
              }
            }
          });
        }
        return Promise.resolve({
          data: {
            success: true,
            data: { id: 'd1', projectId: 'p1', milestoneId: 'm1', status: 'OPEN' }
          }
        });
      });

      const result = await disputeService.getDisputeById('d1');
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('d1');
      expect(result.data?.clientName).toBe('Client Name');
      expect(result.data?.milestoneAmount).toBe(500);
    });

    it('throws enrichment error if project fetch fails', async () => {
      (vi.mocked(apiClient.get)).mockImplementation((url: string) => {
        if (url.includes('projects')) {
          return Promise.reject(new Error('Unauthorized'));
        }
        return Promise.resolve({
          data: {
            success: true,
            data: { id: 'd1', projectId: 'p1', milestoneId: 'm1', status: 'OPEN' }
          }
        });
      });

      await expect(disputeService.getDisputeById('d1')).rejects.toThrow('Unauthorized');
    });
  });

  describe('resolveDispute', () => {
    it('calls resolve endpoint with correct data', async () => {
      (vi.mocked(apiClient.put)).mockResolvedValue({ data: { success: true } });
      const payload = { resolutionType: DisputeResolutionType.RELEASE_TO_EXPERT, resolutionNote: 'Done' };
      
      const result = await disputeService.resolveDispute('d1', payload);
      expect(result.success).toBe(true);
      expect(apiClient.put).toHaveBeenCalledWith(expect.stringContaining('/d1'), payload);
    });
  });
});
