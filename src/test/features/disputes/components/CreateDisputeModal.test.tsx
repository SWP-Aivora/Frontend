import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateDisputeModal } from '../../../../features/disputes/components/CreateDisputeModal';

// Mock the hooks
vi.mock('../../../../features/projects/hooks/useProjects', () => ({
  useProjects: vi.fn(() => ({
    data: { data: [{ id: 'p1', title: 'Project 1' }] },
    isLoading: false,
  })),
}));

vi.mock('../../../../features/projects/hooks/useProjectMilestones', () => ({
  useProjectMilestones: vi.fn(() => ({
    data: { data: [{ id: 'm1', title: 'Milestone 1', amount: 500 }] },
    isLoading: false,
  })),
}));

const mockMutate = vi.fn();
let mockIsPending = false;
vi.mock('../../../../features/disputes/hooks/useOpenDispute', () => ({
  useOpenDispute: vi.fn(() => ({
    mutate: mockMutate,
    isPending: mockIsPending,
  })),
}));

describe('CreateDisputeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <CreateDisputeModal isOpen={false} onClose={() => {}} onSuccess={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders and allows submitting when form is valid', async () => {
    render(
      <CreateDisputeModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
    );

    expect(screen.getByText('Open a Dispute')).toBeInTheDocument();

    const projectSelect = screen.getByLabelText('Select Project');
    fireEvent.change(projectSelect, { target: { value: 'p1' } });

    const milestoneSelect = screen.getByLabelText('Select Milestone');
    fireEvent.change(milestoneSelect, { target: { value: 'm1' } });

    const reasonInput = screen.getByLabelText('Reason');
    fireEvent.change(reasonInput, { target: { value: 'Work not delivered' } });

    const descriptionInput = screen.getByLabelText('Detailed Description');
    fireEvent.change(descriptionInput, {
      target: { value: 'The submitted work was not delivered as agreed.' }
    });

    const submitBtn = screen.getByText('Submit Dispute');
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        {
          milestoneId: 'm1',
          reason: 'Work not delivered',
          description: 'The submitted work was not delivered as agreed.'
        },
        expect.any(Object)
      );
    });
  });

  it('calls success handlers after successful mutation callback', async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <CreateDisputeModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    );

    fireEvent.change(screen.getByLabelText('Select Project'), { target: { value: 'p1' } });
    fireEvent.change(screen.getByLabelText('Select Milestone'), { target: { value: 'm1' } });
    fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Work not delivered' } });
    fireEvent.change(screen.getByLabelText('Detailed Description'), {
      target: { value: 'The submitted work was not delivered as agreed.' }
    });
    fireEvent.click(screen.getByText('Submit Dispute'));

    await waitFor(() => expect(mockMutate).toHaveBeenCalled());

    const mutationOptions = mockMutate.mock.calls[0][1];
    act(() => {
      mutationOptions.onSuccess();
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables form controls while submitting', () => {
    mockIsPending = true;

    render(
      <CreateDisputeModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
    );

    expect(screen.getByLabelText('Select Project')).toBeDisabled();
    expect(screen.getByLabelText('Select Milestone')).toBeDisabled();
    expect(screen.getByLabelText('Reason')).toBeDisabled();
    expect(screen.getByLabelText('Detailed Description')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Submitting...')).toBeDisabled();
  });

  it('shows validation errors if required fields are missing', async () => {
    render(
      <CreateDisputeModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
    );

    const submitBtn = screen.getByText('Submit Dispute');
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    expect(await screen.findByText('Project must be selected')).toBeInTheDocument();
    expect(screen.getByText('Milestone must be selected')).toBeInTheDocument();
    expect(screen.getByText('Reason must be selected or provided')).toBeInTheDocument();
    expect(screen.getByText('Description must be at least 20 characters')).toBeInTheDocument();
  });
});
