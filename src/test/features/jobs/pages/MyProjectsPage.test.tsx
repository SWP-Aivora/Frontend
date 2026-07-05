import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider, type UseQueryResult } from '@tanstack/react-query';
import * as reactQuery from '@tanstack/react-query';
import { MyProjectsPage } from '../../../../features/jobs/pages/MyProjectsPage';
import { QUERY_KEYS, REFETCH_INTERVALS } from '@/shared/constants';

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
    useQueries: vi.fn(),
  };
});


vi.mock('../../../../features/projects/services', () => ({
  projectService: {
    getProjects: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

vi.mock('../../../../features/jobs/services', () => ({
  jobService: {
    getMyJobs: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

vi.mock('../../../../features/proposals/services', () => ({
  proposalService: {
    getProposalsByJobId: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

describe('MyProjectsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyProjectsPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders loading state when queries are loading', () => {
    (vi.mocked(reactQuery.useQuery)).mockReturnValue({ isLoading: true } as unknown as UseQueryResult);
    (vi.mocked(reactQuery.useQueries)).mockReturnValue([]);
    
    renderComponent();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('configures proposalCountQueries with correct query key and BACKGROUND_SUMMARY refetch interval', () => {
    const mockJobs = [
      { id: 'job-1', title: 'Job 1', status: 1, createdAt: new Date().toISOString() },
    ];

    (vi.mocked(reactQuery.useQuery)).mockImplementation((options: { queryKey?: readonly unknown[] }) => {
      const queryKey = options.queryKey as unknown[];
      if (queryKey?.[0] === 'clientJobs') {
        return { data: { data: mockJobs }, isLoading: false } as unknown as UseQueryResult;
      }
      if (queryKey?.[0] === 'clientProjects') {
        return { data: { data: [] }, isLoading: false } as unknown as UseQueryResult;
      }
      return { isLoading: false } as unknown as UseQueryResult;
    });

    (vi.mocked(reactQuery.useQueries)).mockReturnValue([]);

    renderComponent();

    const useQueriesCalls = vi.mocked(reactQuery.useQueries).mock.calls;
    expect(useQueriesCalls.length).toBeGreaterThan(0);
    
    const queriesArg = (useQueriesCalls[0][0] as { queries: Array<{ queryKey?: unknown[]; refetchInterval?: number }> }).queries;
    expect(queriesArg).toBeDefined();
    expect(queriesArg.length).toBe(1);
    expect(queriesArg[0].queryKey).toEqual(QUERY_KEYS.JOBS.PROPOSAL_COUNT('job-1'));
    expect(queriesArg[0].refetchInterval).toBe(REFETCH_INTERVALS.BACKGROUND_SUMMARY);
  });
});
