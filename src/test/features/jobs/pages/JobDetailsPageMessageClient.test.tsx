import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JobDetailsPage } from '../../../../features/jobs/pages/JobDetailsPage';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

// Kept in its own file: JobDetailsPage.test.tsx already runs at the memory
// ceiling of a single vitest worker on low-RAM machines — adding renders
// there OOMs the worker.

const mockRouterState = vi.hoisted(() => ({
  params: { id: 'job-123', proposalId: undefined as string | undefined },
  navigate: vi.fn(),
}));

const mockAuthState = vi.hoisted(() => ({
  user: { id: 'client-1', role: 'CLIENT' },
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

vi.mock('@/features/chat/services', () => ({
  chatService: {
    initializeConversation: vi.fn(),
  },
}));

vi.mock('@/features/auth/store', () => ({
  useAuthStore: () => ({
    user: mockAuthState.user,
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
            status: 'OPEN',
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

const setLocalStorage = (getItem: (key: string) => string | null) => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: vi.fn(getItem),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
  });
};

describe('JobDetailsPage Message Client button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouterState.params = { id: 'job-123', proposalId: undefined };
    mockAuthState.user = { id: 'client-1', role: 'CLIENT' };
    setLocalStorage(() => null);
  });

  it('shows the button for an expert who has submitted a proposal', () => {
    mockAuthState.user = { id: 'expert-1', role: 'EXPERT' };
    setLocalStorage((key) => (key === 'submitted_proposal_job-123' ? 'true' : null));
    mockOpenJob();
    renderComponent();
    expect(screen.getByRole('button', { name: /message client/i })).toBeInTheDocument();
  });

  it('hides the button for an expert who has not submitted a proposal', () => {
    mockAuthState.user = { id: 'expert-1', role: 'EXPERT' };
    mockOpenJob();
    renderComponent();
    expect(screen.queryByRole('button', { name: /message client/i })).not.toBeInTheDocument();
  });

  it('hides the button for a client', () => {
    setLocalStorage((key) => (key === 'submitted_proposal_job-123' ? 'true' : null));
    mockOpenJob();
    renderComponent();
    expect(screen.queryByRole('button', { name: /message client/i })).not.toBeInTheDocument();
  });
});
