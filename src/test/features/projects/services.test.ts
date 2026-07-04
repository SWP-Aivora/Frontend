import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectService } from '../../../features/projects/services';
import apiClient from '../../../lib/axios';

vi.mock('../../../lib/axios');

describe('projectService.getMilestoneById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches full milestone details including fields the project summary omits', async () => {
    (vi.mocked(apiClient.get)).mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'milestone-1',
          projectId: 'project-1',
          title: 'QA Testing',
          description: 'Manual QA pass',
          acceptanceCriteria: 'No P1 bugs',
          amount: 300,
          currency: 'AICOIN',
          status: 'CREATED',
          dueDate: '2026-08-15',
          orderIndex: 3,
          createdAt: '2026-07-01T00:00:00Z',
        },
        message: 'Milestone retrieved successfully'
      }
    });

    const result = await projectService.getMilestoneById('milestone-1');

    expect(apiClient.get).toHaveBeenCalledWith('milestones/milestone-1');
    expect(result.success).toBe(true);
    expect(result.data?.acceptanceCriteria).toBe('No P1 bugs');
  });
});

describe('projectService.updateMilestone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the milestone update endpoint and normalizes the response', async () => {
    (vi.mocked(apiClient.put)).mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 'milestone-1',
          projectId: 'project-1',
          title: 'Updated title',
          description: 'Updated description',
          acceptanceCriteria: 'Updated criteria',
          amount: 500,
          currency: 'AICOIN',
          status: 'CREATED',
          dueDate: '2026-08-01',
          orderIndex: 0,
          createdAt: '2026-07-01T00:00:00Z',
        },
        message: 'Milestone updated successfully'
      }
    });

    const result = await projectService.updateMilestone('milestone-1', {
      title: 'Updated title',
      amount: 500,
    });

    expect(apiClient.put).toHaveBeenCalledWith('milestones/milestone-1', {
      title: 'Updated title',
      amount: 500,
    });
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe('Updated title');
    expect(result.data?.amount).toBe(500);
  });
});
