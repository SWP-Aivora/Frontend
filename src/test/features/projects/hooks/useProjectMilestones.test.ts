import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import * as reactQuery from '@tanstack/react-query';
import { useProjectMilestones } from '../../../../features/projects/hooks/useProjectMilestones';
import { projectService } from '../../../../features/projects/services';

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

vi.mock('../../../../features/projects/services', () => ({
  projectService: {
    getMilestonesByProject: vi.fn(),
  },
}));

describe('useProjectMilestones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes focus and reconnect refetch options without polling to React Query options', () => {
    (vi.mocked(reactQuery.useQuery)).mockReturnValue({
      data: undefined,
      isLoading: false,
      isSuccess: true,
    } as unknown as reactQuery.UseQueryResult);

    renderHook(() => useProjectMilestones('project-123'));

    expect(reactQuery.useQuery).toHaveBeenCalledTimes(1);
    const queryOptions = vi.mocked(reactQuery.useQuery).mock.calls[0][0] as {
      queryKey?: unknown[];
      enabled?: boolean;
      refetchOnWindowFocus?: boolean;
      refetchOnReconnect?: boolean;
      queryFn?: () => unknown;
    };

    expect(queryOptions.queryKey).toEqual(['project', 'project-123', 'milestones']);
    expect(queryOptions.enabled).toBe(true);
    expect(queryOptions).not.toHaveProperty('refetchInterval');
    expect(queryOptions.refetchOnWindowFocus).toBe(true);
    expect(queryOptions.refetchOnReconnect).toBe(true);

    if (queryOptions.queryFn) {
      queryOptions.queryFn();
      expect(projectService.getMilestonesByProject).toHaveBeenCalledWith('project-123');
    }
  });
});
