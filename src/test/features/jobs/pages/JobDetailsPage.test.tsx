import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { JobDetailsPage } from '../../../../features/jobs/pages/JobDetailsPage';
import { BrowserRouter } from 'react-router-dom';
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
  },
}));

vi.mock('../../../../features/jobs/services', () => ({
  jobService: {
    getJobById: vi.fn(),
  },
}));

vi.mock('../../proposals/services', () => ({
  proposalService: {
    getProposalById: vi.fn(),
    submitProposal: vi.fn(),
    updateProposal: vi.fn(),
  },
}));

const queryClient = new QueryClient();

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <JobDetailsPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('JobDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(reactQuery.useQuery)).mockReturnValue({ isLoading: true } as any);
    renderComponent();
    expect(document.querySelector('.animate-spin')).not.toBeNull();
  });

  it('configures refetchInterval: 10000 and refetchOnWindowFocus: true for the job query', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(reactQuery.useQuery)).mockImplementation((options: any) => {
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
              skills: ['React'],
              client: { fullName: 'Client Name' },
            },
          },
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      return { isLoading: false, data: { data: null } } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    });
    renderComponent();
    expect(reactQuery.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['job', 'job-123'],
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
      })
    );
  });
});
