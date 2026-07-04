import { describe, it, expect, vi, beforeEach } from 'vitest';
import { jobService } from '../../../features/jobs/services';
import apiClient from '../../../lib/axios';

vi.mock('../../../lib/axios');

describe('jobService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteJob', () => {
    it('calls the delete endpoint and normalizes the response', async () => {
      (vi.mocked(apiClient.delete)).mockResolvedValue({
        data: {
          success: true,
          data: null,
          message: 'Job deleted successfully'
        }
      });

      const result = await jobService.deleteJob('job-1');
      expect(apiClient.delete).toHaveBeenCalledWith('/jobs/job-1');
      expect(result.success).toBe(true);
    });
  });

  describe('cancelJob', () => {
    it('calls the cancel endpoint with a null reason by default', async () => {
      (vi.mocked(apiClient.post)).mockResolvedValue({
        data: {
          success: true,
          data: { id: 'job-1', status: 'CANCELLED' },
          message: 'Job cancelled successfully'
        }
      });

      const result = await jobService.cancelJob('job-1');
      expect(apiClient.post).toHaveBeenCalledWith('/jobs/job-1/cancel', null);
      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('job-1');
    });

    it('forwards a reason when provided', async () => {
      (vi.mocked(apiClient.post)).mockResolvedValue({
        data: {
          success: true,
          data: { id: 'job-1', status: 'CANCELLED' },
          message: 'Job cancelled successfully'
        }
      });

      await jobService.cancelJob('job-1', 'No longer needed');
      expect(apiClient.post).toHaveBeenCalledWith('/jobs/job-1/cancel', 'No longer needed');
    });
  });
});
