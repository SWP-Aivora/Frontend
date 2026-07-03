import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as reactQuery from '@tanstack/react-query';
import { ClientDashboardPage } from '../../../../features/dashboard/pages/ClientDashboardPage';

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
    user: { fullName: 'Test Client' },
  }),
}));

describe('ClientDashboardPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
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
          },
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      return { isLoading: false, data: { data: { balance: 100 } } } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
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
          data: { data: { balance: 2500 } },
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      }
      return { isLoading: false, data: { data: [] } } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
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
});
