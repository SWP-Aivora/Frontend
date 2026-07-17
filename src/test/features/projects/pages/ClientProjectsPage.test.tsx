import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClientProjectsPage } from '../../../../features/projects/pages/ClientProjectsPage';
import { ProjectStatus } from '@/shared/types/enums';

vi.mock('../../../../features/projects/hooks/useProjects', () => ({
  useProjects: vi.fn(),
}));

import { useProjects } from '../../../../features/projects/hooks/useProjects';

const LocationProbe = () => {
  const location = useLocation();
  return <div aria-label="current path">{`${location.pathname}${location.search}`}</div>;
};

const renderComponent = () => {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/client/projects']}>
        <ClientProjectsPage />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ClientProjectsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders only projects returned by the project hook and opens workspaces by project ID', async () => {
    const user = userEvent.setup();

    vi.mocked(useProjects).mockReturnValue({
      data: {
        data: [
          {
            id: 'project-123',
            jobId: 'job-999',
            title: 'Accepted Project',
            description: 'Real project workspace',
            status: ProjectStatus.ACTIVE,
            clientId: 'client-1',
            expertId: 'expert-1',
            expertName: 'Expert User',
            client: { id: 'client-1', fullName: 'Client User', avatarUrl: null, role: 'CLIENT' },
            expert: { id: 'expert-1', fullName: 'Expert User', avatarUrl: null, role: 'EXPERT' },
            totalBudget: 1200,
            remainingBudget: 800,
            currency: 'Aivora Coin',
            startDate: '2026-07-10T00:00:00.000Z',
            endDate: null,
            createdAt: '2026-07-10T00:00:00.000Z',
            updatedAt: '2026-07-10T00:00:00.000Z',
            milestones: [],
          },
        ],
        metadata: {
          pageIndex: 1,
          pageSize: 10,
          totalCount: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProjects>);

    renderComponent();

    expect(screen.getByText('Accepted Project')).toBeInTheDocument();
    expect(screen.queryByText('job-999')).not.toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /open workspace/i }));

    expect(screen.getByLabelText('current path')).toHaveTextContent('/client/projects/project-123/workspace');
  });
});
