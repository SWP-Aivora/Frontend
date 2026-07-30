import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepCard } from '../../../../features/projects/components/StepCard';
import { getStepDueDateError } from '../../../../features/projects/utils';
import { MilestoneStepStatus } from '../../../../shared/types/enums';
import type { MilestoneStep } from '../../../../features/projects/types';

describe('getStepDueDateError', () => {
  it('returns an error when the step due date is after the milestone due date', () => {
    expect(getStepDueDateError('2026-08-15', '2026-08-01')).toMatch(/must be on or before the milestone due date/i);
  });

  it('returns null when the step due date equals the milestone due date', () => {
    expect(getStepDueDateError('2026-08-01', '2026-08-01')).toBeNull();
  });

  it('returns null when the milestone has no due date', () => {
    expect(getStepDueDateError('2099-01-01', null)).toBeNull();
  });

  it('returns null for an unparseable date string', () => {
    expect(getStepDueDateError('not-a-date', '2026-08-01')).toBeNull();
  });
});

const mockStep: MilestoneStep = {
  id: 'step-1',
  milestoneId: 'milestone-1',
  title: 'Draft wireframes',
  description: null,
  orderIndex: 1,
  status: MilestoneStepStatus.PENDING,
  dueDate: null,
  completedAt: null,
  completedByUserId: null,
  blockedReason: null,
};

const noop = () => {};

describe('StepCard edit form', () => {
  it('blocks Save and does not call onEdit when the edited due date is after the milestone due date', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    const { container } = render(
      <StepCard
        step={mockStep}
        isExpert={true}
        isClient={false}
        milestoneDueDate="2026-08-01"
        isFirst={true}
        isLast={true}
        onStart={noop}
        onComplete={noop}
        onSkip={noop}
        onBlock={noop}
        onUnblock={noop}
        onDelete={noop}
        onMoveUp={noop}
        onMoveDown={noop}
        onEdit={onEdit}
      />
    );

    await user.click(screen.getByTitle('Edit'));
    const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(dateInput).not.toHaveAttribute('min');
    fireEvent.change(dateInput, { target: { value: '2026-08-15' } });

    expect(screen.getByText(/must be on or before the milestone due date/i)).toBeInTheDocument();
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();

    await user.click(saveButton);
    expect(onEdit).not.toHaveBeenCalled();
  });
});
