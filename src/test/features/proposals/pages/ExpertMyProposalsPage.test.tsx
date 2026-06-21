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
  };
});

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
});
