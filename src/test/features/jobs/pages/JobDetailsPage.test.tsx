import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JobDetailsPage } from '../../../../features/jobs/pages/JobDetailsPage';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const mockRouterState = vi.hoisted(() => ({
  params: { id: 'job-123', proposalId: undefined as string | undefined },
  navigate: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => {
  return {
    QueryClient: vi.fn(),
    QueryClientProvider: ({ children }: { children: ReactNode }) => children,
    useQuery: vi.fn(),
    useMutation: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  };
});

vi.mock('react-router-dom', () => {
  return {
    useParams: () => mockRouterState.params,
    useNavigate: () => mockRouterState.navigate,
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/features/jobs/services', () => ({
  jobService: {
    getJobById: vi.fn(),
  },
}));

vi.mock('@/features/proposals/services', () => ({
  proposalService: {
    getProposalById: vi.fn(),
    submitProposal: vi.fn(),
    updateProposal: vi.fn(),
  },
}));

vi.mock('@/features/auth/store', () => ({
  useAuthStore: () => ({
    user: { id: 'client-1', role: 'CLIENT' },
  }),
}));

const queryClient = new QueryClient();

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <JobDetailsPage />
    </QueryClientProvider>
  );
};

describe('JobDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouterState.params = { id: 'job-123', proposalId: undefined };
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
    });
  });

  it('renders loading state', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(useQuery)).mockReturnValue({ isLoading: true } as any);
    renderComponent();
    expect(document.querySelector('.animate-spin')).not.toBeNull();
  });

  it('configures refetchInterval: 10000 and refetchOnWindowFocus: true for the job query', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(useQuery)).mockImplementation((options: any) => {
      if (options?.queryKey?.[0] === 'job') {
        return {
          isLoading: false,
          data: {
            data: {
              id: 'job-123',
              title: 'Test Job',
              createdAt: new Date().toISOString(),
              budgetMin: 100,
              budgetMax: 500,
              skills: [{ id: '1', name: 'React' }],
              clientId: 'client-1',
              client: { fullName: 'Client Name' },
            },
          },
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      return { isLoading: false, data: { data: null } } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    });
    renderComponent();
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['job', 'job-123'],
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
      })
    );
  });

  describe('Proposal form visibility by job status', () => {
    const mockJobWithStatus = (status: unknown) => {
      (vi.mocked(useQuery)).mockImplementation((options: unknown) => {
        const queryOptions = options as { queryKey?: unknown[] };
        if (queryOptions?.queryKey?.[0] === 'job') {
          return {
            isLoading: false,
            data: {
              data: {
                id: 'job-123',
                title: 'Test Job',
                status,
                createdAt: new Date().toISOString(),
                budgetMin: 100,
                budgetMax: 500,
                skills: [],
                clientId: 'client-1',
                client: { fullName: 'Client' },
              },
            },
          } as unknown as ReturnType<typeof useQuery>;
        }
        return { isLoading: false, data: { data: null } } as unknown as ReturnType<typeof useQuery>;
      });
    };

    it('should_render_proposal_form_when_job_status_is_published', () => {
      mockJobWithStatus('Published');
      renderComponent();
      expect(screen.queryByTestId('proposal-form')).toBeInTheDocument();
      expect(screen.queryByText('This job is no longer accepting proposals')).toBeNull();
    });

    it('should_render_proposal_form_when_job_status_is_open', () => {
      mockJobWithStatus('OPEN'); // actual backend JobStatus enum value
      renderComponent();
      expect(screen.queryByTestId('proposal-form')).toBeInTheDocument();
      expect(screen.queryByText('This job is no longer accepting proposals')).toBeNull();
    });

    it('should_render_proposal_form_when_job_status_is_numeric_1', () => {
      mockJobWithStatus(1); // 1 = Published / Open
      renderComponent();
      expect(screen.queryByTestId('proposal-form')).toBeInTheDocument();
      expect(screen.queryByText('This job is no longer accepting proposals')).toBeNull();
    });

    it('should_hide_proposal_form_when_job_status_is_in_progress', () => {
      mockJobWithStatus('InProgress');
      renderComponent();
      expect(screen.queryByTestId('proposal-form')).toBeNull();
      expect(screen.getByText('This job is no longer accepting proposals')).toBeInTheDocument();
    });

    it('should_hide_proposal_form_when_job_status_is_numeric_2', () => {
      mockJobWithStatus(2); // 2 = InProgress
      renderComponent();
      expect(screen.queryByTestId('proposal-form')).toBeNull();
      expect(screen.getByText('This job is no longer accepting proposals')).toBeInTheDocument();
    });

    it('should_hide_proposal_form_when_job_status_is_completed', () => {
      mockJobWithStatus('Completed');
      renderComponent();
      expect(screen.queryByTestId('proposal-form')).toBeNull();
      expect(screen.getByText('This job is no longer accepting proposals')).toBeInTheDocument();
    });

    it('should_hide_proposal_form_when_job_status_is_cancelled', () => {
      mockJobWithStatus('Cancelled');
      renderComponent();
      expect(screen.queryByTestId('proposal-form')).toBeNull();
      expect(screen.getByText('This job is no longer accepting proposals')).toBeInTheDocument();
    });

    it('shows Cancel Job button for open jobs', () => {
      mockJobWithStatus(1);
      renderComponent();
      expect(screen.getByRole('button', { name: /cancel job/i })).toBeInTheDocument();
    });

    it('shows Delete button for draft jobs', () => {
      mockJobWithStatus(0);
      renderComponent();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('does not show Delete button for open jobs', () => {
      mockJobWithStatus(1);
      renderComponent();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });
  });

  describe('Proposal milestone amount input step', () => {
    const mockOpenJob = () => {
      (vi.mocked(useQuery)).mockImplementation((options: unknown) => {
        const queryOptions = options as { queryKey?: unknown[] };
        if (queryOptions?.queryKey?.[0] === 'job') {
          return {
            isLoading: false,
            data: {
              data: {
                id: 'job-123',
                title: 'Test Job',
                status: 1,
                createdAt: new Date().toISOString(),
                budgetMin: 100,
                budgetMax: 500,
                skills: [],
                clientId: 'client-1',
                client: { fullName: 'Client' },
              },
            },
          } as unknown as ReturnType<typeof useQuery>;
        }

        return { isLoading: false, data: { data: null } } as unknown as ReturnType<typeof useQuery>;
      });
    };

    it('uses whole-number increments for milestone amount inputs when creating a proposal', () => {
      mockOpenJob();

      renderComponent();

      const amountInputs = screen.getAllByTestId('proposal-milestone-amount');
      expect(amountInputs).toHaveLength(1);
      expect(amountInputs[0]).toHaveAttribute('step', '1');
    });

    it('uses whole-number increments for every milestone amount input when editing a proposal', () => {
      mockRouterState.params = { id: 'job-123', proposalId: 'proposal-123' };
      (vi.mocked(useQuery)).mockImplementation((options: unknown) => {
        const queryOptions = options as { queryKey?: unknown[] };
        if (queryOptions?.queryKey?.[0] === 'job') {
          return {
            isLoading: false,
            data: {
              data: {
                id: 'job-123',
                title: 'Test Job',
                status: 1,
                createdAt: new Date().toISOString(),
                budgetMin: 100,
                budgetMax: 500,
                skills: [],
                clientId: 'client-1',
                client: { fullName: 'Client' },
              },
            },
          } as unknown as ReturnType<typeof useQuery>;
        }

        if (queryOptions?.queryKey?.[0] === 'proposal') {
          return {
            isLoading: false,
            data: {
              data: {
                id: 'proposal-123',
                status: 1,
                coverLetter: 'Existing proposal',
                milestones: [
                  { id: 'milestone-1', title: 'First milestone', amount: 1, dueDays: 1, orderIndex: 0 },
                  { id: 'milestone-2', title: 'Second milestone', amount: 2, dueDays: 2, orderIndex: 1 },
                ],
              },
            },
          } as unknown as ReturnType<typeof useQuery>;
        }

        return { isLoading: false, data: { data: null } } as unknown as ReturnType<typeof useQuery>;
      });

      renderComponent();

      const amountInputs = screen.getAllByTestId('proposal-milestone-amount');
      expect(amountInputs).toHaveLength(2);
      amountInputs.forEach((input) => {
        expect(input).toHaveAttribute('step', '1');
      });
    });
  });
});
