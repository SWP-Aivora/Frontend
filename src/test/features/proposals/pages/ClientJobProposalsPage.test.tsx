import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClientJobProposalsPage } from '../../../../features/proposals/pages/ClientJobProposalsPage';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider, type UseQueryResult } from '@tanstack/react-query';
import * as reactQuery from '@tanstack/react-query';
import { QUERY_KEYS, REFETCH_INTERVALS } from '@/shared/constants';

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'job-123' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const queryClient = new QueryClient();

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ClientJobProposalsPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ClientJobProposalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    (vi.mocked(reactQuery.useQuery)).mockReturnValue({ isLoading: true } as unknown as UseQueryResult);
    renderComponent();
    expect(screen.getByText('Retrieving Proposals & AI Insights...')).toBeInTheDocument();
  });

  it('renders proposals list correctly', () => {
    (vi.mocked(reactQuery.useQuery)).mockImplementation((options: reactQuery.UseQueryOptions) => {
      const queryKey = options.queryKey as unknown[];
      if (queryKey?.[0] === 'job') {
        return {
          data: {
            data: {
              id: 'job-123',
              title: 'Test Job Title',
              status: 1,
              timelineDays: 14,
              budgetMin: 100,
              budgetMax: 500,
            },
          },
          isLoading: false,
        } as unknown as UseQueryResult;
      }
      if (queryKey?.[0] === 'proposals') {
        return {
          data: {
            data: [
              {
                id: 'prop-1',
                expertId: 'exp-1',
                expert: { fullName: 'Jane Doe' },
                status: 0,
                coverLetter: 'I am a great developer for this job.',
                jobTitle: 'Frontend Developer',
                proposedBudget: 300,
                proposedTimelineDays: 10,
                milestones: [],
              },
            ],
          },
          isLoading: false,
        } as unknown as UseQueryResult;
      }
      if (queryKey?.[0] === 'jobRecommendations') {
        return {
          data: { data: [] },
          isLoading: false,
          isFetching: false,
          refetch: vi.fn(),
        } as unknown as UseQueryResult;
      }
      return { isLoading: false } as unknown as UseQueryResult;
    });

    renderComponent();
    expect(screen.getByText('Test Job Title')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Total Proposals')).toBeInTheDocument();
  });

  it('configures refetchInterval and query keys correctly using REFETCH_INTERVALS and QUERY_KEYS', () => {
    (vi.mocked(reactQuery.useQuery)).mockReturnValue({ isLoading: false, data: { data: [] } } as unknown as UseQueryResult);

    renderComponent();

    const calls = vi.mocked(reactQuery.useQuery).mock.calls;
    
    const proposalsQueryCall = calls.find(call => {
      const options = call[0] as { queryKey?: unknown[] };
      return Array.isArray(options?.queryKey) && options.queryKey[0] === 'proposals' && options.queryKey[1] === 'job-123';
    });
    expect(proposalsQueryCall).toBeDefined();
    expect(proposalsQueryCall![0]).toHaveProperty('queryKey', QUERY_KEYS.JOBS.PROPOSALS('job-123'));
    expect(proposalsQueryCall![0]).toHaveProperty('refetchInterval', REFETCH_INTERVALS.REALTIME_FAST);

    const jobQueryCall = calls.find(call => {
      const options = call[0] as { queryKey?: unknown[] };
      return Array.isArray(options?.queryKey) && options.queryKey[0] === 'job' && options.queryKey[1] === 'job-123';
    });
    expect(jobQueryCall).toBeDefined();
    expect(jobQueryCall![0]).toHaveProperty('queryKey', QUERY_KEYS.JOBS.DETAIL('job-123'));
    expect(jobQueryCall![0]).toHaveProperty('refetchInterval', REFETCH_INTERVALS.REALTIME_SLOW);
  });
});
