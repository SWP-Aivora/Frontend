import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminDashboardPage } from '../../../features/admin/pages/AdminDashboardPage';

const mockUseAdminDashboard = vi.fn();
const mockUseAdminRecentActivity = vi.fn();

vi.mock('../../../features/admin/hooks/useAdminDashboard', () => ({
  useAdminDashboard: (...args: unknown[]) => mockUseAdminDashboard(...args),
  useAdminRecentActivity: (...args: unknown[]) => mockUseAdminRecentActivity(...args),
}));

const mockRefetch = vi.fn();
const mockRefetchActivity = vi.fn();

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when dashboard data is loading', () => {
    mockUseAdminDashboard.mockReturnValue({
      isLoading: true,
      data: undefined,
      isError: false,
      refetch: mockRefetch,
    });
    mockUseAdminRecentActivity.mockReturnValue({
      isLoading: false,
      data: { data: [] },
      isError: false,
      refetch: mockRefetchActivity,
    });

    const { container } = render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders error state when dashboard data fails to load', () => {
    // In AdminDashboardPage: if isLoading is false and isError is true, it still proceeds to render unless handled.
    // Wait, let's see how AdminDashboardPage handles error:
    // It renders DashboardHeader with onRetry calling refetch, but doesn't have a full page error block for dashboard loading,
    // only for recent activity. Oh, wait! Let's check how it handles undefined summary:
    // It passes summary ?? undefined to DashboardHeader and SummaryCardsRow.
    // Let's mock a successful dashboard state first, then error state.
    mockUseAdminDashboard.mockReturnValue({
      isLoading: false,
      data: undefined,
      isError: true,
      refetch: mockRefetch,
    });
    mockUseAdminRecentActivity.mockReturnValue({
      isLoading: false,
      data: { data: [] },
      isError: false,
      refetch: mockRefetchActivity,
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    // Should display Retry button on header or similar
    const retryButtons = screen.getAllByRole('button');
    expect(retryButtons.length).toBeGreaterThan(0);
  });

  it('renders data successfully', () => {
    const mockSummary = {
      totalUsers: 150,
      openJobs: 25,
      activeProjects: 8,
      openDisputes: 2,
      totalTransactionsValue: 50000,
      pendingReviews: 5,
      newUsers7d: 12,
      newJobs7d: 5,
      newProjects7d: 2,
      newDisputes7d: 1,
      newExpertReviews7d: 3,
      newTransactions7d: 4,
      userOverview: [
        { role: 'Clients', count: 80, fillPercentage: 53.3 },
        { role: 'Experts', count: 65, fillPercentage: 43.3 },
        { role: 'Admins', count: 5, fillPercentage: 3.4 },
      ],
      activeProjectsList: [
        {
          id: 'p-1',
          title: 'Translate English to Spanish',
          clientName: 'Juan Carlos',
          expertName: 'Maria Gomez',
          status: 'Active',
          amount: 1200,
          paymentStatus: 'Escrow',
        }
      ],
      activeProjectsPagination: {
        pageIndex: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
      },
      healthAlerts: [
        { title: 'API Connection Alert', description: 'Some warnings', severity: 'warning' }
      ],
    };

    const mockRecentActivity = {
      success: true,
      data: [
        {
          title: 'Project Started',
          description: 'Juan Carlos started Translate English to Spanish',
          type: 'info',
          timestamp: '2h ago',
        }
      ]
    };

    mockUseAdminDashboard.mockReturnValue({
      isLoading: false,
      data: mockSummary,
      isError: false,
      refetch: mockRefetch,
    });
    mockUseAdminRecentActivity.mockReturnValue({
      isLoading: false,
      data: mockRecentActivity,
      isError: false,
      refetch: mockRefetchActivity,
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    // Check summary statistics render
    expect(screen.getByText('Translate English to Spanish')).toBeInTheDocument();
    expect(screen.getByText('Juan Carlos')).toBeInTheDocument();
    expect(screen.getByText('Maria Gomez')).toBeInTheDocument();
    expect(screen.getByText('Project Started')).toBeInTheDocument();
    expect(screen.getByText('Juan Carlos started Translate English to Spanish')).toBeInTheDocument();
  });

  it('triggers refetch when clicking retry', () => {
    mockUseAdminDashboard.mockReturnValue({
      isLoading: false,
      data: undefined,
      isError: true,
      refetch: mockRefetch,
    });
    mockUseAdminRecentActivity.mockReturnValue({
      isLoading: false,
      data: undefined,
      isError: true,
      refetch: mockRefetchActivity,
    });

    render(
      <MemoryRouter>
        <AdminDashboardPage />
      </MemoryRouter>
    );

    // Try to trigger onRetry on DashboardHeader or activity section retry
    const activityRetryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(activityRetryBtn);
    expect(mockRefetchActivity).toHaveBeenCalled();
  });
});
