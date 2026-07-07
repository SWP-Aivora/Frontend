import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  useCreateMilestoneStep: vi.fn(() => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false })),
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
vi.mock('../../../../features/projects/hooks/useSuggestMilestoneSteps', () => ({
  useSuggestMilestoneSteps: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
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

  it('requires a non-empty reason before submitting a Block, and calls mutate with it once provided', async () => {
    const user = userEvent.setup();
    const useMilestoneStepsMock = await import('../../../../features/projects/hooks/useMilestoneSteps');
    vi.mocked(useMilestoneStepsMock.useMilestoneSteps).mockReturnValueOnce({
      data: { data: [{ ...mockStep, status: 'IN_PROGRESS' as const }] },
      isLoading: false,
    } as never);
    const useUpdateStepStatusMock = await import('../../../../features/projects/hooks/useUpdateStepStatus');
    const mutate = vi.fn();
    vi.mocked(useUpdateStepStatusMock.useUpdateStepStatus).mockReturnValueOnce({ mutate } as never);

    render(<StepBoard milestoneId="milestone-1" isExpert={true} isClient={false} />);

    await user.click(screen.getByText('Block'));
    const submitButton = screen.getByRole('button', { name: 'Block' });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText(/what are you waiting on/i), 'Waiting on client access');
    expect(submitButton).not.toBeDisabled();

    await user.click(submitButton);
    expect(mutate).toHaveBeenCalledWith({ stepId: mockStep.id, status: 'BLOCKED', reason: 'Waiting on client access' });
  });

  it('calls mutate with IN_PROGRESS when the Client clicks Unblock', async () => {
    const user = userEvent.setup();
    const useMilestoneStepsMock = await import('../../../../features/projects/hooks/useMilestoneSteps');
    vi.mocked(useMilestoneStepsMock.useMilestoneSteps).mockReturnValueOnce({ data: { data: [blockedStep] }, isLoading: false } as never);
    const useUpdateStepStatusMock = await import('../../../../features/projects/hooks/useUpdateStepStatus');
    const mutate = vi.fn();
    vi.mocked(useUpdateStepStatusMock.useUpdateStepStatus).mockReturnValueOnce({ mutate } as never);

    render(<StepBoard milestoneId="milestone-1" isExpert={false} isClient={true} />);

    await user.click(screen.getByText('Unblock'));
    expect(mutate).toHaveBeenCalledWith({ stepId: blockedStep.id, status: 'IN_PROGRESS' });
  });

  it('lets the Expert generate, edit, and save AI-suggested steps', async () => {
    const user = userEvent.setup();
    const useSuggestMilestoneStepsMock = await import('../../../../features/projects/hooks/useSuggestMilestoneSteps');
    const suggestMutate = vi.fn((_vars, opts?: { onSuccess?: (res: { data: { title: string; description: string | null }[] }) => void }) => {
      opts?.onSuccess?.({ data: [{ title: 'Draft schema', description: 'Design the DB schema' }, { title: 'Build API', description: null }] });
    });
    vi.mocked(useSuggestMilestoneStepsMock.useSuggestMilestoneSteps).mockReturnValue({ mutate: suggestMutate, isPending: false } as never);

    const useCreateMilestoneStepMock = await import('../../../../features/projects/hooks/useCreateMilestoneStep');
    const mutateAsync = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useCreateMilestoneStepMock.useCreateMilestoneStep).mockReturnValue({ mutate: vi.fn(), mutateAsync, isPending: false } as never);

    render(<StepBoard milestoneId="milestone-1" isExpert={true} isClient={false} />);

    await user.click(screen.getByText('AI Suggest Steps'));
    expect(suggestMutate).toHaveBeenCalled();
    expect(screen.getByDisplayValue('Draft schema')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Build API')).toBeInTheDocument();

    // Remove the second draft step
    const removeButtons = screen.getAllByTitle('Remove');
    await user.click(removeButtons[1]);
    expect(screen.queryByDisplayValue('Build API')).not.toBeInTheDocument();

    await user.click(screen.getByText(/Save 1 step/));
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ title: 'Draft schema' }));
  });
});
