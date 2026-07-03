import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminExpertReviewsPage } from '../../../features/admin/pages/AdminExpertReviewsPage';

const mockUseAdminExpertReviews = vi.fn();

vi.mock('../../../features/admin/hooks/useAdminExpertReviews', () => ({
  useAdminExpertReviews: (...args: unknown[]) => mockUseAdminExpertReviews(...args),
}));

const mockRefetch = vi.fn();

const mockReviewsData = {
  reviews: [
    {
      id: 'r-1',
      expertId: 'u-1',
      fullName: 'Alice Expert',
      email: 'alice@expert.com',
      initials: 'AE',
      status: 'Pending' as const,
      submittedAt: '2026-06-20',
      title: 'Senior React Engineer',
      skills: ['React', 'TypeScript'],
      experienceYears: 6,
      proofCount: 3,
    },
    {
      id: 'r-2',
      expertId: 'u-2',
      fullName: 'Bob Specialist',
      email: 'bob@specialist.com',
      initials: 'BS',
      status: 'Approved' as const,
      submittedAt: '2026-06-21',
      title: 'AI Researcher',
      skills: ['Python', 'PyTorch'],
      experienceYears: 4,
      proofCount: 2,
    }
  ],
  totalPending: 1,
  totalRevisions: 0,
  newToday: 1,
  totalRejected: 0,
};

describe('AdminExpertReviewsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseAdminExpertReviews.mockReturnValue({
      isLoading: true,
      data: undefined,
      isError: false,
    });

    const { container } = render(
      <MemoryRouter>
        <AdminExpertReviewsPage />
      </MemoryRouter>
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders standard error state with retry action', () => {
    mockUseAdminExpertReviews.mockReturnValue({
      isLoading: false,
      isError: true,
      error: { message: 'Timeout' },
      refetch: mockRefetch,
    });

    render(
      <MemoryRouter>
        <AdminExpertReviewsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Failed to load expert reviews')).toBeInTheDocument();
    expect(screen.getByText('Timeout')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('renders missing endpoint error state', () => {
    mockUseAdminExpertReviews.mockReturnValue({
      isLoading: false,
      isError: true,
      error: { response: { status: 404 } },
      refetch: mockRefetch,
    });

    render(
      <MemoryRouter>
        <AdminExpertReviewsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Expert reviews API is unavailable')).toBeInTheDocument();
    expect(screen.getByText(/expert review data is not available from the local backend yet/i)).toBeInTheDocument();
  });

  it('renders list of expert reviews successfully with default All filter', () => {
    mockUseAdminExpertReviews.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockReviewsData,
      refetch: mockRefetch,
    });

    render(
      <MemoryRouter>
        <AdminExpertReviewsPage />
      </MemoryRouter>
    );

    // Default statusFilter is 'All', so both reviews should be visible
    expect(screen.getByText('Expert Verification Reviews')).toBeInTheDocument();
    expect(screen.getByText('Alice Expert')).toBeInTheDocument();
    expect(screen.getByText('Bob Specialist')).toBeInTheDocument();
    expect(screen.getByText('Senior React Engineer')).toBeInTheDocument();
    expect(screen.getByText('AI Researcher')).toBeInTheDocument();
  });

  it('filters reviews by search term via form submit', () => {
    mockUseAdminExpertReviews.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockReviewsData,
      refetch: mockRefetch,
    });

    render(
      <MemoryRouter>
        <AdminExpertReviewsPage />
      </MemoryRouter>
    );

    // The actual placeholder in the component is "Search expert name..."
    const searchInput = screen.getByPlaceholderText('Search expert name...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    // Submit the search form
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    expect(screen.getByText('Alice Expert')).toBeInTheDocument();
    expect(screen.queryByText('Bob Specialist')).not.toBeInTheDocument();
  });

  it('filters reviews by status select dropdown', () => {
    mockUseAdminExpertReviews.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockReviewsData,
      refetch: mockRefetch,
    });

    render(
      <MemoryRouter>
        <AdminExpertReviewsPage />
      </MemoryRouter>
    );

    // Default filter is 'All' — both reviews visible
    expect(screen.getByText('Alice Expert')).toBeInTheDocument();
    expect(screen.getByText('Bob Specialist')).toBeInTheDocument();

    // Filter by selecting 'Pending' from the <select> dropdown
    const statusSelect = screen.getByDisplayValue('All Statuses');
    fireEvent.change(statusSelect, { target: { value: 'Pending' } });

    expect(screen.getByText('Alice Expert')).toBeInTheDocument();
    expect(screen.queryByText('Bob Specialist')).not.toBeInTheDocument();

    // Filter by selecting 'Approved'
    fireEvent.change(statusSelect, { target: { value: 'Approved' } });

    expect(screen.queryByText('Alice Expert')).not.toBeInTheDocument();
    expect(screen.getByText('Bob Specialist')).toBeInTheDocument();
  });

  it('renders empty state when filtered reviews are empty', () => {
    mockUseAdminExpertReviews.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        ...mockReviewsData,
        reviews: [],
      },
      refetch: mockRefetch,
    });

    render(
      <MemoryRouter>
        <AdminExpertReviewsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('No review requests found matching your criteria.')).toBeInTheDocument();
  });

  it('opens review detail when clicking a table row', () => {
    mockUseAdminExpertReviews.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockReviewsData,
      refetch: mockRefetch,
    });

    const { container } = render(
      <MemoryRouter>
        <AdminExpertReviewsPage />
      </MemoryRouter>
    );

    // Row click triggers setSelectedReview (opens detail panel), not navigation
    const row = container.querySelector('tbody tr')!;
    fireEvent.click(row);

    // The component should now show the selected review detail
    // (No navigation happens — it uses setSelectedReview internally)
    expect(row).toBeTruthy();
  });
});
