import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminUserDetailPage } from '../../../features/admin/pages/AdminUserDetailPage';

// Mock useParams from react-router-dom
const mockUseParams = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

// Mock sonner toast
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  }
}));

// Mock services
const mockSuspendUser = vi.fn();
const mockUnsuspendUser = vi.fn();
vi.mock('../../../features/admin/services', () => ({
  adminService: {
    suspendUser: (...args: unknown[]) => mockSuspendUser(...args),
    unsuspendUser: (...args: unknown[]) => mockUnsuspendUser(...args),
  }
}));

// Mock hooks
const mockUseAdminUsers = vi.fn();
const mockUseAdminUser = vi.fn();
const mockUseAdminExpertReviews = vi.fn();
const mockUseExpertReviewDetail = vi.fn();
const mockUseProcessExpertReview = vi.fn();

vi.mock('../../../features/admin/hooks/useAdminUsers', () => ({
  adminUsersQueryKeys: {
    all: ['admin', 'users'],
    list: (params?: Record<string, unknown>) => ['admin', 'users', params],
    detail: (id: string) => ['admin', 'users', 'detail', id],
  },
  useAdminUsers: (...args: unknown[]) => mockUseAdminUsers(...args),
  useAdminUser: (...args: unknown[]) => mockUseAdminUser(...args),
}));

vi.mock('../../../features/admin/hooks/useAdminExpertReviews', () => ({
  useAdminExpertReviews: (...args: unknown[]) => mockUseAdminExpertReviews(...args),
  useExpertReviewDetail: (...args: unknown[]) => mockUseExpertReviewDetail(...args),
  useProcessExpertReview: (...args: unknown[]) => mockUseProcessExpertReview(...args),
}));

// Mock queryClient invalidateQueries
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
    }),
  };
});

const userIds = {
  client: '11111111-1111-4111-8111-111111111111',
  expert: '22222222-2222-4222-8222-222222222222',
  suspendedExpert: '33333333-3333-4333-8333-333333333333',
  admin: '44444444-4444-4444-8444-444444444444',
  nonRecentExpert: '55555555-5555-4555-8555-555555555555',
};

const mockUsersData = {
  users: [
    {
      id: userIds.client,
      fullName: 'Alice Client',
      email: 'alice@client.com',
      role: 'Client',
      status: 'Active',
      verificationState: 'Verified',
      createdAt: '2026-01-01',
      lastLoginAt: '2026-06-20',
      initials: 'AC',
      projectsCount: 2,
    },
    {
      id: userIds.expert,
      fullName: 'Bob Expert',
      email: 'bob@expert.com',
      role: 'Expert',
      status: 'Active',
      verificationState: 'Review',
      createdAt: '2026-02-01',
      lastLoginAt: '2026-06-21',
      initials: 'BE',
      proposalsCount: 5,
      completionRate: '95%',
      riskLevel: 'Low',
    },
    {
      id: userIds.suspendedExpert,
      fullName: 'Suspended Expert',
      email: 'suspended@expert.com',
      role: 'Expert',
      status: 'Suspended',
      verificationState: 'Verified',
      createdAt: '2026-02-01',
      lastLoginAt: '2026-06-21',
      initials: 'SE',
      proposalsCount: 1,
    },
    {
      id: userIds.admin,
      fullName: 'Charlie Admin',
      email: 'charlie@admin.com',
      role: 'Admin',
      status: 'Active',
      verificationState: 'Internal',
      createdAt: '2026-03-01',
      lastLoginAt: '2026-06-21',
      initials: 'CA',
    }
  ],
};

const nonRecentExpert = {
  id: userIds.nonRecentExpert,
  fullName: 'Expert One',
  email: 'expert.one@example.com',
  role: 'Expert',
  status: 'Active',
  verificationState: 'Review',
  createdAt: '2025-01-01',
  lastLoginAt: '2026-06-21',
  initials: 'EO',
  proposalsCount: 12,
  completionRate: '98%',
  riskLevel: 'Low',
};

const mockReviewsData = {
  reviews: [
    {
      id: 'r-1',
      expertId: userIds.expert,
      status: 'Pending',
      submittedAt: '2026-06-21',
      fullName: 'Bob Expert',
      email: 'bob@expert.com',
      initials: 'BE',
      title: 'AI Developer',
      skills: ['React'],
      experienceYears: 5,
      proofCount: 1,
    }
  ]
};

