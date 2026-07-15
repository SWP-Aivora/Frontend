/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostJobPage } from '../../../../features/jobs/pages/PostJobPage';
import { jobService } from '../../../../features/jobs/services';
import { JobVisibility } from '../../../../shared/types/enums';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock services
vi.mock('../../../../features/jobs/services', () => ({
  jobService: {
    initAiJobAssistant: vi.fn(),
    refineAiJobAssistant: vi.fn(),
    refineExistingJobAssistant: vi.fn(),
    patchAiJobSuggestion: vi.fn(),
    publishJob: vi.fn(),
    acceptAiJobSuggestion: vi.fn(),
    rejectAiJobSuggestion: vi.fn(),
    createJob: vi.fn(),
    updateJob: vi.fn(),
    getRecommendations: vi.fn().mockResolvedValue({ data: [] }),
    getJobById: vi.fn().mockResolvedValue({ data: null }),
  },
}));

vi.mock('@/shared/services/categoryService', () => ({
  categoryService: {
    getCategories: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

vi.mock('@/shared/services/skillService', () => ({
  skillService: {
    getSkills: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

// Mock components to simplify rendering
vi.mock('../../../../features/jobs/components/AiChatPanel', () => ({
  AiChatPanel: () => <div data-testid="ai-chat-panel">AiChatPanel</div>,
}));
vi.mock('../../../../features/jobs/components/JobDraftForm', () => ({
  JobDraftForm: ({ onAccept, onReject }: any) => (
    <div data-testid="job-draft-form">
      JobDraftForm
      <button data-testid="mock-accept-btn" onClick={onAccept}>
        Continue to Review
      </button>
      {onReject && (
        <button data-testid="mock-reject-btn" onClick={onReject}>
          Reject
        </button>
      )}
    </div>
  ),
}));
vi.mock('../../../../features/jobs/components/ExpertMatchInsights', () => ({
  ExpertMatchInsights: () => <div data-testid="expert-match-insights">ExpertMatchInsights</div>,
}));

let mutationCalls: any[] = [];

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useMutation: (options: any) => {
      mutationCalls.push(options);
      return actual.useMutation(options);
    },
  };
});

const findMutation = (identifier: string) => {
  const found = mutationCalls.find((call) => {
    const fnStr = call.mutationFn?.toString() || '';
    const successStr = call.onSuccess?.toString() || '';
    return fnStr.includes(identifier) || successStr.includes(identifier);
  });
  if (!found) {
    throw new Error(`Mutation with identifier "${identifier}" not found among ${mutationCalls.length} calls`);
  }
  return found;
};

const publishReadySuggestion = {
  id: 'suggest-123',
  rawInput: 'Build a marketplace project',
  suggestedTitle: 'Build a marketplace project',
  suggestedDescription: 'A detailed project description with enough context for experts.',
  businessDomain: 'Marketplace',
  expectedOutcome: 'A published marketplace job',
  budgetType: 'FIXED',
  suggestedBudgetMin: 100,
  suggestedBudgetMax: 200,
  currency: 'Xu',
  suggestedTimelineDays: 30,
  experienceLevel: 'EXPERT',
  categoryId: 'cat-1',
  categoryName: 'Software Development',
  suggestedSkills: ['React'],
  suggestedMilestones: [
    {
      title: 'Discovery',
      description: 'Confirm project scope',
      acceptanceCriteria: 'Scope approved',
      amount: 100,
      dueDays: 7,
      orderIndex: 0,
    },
  ],
  createdAt: '2026-07-15T00:00:00.000Z',
};

describe('PostJobPage query invalidation on mutation success', () => {
  let queryClient: QueryClient;
  let invalidateSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mutationCalls = [];
    queryClient = new QueryClient();
    invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PostJobPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('invalidates clientJobs and clientProjects when createDraftJobMutation succeeds', () => {
    renderComponent();
    const createDraftMutation = findMutation('createJob');
    act(() => {
      createDraftMutation.onSuccess({ data: { id: 'job-123' } });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientJobs'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientProjects'] });
  });

  it('invalidates clientJobs and clientProjects when acceptMutation succeeds', () => {
    renderComponent();
    const acceptMutation = findMutation('acceptAiJobSuggestion');
    act(() => {
      acceptMutation.onSuccess({
        data: {
          job: {
            id: 'job-123',
            categoryId: 'cat-1',
            milestones: [],
          },
        },
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientJobs'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientProjects'] });
  });

  it('invalidates clientJobs and clientProjects when publishMutation succeeds', () => {
    renderComponent();
    const publishMutation = findMutation('publishJob');
    act(() => {
      publishMutation.onSuccess();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientJobs'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientProjects'] });
  });

  it('invalidates clientJobs and clientProjects when updateDraftJobMutation succeeds', () => {
    renderComponent();
    const updateDraftMutation = findMutation('updateJob');
    act(() => {
      updateDraftMutation.onSuccess();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientJobs'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['clientProjects'] });
  });
});

describe('PostJobPage AI suggestion rejection flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mutationCalls = [];
    queryClient = new QueryClient();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PostJobPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('handles the suggestion rejection flow successfully', () => {
    const { getByTestId, queryByText, getByText, getByPlaceholderText } = renderComponent();

    // 1. Transition to DRAFT state by succeeding initMutation
    const initMutationCall = findMutation('initAiJobAssistant');
    act(() => {
      initMutationCall.onSuccess({
        data: {
          id: 'suggest-123',
          title: 'Test AI Suggestion',
          milestones: [],
        },
      });
    });

    // Verify JobDraftForm is rendered
    expect(getByTestId('job-draft-form')).toBeDefined();

    // Verify modal is not open yet
    expect(queryByText('Reject this suggestion?')).toBeNull();

    // 2. Click mock reject button to open modal
    const rejectBtn = getByTestId('mock-reject-btn');
    act(() => {
      rejectBtn.click();
    });

    // Verify modal header is rendered
    expect(getByText('Reject this suggestion?')).toBeDefined();

    const textarea = getByPlaceholderText(/Not what I was looking for/i);
    expect(textarea).toBeDefined();

    // "Reject Suggestion" button is disabled initially
    const submitBtn = getByText('Reject Suggestion') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);

    // 3. Type a valid reason (>= 3 chars)
    act(() => {
      fireEvent.change(textarea, { target: { value: 'Not what I wanted' } });
    });

    // Now button should be enabled
    expect(submitBtn.disabled).toBe(false);

    // Get the reject mutation config to simulate successful response
    const rejectMutationCall = findMutation('rejectAiJobSuggestion');

    // Click Reject Suggestion button
    act(() => {
      submitBtn.click();
    });

    // Simulate reject mutation success
    act(() => {
      rejectMutationCall.onSuccess();
    });

    expect(toast.success).toHaveBeenCalledWith('Suggestion rejected. Start a new conversation whenever you\'re ready.');
  });
});

describe('PostJobPage publish confirmation flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mutationCalls = [];
    queryClient = new QueryClient();
    vi.mocked(jobService.acceptAiJobSuggestion).mockResolvedValue({
      data: {
        job: {
          id: 'job-123',
          categoryId: 'cat-1',
          milestones: [],
        },
      },
      message: 'Success',
      success: true,
      statusCode: 200,
    } as any);
    vi.mocked(jobService.updateJob).mockResolvedValue({
      data: { id: 'job-123' },
      message: 'Success',
      success: true,
      statusCode: 200,
    } as any);
    vi.mocked(jobService.publishJob).mockResolvedValue({
      data: { id: 'job-123' },
      message: 'Success',
      success: true,
      statusCode: 200,
    } as any);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <PostJobPage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  const moveToReviewStep = (view: ReturnType<typeof renderComponent>) => {
    const initMutationCall = findMutation('initAiJobAssistant');
    act(() => {
      initMutationCall.onSuccess({ data: publishReadySuggestion });
    });

    act(() => {
      view.getByTestId('mock-accept-btn').click();
    });
  };

  it('opens a custom publish modal instead of the native browser confirm', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    const view = renderComponent();
    moveToReviewStep(view);

    act(() => {
      fireEvent.click(view.getByText('Publish Project'));
    });

    expect(view.getByText('Publish this project?')).toBeDefined();
    expect(view.getByText('Cancel')).toBeDefined();
    expect(view.getByText('Publish')).toBeDefined();
    expect(confirmSpy).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('does not publish when the custom publish modal is cancelled', () => {
    const view = renderComponent();
    moveToReviewStep(view);

    act(() => {
      fireEvent.click(view.getByText('Publish Project'));
    });
    act(() => {
      fireEvent.click(view.getByText('Cancel'));
    });

    expect(view.queryByText('Publish this project?')).toBeNull();
    expect(jobService.publishJob).not.toHaveBeenCalled();
    expect(jobService.updateJob).not.toHaveBeenCalled();
  });

  it('preserves the existing publish sequence after custom confirmation', async () => {
    const view = renderComponent();
    moveToReviewStep(view);

    act(() => {
      fireEvent.click(view.getByText('Publish Project'));
    });
    act(() => {
      fireEvent.click(view.getByText('Publish'));
    });

    await waitFor(() => {
      expect(jobService.acceptAiJobSuggestion).toHaveBeenCalledWith('suggest-123', {
        categoryId: 'cat-1',
        selectedSkillIds: [],
      });
      expect(jobService.updateJob).toHaveBeenCalledWith(
        'job-123',
        expect.objectContaining({
          visibility: JobVisibility.PUBLIC,
          categoryId: 'cat-1',
          title: 'Build a marketplace project',
        })
      );
      expect(jobService.publishJob).toHaveBeenCalledWith('job-123');
    });
  });
});
