import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as reactQuery from '@tanstack/react-query';
import { useUpdateStepStatus } from '../../../../features/projects/hooks/useUpdateStepStatus';
import { projectService } from '../../../../features/projects/services';

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useMutation: vi.fn(),
    useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
  };
});

vi.mock('../../../../features/projects/services', () => ({
  projectService: {
    updateStepStatus: vi.fn(),
  },
}));

describe('useUpdateStepStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('threads the reason through to projectService.updateStepStatus for a block', () => {
    (vi.mocked(reactQuery.useMutation)).mockReturnValue({} as unknown as ReturnType<typeof reactQuery.useMutation>);

    renderHook(() => useUpdateStepStatus('milestone-123'));

    const mutationOptions = vi.mocked(reactQuery.useMutation).mock.calls[0][0] as {
      mutationFn: (vars: { stepId: string; status: string; reason?: string }) => unknown;
    };

    mutationOptions.mutationFn({ stepId: 'step-1', status: 'BLOCKED', reason: 'Waiting on client access' });
    expect(projectService.updateStepStatus).toHaveBeenCalledWith('step-1', 'BLOCKED', 'Waiting on client access');
  });

  it('calls projectService.updateStepStatus without a reason for a plain status change', () => {
    (vi.mocked(reactQuery.useMutation)).mockReturnValue({} as unknown as ReturnType<typeof reactQuery.useMutation>);

    renderHook(() => useUpdateStepStatus('milestone-123'));

    const mutationOptions = vi.mocked(reactQuery.useMutation).mock.calls[0][0] as {
      mutationFn: (vars: { stepId: string; status: string; reason?: string }) => unknown;
    };

    mutationOptions.mutationFn({ stepId: 'step-1', status: 'IN_PROGRESS' });
    expect(projectService.updateStepStatus).toHaveBeenCalledWith('step-1', 'IN_PROGRESS', undefined);
  });
});
