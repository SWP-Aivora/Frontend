import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider, type UseQueryResult } from '@tanstack/react-query';
import * as reactQuery from '@tanstack/react-query';
import { MyProjectsPage } from '../../../../features/jobs/pages/MyProjectsPage';
import { QUERY_KEYS, REFETCH_INTERVALS } from '@/shared/constants';
import { BudgetType, ProjectStatus } from '@/shared/types/enums';

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
    deleteJob: vi.fn(),
    cancelJob: vi.fn(),
  },
}));

vi.mock('../../../../features/proposals/services', () => ({
  proposalService: {
    getProposalsByJobId: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

const LocationProbe = () => {
  const location = useLocation();
  return <div aria-label="current path">{`${location.pathname}${location.search}`}</div>;
};

const createJob = (overrides: Record<string, unknown>) => ({
  id: 'job-1',
  title: 'Test Job',
  status: 1,
  createdAt: '2026-07-10T00:00:00.000Z',
  budgetType: BudgetType.FIXED,
  budgetMin: 500,
  budgetMax: 1500,
  businessDomain: 'General',
  ...overrides,
});

const createProject = (overrides: Record<string, unknown>) => ({
  id: 'project-1',
  jobId: 'job-1',
  title: 'Project 1',
  status: ProjectStatus.ACTIVE,
  createdAt: '2026-07-11T00:00:00.000Z',
  expertName: 'Expert User',
  ...overrides,
});

describe('MyProjectsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/client/projects']}>
          <MyProjectsPage />
          <LocationProbe />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  const mockPageData = ({
    jobs = [],
    projects = [],
    proposalCounts = [],
  }: {
    jobs?: Array<Record<string, unknown>>;
    projects?: Array<Record<string, unknown>>;
    proposalCounts?: number[];
  }) => {
    (vi.mocked(reactQuery.useQuery)).mockImplementation((options: { queryKey?: readonly unknown[] }) => {
      const queryKey = options.queryKey as unknown[];
      if (queryKey?.[0] === 'clientJobs') {
        return { data: { data: jobs }, isLoading: false } as unknown as UseQueryResult;
      }
      if (queryKey?.[0] === 'clientProjects') {
        return { data: { data: projects }, isLoading: false } as unknown as UseQueryResult;
      }
      return { isLoading: false } as unknown as UseQueryResult;
    });

    (vi.mocked(reactQuery.useQueries)).mockReturnValue(
      jobs.map((_, index) => ({
        data: { data: Array.from({ length: proposalCounts[index] ?? 0 }, (__, proposalIndex) => ({ id: `proposal-${proposalIndex}` })) },
      })) as unknown as UseQueryResult[]
    );
  };

  const currentPath = () => screen.getByLabelText('current path').textContent;

  it('renders loading state when queries are loading', () => {
    (vi.mocked(reactQuery.useQuery)).mockReturnValue({ isLoading: true } as unknown as UseQueryResult);
    (vi.mocked(reactQuery.useQueries)).mockReturnValue([]);
    
    renderComponent();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('configures proposalCountQueries with correct query key and BACKGROUND_SUMMARY refetch interval', () => {
    const mockJobs = [
      createJob({ id: 'job-1', title: 'Job 1' }),
    ];

    mockPageData({ jobs: mockJobs });

    renderComponent();

    const useQueriesCalls = vi.mocked(reactQuery.useQueries).mock.calls;
    expect(useQueriesCalls.length).toBeGreaterThan(0);
    
    const queriesArg = (useQueriesCalls[0][0] as { queries: Array<{ queryKey?: unknown[]; refetchInterval?: number }> }).queries;
    expect(queriesArg).toBeDefined();
    expect(queriesArg.length).toBe(1);
    expect(queriesArg[0].queryKey).toEqual(QUERY_KEYS.JOBS.PROPOSAL_COUNT('job-1'));
    expect(queriesArg[0].refetchInterval).toBe(REFETCH_INTERVALS.BACKGROUND_SUMMARY);
  });

  describe('Title navigation', () => {
    it('navigates to the project workspace when a valid associated project ID exists', async () => {
      const user = userEvent.setup();
      mockPageData({
        jobs: [createJob({ id: 'job-with-project', title: 'Accepted Job', status: 1 })],
        projects: [createProject({ id: 'project-123', jobId: 'job-with-project', status: ProjectStatus.ACTIVE })],
      });

      renderComponent();

      await user.click(screen.getByRole('link', { name: 'Accepted Job' }));

      expect(currentPath()).toBe('/client/projects/project-123/workspace');
    });

    it('navigates to the job post editor for a draft job without a project ID', async () => {
      const user = userEvent.setup();
      mockPageData({
        jobs: [createJob({ id: 'draft-job', title: 'Draft Job', status: 0 })],
      });

      renderComponent();

      await user.click(screen.getByRole('link', { name: 'Draft Job' }));

      expect(currentPath()).toBe('/client/post-job?editJobId=draft-job');
    });

    it('navigates to the job post editor for an open job without a project ID', async () => {
      const user = userEvent.setup();
      mockPageData({
        jobs: [createJob({ id: 'open-job', title: 'Open Job', status: 1 })],
      });

      renderComponent();

      await user.click(screen.getByRole('link', { name: 'Open Job' }));

      expect(currentPath()).toBe('/client/post-job?editJobId=open-job');
    });

    it('navigates to the project workspace for an in-progress item with a valid project ID', async () => {
      const user = userEvent.setup();
      mockPageData({
        jobs: [createJob({ id: 'progress-job', title: 'In Progress Job', status: 1 })],
        projects: [createProject({ id: 'project-progress', jobId: 'progress-job', status: ProjectStatus.ACTIVE })],
      });

      renderComponent();

      await user.click(screen.getByRole('link', { name: 'In Progress Job' }));

      expect(currentPath()).toBe('/client/projects/project-progress/workspace');
    });

    it('navigates to the project workspace for a completed item with a valid project ID', async () => {
      const user = userEvent.setup();
      mockPageData({
        jobs: [createJob({ id: 'completed-job', title: 'Completed Job', status: 1 })],
        projects: [createProject({ id: 'project-completed', jobId: 'completed-job', status: ProjectStatus.COMPLETED })],
      });

      renderComponent();

      await user.click(screen.getByRole('link', { name: 'Completed Job' }));

      expect(currentPath()).toBe('/client/projects/project-completed/workspace');
    });

    it('does not navigate when clicking outside the title', async () => {
      const user = userEvent.setup();
      mockPageData({
        jobs: [createJob({ id: 'open-job', title: 'Open Job', status: 1 })],
      });

      renderComponent();

      await user.click(screen.getByText('General'));

      expect(currentPath()).toBe('/client/projects');
    });
  });

  describe('Job action buttons', () => {
    it('preserves View Proposals navigation', async () => {
      const user = userEvent.setup();
      mockPageData({
        jobs: [createJob({ id: 'job-1', title: 'Job with Proposals', status: 1 })],
      });

      renderComponent();

      await user.click(screen.getByRole('link', { name: /view proposals/i }));

      expect(currentPath()).toBe('/client/projects/job-1/proposals');
    });

    it('preserves Enter Workspace navigation', async () => {
      const user = userEvent.setup();
      mockPageData({
        jobs: [createJob({ id: 'job-1', title: 'Job with Workspace', status: 1 })],
        projects: [createProject({ id: 'project-1', jobId: 'job-1', status: ProjectStatus.ACTIVE })],
      });

      renderComponent();

      await user.click(screen.getByRole('link', { name: /enter workspace/i }));

      expect(currentPath()).toBe('/client/projects/project-1/workspace');
    });

    it('shows Delete button for draft jobs', () => {
      mockPageData({ jobs: [createJob({ status: 0 })] });
      renderComponent();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel job/i })).not.toBeInTheDocument();
    });

    it('shows Cancel Job button for open jobs', () => {
      mockPageData({ jobs: [createJob({ status: 1 })] });
      renderComponent();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel job/i })).toBeInTheDocument();
    });

    it('does not show Cancel or Delete buttons for in-progress jobs', () => {
      mockPageData({ jobs: [createJob({ status: 2 })] });
      renderComponent();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel job/i })).not.toBeInTheDocument();
    });

    it('does not show Cancel or Delete buttons for completed jobs', () => {
      mockPageData({ jobs: [createJob({ status: 3 })] });
      renderComponent();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel job/i })).not.toBeInTheDocument();
    });
  });
});
