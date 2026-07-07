import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepBoard } from '../../../../features/projects/components/StepBoard';

const mockStep = {
  id: 'step-1',
  milestoneId: 'milestone-1',
  title: 'Draft wireframes',
  description: null,
  orderIndex: 1,
  status: 'PENDING' as const,
  dueDate: null,
  completedAt: null,
  completedByUserId: null,
  blockedReason: null,
};

const blockedStep = {
  ...mockStep,
  id: 'step-2',
  title: 'Integrate payment gateway',
  status: 'BLOCKED' as const,
  blockedReason: 'Waiting on client API credentials',
};

vi.mock('../../../../features/projects/hooks/useMilestoneSteps', () => ({
  useMilestoneSteps: vi.fn(() => ({ data: { data: [mockStep] }, isLoading: false })),
}));
vi.mock('../../../../features/projects/hooks/useCreateMilestoneStep', () => ({
  useCreateMilestoneStep: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));
vi.mock('../../../../features/projects/hooks/useUpdateMilestoneStep', () => ({
  useUpdateMilestoneStep: vi.fn(() => ({ mutate: vi.fn() })),
}));
vi.mock('../../../../features/projects/hooks/useDeleteMilestoneStep', () => ({
  useDeleteMilestoneStep: vi.fn(() => ({ mutate: vi.fn() })),
}));
vi.mock('../../../../features/projects/hooks/useUpdateStepStatus', () => ({
  useUpdateStepStatus: vi.fn(() => ({ mutate: vi.fn() })),
}));
vi.mock('../../../../features/projects/hooks/useReorderMilestoneSteps', () => ({
  useReorderMilestoneSteps: vi.fn(() => ({ mutate: vi.fn() })),
}));

describe('StepBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the step read-only with no mutation controls for a Client', () => {
    render(<StepBoard milestoneId="milestone-1" isExpert={false} isClient={true} />);

    expect(screen.getByText('Draft wireframes')).toBeInTheDocument();
    expect(screen.queryByText('Add Step')).not.toBeInTheDocument();
    expect(screen.queryByText('Start')).not.toBeInTheDocument();
    expect(screen.queryByText('Skip')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Edit')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Delete')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Move up')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Move down')).not.toBeInTheDocument();
  });

  it('renders add/edit/delete/reorder and status-change controls for an Expert', () => {
    render(<StepBoard milestoneId="milestone-1" isExpert={true} isClient={false} />);

    expect(screen.getByText('Add Step')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Skip')).toBeInTheDocument();
    expect(screen.getByTitle('Edit')).toBeInTheDocument();
    expect(screen.getByTitle('Delete')).toBeInTheDocument();
  });

  it('shows the Unblock action and blocked reason to the Client for a blocked step, but not Start/Skip', async () => {
    const useMilestoneStepsMock = await import('../../../../features/projects/hooks/useMilestoneSteps');
    vi.mocked(useMilestoneStepsMock.useMilestoneSteps).mockReturnValueOnce({ data: { data: [blockedStep] }, isLoading: false } as never);

    render(<StepBoard milestoneId="milestone-1" isExpert={false} isClient={true} />);

    expect(screen.getByText(/Waiting on client API credentials/)).toBeInTheDocument();
    expect(screen.getByText('Unblock')).toBeInTheDocument();
    expect(screen.queryByText('Start')).not.toBeInTheDocument();
    expect(screen.queryByText('Skip')).not.toBeInTheDocument();
  });

  it('does not show the Unblock action to the Expert for a blocked step', async () => {
    const useMilestoneStepsMock = await import('../../../../features/projects/hooks/useMilestoneSteps');
    vi.mocked(useMilestoneStepsMock.useMilestoneSteps).mockReturnValueOnce({ data: { data: [blockedStep] }, isLoading: false } as never);

    render(<StepBoard milestoneId="milestone-1" isExpert={true} isClient={false} />);

    expect(screen.queryByText('Unblock')).not.toBeInTheDocument();
  });

  it('shows a Block action to the Expert for an in-progress step', async () => {
    const useMilestoneStepsMock = await import('../../../../features/projects/hooks/useMilestoneSteps');
    vi.mocked(useMilestoneStepsMock.useMilestoneSteps).mockReturnValueOnce({
      data: { data: [{ ...mockStep, status: 'IN_PROGRESS' as const }] },
      isLoading: false,
    } as never);

    render(<StepBoard milestoneId="milestone-1" isExpert={true} isClient={false} />);

    expect(screen.getByText('Block')).toBeInTheDocument();
  });
});
