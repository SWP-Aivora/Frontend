import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProjectManagementPage } from '../../../features/admin/pages/ProjectManagementPage';
import type { AdminProject } from '../../../features/admin/types';
import { DisputeStatus } from '../../../features/disputes/types';

const mockUseAdminProjects = vi.fn();
const mockUseAdminProjectDetail = vi.fn();
const mockUseDisputes = vi.fn();

vi.mock('../../../features/admin/hooks/useAdminProjects', () => ({
  useAdminProjects: (...args: unknown[]) => mockUseAdminProjects(...args),
}));

vi.mock('../../../features/admin/hooks/useAdminProjectDetail', () => ({
  useAdminProjectDetail: (...args: unknown[]) => mockUseAdminProjectDetail(...args),
}));

vi.mock('../../../features/disputes/hooks/useDisputes', () => ({
  useDisputes: (...args: unknown[]) => mockUseDisputes(...args),
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

const disputedProject: AdminProject = {
  ...baseProject,
  id: 'project-2',
  title: 'Dispute Review Platform',
  status: 3,
  hasDispute: true,
};

const completedProject: AdminProject = {
  ...baseProject,
  id: 'project-3',
  title: 'Completed Chatbot Build',
  status: 4,
  hasDispute: false,
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
    mockUseDisputes.mockReturnValue({
      data: {
        data: [
          {
            id: 'dispute-1',
            projectId: 'project-2',
            status: DisputeStatus.OPEN,
          },
        ],
      },
      isSuccess: true,
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
    expect(screen.getByText('Manage Projects')).toBeInTheDocument();
    expect(screen.getAllByText('No Dispute').length).toBeGreaterThan(0);
    expect(screen.queryByText('Page Value')).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: /milestones/i })).not.toBeInTheDocument();
  });

  it('only applies project name search after clicking Search', () => {
    mockUseAdminProjects.mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
      data: {
        data: [baseProject, disputedProject],
        metadata: {
          pageIndex: 1,
          pageSize: 10,
          totalCount: 2,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      },
    });

    render(<ProjectManagementPage />);

    const searchInput = screen.getByPlaceholderText('Search project name...');
    fireEvent.change(searchInput, { target: { value: 'Dispute' } });

    expect(mockUseAdminProjects).toHaveBeenLastCalledWith({
      PageIndex: 1,
      PageSize: 10,
      SearchTerm: undefined,
      status: undefined,
    });

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(mockUseAdminProjects).toHaveBeenLastCalledWith({
      PageIndex: 1,
      PageSize: 10,
      SearchTerm: 'Dispute',
      status: undefined,
    });
  });

  it('filters status separately from dispute state', () => {
    mockUseAdminProjects.mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
      data: {
        data: [baseProject, disputedProject, completedProject],
        metadata: {
          pageIndex: 1,
          pageSize: 10,
          totalCount: 3,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      },
    });

    render(<ProjectManagementPage />);

    fireEvent.change(screen.getByLabelText('Project status'), { target: { value: '4' } });

    expect(mockUseAdminProjects).toHaveBeenLastCalledWith({
      PageIndex: 1,
      PageSize: 10,
      SearchTerm: undefined,
      status: 4,
    });

    fireEvent.change(screen.getByLabelText('Dispute filter'), { target: { value: 'Open' } });

    expect(screen.getByText('Dispute Review Platform')).toBeInTheDocument();
    expect(screen.queryByText('AI Workflow Automation')).not.toBeInTheDocument();
    expect(screen.queryByText('Completed Chatbot Build')).not.toBeInTheDocument();
  });
});
