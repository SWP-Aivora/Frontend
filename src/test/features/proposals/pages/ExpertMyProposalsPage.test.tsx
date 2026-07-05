import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExpertMyProposalsPage } from '../../../../features/proposals/pages/ExpertMyProposalsPage';
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
    withdrawProposal: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const queryClient = new QueryClient();

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ExpertMyProposalsPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ExpertMyProposalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    (vi.mocked(reactQuery.useQuery)).mockReturnValue({
      data: {
        data: [{ id: '1', status: 1, coverLetter: 'test', jobId: 'job123' }]
      },
      isLoading: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
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
      (vi.mocked(reactQuery.useQuery)).mockReturnValue({
        data: {
          data: [{ id: '1', status: 1, coverLetter: 'test', jobId: 'job123' }] // 1 is pending
        },
        isLoading: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      renderComponent();
      expect(screen.getByRole('button', { name: /withdraw proposal/i })).toBeInTheDocument();
    });

    it('does not render Withdraw Proposal button for accepted proposals', () => {
      (vi.mocked(reactQuery.useQuery)).mockReturnValue({
        data: {
          data: [{ id: '1', status: 2, coverLetter: 'test', jobId: 'job123' }] // 2 is accepted
        },
        isLoading: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
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
      (vi.mocked(reactQuery.useQuery)).mockReturnValue({
        data: {
          data: [{ id: '1', status: 1, coverLetter: 'test', jobId: 'job123' }]
        },
        isLoading: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderComponent();
      const withdrawButton = screen.getByRole('button', { name: /withdraw proposal/i });
      withdrawButton.click();
      expect(mockMutate).toHaveBeenCalledWith('1');
    });
  });
});

