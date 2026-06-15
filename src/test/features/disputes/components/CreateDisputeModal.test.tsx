import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
vi.mock('../../../../features/disputes/hooks/useOpenDispute', () => ({
  useOpenDispute: vi.fn(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
}));

describe('CreateDisputeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    const submitBtn = screen.getByText('Submit Dispute');
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { milestoneId: 'm1', reason: 'Work not delivered', description: '' },
        expect.any(Object)
      );
    });
  });

  it('submit is disabled if required fields are missing', () => {
    render(
      <CreateDisputeModal isOpen={true} onClose={() => {}} onSuccess={() => {}} />
    );

    const submitBtn = screen.getByText('Submit Dispute');
    expect(submitBtn).toBeDisabled();
  });
});
