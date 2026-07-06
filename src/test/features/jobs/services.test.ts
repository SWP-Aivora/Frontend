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
      expect(apiClient.post).toHaveBeenCalledWith('/jobs/job-1/cancel', 'null', {
        headers: { 'Content-Type': 'application/json' },
      });
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
      expect(apiClient.post).toHaveBeenCalledWith('/jobs/job-1/cancel', '"No longer needed"', {
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('rejectAiJobSuggestion', () => {
    it('calls the reject endpoint with the given reason', async () => {
      (vi.mocked(apiClient.post)).mockResolvedValue({
        data: {
          success: true,
          data: {
            id: 'suggestion-1',
            jobId: null,
            clientId: 'client-1',
            rawInput: 'Build me a website',
            suggestedTitle: 'Website build',
            suggestedDescription: 'A website',
            businessDomain: null,
            expectedOutcome: null,
            categoryId: null,
            categoryName: null,
            budgetType: 'FIXED',
            suggestedBudgetMin: 100,
            suggestedBudgetMax: 500,
            currency: 'AICOIN',
            suggestedTimelineDays: 10,
            experienceLevel: null,
            suggestedSkills: [],
            suggestedMilestones: [],
            status: 'REJECTED',
            createdAt: '2026-07-01T00:00:00Z',
          },
          message: 'AI suggestion rejected'
        }
      });

      const result = await jobService.rejectAiJobSuggestion('suggestion-1', 'Not what I needed');
      expect(apiClient.post).toHaveBeenCalledWith('/ai/job-assistant/suggestion-1/reject', { reason: 'Not what I needed' });
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('REJECTED');
    });
  });
});
