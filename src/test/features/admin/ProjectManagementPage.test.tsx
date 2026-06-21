import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectManagementPage } from '../../../features/admin/pages/ProjectManagementPage';
import type { AdminProject } from '../../../features/admin/types';

const mockUseAdminProjects = vi.fn();
const mockUseAdminProjectDetail = vi.fn();

vi.mock('../../../features/admin/hooks/useAdminProjects', () => ({
  useAdminProjects: (...args: unknown[]) => mockUseAdminProjects(...args),
}));

vi.mock('../../../features/admin/hooks/useAdminProjectDetail', () => ({
  useAdminProjectDetail: (...args: unknown[]) => mockUseAdminProjectDetail(...args),
}));

const mockRefetch = vi.fn();

const baseProject: AdminProject = {
  id: 'project-1',
  clientId: 'client-1',
  clientName: 'Client One',
  expertId: 'expert-1',
  expertName: 'Expert One',
  title: 'AI Workflow Automation',
  description: 'Automate invoice processing',
  totalBudget: 2500,
  currency: 'USD',
  status: 1,
  startDate: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  milestones: [],
};

describe('ProjectManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAdminProjectDetail.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it('renders loading state', () => {
    mockUseAdminProjects.mockReturnValue({
      isLoading: true,
      data: undefined,
      isError: false,
      refetch: mockRefetch,
    });

    const { container } = render(<ProjectManagementPage />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders error state with retry action', () => {
    mockUseAdminProjects.mockReturnValue({
      isLoading: false,
      isError: true,
      error: new Error('Projects unavailable'),
      refetch: mockRefetch,
    });

    render(<ProjectManagementPage />);

    expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
    expect(screen.getByText('Projects unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('renders empty state when no projects are returned', () => {
    mockUseAdminProjects.mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
      data: {
        data: [],
        metadata: {
          pageIndex: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      },
    });

    render(<ProjectManagementPage />);

    expect(screen.getByText('Manage Projects')).toBeInTheDocument();
    expect(screen.getByText('No projects found')).toBeInTheDocument();
    expect(screen.getByText('Projects will appear here when they exist in the backend.')).toBeInTheDocument();
  });

  it('renders project data successfully', () => {
    mockUseAdminProjects.mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
      data: {
        data: [baseProject],
        metadata: {
          pageIndex: 1,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      },
    });

    render(<ProjectManagementPage />);

    expect(screen.getByText('AI Workflow Automation')).toBeInTheDocument();
    expect(screen.getByText('Client One')).toBeInTheDocument();
    expect(screen.getByText('Expert One')).toBeInTheDocument();
    expect(screen.getByText('No admin mutation endpoints')).toBeInTheDocument();
  });
});
