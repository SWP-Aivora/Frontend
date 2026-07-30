import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EditMilestoneModal } from '../../../../features/projects/components/EditMilestoneModal';
import { MilestoneStatus } from '../../../../shared/types/enums';

const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: toastMock,
}));

const milestone = {
  id: 'ms-1',
  title: 'Milestone 1',
  description: 'Desc',
  amount: 100,
  currency: 'AICOIN',
  dueDate: '2026-08-01',
  dueDays: null,
  acceptanceCriteria: 'Criteria',
  orderIndex: 0,
  status: MilestoneStatus.CREATED,
  projectId: 'project-1',
  createdAt: '2026-07-01T00:00:00Z',
  updatedAt: '2026-07-01T00:00:00Z',
};

// The Save button starts disabled until react-hook-form's async zod
// validation resolves (isValid flips true after the initial reset). Wait for
// that before clicking, otherwise the click on a disabled button is a no-op.
const submitForm = async () => {
  const saveButton = screen.getByRole('button', { name: 'Save Changes' });
  await waitFor(() => expect(saveButton).not.toBeDisabled());
  fireEvent.click(saveButton);
};

describe('EditMilestoneModal cascade toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a cascade toast when cascadedMilestoneCount > 0', async () => {
    const onSave = vi.fn().mockResolvedValue({ cascadedMilestoneCount: 2 });

    render(
      <EditMilestoneModal
        isOpen
        milestone={milestone}
        isSaving={false}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );

    await submitForm();

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    await waitFor(() => expect(toastMock.success).toHaveBeenCalledWith(
      expect.stringContaining('2 other milestones were shifted')
    ));
  });

  it('does not show a cascade toast when cascadedMilestoneCount is 0', async () => {
    const onSave = vi.fn().mockResolvedValue({ cascadedMilestoneCount: 0 });

    render(
      <EditMilestoneModal
        isOpen
        milestone={milestone}
        isSaving={false}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );

    await submitForm();

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(toastMock.success).not.toHaveBeenCalled();
  });

  it('does not show a cascade toast when onSave resolves without a count (e.g. void)', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <EditMilestoneModal
        isOpen
        milestone={milestone}
        isSaving={false}
        onClose={vi.fn()}
        onSave={onSave}
      />
    );

    await submitForm();

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(toastMock.success).not.toHaveBeenCalled();
  });
});
