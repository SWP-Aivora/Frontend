import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCreateMilestone } from '../../../../features/projects/hooks/useCreateMilestone';
import { projectService } from '../../../../features/projects/services';
import { toast } from 'sonner';

const queryClientMock = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
}));

const mutationMock = vi.hoisted(() => ({
  options: null as null | {
    mutationFn: (data: {
      title: string;
      description?: string;
      amount: number;
      dueDate?: string;
      acceptanceCriteria?: string;
    }) => unknown;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => queryClientMock,
  useMutation: vi.fn((options) => {
    mutationMock.options = options;
    return { mutate: vi.fn(), isPending: false };
  }),
}));

vi.mock('../../../../features/projects/services', () => ({
  projectService: {
    createMilestone: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useCreateMilestone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutationMock.options = null;
  });

  it('uses the real project create service contract with project ID and request payload', async () => {
    vi.mocked(projectService.createMilestone).mockResolvedValue({
      success: true,
      message: 'Success',
      data: null,
      statusCode: 200,
    });

    renderHook(() => useCreateMilestone({ projectId: 'project-101' }));

    await mutationMock.options?.mutationFn({
      title: 'Build authentication',
      description: '',
      amount: 500,
      dueDate: '',
      acceptanceCriteria: 'Login works',
    });

    expect(projectService.createMilestone).toHaveBeenCalledWith('project-101', {
      title: 'Build authentication',
      description: undefined,
      amount: 500,
      dueDate: undefined,
      acceptanceCriteria: 'Login works',
    });
  });

  it('invalidates project detail and milestone list queries after successful creation', () => {
    const onSuccess = vi.fn();

    renderHook(() => useCreateMilestone({ projectId: 'project-101', onSuccess }));

    mutationMock.options?.onSuccess?.();

    expect(queryClientMock.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['project', 'project-101'] });
    expect(queryClientMock.invalidateQueries).toHaveBeenCalledWith({ queryKey: ['project', 'project-101', 'milestones'] });
    expect(toast.success).toHaveBeenCalledWith('Milestone created successfully!');
    expect(onSuccess).toHaveBeenCalled();
  });

  it('shows a specific toast for the backend active-dispute guard', () => {
    renderHook(() => useCreateMilestone({ projectId: 'project-101' }));

    mutationMock.options?.onError?.({
      response: {
        data: {
          message: 'Cannot create a milestone while there is an active dispute.',
        },
      },
    });

    expect(toast.error).toHaveBeenCalledWith('This action cannot be completed while there is an open dispute.');
  });
});
