import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProposalDetailsPage } from '../../../../features/proposals/pages/ProposalDetailsPage';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as reactQuery from '@tanstack/react-query';

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
    useParams: () => ({ proposalId: 'prop-123' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@/features/auth/store', () => ({
  useAuthStore: () => ({
    user: { role: 'CLIENT', id: 'client-1' },
  }),
}));

const queryClient = new QueryClient();

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ProposalDetailsPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ProposalDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(reactQuery.useQuery)).mockReturnValue({ isLoading: true } as any);
    renderComponent();
    expect(screen.getByRole('status', { hidden: true }) || screen.getByText(/Loading/i)).toBeDefined();
  });

  it('configures refetchInterval: 10000 and refetchOnWindowFocus: true for the proposal query', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(reactQuery.useQuery)).mockReturnValue({ isLoading: false, data: { data: { id: 'prop-123', status: 1, jobId: 'job-123', jobTitle: 'Test Job', expertId: 'exp-1', proposedBudget: 100, proposedTimelineDays: 5, coverLetter: 'Hello', milestones: [] } } } as any);
    renderComponent();
    expect(reactQuery.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['proposal', 'prop-123'],
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
      })
    );
  });
});
