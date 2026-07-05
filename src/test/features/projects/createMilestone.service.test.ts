// 🔴 RED Phase — Service tests for createMilestone
// These tests define the contract for createMilestone service method.
// They will FAIL until the method is added to projectService.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectService } from '../../../features/projects/services';
import { MilestoneStatus } from '../../../shared/types/enums';
import apiClient from '../../../lib/axios';

vi.mock('../../../lib/axios');

describe('projectService.createMilestone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls POST /projects/{id}/milestones with correct payload', async () => {
    (vi.mocked(apiClient.post)).mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'new-milestone-1',
          projectId: 'project-1',
          title: 'New milestone',
          description: 'Description',
          acceptanceCriteria: null,
          amount: 500,
          // normalizeMilestoneStatus('CREATED') → MilestoneStatus.CREATED (0)
          status: 'CREATED',
          dueDate: '2026-09-01',
          dueDays: null,
          orderIndex: 4,
          createdAt: '2026-07-05T00:00:00Z',
          updatedAt: '2026-07-05T00:00:00Z',
        },
        message: 'Milestone created successfully',
      },
    });

    const payload = {
      title: 'New milestone',
      description: 'Description',
      amount: 500,
      dueDate: '2026-09-01',
    };

    const result = await projectService.createMilestone('project-1', payload);

    expect(apiClient.post).toHaveBeenCalledWith('projects/project-1/milestones', payload);
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('new-milestone-1');
    expect(result.data?.title).toBe('New milestone');
    expect(result.data?.amount).toBe(500);
    // normalizeMilestoneStatus converts 'CREATED' string → MilestoneStatus.CREATED (0)
    expect(result.data?.status).toBe(MilestoneStatus.CREATED);
  });

  it('normalizes the returned milestone (camelCase fields from API)', async () => {
    (vi.mocked(apiClient.post)).mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'norm-1',
          projectId: 'project-1',
          title: 'Normalized milestone',
          amount: 300,
          status: 'CREATED',
          orderIndex: 0,
          createdAt: '2026-07-05T00:00:00Z',
          updatedAt: '2026-07-05T00:00:00Z',
        },
        message: 'Created',
      },
    });

    const result = await projectService.createMilestone('project-1', {
      title: 'Normalized milestone',
      amount: 300,
    });

    expect(result.success).toBe(true);
    expect(result.data?.id).toBe('norm-1');
    expect(result.data?.projectId).toBe('project-1');
    expect(result.data?.title).toBe('Normalized milestone');
    expect(result.data?.amount).toBe(300);
  });

  it('propagates API error when request fails', async () => {
    const apiError = new Error('Network Error');
    (vi.mocked(apiClient.post)).mockRejectedValue(apiError);

    await expect(
      projectService.createMilestone('project-1', { title: 'Fail', amount: 100 })
    ).rejects.toThrow('Network Error');
  });
});
