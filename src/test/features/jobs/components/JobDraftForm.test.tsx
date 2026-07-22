import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JobDraftForm } from '../../../../features/jobs/components/JobDraftForm';
import {
  MILESTONE_TOTAL_BELOW_MIN_MESSAGE,
  MILESTONE_TOTAL_ABOVE_MAX_MESSAGE,
} from '../../../../features/jobs/budgetValidation';
import type { AiJobSuggestion } from '../../../../features/jobs/types';
import { AiJobAssistantStatus } from '../../../../features/jobs/types';
import { BudgetType, SkillLevel } from '../../../../shared/types/enums';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

import { toast } from 'sonner';

const createSuggestion = (amounts: number[], budgetMin = 1000, budgetMax = 2000): AiJobSuggestion => ({
  id: 'suggestion-1',
  jobId: null,
  clientId: 'client-1',
  rawInput: 'Build a useful AI workflow',
  suggestedTitle: 'Build a useful AI workflow',
  suggestedDescription: 'A detailed job description that gives experts enough context to estimate the project.',
  businessDomain: 'Operations',
  expectedOutcome: 'A working AI workflow',
  categoryId: 'category-1',
  categoryName: 'Automation',
  budgetType: BudgetType.FIXED,
  suggestedBudgetMin: budgetMin,
  suggestedBudgetMax: budgetMax,
  currency: 'AICOIN',
  suggestedTimelineDays: 14,
  experienceLevel: SkillLevel.EXPERT,
  suggestedSkills: ['Automation'],
  suggestedMilestones: amounts.map((amount, index) => ({
    title: `Milestone ${index + 1}`,
    description: 'Complete project work',
    amount,
    dueDays: 7,
    acceptanceCriteria: 'Accepted by client',
    orderIndex: index,
  })),
  status: AiJobAssistantStatus.GENERATED,
  createdAt: '2026-07-19T00:00:00.000Z',
});

const DraftFormHarness = ({
  initialSuggestion,
  onAccept = vi.fn(),
}: {
  initialSuggestion: AiJobSuggestion;
  onAccept?: (values: unknown) => void;
}) => {
  return (
    <JobDraftForm
      suggestion={initialSuggestion}
      categories={[]}
      skills={[]}
      selectedSkillIds={[]}
      onSkillChange={vi.fn()}
      onCategoryChange={vi.fn()}
      onAccept={onAccept}
      onSaveDraft={vi.fn()}
      isAccepting={false}
    />
  );
};

describe('JobDraftForm milestone budget feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the current milestone total and budget range for valid AI-generated milestones', () => {
    render(<DraftFormHarness initialSuggestion={createSuggestion([500, 1000])} />);

    expect(screen.getByText('1,500 Aivora Coin')).toBeInTheDocument();
    expect(screen.getByText('Job budget range: 1,000 - 2,000 Aivora Coin')).toBeInTheDocument();
    expect(screen.queryByText(MILESTONE_TOTAL_BELOW_MIN_MESSAGE)).not.toBeInTheDocument();
  });

  it('shows a below-minimum error immediately and clears it after editing the total into range', () => {
    render(<DraftFormHarness initialSuggestion={createSuggestion([400, 500])} />);

    expect(screen.getByText('900 Aivora Coin')).toBeInTheDocument();
    expect(screen.getByText(MILESTONE_TOTAL_BELOW_MIN_MESSAGE)).toBeInTheDocument();

    const amountInputs = screen.getAllByLabelText('Amount (Aivora Coin)');
    fireEvent.change(amountInputs[1], { target: { value: '1100' } });

    expect(screen.getByText('1,500 Aivora Coin')).toBeInTheDocument();
    expect(screen.queryByText(MILESTONE_TOTAL_BELOW_MIN_MESSAGE)).not.toBeInTheDocument();
  });

  it('shows an above-maximum error for totals above the budget range', () => {
    render(<DraftFormHarness initialSuggestion={createSuggestion([1000, 1100])} />);

    expect(screen.getByText('2,100 Aivora Coin')).toBeInTheDocument();
    expect(screen.getByText(MILESTONE_TOTAL_ABOVE_MAX_MESSAGE)).toBeInTheDocument();
  });

  it('shows the milestone budget validation message on invalid continue and does not accept the draft', async () => {
    const onAccept = vi.fn();
    render(<DraftFormHarness initialSuggestion={createSuggestion([400, 500])} onAccept={onAccept} />);

    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    expect(await screen.findByText(MILESTONE_TOTAL_BELOW_MIN_MESSAGE)).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith(MILESTONE_TOTAL_BELOW_MIN_MESSAGE);
    expect(onAccept).not.toHaveBeenCalled();
  });

  it('shows a specific field validation message for other schema failures', async () => {
    const onAccept = vi.fn();
    render(<DraftFormHarness initialSuggestion={createSuggestion([1000])} onAccept={onAccept} />);

    fireEvent.change(screen.getByLabelText(/job title/i), { target: { value: 'Bad' } });
    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    expect(await screen.findByText('Title must be at least 5 characters')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Title must be at least 5 characters');
    expect(onAccept).not.toHaveBeenCalled();
  });

  it('continues to review for a valid draft', async () => {
    const onAccept = vi.fn();
    render(<DraftFormHarness initialSuggestion={createSuggestion([500, 1000])} onAccept={onAccept} />);

    fireEvent.click(screen.getByRole('button', { name: /continue to review/i }));

    await waitFor(() => {
      expect(onAccept).toHaveBeenCalledTimes(1);
    });
    expect(toast.error).not.toHaveBeenCalled();
  });
});
