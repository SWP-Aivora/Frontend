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
    render(<StepBoard milestoneId="milestone-1" isExpert={false} />);

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
    render(<StepBoard milestoneId="milestone-1" isExpert={true} />);

    expect(screen.getByText('Add Step')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Skip')).toBeInTheDocument();
    expect(screen.getByTitle('Edit')).toBeInTheDocument();
    expect(screen.getByTitle('Delete')).toBeInTheDocument();
  });
});
