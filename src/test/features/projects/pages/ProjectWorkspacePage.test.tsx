import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as reactQuery from '@tanstack/react-query';
import { ProjectWorkspacePage } from '../../../../features/projects/pages/ProjectWorkspacePage';
import { BrowserRouter } from 'react-router-dom';

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
    useQueryClient: vi.fn().mockReturnValue({
      invalidateQueries: vi.fn(),
      setQueryData: vi.fn(),
    }),
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'project-101' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../../../../features/projects/services', () => ({
  projectService: {
    getProjectById: vi.fn().mockResolvedValue({ data: null }),
    getProjects: vi.fn().mockResolvedValue({ data: [] }),
    getDeliverables: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

vi.mock('@/features/wallet/services', () => ({
  walletService: {
    getWallet: vi.fn().mockResolvedValue({ data: { balance: 1000 } }),
  },
}));

vi.mock('@/features/disputes/services', () => ({
  disputeService: {
    getDisputes: vi.fn().mockResolvedValue({ data: [], metadata: { totalPages: 1 } }),
  },
}));

vi.mock('@/features/chat/services', () => ({
  chatService: {
    initializeConversation: vi.fn(),
  },
}));

describe('ProjectWorkspacePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ProjectWorkspacePage />
      </BrowserRouter>
    );
  };

  it('configures refetchInterval: 5000 and refetchOnWindowFocus: true for project and active-disputes queries', () => {
    (vi.mocked(reactQuery.useQuery)).mockImplementation((options: { queryKey?: readonly unknown[] }) => {
      const queryKey = options.queryKey as unknown[];
      if (queryKey?.[0] === 'project' && queryKey?.[1] === 'project-101' && !queryKey?.[2]) {
        return {
          data: {
            data: {
              id: 'project-101',
              title: 'Test Project Title',
              status: 1,
              milestones: [],
              totalBudget: 1000,
            },
          },
          isLoading: false,
        } as unknown as reactQuery.UseQueryResult;
      }
      if (queryKey?.[0] === 'project' && queryKey?.[1] === 'project-101' && queryKey?.[2] === 'active-disputes') {
        return {
          data: [],
          isSuccess: true,
          isLoading: false,
        } as unknown as reactQuery.UseQueryResult;
      }
      return { isLoading: false, data: { data: [] } } as unknown as reactQuery.UseQueryResult;
    });

    renderComponent();

    expect(screen.getByText('Test Project Title')).toBeInTheDocument();

    const calls = vi.mocked(reactQuery.useQuery).mock.calls;

    const projectQueryCall = calls.find((call) => {
      const options = call[0] as { queryKey?: unknown[] };
      return (
        Array.isArray(options?.queryKey) &&
        options.queryKey[0] === 'project' &&
        options.queryKey[1] === 'project-101' &&
        options.queryKey.length === 2
      );
    });
    expect(projectQueryCall).toBeDefined();
    expect(projectQueryCall![0]).toHaveProperty('refetchInterval', 5000);
    expect(projectQueryCall![0]).toHaveProperty('refetchOnWindowFocus', true);

    const activeDisputesQueryCall = calls.find((call) => {
      const options = call[0] as { queryKey?: unknown[] };
      return (
        Array.isArray(options?.queryKey) &&
        options.queryKey[0] === 'project' &&
        options.queryKey[1] === 'project-101' &&
        options.queryKey[2] === 'active-disputes'
      );
    });
    expect(activeDisputesQueryCall).toBeDefined();
    expect(activeDisputesQueryCall![0]).toHaveProperty('refetchInterval', 5000);
    expect(activeDisputesQueryCall![0]).toHaveProperty('refetchOnWindowFocus', true);
  });
});
