import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserManagementPage } from '../../../features/admin/pages/UserManagementPage';
import type { AdminUserManagementData, DashboardSummary } from '../../../features/admin/types';

const mockUseAdminUsers = vi.fn();
const mockUseAdminDashboard = vi.fn();

vi.mock('../../../features/admin/hooks/useAdminUsers', () => ({
  useAdminUsers: (...args: unknown[]) => mockUseAdminUsers(...args),
}));

vi.mock('../../../features/admin/hooks/useAdminDashboard', () => ({
  useAdminDashboard: (...args: unknown[]) => mockUseAdminDashboard(...args),
}));

const mockRefetch = vi.fn();

const mockDashboardStats: DashboardSummary = {
  totalUsers: 3,
  openJobs: 5,
  activeProjects: 2,
  openDisputes: 0,
  totalTransactionsValue: 1000,
  pendingReviews: 1,
  newUsers7d: 1,
  newJobs7d: 2,
  newProjects7d: 0,
  newDisputes7d: 0,
  newExpertReviews7d: 0,
  newTransactions7d: 0,
  userOverview: [
    { role: 'CLIENTS', count: 1, fillPercentage: 33.3 },
    { role: 'EXPERTS', count: 1, fillPercentage: 33.3 },
    { role: 'ADMINS', count: 1, fillPercentage: 33.3 },
  ],
  activeProjectsList: [],
  reviewQueue: [],
  healthAlerts: [],
  topCategories: [],
  recentActivity: [],
  transactionSummary: [],
};

const mockUsersData: AdminUserManagementData = {
  users: [
    {
      id: 'u-1',
      fullName: 'Alice Client',
      email: 'alice@client.com',
      role: 'Client',
      status: 'Active',
      verificationState: 'Verified',
      createdAt: '2026-01-01T00:00:00.000Z',
      lastLoginAt: '2026-06-20T12:00:00.000Z',
      initials: 'AC',
      projectsCount: 2,
    },
    {
      id: 'u-2',
      fullName: 'Bob Expert',
      email: 'bob@expert.com',
      role: 'Expert',
      status: 'Suspended',
      verificationState: 'Review',
      createdAt: '2026-02-01T00:00:00.000Z',
      lastLoginAt: '2026-06-21T10:00:00.000Z',
      initials: 'BE',
      proposalsCount: 5,
      completionRate: '95%',
      riskLevel: 'Low',
    },
    {
      id: 'u-3',
      fullName: 'Charlie Admin',
      email: 'charlie@admin.com',
      role: 'Admin',
      status: 'Active',
      verificationState: 'Internal',
      createdAt: '2026-03-01T00:00:00.000Z',
      lastLoginAt: '2026-06-21T15:00:00.000Z',
      initials: 'CA',
    }
  ],
  totalUsers: 3,
  activeUsers: 2,
  suspendedUsers: 1,
  pendingVerify: 1,
  totalClients: 1,
  totalExperts: 1,
  reviewQueue: [
    {
      id: 'q-1',
      userId: 'u-2',
      fullName: 'Bob Expert',
      reason: 'Verify credential certificate',
      severity: 'High',
      initials: 'BE',
    }
  ],
  recentActions: [
    {
      title: 'Expert verification requested',
      description: 'Bob Expert submitted a new certificate',
      type: 'info',
      date: '2026-06-21T10:00:00.000Z',
    }
  ]
};

