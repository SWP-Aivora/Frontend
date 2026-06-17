import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserDisputeListPage } from '../../../../features/disputes/pages/UserDisputeListPage';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockUseDisputes = vi.fn();
vi.mock('../../../../features/disputes/hooks/useDisputes', () => ({
  useDisputes: (...args: unknown[]) => mockUseDisputes(...args),
}));

vi.mock('../../../../features/auth/store', () => ({
  useAuthStore: vi.fn(() => ({
    user: { role: 'CLIENT' }
  }))
}));

const queryClient = new QueryClient();

const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <UserDisputeListPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('UserDisputeListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseDisputes.mockReturnValue({ isLoading: true });
    renderComponent();
    expect(screen.getByText('Loading your disputes...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseDisputes.mockReturnValue({ isError: true, error: new Error('Failed to load') });
    renderComponent();
    expect(screen.getByText('Failed to load disputes')).toBeInTheDocument();
  });

  it('renders empty state when no disputes', () => {
    mockUseDisputes.mockReturnValue({ data: { data: [] }, isLoading: false });
    renderComponent();
    expect(screen.getByText('All Clear')).toBeInTheDocument();
    expect(screen.getByText("You don't have any active dispute cases.")).toBeInTheDocument();
  });

  it('renders list of disputes', () => {
    mockUseDisputes.mockReturnValue({
      data: {
        data: [
          { id: '1', projectTitle: 'Project Alpha', milestoneTitle: 'M1', status: 'OPEN', createdAt: '2023-01-01' }
        ],
        metadata: { hasNextPage: false, hasPreviousPage: false, totalCount: 1 }
      },
      isLoading: false
    });
    
    renderComponent();
    expect(screen.getByText('Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('M1')).toBeInTheDocument();
  });
});
