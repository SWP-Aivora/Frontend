import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as reactQuery from '@tanstack/react-query';
import { ExpertDashboardPage } from '../../../../features/dashboard/pages/ExpertDashboardPage';

let mockUser = {
  id: 'expert-1',
  email: 'expert@example.com',
  fullName: 'Test Expert',
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

const base = <T,>(data: T[]) => ({
  success: true,
  data,
});

const successfulQuery = (data: unknown) => ({
  isLoading: false,
  isSuccess: true,
  isError: false,
  data,
});

const mockDashboardQueries = ({
  projects = paginated([]),
  wallet = { success: true, data: { balance: 0 } },
  proposals = paginated([]),
  services = base([]),
}: {
  projects?: unknown;
  wallet?: unknown;
  proposals?: unknown;
  services?: unknown;
} = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (vi.mocked(reactQuery.useQuery)).mockImplementation((options: any) => {
    if (options?.queryKey?.[0] === 'expertProjects') return successfulQuery(projects) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (options?.queryKey?.[0] === 'wallet') return successfulQuery(wallet) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (options?.queryKey?.[0] === 'expertProposals') return successfulQuery(proposals) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    if (options?.queryKey?.[0] === 'expertServices') return successfulQuery(services) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
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

vi.mock('../../../../features/proposals/services', () => ({
  proposalService: {
    getMyProposals: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

vi.mock('../../../../features/services/services', () => ({
  servicesFeatureApi: {
    getMyServices: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

vi.mock('../../../../features/auth/store', () => ({
  useAuthStore: () => ({
    user: mockUser,
  }),
}));

describe('ExpertDashboardPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = {
      id: 'expert-1',
      email: 'expert@example.com',
      fullName: 'Test Expert',
    };
    queryClient = new QueryClient();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ExpertDashboardPage />
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

  it('configures refetchInterval: 15000 and refetchOnWindowFocus: true for expertProjects query', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (vi.mocked(reactQuery.useQuery)).mockImplementation((options: any) => {
      if (options?.queryKey?.[0] === 'expertProjects') {
        return {
          isLoading: false,
          data: {
            data: [
              {
                id: 'proj-1',
                title: 'Test Project',
                status: 'IN_PROGRESS',
                startDate: new Date().toISOString(),
                totalBudget: 500,
              },
            ],
          },
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      if (options?.queryKey?.[0] === 'wallet') {
        return { isLoading: false, isSuccess: true, data: { success: true, data: { balance: 100 } } } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      return { isLoading: false, isSuccess: true, data: { success: true, data: [] } } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    });

    renderComponent();

    expect(reactQuery.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['expertProjects'],
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
          data: { success: true, data: { balance: 2500 } },
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      return { isLoading: false, isSuccess: true, data: { success: true, data: [] } } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
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

  it('shows a dedicated onboarding dashboard when expert activity is empty and wallet balance is zero', () => {
    mockDashboardQueries();

    renderComponent();

    expect(screen.getByRole('heading', { name: /welcome to aivora, test/i })).toBeInTheDocument();
    expect(screen.getByText(/Turn your AI expertise into client projects and packaged services/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Find Work$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^Create a Service$/i })).toBeInTheDocument();
    expect(screen.getByText(/Browse open jobs/i)).toBeInTheDocument();
    expect(screen.getByText(/Publish your offer/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /find your first job/i })).toHaveAttribute('href', '/expert/jobs');
    expect(screen.getByRole('link', { name: /create your first service/i })).toHaveAttribute('href', '/expert/services/new');
    expect(screen.getByRole('link', { name: /complete profile/i })).toHaveAttribute('href', '/expert/profile');
    expect(screen.getByRole('heading', { name: /Account overview/i })).toBeInTheDocument();
    expect(screen.getByText('Available Balance')).toBeInTheDocument();
    expect(screen.getByText('Active Projects')).toBeInTheDocument();
    expect(screen.getByText('Submitted Proposals')).toBeInTheDocument();
    expect(screen.getByText('Published Services')).toBeInTheDocument();
    expect(screen.getByText('0 Aivora Coin')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: /Manage your project in one workspace/i })).toBeInTheDocument();
    expect(screen.getByText('Staged Milestone Payments')).toBeInTheDocument();
    expect(screen.getByText(/Receive 30% when work begins and the remaining payment after deliverable approval/i)).toBeInTheDocument();
  });

  it('renders the normal dashboard when any expert activity or wallet balance exists', () => {
    mockDashboardQueries({
      proposals: paginated([], 1),
    });
    const { rerender } = renderComponent();

    expect(screen.getByRole('heading', { name: /welcome back, test/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /welcome to aivora/i })).not.toBeInTheDocument();

    mockDashboardQueries({
      services: base([{ id: 'service-1' }]),
    });
    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ExpertDashboardPage />
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
          <ExpertDashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByRole('heading', { name: /welcome back, test/i })).toBeInTheDocument();
  });
});