describe('UserManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAdminDashboard.mockReturnValue({
      isLoading: false,
      data: mockDashboardStats,
    });
  });

  it('renders loading state', () => {
    mockUseAdminUsers.mockReturnValue({
      isLoading: true,
      data: undefined,
      isError: false,
      refetch: mockRefetch,
    });

    const { container } = render(
      <MemoryRouter>
        <UserManagementPage />
      </MemoryRouter>
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders error state with retry button', () => {
    mockUseAdminUsers.mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error('Failed to load user list'),
      refetch: mockRefetch,
    });

    render(
      <MemoryRouter>
        <UserManagementPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Failed to load users')).toBeInTheDocument();
    expect(screen.getByText('Failed to load user list')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('renders successful data rendering state', () => {
    mockUseAdminUsers.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockUsersData,
      refetch: mockRefetch,
    });

    const { container } = render(
      <MemoryRouter>
        <UserManagementPage />
      </MemoryRouter>
    );

    // Header & Hero
    expect(screen.getByText('Manage Platform Users')).toBeInTheDocument();
    expect(screen.getByText('3 total users')).toBeInTheDocument();

    // Table entries (scoping to table)
    const table = container.querySelector('table')!;
    expect(within(table).getByText('Alice Client')).toBeInTheDocument();
    expect(within(table).getByText('alice@client.com')).toBeInTheDocument();
    expect(within(table).getByText('Bob Expert')).toBeInTheDocument();
    expect(within(table).getByText('bob@expert.com')).toBeInTheDocument();
    expect(within(table).getByText('Charlie Admin')).toBeInTheDocument();

    // Side queues
    expect(screen.getByText('User review queue')).toBeInTheDocument();
    expect(screen.getByText('Verify credential certificate')).toBeInTheDocument();
  });

  it('supports client-side searching', () => {
    mockUseAdminUsers.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockUsersData,
      refetch: mockRefetch,
    });

    const { container } = render(
      <MemoryRouter>
        <UserManagementPage />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search name, email, role, or ID...');
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    const table = container.querySelector('table')!;
    expect(within(table).getByText('Alice Client')).toBeInTheDocument();
    expect(within(table).queryByText('Bob Expert')).not.toBeInTheDocument();
    expect(within(table).queryByText('Charlie Admin')).not.toBeInTheDocument();
  });

  it('supports client-side filtering by role', () => {
    mockUseAdminUsers.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockUsersData,
      refetch: mockRefetch,
    });

    const { container } = render(
      <MemoryRouter>
        <UserManagementPage />
      </MemoryRouter>
    );

    const roleSelectEl = screen.getByDisplayValue('All Roles');
    fireEvent.change(roleSelectEl, { target: { value: 'Expert' } });

    const table = container.querySelector('table')!;
    expect(within(table).queryByText('Alice Client')).not.toBeInTheDocument();
    expect(within(table).getByText('Bob Expert')).toBeInTheDocument();
    expect(within(table).queryByText('Charlie Admin')).not.toBeInTheDocument();
  });

  it('supports client-side filtering by status', () => {
    mockUseAdminUsers.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockUsersData,
      refetch: mockRefetch,
    });

    const { container } = render(
      <MemoryRouter>
        <UserManagementPage />
      </MemoryRouter>
    );

    const statusSelectEl = screen.getByDisplayValue('All Statuses');
    fireEvent.change(statusSelectEl, { target: { value: 'SUSPENDED' } });

    const table = container.querySelector('table')!;
    expect(within(table).queryByText('Alice Client')).not.toBeInTheDocument();
    expect(within(table).getByText('Bob Expert')).toBeInTheDocument();
    expect(within(table).queryByText('Charlie Admin')).not.toBeInTheDocument();
  });

  it('renders empty state when search matches nothing', () => {
    mockUseAdminUsers.mockReturnValue({
      isLoading: false,
      isError: false,
      data: mockUsersData,
      refetch: mockRefetch,
    });

    render(
      <MemoryRouter>
        <UserManagementPage />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search name, email, role, or ID...');
    fireEvent.change(searchInput, { target: { value: 'Zack' } });

    expect(screen.getByText('No users match your filters')).toBeInTheDocument();
  });

  it('navigates pagination when clicking pagination controls', () => {
    mockUseAdminUsers.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        ...mockUsersData,
        users: Array.from({ length: 15 }, (_, i) => ({
          id: `u-${i}`,
          fullName: `User ${i}`,
          email: `user${i}@test.com`,
          role: 'Client' as const,
          status: 'Active' as const,
          verificationState: 'Verified' as const,
          createdAt: '2026-01-01T00:00:00.000Z',
          lastLoginAt: '2026-06-20T12:00:00.000Z',
          initials: 'U',
        }))
      },
      refetch: mockRefetch,
    });

    const { container } = render(
      <MemoryRouter>
        <UserManagementPage />
      </MemoryRouter>
    );

    const table = container.querySelector('table')!;
    // First page shows User 0 to User 9
    expect(within(table).getByText('User 0')).toBeInTheDocument();
    expect(within(table).queryByText('User 10')).not.toBeInTheDocument();

    const rightChevronButton = container.querySelector('svg.lucide-chevron-right')?.closest('button');
    expect(rightChevronButton).toBeInTheDocument();
    
    if (rightChevronButton) {
      fireEvent.click(rightChevronButton);
      // Now page 2, should show User 10 to User 14
      expect(within(table).queryByText('User 0')).not.toBeInTheDocument();
      expect(within(table).getByText('User 10')).toBeInTheDocument();
    }
  });
});
