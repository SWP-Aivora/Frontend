import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
const mockUseAdminExpertReviews = vi.fn();
const mockUseExpertReviewDetail = vi.fn();
const mockUseProcessExpertReview = vi.fn();

vi.mock('../../../features/admin/hooks/useAdminUsers', () => ({
  useAdminUsers: (...args: unknown[]) => mockUseAdminUsers(...args),
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

const mockUsersData = {
  users: [
    {
      id: 'u-1',
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
      id: 'u-2',
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
      id: 'u-3',
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
      id: 'u-4',
      fullName: 'Charlie Admin',
      email: 'charlie@admin.com',
      role: 'Admin',
      status: 'Active',
      verificationState: 'Internal',
      createdAt: '2026-03-01',
      lastLoginAt: '2026-06-21',
      initials: 'CA',
    }
  ]
};

const mockReviewsData = {
  reviews: [
    {
      id: 'r-1',
      expertId: 'u-2',
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
  expertId: 'u-2',
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
    mockUseParams.mockReturnValue({ id: 'u-1' });
    mockUseAdminUsers.mockReturnValue({
      isLoading: false,
      data: mockUsersData,
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
    mockUseAdminUsers.mockReturnValue({
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
    mockUseAdminUsers.mockReturnValue({
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

  it('renders not found state when user is missing', () => {
    mockUseParams.mockReturnValue({ id: 'u-999' });

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    expect(screen.getByText('User not found')).toBeInTheDocument();
  });

  it('renders Client details successfully', () => {
    mockUseParams.mockReturnValue({ id: 'u-1' });

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
    mockUseParams.mockReturnValue({ id: 'u-4' });

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
    mockUseParams.mockReturnValue({ id: 'u-2' });
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

  it('calls suspend action successfully', async () => {
    mockUseParams.mockReturnValue({ id: 'u-2' });
    mockSuspendUser.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    const suspendButton = screen.getByRole('button', { name: /suspend user/i });
    fireEvent.click(suspendButton);

    expect(mockSuspendUser).toHaveBeenCalledWith('u-2', 'Suspended by admin via dashboard');
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('User suspended successfully');
    });
  });

  it('calls unsuspend action successfully', async () => {
    mockUseParams.mockReturnValue({ id: 'u-3' });
    mockUnsuspendUser.mockResolvedValueOnce({});

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    const unsuspendButton = screen.getByRole('button', { name: /unsuspend user/i });
    fireEvent.click(unsuspendButton);

    expect(mockUnsuspendUser).toHaveBeenCalledWith('u-3');
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('User unsuspended successfully');
    });
  });

  it('handles suspend failure', async () => {
    mockUseParams.mockReturnValue({ id: 'u-2' });
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

  it('calls approve expert review successfully when confirmed', () => {
    mockUseParams.mockReturnValue({ id: 'u-2' });
    mockUseExpertReviewDetail.mockReturnValue({
      isLoading: false,
      data: mockReviewDetail,
    });
    const processMock = vi.fn();
    mockUseProcessExpertReview.mockReturnValue({
      mutate: processMock,
      isPending: false,
    });

    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    const approveButton = screen.getByRole('button', { name: /approve all changes/i });
    fireEvent.click(approveButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(processMock).toHaveBeenCalledWith({ id: 'r-1', status: 'Approved' });
  });

  it('does not call approve expert review when confirmation is rejected', () => {
    mockUseParams.mockReturnValue({ id: 'u-2' });
    mockUseExpertReviewDetail.mockReturnValue({
      isLoading: false,
      data: mockReviewDetail,
    });
    const processMock = vi.fn();
    mockUseProcessExpertReview.mockReturnValue({
      mutate: processMock,
      isPending: false,
    });

    vi.spyOn(window, 'confirm').mockImplementation(() => false);

    render(
      <MemoryRouter>
        <AdminUserDetailPage />
      </MemoryRouter>
    );

    const approveButton = screen.getByRole('button', { name: /approve all changes/i });
    fireEvent.click(approveButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(processMock).not.toHaveBeenCalled();
  });

  it('calls reject expert review successfully', () => {
    mockUseParams.mockReturnValue({ id: 'u-2' });
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
    fireEvent.change(reasonTextarea, { target: { value: 'Incomplete evidence' } });

    const confirmRejectBtn = screen.getByRole('button', { name: /confirm reject/i });
    fireEvent.click(confirmRejectBtn);

    expect(processMock).toHaveBeenCalledWith({ id: 'r-1', status: 'Rejected', note: 'Incomplete evidence' });
  });
});
