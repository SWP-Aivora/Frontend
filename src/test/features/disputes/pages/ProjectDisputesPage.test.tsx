import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ProjectDisputesPage } from '../../../../features/disputes/pages/ProjectDisputesPage';
import { disputeService } from '../../../../features/disputes/services';
import { DisputeStatus, type Dispute } from '../../../../features/disputes/types';
import { Role } from '../../../../shared/types/enums';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'project-1' }),
  };
});

const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

vi.mock('../../../../features/projects/hooks/useProjectRealtime', () => ({
  useProjectRealtime: vi.fn(),
}));

vi.mock('../../../../features/disputes/services', () => ({
  disputeService: {
    getDisputes: vi.fn(),
    getDisputeById: vi.fn(),
    closeDispute: vi.fn(),
    cancelDisputedProject: vi.fn(),
  },
  normalizeDisputeStatus: (status: unknown) => status,
}));

let mockAuthUser: { id: string; role: Role } | undefined = { id: 'client-1', role: Role.CLIENT };
vi.mock('@/features/auth/store', () => ({
  useAuthStore: () => ({ user: mockAuthUser }),
}));

const buildDispute = (overrides: Partial<Dispute> = {}): Dispute => ({
  id: 'd1',
  milestoneId: 'm1',
  milestoneTitle: 'Milestone 1',
  projectId: 'project-1',
  projectTitle: 'Project 1',
  clientId: 'client-1',
  clientName: 'Client Name',
  expertId: 'expert-1',
  expertName: 'Expert Name',
  openerId: 'client-1',
  openerName: 'Client Name',
  reason: 'Work not delivered',
  description: 'The submitted work was not delivered as agreed.',
  status: DisputeStatus.OPEN,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const mockDisputesList = (disputes: Dispute[]) => {
  vi.mocked(disputeService.getDisputes).mockResolvedValue({
    success: true,
    message: '',
    statusCode: 200,
    data: disputes,
    metadata: { pageIndex: 1, pageSize: 100, totalCount: disputes.length, totalPages: 1, hasPreviousPage: false, hasNextPage: false },
  });
  vi.mocked(disputeService.getDisputeById).mockImplementation((id: string) => {
    const dispute = disputes.find(d => d.id === id);
    return Promise.resolve({ success: true, message: '', statusCode: 200, data: dispute ?? null });
  });
};

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProjectDisputesPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ProjectDisputesPage cancel project (#246)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthUser = { id: 'client-1', role: Role.CLIENT };
  });

  it('shows the Cancel Project button for the project client when a dispute is open', async () => {
    mockDisputesList([buildDispute({ status: DisputeStatus.OPEN })]);

    renderPage();

    expect(await screen.findByRole('button', { name: 'Cancel Project' })).toBeInTheDocument();
  });

  it('hides the Cancel Project button when no dispute is open or under review', async () => {
    mockDisputesList([buildDispute({ status: DisputeStatus.RESOLVED })]);

    renderPage();

    await screen.findByText('Work not delivered');
    expect(screen.queryByRole('button', { name: 'Cancel Project' })).not.toBeInTheDocument();
  });

  it('hides the Cancel Project button for a user who is not the project client or expert', async () => {
    mockAuthUser = { id: 'someone-else', role: Role.CLIENT };
    mockDisputesList([buildDispute({ status: DisputeStatus.OPEN })]);

    renderPage();

    await screen.findByText('Work not delivered');
    expect(screen.queryByRole('button', { name: 'Cancel Project' })).not.toBeInTheDocument();
  });

  it('calls cancelDisputedProject and shows a success toast after confirming', async () => {
    const user = userEvent.setup();
    mockDisputesList([buildDispute({ status: DisputeStatus.UNDER_REVIEW })]);
    vi.mocked(disputeService.cancelDisputedProject).mockResolvedValue({ success: true, message: '', statusCode: 200, data: null });

    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Cancel Project' }));

    const confirmButtons = await screen.findAllByRole('button', { name: 'Cancel Project' });
    await user.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() => expect(disputeService.cancelDisputedProject).toHaveBeenCalledWith('project-1'));
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalled());
  });
});
