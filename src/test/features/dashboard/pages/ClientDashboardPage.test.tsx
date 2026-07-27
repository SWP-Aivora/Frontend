import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as reactQuery from '@tanstack/react-query';
import { ClientDashboardPage } from '../../../../features/dashboard/pages/ClientDashboardPage';

let mockUser = {
  id: 'client-1',
  email: 'test.client@example.com',
  fullName: 'Test Client',
};

const paginated = <T,>(data: T[], totalCount = data.length) => ({
  success: true,
  data,
  metadata: {
    pageIndex: 1,
    pageSize: Math.max(data.length, 1),
    totalCount,
    totalPages: totalCount > 0 ? 1 : 0,
    hasPreviousPage: false,
    hasNextPage: false,
  },
});

const successfulQuery = (data: unknown) => ({
  isLoading: false,
  isSuccess: true,
  isError: false,
  data,
});

const mockDashboardQueries = ({
  jobs = paginated([]),
  projects = paginated([]),
  serviceRequests = paginated([]),
  wallet = { success: true, data: { balance: 0 } },
}: {
  jobs?: unknown;
  projects?: unknown;
  serviceRequests?: unknown;
  wallet?: unknown;
} = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (vi.mocked(reactQuery.useQuery)).mockImplementation((options: any) => {
    if (options?.queryKey?.[0] === 'clientProjects') return successfulQuery(projects) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (options?.queryKey?.[0] === 'wallet') return successfulQuery(wallet) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (options?.queryKey?.[0] === 'clientJobs') return successfulQuery(jobs) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (options?.queryKey?.[0] === 'clientServiceRequests') return successfulQuery(serviceRequests) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    return successfulQuery(null) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  });
};

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

