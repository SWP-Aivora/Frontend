import { describe, it, expect, vi, beforeEach } from 'vitest';
import { proposalService } from '../../../features/proposals/services';
import apiClient from '../../../lib/axios';

vi.mock('../../../lib/axios');

describe('proposalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitProposal', () => {
    it('normalizes base response successfully', async () => {
      (vi.mocked(apiClient.post)).mockResolvedValue({
        data: {
          success: true,
          data: { id: 'p1', jobId: 'j1' },
          message: 'Success'
        }
      });

      const result = await proposalService.submitProposal('j1', { coverLetter: 'test', proposedBudget: 100 });
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('p1');
    });
  });

  describe('getProposalsByJobId', () => {
    it('normalizes paginated response successfully', async () => {
      (vi.mocked(apiClient.get)).mockResolvedValue({
        data: {
          success: true,
          data: {
            items: [{ id: 'p1' }],
            totalItems: 1
          }
        }
      });

      const result = await proposalService.getProposalsByJobId('j1');
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('acceptProposal', () => {
    it('normalizes base response successfully', async () => {
      (vi.mocked(apiClient.put)).mockResolvedValue({
        data: {
          success: true,
          data: null,
          message: 'Accepted'
        }
      });

      const result = await proposalService.acceptProposal('p1');
      expect(result.success).toBe(true);
    });
  });
  
  describe('getMyProposals', () => {
    it('normalizes paginated response successfully', async () => {
      (vi.mocked(apiClient.get)).mockResolvedValue({
        data: {
          success: true,
          data: {
            items: [{ id: 'p1' }],
            totalItems: 1
          }
        }
      });

      const result = await proposalService.getMyProposals();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });
});
