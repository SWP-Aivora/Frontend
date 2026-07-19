import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProposalDetailsPage } from '../../../../features/proposals/pages/ProposalDetailsPage';
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

vi.mock('../../../../features/proposals/services', () => ({
  proposalService: {
    getProposalById: vi.fn(),
    withdrawProposal: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ proposalId: 'prop-123' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('@/features/auth/store', () => ({
  useAuthStore: vi.fn(),
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
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(await import('@/features/auth/store')).useAuthStore.mockReturnValue({
      user: { role: 'EXPERT', id: 'exp-1' }
    } as never);
  });

  it('renders loading state', () => {
    (vi.mocked(reactQuery.useQuery)).mockReturnValue({ isLoading: true } as never);
    renderComponent();
    expect(screen.getByRole('status', { hidden: true }) || screen.getByText(/Loading/i)).toBeDefined();
  });

  it('configures refetchInterval: 10000 and refetchOnWindowFocus: true for the proposal query', () => {
    (vi.mocked(reactQuery.useQuery)).mockReturnValue({ isLoading: false, data: { data: { id: 'prop-123', status: 1, jobId: 'job-123', jobTitle: 'Test Job', expertId: 'exp-1', proposedBudget: 100, proposedTimelineDays: 5, coverLetter: 'Hello', milestones: [] } } } as never);
    renderComponent();
    expect(reactQuery.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['proposal', 'prop-123'],
        refetchInterval: 10000,
        refetchOnWindowFocus: true,
      })
    );
  });

  describe('Withdraw Proposal (Expert)', () => {
    beforeEach(async () => {
      vi.mocked(await import('@/features/auth/store')).useAuthStore.mockReturnValue({
        user: { role: 'EXPERT', id: 'exp-1' }
      } as never);
    });

    it('renders Withdraw Proposal button for submitted proposals', () => {
      (vi.mocked(reactQuery.useQuery)).mockReturnValue({ 
        isLoading: false, 
        data: { data: { id: 'prop-123', status: 1, jobId: 'job-123', expertId: 'exp-1', milestones: [] } } 
      } as never);
      renderComponent();
      expect(screen.getByRole('button', { name: /withdraw proposal/i })).toBeInTheDocument();
    });

    it('renders expert-specific proposal actions from the authenticated expert role', () => {
      (vi.mocked(reactQuery.useQuery)).mockReturnValue({
        isLoading: false,
        data: { data: { id: 'prop-123', status: 1, jobId: 'job-123', expertId: 'exp-1', milestones: [] } }
      } as never);

      renderComponent();

      expect(screen.getByRole('link', { name: /edit proposal/i })).toHaveAttribute(
        'href',
        '/expert/jobs/job-123/proposals/prop-123/edit'
      );
      expect(screen.queryByRole('link', { name: /view expert profile/i })).not.toBeInTheDocument();
    });

    it('does not render Withdraw Proposal button for accepted proposals', () => {
      (vi.mocked(reactQuery.useQuery)).mockReturnValue({ 
        isLoading: false, 
        data: { data: { id: 'prop-123', status: 2, jobId: 'job-123', expertId: 'exp-1', milestones: [] } } 
      } as never);
      renderComponent();
      expect(screen.queryByRole('button', { name: /withdraw proposal/i })).not.toBeInTheDocument();
    });

    it('calls withdrawProposal on Withdraw button click', async () => {
      const user = userEvent.setup();
      const mockMutate = vi.fn();
      (vi.mocked(reactQuery.useMutation)).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      } as never);
      (vi.mocked(reactQuery.useQuery)).mockReturnValue({ 
        isLoading: false, 
        data: { data: { id: 'prop-123', status: 1, jobId: 'job-123', expertId: 'exp-1', milestones: [] } } 
      } as never);

      renderComponent();
      const withdrawButton = screen.getByRole('button', { name: /withdraw proposal/i });
      await user.click(withdrawButton);
      const dialog = screen.getByRole('dialog', { name: /withdraw this proposal/i });
      await user.click(within(dialog).getByRole('button', { name: /withdraw proposal/i }));
      expect(mockMutate).toHaveBeenCalled();
    });
  });

  describe('Withdraw Proposal (Client)', () => {
    beforeEach(async () => {
      vi.mocked(await import('@/features/auth/store')).useAuthStore.mockReturnValue({
        user: { role: 'CLIENT', id: 'client-1' }
      } as never);
    });

    it('does not render Withdraw Proposal button for clients', () => {
      (vi.mocked(reactQuery.useQuery)).mockReturnValue({ 
        isLoading: false, 
        data: { data: { id: 'prop-123', status: 1, jobId: 'job-123', expertId: 'exp-1', milestones: [] } } 
      } as never);
      renderComponent();
      expect(screen.queryByRole('button', { name: /withdraw proposal/i })).not.toBeInTheDocument();
    });
  });

  describe('Proposal status badges', () => {
    it('renders numeric withdrawn status as a red Withdrawn badge', () => {
      (vi.mocked(reactQuery.useQuery)).mockReturnValue({
        isLoading: false,
        data: { data: { id: 'prop-123', status: 4, jobId: 'job-123', expertId: 'exp-1', milestones: [] } }
      } as never);

      renderComponent();

      expect(screen.getByText('Withdrawn')).toHaveClass('text-rose-700', 'bg-rose-50', 'border-rose-100');
      expect(screen.queryByText('Submitted')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /withdraw proposal/i })).not.toBeInTheDocument();
    });
  });
});
