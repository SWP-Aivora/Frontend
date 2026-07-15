import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectService } from '../../../features/projects/services';
import apiClient from '../../../lib/axios';
import { ProjectStatus } from '../../../shared/types/enums';

vi.mock('../../../lib/axios');

describe('projectService.getExpertCompletedProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unwraps the profile completed-projects response and maps summary fields for profile cards', async () => {
    (vi.mocked(apiClient.get)).mockResolvedValue({
      data: {
        success: true,
        data: {
          projects: [
            {
              projectId: 'project-1',
              title: 'AI training assistant',
              summary: 'Built a tutor workflow.',
              completedAt: '2026-07-14T10:00:00Z',
              totalBudget: 120,
              currency: 'AICOIN',
              clientDisplayName: 'Client One',
              clientAvatarUrl: 'https://example.com/client.png',
            },
          ],
          totalCount: 3,
          page: 1,
          pageSize: 100,
          totalPages: 1,
        },
        message: 'Completed projects retrieved successfully',
      },
    });

    const result = await projectService.getExpertCompletedProjects('expert-1');

    expect(apiClient.get).toHaveBeenCalledWith('profiles/expert/expert-1/completed-projects', {
      params: { page: 1, pageSize: 100 },
    });
    expect(result.metadata.totalCount).toBe(3);
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0]).toMatchObject({
      id: 'project-1',
      title: 'AI training assistant',
      description: 'Built a tutor workflow.',
      status: ProjectStatus.COMPLETED,
      totalBudget: 120,
      currency: 'AICOIN',
      clientName: 'Client One',
      endDate: '2026-07-14T10:00:00Z',
    });
  });
});

describe('projectService.getMilestoneSteps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and normalizes the step list for a milestone', async () => {
    (vi.mocked(apiClient.get)).mockResolvedValue({
      data: {
        success: true,
        data: [
          { id: 'step-1', milestoneId: 'milestone-1', title: 'Draft wireframes', orderIndex: 1, status: 'PENDING' },
        ],
        message: 'Milestone steps retrieved successfully',
      },
    });

    const result = await projectService.getMilestoneSteps('milestone-1');

    expect(apiClient.get).toHaveBeenCalledWith('milestones/milestone-1/steps');
    expect(result.success).toBe(true);
    expect(result.data?.[0].title).toBe('Draft wireframes');
    expect(result.data?.[0].status).toBe('PENDING');
  });
});

describe('projectService.createMilestoneStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls POST /milestones/{id}/steps with the payload', async () => {
    (vi.mocked(apiClient.post)).mockResolvedValue({
      data: {
        success: true,
        data: { id: 'step-2', milestoneId: 'milestone-1', title: 'New step', orderIndex: 2, status: 'PENDING' },
        message: 'Milestone step added successfully',
      },
    });

    const payload = { title: 'New step', orderIndex: 2 };
    const result = await projectService.createMilestoneStep('milestone-1', payload);

    expect(apiClient.post).toHaveBeenCalledWith('milestones/milestone-1/steps', payload);
    expect(result.data?.id).toBe('step-2');
  });
});

describe('projectService.updateMilestoneStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls PUT /steps/{id} with the payload and normalizes the response', async () => {
    (vi.mocked(apiClient.put)).mockResolvedValue({
      data: {
        success: true,
        data: { id: 'step-1', milestoneId: 'milestone-1', title: 'Updated title', orderIndex: 1, status: 'PENDING' },
        message: 'Milestone step updated successfully',
      },
    });

    const payload = { title: 'Updated title' };
    const result = await projectService.updateMilestoneStep('step-1', payload);

    expect(apiClient.put).toHaveBeenCalledWith('steps/step-1', payload);
    expect(result.data?.title).toBe('Updated title');
  });
});

describe('projectService.updateStepStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls PUT /steps/{id}/status with the target status', async () => {
    (vi.mocked(apiClient.put)).mockResolvedValue({
      data: {
        success: true,
        data: { id: 'step-1', milestoneId: 'milestone-1', title: 'Draft wireframes', orderIndex: 1, status: 'IN_PROGRESS' },
        message: 'Milestone step status updated successfully',
      },
    });

    const result = await projectService.updateStepStatus('step-1', 'IN_PROGRESS');

    expect(apiClient.put).toHaveBeenCalledWith('steps/step-1/status', { status: 'IN_PROGRESS' });
    expect(result.data?.status).toBe('IN_PROGRESS');
  });
});

describe('projectService.deleteMilestoneStep', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls DELETE /steps/{id}', async () => {
    (vi.mocked(apiClient.delete)).mockResolvedValue({
      data: { success: true, data: null, message: 'Milestone step deleted successfully' },
    });

    await projectService.deleteMilestoneStep('step-1');

    expect(apiClient.delete).toHaveBeenCalledWith('steps/step-1');
  });
});

describe('projectService.reorderMilestoneSteps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls PUT /milestones/{id}/steps/reorder with the ordered id list', async () => {
    (vi.mocked(apiClient.put)).mockResolvedValue({
      data: { success: true, data: null, message: 'Milestone steps reordered successfully' },
    });

    await projectService.reorderMilestoneSteps('milestone-1', ['step-2', 'step-1']);

    expect(apiClient.put).toHaveBeenCalledWith('milestones/milestone-1/steps/reorder', ['step-2', 'step-1']);
  });
});

describe('projectService.suggestMilestoneSteps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls POST /milestones/{id}/steps/suggest and unwraps the steps array', async () => {
    (vi.mocked(apiClient.post)).mockResolvedValue({
      data: {
        success: true,
        data: {
          steps: [
            { title: 'Draft schema', description: 'Design the DB schema' },
            { title: 'Build API', description: null },
          ],
          aiModel: 'Aivora-Mock',
        },
        message: 'Milestone step suggestions generated',
      },
    });

    const result = await projectService.suggestMilestoneSteps('milestone-1');

    expect(apiClient.post).toHaveBeenCalledWith('milestones/milestone-1/steps/suggest', {});
    expect(result.data).toHaveLength(2);
    expect(result.data?.[0].title).toBe('Draft schema');
    expect(result.data?.[1].description).toBeNull();
  });

  it('returns an empty array when the response has no steps', async () => {
    (vi.mocked(apiClient.post)).mockResolvedValue({
      data: { success: true, data: {}, message: 'Milestone step suggestions generated' },
    });

    const result = await projectService.suggestMilestoneSteps('milestone-1');

    expect(result.data).toEqual([]);
  });
});
