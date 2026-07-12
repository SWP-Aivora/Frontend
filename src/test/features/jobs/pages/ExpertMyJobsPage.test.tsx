import { QueryClient, QueryClientProvider, type UseQueryResult } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as reactQuery from '@tanstack/react-query';
import { ExpertMyJobsPage } from '../../../../features/jobs/pages/ExpertMyJobsPage';
import { ProjectStatus } from '@/shared/types/enums';

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

vi.mock('../../../../features/projects/services', () => ({
  projectService: {
    getProjects: vi.fn(),
  },
}));

const LocationProbe = () => {
  const location = useLocation();
  return <div aria-label="current path">{`${location.pathname}${location.search}`}</div>;
};

const createProject = (overrides: Record<string, unknown>) => ({
  id: 'project-1',
  jobId: 'job-1',
  title: 'Expert Project',
  status: ProjectStatus.ACTIVE,
  createdAt: '2026-07-10T00:00:00.000Z',
  expertName: 'Expert User',
  totalBudget: 300,
  ...overrides,
});

describe('ExpertMyJobsPage title navigation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();
  });

  const renderComponent = () => render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/expert/my-jobs']}>
        <ExpertMyJobsPage />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  );

  const mockProjects = (projects: Array<Record<string, unknown>>) => {
    vi.mocked(reactQuery.useQuery).mockReturnValue({
      data: { data: projects },
      isLoading: false,
    } as unknown as UseQueryResult);
  };

  const currentPath = () => screen.getByLabelText('current path').textContent;

  it('navigates to the project workspace when clicking an in-progress project title', async () => {
    const user = userEvent.setup();
    mockProjects([createProject({ id: 'project-progress', title: 'In Progress Project', status: ProjectStatus.ACTIVE })]);

    renderComponent();

    await user.click(screen.getByRole('link', { name: 'In Progress Project' }));

    expect(currentPath()).toBe('/expert/projects/project-progress/workspace');
  });

  it('navigates to the project workspace when clicking a completed project title', async () => {
    const user = userEvent.setup();
    mockProjects([createProject({ id: 'project-completed', title: 'Completed Project', status: ProjectStatus.COMPLETED })]);

    renderComponent();

    await user.click(screen.getByRole('link', { name: 'Completed Project' }));

    expect(currentPath()).toBe('/expert/projects/project-completed/workspace');
  });

  it('uses the real project id in the title route', async () => {
    const user = userEvent.setup();
    mockProjects([createProject({ id: 'real-project-id', title: 'Real Project Id', jobId: 'job-not-used' })]);

    renderComponent();

    await user.click(screen.getByRole('link', { name: 'Real Project Id' }));

    expect(currentPath()).toBe('/expert/projects/real-project-id/workspace');
    expect(currentPath()).not.toContain('job-not-used');
  });

  it('does not navigate when clicking outside the title', async () => {
    const user = userEvent.setup();
    mockProjects([createProject({ id: 'project-1', title: 'Clickable Title' })]);

    renderComponent();

    await user.click(screen.getByText('General'));

    expect(currentPath()).toBe('/expert/my-jobs');
  });

  it('preserves Enter Workspace button navigation', async () => {
    const user = userEvent.setup();
    mockProjects([createProject({ id: 'project-button', title: 'Project Button' })]);

    renderComponent();

    await user.click(screen.getByRole('link', { name: /enter workspace/i }));

    expect(currentPath()).toBe('/expert/projects/project-button/workspace');
  });

  it('handles a missing project id without rendering an incorrect title link', () => {
    mockProjects([createProject({ id: '', title: 'Missing Project Id' })]);

    renderComponent();

    expect(screen.getByText('Missing Project Id')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Missing Project Id' })).not.toBeInTheDocument();
  });
});