const mockReviewDetail = {
  id: 'r-1',
  expertId: userIds.expert,
  fullName: 'Bob Expert',
  email: 'bob@expert.com',
  status: 'Pending',
  submittedAt: '2026-06-21',
  title: 'AI Developer',
  skills: ['React'],
  experienceYears: 5,
  proofCount: 1,
  bio: { current: 'Old bio info', requested: 'New bio info', isChanged: true },
  hourlyRate: { current: 50, requested: 80, isChanged: true },
  skillsComparison: { current: ['React'], requested: ['React', 'AI Integration'], isChanged: true },
  categories: { current: ['Engineering'], requested: ['Engineering', 'AI'], isChanged: true },
  experience: { current: 'Old experience text', requested: 'New experience text', isChanged: true },
  portfolio: [
    { id: 'p-1', title: 'Degree Cert', type: 'Degree', url: 'http://url', status: 'Verified' }
  ]
};

describe('AdminUserDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: userIds.client });
    mockUseAdminUser.mockReturnValue({
      isLoading: false,
      data: mockUsersData.users[0],
      isError: false,
    });
    mockUseAdminExpertReviews.mockReturnValue({
      data: mockReviewsData,
    });
    mockUseExpertReviewDetail.mockReturnValue({
      data: undefined,
    });
    mockUseProcessExpertReview.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  it('renders loading state', () => {
    mockUseAdminUser.mockReturnValue({
      isLoading: true,
      data: undefined,
    });

    const { container } = render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders error state when user fails to load', () => {
    mockUseAdminUser.mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error('User not found in system'),
    });

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Failed to load user details')).toBeInTheDocument();
    expect(screen.getByText('User not found in system')).toBeInTheDocument();
  });

  it('renders not found state when the detail endpoint returns 404', () => {
    mockUseAdminUser.mockReturnValue({
      isLoading: false,
      isError: true,
      error: { response: { status: 404 } },
    });

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    expect(screen.getByText('User not found')).toBeInTheDocument();
  });

  it('handles invalid route IDs without enabling the detail query', () => {
    mockUseParams.mockReturnValue({ id: 'not-a-valid-user-id' });

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    expect(mockUseAdminUser).toHaveBeenCalledWith('not-a-valid-user-id', false);
    expect(mockUseAdminExpertReviews).toHaveBeenCalledWith(undefined, false);
    expect(screen.getByText('Invalid user ID')).toBeInTheDocument();
  });

  it('renders Client details successfully', () => {
    mockUseParams.mockReturnValue({ id: userIds.client });

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Alice Client')).toBeInTheDocument();
    expect(screen.getByText('alice@client.com')).toBeInTheDocument();
    expect(screen.getByText('Job Posts & Projects')).toBeInTheDocument();
  });

  it('renders Admin details successfully', () => {
    mockUseParams.mockReturnValue({ id: userIds.admin });
    mockUseAdminUser.mockReturnValue({
      isLoading: false,
      data: mockUsersData.users[3],
      isError: false,
    });

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Charlie Admin')).toBeInTheDocument();
    expect(screen.getByText('charlie@admin.com')).toBeInTheDocument();
    expect(screen.getByText('Admin Privileges')).toBeInTheDocument();
  });

  it('renders Expert details successfully', () => {
    mockUseParams.mockReturnValue({ id: userIds.expert });
    mockUseAdminUser.mockReturnValue({
      isLoading: false,
      data: mockUsersData.users[1],
      isError: false,
    });
    mockUseExpertReviewDetail.mockReturnValue({
      isLoading: false,
      data: mockReviewDetail,
    });

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Bob Expert')).toBeInTheDocument();
    expect(screen.getByText('bob@expert.com')).toBeInTheDocument();
    expect(screen.getByText('Pending Profile Changes')).toBeInTheDocument();
  });

  it('uses the route user ID with the direct detail hook and does not use the paginated users hook', () => {
    mockUseParams.mockReturnValue({ id: userIds.nonRecentExpert });
    mockUseAdminUser.mockReturnValue({
      isLoading: false,
      data: nonRecentExpert,
      isError: false,
    });

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    expect(mockUseAdminUser).toHaveBeenCalledWith(userIds.nonRecentExpert, true);
    expect(mockUseAdminUsers).not.toHaveBeenCalled();
    expect(screen.getByText('Expert One')).toBeInTheDocument();
  });

  it('keeps pending expert review actions visible for a non-recent user loaded by detail endpoint', () => {
    mockUseParams.mockReturnValue({ id: userIds.nonRecentExpert });
    mockUseAdminUser.mockReturnValue({
      isLoading: false,
      data: nonRecentExpert,
      isError: false,
    });
    mockUseAdminExpertReviews.mockReturnValue({
      data: {
        reviews: [
          {
            ...mockReviewsData.reviews[0],
            id: 'r-non-recent',
            expertId: userIds.nonRecentExpert,
            fullName: 'Expert One',
            email: 'expert.one@example.com',
          },
        ],
      },
    });
    mockUseExpertReviewDetail.mockReturnValue({
      isLoading: false,
      data: {
        ...mockReviewDetail,
        id: 'r-non-recent',
        expertId: userIds.nonRecentExpert,
        fullName: 'Expert One',
        email: 'expert.one@example.com',
      },
    });

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Pending Profile Changes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /approve all changes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
  });

  it('calls suspend action successfully', async () => {
    mockUseParams.mockReturnValue({ id: userIds.expert });
    mockUseAdminUser.mockReturnValue({
      isLoading: false,
      data: mockUsersData.users[1],
      isError: false,
    });
    mockSuspendUser.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    const suspendButton = screen.getByRole('button', { name: /suspend user/i });
    fireEvent.click(suspendButton);

    expect(mockSuspendUser).toHaveBeenCalledWith(userIds.expert, 'Suspended by admin via dashboard');
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('User suspended successfully');
    });
  });

  it('calls unsuspend action successfully', async () => {
    mockUseParams.mockReturnValue({ id: userIds.suspendedExpert });
    mockUseAdminUser.mockReturnValue({
      isLoading: false,
      data: mockUsersData.users[2],
      isError: false,
    });
    mockUnsuspendUser.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    const unsuspendButton = screen.getByRole('button', { name: /unsuspend user/i });
    fireEvent.click(unsuspendButton);

    expect(mockUnsuspendUser).toHaveBeenCalledWith(userIds.suspendedExpert);
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('User unsuspended successfully');
    });
  });

  it('handles suspend failure', async () => {
    mockUseParams.mockReturnValue({ id: userIds.expert });
    mockUseAdminUser.mockReturnValue({
      isLoading: false,
      data: mockUsersData.users[1],
      isError: false,
    });
    mockSuspendUser.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    const suspendButton = screen.getByRole('button', { name: /suspend user/i });
    fireEvent.click(suspendButton);

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Failed to update user status');
    });
  });

  it('calls approve expert review successfully when confirmed', async () => {
    mockUseParams.mockReturnValue({ id: userIds.expert });
    mockUseAdminUser.mockReturnValue({
      isLoading: false,
      data: mockUsersData.users[1],
      isError: false,
    });
    mockUseExpertReviewDetail.mockReturnValue({
      isLoading: false,
      data: mockReviewDetail,
    });
    const processMock = vi.fn();
    mockUseProcessExpertReview.mockReturnValue({
      mutate: processMock,
      isPending: false,
    });

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    const approveButton = screen.getByRole('button', { name: /approve all changes/i });
    fireEvent.click(approveButton);

    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /^approve$/i }));

    expect(processMock).toHaveBeenCalledWith({ id: 'r-1', status: 'Approved' }, expect.any(Object));
  });

  it('does not call approve expert review when confirmation is cancelled', async () => {
    mockUseParams.mockReturnValue({ id: userIds.expert });
    mockUseAdminUser.mockReturnValue({
      isLoading: false,
      data: mockUsersData.users[1],
      isError: false,
    });
    mockUseExpertReviewDetail.mockReturnValue({
      isLoading: false,
      data: mockReviewDetail,
    });
    const processMock = vi.fn();
    mockUseProcessExpertReview.mockReturnValue({
      mutate: processMock,
      isPending: false,
    });

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    const approveButton = screen.getByRole('button', { name: /approve all changes/i });
    fireEvent.click(approveButton);

    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /cancel/i }));

    expect(processMock).not.toHaveBeenCalled();
  });

  it('calls reject expert review successfully', () => {
    mockUseParams.mockReturnValue({ id: userIds.expert });
    mockUseAdminUser.mockReturnValue({
      isLoading: false,
      data: mockUsersData.users[1],
      isError: false,
    });
    mockUseExpertReviewDetail.mockReturnValue({
      isLoading: false,
      data: mockReviewDetail,
    });
    const processMock = vi.fn();
    mockUseProcessExpertReview.mockReturnValue({
      mutate: processMock,
      isPending: false,
    });

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    const rejectButton = screen.getByRole('button', { name: /reject/i });
    fireEvent.click(rejectButton);

    // Enter rejection reason in text area in modal
    const reasonTextarea = screen.getByPlaceholderText(/portfolio links are broken/i);
    fireEvent.change(reasonTextarea, { target: { value: 'Incomplete document' } });

    const confirmRejectBtn = screen.getByRole('button', { name: /confirm reject/i });
    fireEvent.click(confirmRejectBtn);

    expect(processMock).toHaveBeenCalledWith({ id: 'r-1', status: 'Rejected', note: 'Incomplete document' }, expect.any(Object));
  });
});