vi.mock('../../../../features/projects/services', () => ({
  projectService: {
    getProjects: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

vi.mock('../../../../features/wallet/services', () => ({
  walletService: {
    getWallet: vi.fn().mockResolvedValue({ data: { balance: 1000 } }),
  },
}));

vi.mock('../../../../features/auth/store', () => ({
  useAuthStore: () => ({
    user: mockUser,
  }),
}));

describe('ClientDashboardPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = {
      id: 'client-1',
      email: 'test.client@example.com',
      fullName: 'Test Client',
    };
    queryClient = new QueryClient();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ClientDashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders loading state when queries are loading', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(reactQuery.useQuery)).mockReturnValue({ isLoading: true } as any);
    const { container } = renderComponent();
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('configures refetchInterval: 15000 and refetchOnWindowFocus: true for clientProjects query', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(reactQuery.useQuery)).mockImplementation((options: any) => {
      if (options?.queryKey?.[0] === 'clientProjects') {
        return {
          isLoading: false,
          data: {
            data: [
              {
                id: 'proj-1',
                title: 'Test Project',
                status: 'IN_PROGRESS',
                createdAt: new Date().toISOString(),
                totalBudget: 500,
              },
            ],
            metadata: {
              pageIndex: 1,
              pageSize: 20,
              totalCount: 1,
              totalPages: 1,
              hasPreviousPage: false,
              hasNextPage: false,
            },
          },
          isSuccess: true,
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      return { isLoading: false, isSuccess: true, data: { data: { balance: 100 } } } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    });

    renderComponent();

    expect(reactQuery.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['clientProjects'],
        refetchInterval: 15000,
        refetchOnWindowFocus: true,
      })
    );
  });

  it('configures refetchInterval: 15000 and refetchOnWindowFocus: true for wallet query', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(reactQuery.useQuery)).mockImplementation((options: any) => {
      if (options?.queryKey?.[0] === 'wallet') {
        return {
          isLoading: false,
          isSuccess: true,
          data: { data: { balance: 2500 } },
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      return { isLoading: false, isSuccess: true, data: { data: [] } } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    });

    renderComponent();

    expect(reactQuery.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['wallet'],
        refetchInterval: 15000,
        refetchOnWindowFocus: true,
      })
    );
  });

  it('renders a concise platform introduction and dashboard CTAs with existing client routes', () => {
    mockDashboardQueries({
      wallet: { success: true, data: { balance: 100 } },
    });

    renderComponent();

    expect(screen.getByRole('heading', { name: /welcome back, test/i })).toBeInTheDocument();
    expect(screen.getByText(/Here is what is happening with your projects today/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /post new job/i })).toHaveAttribute('href', '/client/post-job');
    expect(screen.getAllByRole('link', { name: /browse experts/i })[0]).toHaveAttribute('href', '/client/experts');
  });

  it('falls back to there when the stored full name is not a proper display name', () => {
    mockUser = {
      id: 'client-1',
      email: 'client@example.com',
      fullName: 'client',
    };
    mockDashboardQueries({
      wallet: { success: true, data: { balance: 100 } },
    });

    renderComponent();

    expect(screen.getByRole('heading', { name: /welcome back, there/i })).toBeInTheDocument();
  });

  it('shows the dedicated onboarding dashboard when all activity sources are empty and wallet balance is zero', () => {
    mockDashboardQueries();

    renderComponent();

    expect(screen.getByRole('heading', { name: /welcome to aivora, test/i })).toBeInTheDocument();
    expect(screen.getByText(/Turn your idea into a project with the right AI expert/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Post a Job$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Find a Service$/i })).toBeInTheDocument();
    expect(screen.getByText(/Choose this path when you have a custom requirement or project idea/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose this path when an expert already provides a service or package/i)).toBeInTheDocument();
    expect(screen.getByText(/Describe your project/i)).toBeInTheDocument();
    expect(screen.getByText('Receive proposals')).toBeInTheDocument();
    expect(screen.getByText(/Choose an expert/i)).toBeInTheDocument();
    expect(screen.getByText(/Accept and start/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse expert services/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose a package/i)).toBeInTheDocument();
    expect(screen.getByText('Send a request')).toBeInTheDocument();
    expect(screen.getByText(/Accept the final offer/i)).toBeInTheDocument();
    expect(screen.getByText(/A project is created after you accept a proposal/i)).toBeInTheDocument();
    expect(screen.getByText(/A project is created after you accept the expert's final offer/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Account overview/i })).toBeInTheDocument();
    expect(screen.getByText('Wallet Balance')).toBeInTheDocument();
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
    expect(screen.getByText('Open Job Posts')).toBeInTheDocument();
    expect(screen.getByText('Service Requests')).toBeInTheDocument();
    expect(screen.getByText('0 Aivora Coin')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: /Manage your project in one workspace/i })).toBeInTheDocument();
    expect(screen.getByText(/track progress, communicate with your expert, review submitted work, and manage milestone payments/i)).toBeInTheDocument();
    expect(screen.getByText('Milestones')).toBeInTheDocument();
    expect(screen.getByText(/Plan stages, deadlines, and payment amounts/i)).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText(/Discuss requirements and share project updates/i)).toBeInTheDocument();
    expect(screen.getByText('Submitted Deliverables')).toBeInTheDocument();
    expect(screen.getByText(/Review work, request revisions, and approve submissions/i)).toBeInTheDocument();
    expect(screen.getByText('Staged Milestone Payments')).toBeInTheDocument();
    expect(screen.getByText(/Pay 30% when work begins and 70% after deliverable approval/i)).toBeInTheDocument();
    expect(screen.getByText(/Not sure which path is right for you/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /post your first job/i })).toHaveAttribute('href', '/client/post-job');
    expect(screen.getByRole('link', { name: /explore services/i })).toHaveAttribute('href', '/client/services');
    expect(screen.getByRole('link', { name: /browse experts/i })).toHaveAttribute('href', '/client/experts');
    expect(screen.getAllByRole('link', { name: /post your first job/i })).toHaveLength(1);
    expect(screen.getAllByRole('link', { name: /explore services/i })).toHaveLength(1);
    expect(screen.getAllByRole('link', { name: /browse experts/i })).toHaveLength(1);
    expect(screen.queryByText(/Getting Started/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/0 of 3 completed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/No jobs, projects, or service requests yet/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/How Aivora works:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Chat/i)).not.toBeInTheDocument();
  });

  it('renders the normal dashboard when any job post exists, including inactive statuses', () => {
    mockDashboardQueries({
      jobs: paginated([], 1),
    });

    renderComponent();

    expect(screen.getByRole('heading', { name: /welcome back, test/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /welcome to aivora/i })).not.toBeInTheDocument();
  });

  it('renders the normal dashboard when any project, service request, or positive wallet balance exists', () => {
    mockDashboardQueries({
      projects: paginated([], 1),
    });
    const { rerender } = renderComponent();

    expect(screen.getByRole('heading', { name: /welcome back, test/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /welcome to aivora/i })).not.toBeInTheDocument();

    mockDashboardQueries({
      serviceRequests: paginated([], 1),
    });
    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ClientDashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /welcome back, test/i })).toBeInTheDocument();

    mockDashboardQueries({
      wallet: { success: true, data: { balance: 1 } },
    });
    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ClientDashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /welcome back, test/i })).toBeInTheDocument();
  });

  it('does not show onboarding while required activity queries are loading or failing', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(reactQuery.useQuery)).mockImplementation((options: any) => {
      if (options?.queryKey?.[0] === 'clientJobs') {
        return { isLoading: true, isSuccess: false, data: undefined } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      return successfulQuery(
        options?.queryKey?.[0] === 'wallet' ? { success: true, data: { balance: 0 } } : paginated([])
      ) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    });
    const { container, rerender } = renderComponent();

    expect(container.querySelector('.animate-spin')).not.toBeNull();
    expect(screen.queryByRole('heading', { name: /welcome to aivora/i })).not.toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(reactQuery.useQuery)).mockImplementation((options: any) => {
      if (options?.queryKey?.[0] === 'clientJobs') {
        return { isLoading: false, isSuccess: false, isError: true, data: undefined } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      return successfulQuery(
        options?.queryKey?.[0] === 'wallet' ? { success: true, data: { balance: 0 } } : paginated([])
      ) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    });
    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ClientDashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /welcome back, test/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /welcome to aivora/i })).not.toBeInTheDocument();

    mockDashboardQueries({
      jobs: { ...paginated([]), success: false, statusCode: 500 },
    });
    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ClientDashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /welcome back, test/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /welcome to aivora/i })).not.toBeInTheDocument();
  });
});
