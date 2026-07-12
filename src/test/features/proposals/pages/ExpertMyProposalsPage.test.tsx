import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpertMyProposalsPage } from '../../../../features/proposals/pages/ExpertMyProposalsPage';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as reactQuery from '@tanstack/react-query';

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

vi.mock('../../../../features/proposals/services', () => ({
  proposalService: {
    withdrawProposal: vi.fn(),
  },
}));

vi.mock('../../../../features/projects/services', () => ({
  projectService: {
    getProjects: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const queryClient = new QueryClient();

const LocationProbe = () => {
  const location = useLocation();
  return <div aria-label="current path">{`${location.pathname}${location.search}`}</div>;
};

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/expert/proposals']}>
        <ExpertMyProposalsPage />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const createProposal = (overrides: Record<string, unknown>) => ({
  id: 'proposal-1',
  status: 0,
  coverLetter: 'Proposal cover letter',
  jobId: 'job-1',
  jobTitle: 'Proposal Job Title',
  proposedBudget: 300,
  proposedTimelineDays: 35,
  createdAt: '2026-07-10T00:00:00.000Z',
  ...overrides,
});

const createProject = (overrides: Record<string, unknown>) => ({
  id: 'project-1',
  jobId: 'job-1',
  acceptedProposalId: 'proposal-1',
  ...overrides,
});

describe('ExpertMyProposalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockPageData = ({
    proposals = [],
    projects = [],
  }: {
    proposals?: Array<Record<string, unknown>>;
    projects?: Array<Record<string, unknown>>;
  }) => {
    vi.mocked(reactQuery.useQuery).mockImplementation((options: { queryKey?: readonly unknown[] }) => {
      const queryKey = options.queryKey as unknown[];
      if (queryKey?.[0] === 'myProposals') {
        return { data: { data: proposals }, isLoading: false } as never;
      }
      if (queryKey?.[0] === 'expertProjects') {
        return { data: { data: projects }, isLoading: false } as never;
      }
      return { isLoading: false } as never;
    });
  };

  const currentPath = () => screen.getByLabelText('current path').textContent;

  it('renders loading state', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(reactQuery.useQuery)).mockReturnValue({ isLoading: true } as any);
    renderComponent();
    expect(screen.getByText('Loading your proposals...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(reactQuery.useQuery)).mockReturnValue({ isError: true } as any);
    renderComponent();
    expect(screen.getByText('Failed to load proposals. Please try again later.')).toBeInTheDocument();
  });

  it('renders proposals correctly', () => {
    mockPageData({ proposals: [createProposal({ id: '1', status: 1, coverLetter: 'test', jobId: 'job123' })] });
    renderComponent();
    expect(screen.getByText('My Proposals')).toBeInTheDocument();
  });

  it('configures refetchInterval: 10000 and refetchOnWindowFocus: true for the myProposals query', () => {
    (vi.mocked(reactQuery.useQuery)).mockReturnValue({
      data: { data: [] },
      isLoading: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    renderComponent();
    expect(reactQuery.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['myProposals'],
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
      })
    );
  });

  describe('Withdraw Proposal', () => {
    it('renders Withdraw Proposal button for submitted proposals', () => {
      mockPageData({ proposals: [createProposal({ id: '1', status: 0, coverLetter: 'test', jobId: 'job123' })] });
      renderComponent();
      expect(screen.getByRole('button', { name: /withdraw proposal/i })).toBeInTheDocument();
    });

    it('does not render Withdraw Proposal button for accepted proposals', () => {
      mockPageData({ proposals: [createProposal({ id: '1', status: 2, coverLetter: 'test', jobId: 'job123' })] });
      renderComponent();
      expect(screen.queryByRole('button', { name: /withdraw proposal/i })).not.toBeInTheDocument();
    });
    it('calls withdrawProposal on Withdraw button click', async () => {
      const mockMutate = vi.fn();
      (vi.mocked(reactQuery.useMutation)).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      mockPageData({ proposals: [createProposal({ id: '1', status: 0, coverLetter: 'test', jobId: 'job123' })] });

      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderComponent();
      const withdrawButton = screen.getByRole('button', { name: /withdraw proposal/i });
      withdrawButton.click();
      expect(mockMutate).toHaveBeenCalledWith('1');
    });

    it('renders withdrawn proposals with a red Withdrawn badge and no withdraw action', () => {
      mockPageData({ proposals: [createProposal({ id: 'withdrawn-proposal', status: 4, jobTitle: 'Withdrawn Proposal' })] });

      renderComponent();

      const badge = screen.getByText('Withdrawn').closest('div');
      expect(badge).toHaveClass('text-destructive', 'bg-destructive/10');
      expect(screen.queryByText('Unknown')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /withdraw proposal/i })).not.toBeInTheDocument();
    });
  });

  describe('Title navigation', () => {
    it('navigates a pending proposal title to the shared proposal detail page', async () => {
      const user = userEvent.setup();
      mockPageData({ proposals: [createProposal({ id: 'proposal-pending', status: 0, jobTitle: 'Pending Proposal' })] });

      renderComponent();

      await user.click(screen.getByRole('link', { name: 'Pending Proposal' }));

      expect(currentPath()).toBe('/expert/proposals/proposal-pending');
    });

    it('navigates an accepted proposal title to proposal detail instead of workspace', async () => {
      const user = userEvent.setup();
      mockPageData({
        proposals: [createProposal({ id: 'proposal-accepted', status: 2, jobId: 'job-accepted', jobTitle: 'Accepted Proposal' })],
        projects: [createProject({ id: 'project-accepted', jobId: 'job-accepted', acceptedProposalId: 'proposal-accepted' })],
      });

      renderComponent();

      await user.click(screen.getByRole('link', { name: 'Accepted Proposal' }));

      expect(currentPath()).toBe('/expert/proposals/proposal-accepted');
      expect(currentPath()).not.toBe('/expert/projects/project-accepted/workspace');
    });

    it('navigates a declined proposal title to the shared proposal detail page', async () => {
      const user = userEvent.setup();
      mockPageData({ proposals: [createProposal({ id: 'proposal-declined', status: 3, jobTitle: 'Declined Proposal' })] });

      renderComponent();

      await user.click(screen.getByRole('link', { name: 'Declined Proposal' }));

      expect(currentPath()).toBe('/expert/proposals/proposal-declined');
    });

    it('uses proposal id, not job id or project id, for the title route', async () => {
      const user = userEvent.setup();
      mockPageData({
        proposals: [createProposal({ id: 'real-proposal-id', status: 2, jobId: 'job-not-used', jobTitle: 'Real Proposal Id' })],
        projects: [createProject({ id: 'project-not-used', jobId: 'job-not-used', acceptedProposalId: 'real-proposal-id' })],
      });

      renderComponent();

      await user.click(screen.getByRole('link', { name: 'Real Proposal Id' }));

      expect(currentPath()).toBe('/expert/proposals/real-proposal-id');
      expect(currentPath()).not.toContain('job-not-used');
      expect(currentPath()).not.toContain('project-not-used');
    });

    it('does not navigate when clicking outside the title', async () => {
      const user = userEvent.setup();
      mockPageData({ proposals: [createProposal({ id: 'proposal-1', status: 0, jobTitle: 'Clickable Proposal' })] });

      renderComponent();

      await user.click(screen.getByText('Proposal cover letter'));

      expect(currentPath()).toBe('/expert/proposals');
    });

    it('keeps Go to Workspace as the independent workspace action', async () => {
      const user = userEvent.setup();
      mockPageData({
        proposals: [createProposal({ id: 'proposal-accepted', status: 2, jobId: 'job-accepted', jobTitle: 'Accepted Proposal' })],
        projects: [createProject({ id: 'project-accepted', jobId: 'job-accepted', acceptedProposalId: 'proposal-accepted' })],
      });

      renderComponent();

      await user.click(screen.getByRole('link', { name: /go to workspace/i }));

      expect(currentPath()).toBe('/expert/projects/project-accepted/workspace');
    });
  });
});
