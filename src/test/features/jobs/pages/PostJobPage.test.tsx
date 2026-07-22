/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, fireEvent, waitFor, screen } from '@testing-library/react';
import { createMemoryRouter, Link, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostJobPage } from '../../../../features/jobs/pages/PostJobPage';
import { jobService } from '../../../../features/jobs/services';
import { JobVisibility } from '../../../../shared/types/enums';
import { toast } from 'sonner';
import {
  MILESTONE_TOTAL_BELOW_MIN_MESSAGE,
  MILESTONE_TOTAL_ABOVE_MAX_MESSAGE,
} from '../../../../features/jobs/budgetValidation';

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
  AiChatPanel: ({ inputDisabled, disabledPlaceholder, modeLabel }: any) => (
    <div data-testid="ai-chat-panel" data-disabled={inputDisabled ? 'true' : 'false'}>
      AiChatPanel
      {modeLabel && <span>{modeLabel}</span>}
      {disabledPlaceholder && <p>{disabledPlaceholder}</p>}
    </div>
  ),
}));
vi.mock('../../../../features/jobs/components/JobDraftForm', () => {
  const toMockDraftFormValues = (suggestion: any) => ({
    title: suggestion?.suggestedTitle,
    description: suggestion?.suggestedDescription,
    businessDomain: suggestion?.businessDomain ?? '',
    budgetType: suggestion?.budgetType,
    budgetMin: suggestion?.suggestedBudgetMin ?? null,
    budgetMax: suggestion?.suggestedBudgetMax ?? null,
    timelineDays: suggestion?.suggestedTimelineDays ?? null,
    milestones: suggestion?.suggestedMilestones ?? [],
  });

  return {
    JobDraftForm: ({
      suggestion,
      onAccept,
      onReject,
      onSaveDraft,
      onSkillChange,
      milestoneBudgetValidation,
      isReadOnly,
      readOnlyStatusLabel,
      readOnlyMessage,
    }: any) => (
      <div data-testid="job-draft-form">
        JobDraftForm
        {isReadOnly && (
          <div>
            {readOnlyStatusLabel && <span>{readOnlyStatusLabel}</span>}
            {readOnlyMessage && <p role="alert">{readOnlyMessage}</p>}
          </div>
        )}
        {milestoneBudgetValidation?.blockingMessage && (
          <p role="alert">{milestoneBudgetValidation.blockingMessage}</p>
        )}
        <button data-testid="mock-skill-btn" onClick={() => onSkillChange('skill-1')}>
          Select Skill
        </button>
        {isReadOnly ? (
          <>
            <button data-testid="mock-force-save-btn" onClick={() => onSaveDraft(toMockDraftFormValues(suggestion))}>
              Force Save
            </button>
            <button data-testid="mock-force-accept-btn" onClick={() => onAccept(toMockDraftFormValues(suggestion))}>
              Force Continue
            </button>
          </>
        ) : (
          <>
            <button data-testid="mock-save-btn" onClick={() => onSaveDraft(toMockDraftFormValues(suggestion))}>
              Save
            </button>
            <button data-testid="mock-accept-btn" onClick={() => onAccept(toMockDraftFormValues(suggestion))}>
              Continue to Review
            </button>
          </>
        )}
        {!isReadOnly && onReject && (
          <button data-testid="mock-reject-btn" onClick={onReject}>
            Reject
          </button>
        )}
      </div>
    ),
  };
});
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

const createPublishReadySuggestion = (overrides: Partial<typeof publishReadySuggestion> = {}) => ({
  ...publishReadySuggestion,
  ...overrides,
  suggestedMilestones: overrides.suggestedMilestones ?? publishReadySuggestion.suggestedMilestones,
});

describe('PostJobPage query invalidation on mutation success', () => {
  let queryClient: QueryClient;
  let invalidateSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mutationCalls = [];
    queryClient = new QueryClient();
    invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  });

  const renderComponent = (initialEntries: string[] = ['/client/post-job']) => {
    const router = createMemoryRouter(
      [{ path: '/client/post-job', element: <PostJobPage /> }],
      { initialEntries }
    );

    return render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
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

  const renderComponent = (initialEntries: string[] = ['/client/post-job']) => {
    const router = createMemoryRouter(
      [{ path: '/client/post-job', element: <PostJobPage /> }],
      { initialEntries }
    );

    return render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
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
    vi.mocked(jobService.patchAiJobSuggestion).mockImplementation(async (_suggestionId, data) => ({
      data: {
        ...publishReadySuggestion,
        ...data,
      },
      message: 'Success',
      success: true,
      statusCode: 200,
    } as any));
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

  const renderComponent = (initialEntries: string[] = ['/client/post-job']) => {
    const router = createMemoryRouter(
      [{ path: '/client/post-job', element: <PostJobPage /> }],
      { initialEntries }
    );

    return render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
  };

  const moveToReviewStep = (
    view: ReturnType<typeof renderComponent>,
    suggestion = publishReadySuggestion,
  ) => {
    const initMutationCall = findMutation('initAiJobAssistant');
    act(() => {
      initMutationCall.onSuccess({ data: suggestion });
    });

    act(() => {
      view.getByTestId('mock-skill-btn').click();
    });

    act(() => {
      view.getByTestId('mock-accept-btn').click();
    });
  };

  it('blocks saving an in-progress job post opened directly in the editor', async () => {
    vi.mocked(jobService.getJobById).mockResolvedValue({
      data: {
        id: 'locked-job',
        clientId: 'client-1',
        title: 'Locked Job Post',
        originalDescription: 'Original requirements',
        finalDescription: 'Final requirements',
        businessDomain: 'Education',
        expectedOutcome: 'Delivered content',
        categoryId: 'cat-1',
        categoryName: 'Education',
        budgetType: 0,
        budgetMin: 100,
        budgetMax: 200,
        currency: 'Xu',
        timelineDays: 14,
        experienceLevel: 3,
        status: 2,
        skills: [{ id: 'skill-1', name: 'Writing' }],
        milestones: [],
        createdAt: '2026-07-15T00:00:00.000Z',
      },
      message: 'Success',
      success: true,
      statusCode: 200,
    } as any);

    const view = renderComponent(['/client/post-job?editJobId=locked-job']);

    expect(await view.findByText("This job post can't be edited in its current status.")).toBeDefined();
    expect(view.queryByTestId('mock-save-btn')).toBeNull();

    const saveButton = await view.findByTestId('mock-force-save-btn');
    fireEvent.click(saveButton);

    expect(toast.error).toHaveBeenCalledWith("This job post can't be edited in its current status.");
    expect(jobService.updateJob).not.toHaveBeenCalled();
  });

  it('loads a cancelled job post as read-only and blocks defensive save and review handlers', async () => {
    vi.mocked(jobService.getJobById).mockResolvedValue({
      data: {
        id: 'cancelled-job',
        clientId: 'client-1',
        title: 'Cancelled Job Post',
        originalDescription: 'Original requirements',
        finalDescription: 'Final requirements',
        businessDomain: 'Education',
        expectedOutcome: 'Delivered content',
        categoryId: 'cat-1',
        categoryName: 'Education',
        budgetType: 0,
        budgetMin: 100,
        budgetMax: 200,
        currency: 'Xu',
        timelineDays: 14,
        experienceLevel: 3,
        status: 4,
        skills: [{ id: 'skill-1', name: 'Writing' }],
        milestones: [],
        createdAt: '2026-07-15T00:00:00.000Z',
      },
      message: 'Success',
      success: true,
      statusCode: 200,
    } as any);

    const view = renderComponent(['/client/post-job?editJobId=cancelled-job']);

    expect(await view.findByText('Cancelled')).toBeDefined();
    expect(view.getAllByText('This cancelled job post cannot be edited or re-published.').length).toBeGreaterThan(0);
    expect(view.getByTestId('ai-chat-panel').getAttribute('data-disabled')).toBe('true');
    expect(view.queryByTestId('mock-save-btn')).toBeNull();
    expect(view.queryByTestId('mock-accept-btn')).toBeNull();

    fireEvent.click(view.getByTestId('mock-force-save-btn'));
    fireEvent.click(view.getByTestId('mock-force-accept-btn'));
    fireEvent.click(view.getByTestId('mock-skill-btn'));

    expect(toast.error).toHaveBeenCalledWith('This cancelled job post cannot be edited or re-published.');
    expect(jobService.updateJob).not.toHaveBeenCalled();
    expect(jobService.acceptAiJobSuggestion).not.toHaveBeenCalled();
    expect(jobService.publishJob).not.toHaveBeenCalled();
  });

  it('blocks saving when the milestone total is below the minimum job budget', () => {
    const view = renderComponent();
    const initMutationCall = findMutation('initAiJobAssistant');
    act(() => {
      initMutationCall.onSuccess({
        data: createPublishReadySuggestion({
          suggestedBudgetMin: 1000,
          suggestedBudgetMax: 2000,
          suggestedMilestones: [
            {
              title: 'Discovery',
              description: 'Confirm scope',
              acceptanceCriteria: 'Scope approved',
              amount: 900,
              dueDays: 7,
              orderIndex: 0,
            },
          ],
        }),
      });
    });

    expect(view.getByText(MILESTONE_TOTAL_BELOW_MIN_MESSAGE)).toBeDefined();

    act(() => {
      view.getByTestId('mock-save-btn').click();
    });

    expect(toast.error).toHaveBeenCalledWith(MILESTONE_TOTAL_BELOW_MIN_MESSAGE);
    expect(jobService.createJob).not.toHaveBeenCalled();
    expect(jobService.updateJob).not.toHaveBeenCalled();
  });

  it('opens a custom publish modal instead of the native browser confirm', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    const view = renderComponent();
    moveToReviewStep(view);

    act(() => {
      fireEvent.click(view.getByText('Publish Job Post'));
    });

    expect(view.getByText('Publish this job post?')).toBeDefined();
    expect(view.getByText('Cancel')).toBeDefined();
    expect(view.getByText('Publish')).toBeDefined();
    expect(confirmSpy).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('does not publish when the custom publish modal is cancelled', () => {
    const view = renderComponent();
    moveToReviewStep(view);

    act(() => {
      fireEvent.click(view.getByText('Publish Job Post'));
    });
    act(() => {
      fireEvent.click(view.getByText('Cancel'));
    });

    expect(view.queryByText('Publish this job post?')).toBeNull();
    expect(jobService.publishJob).not.toHaveBeenCalled();
    expect(jobService.updateJob).not.toHaveBeenCalled();
  });

  it('blocks publishing when the milestone total exceeds the maximum job budget', () => {
    const view = renderComponent();
    moveToReviewStep(
      view,
      createPublishReadySuggestion({
        suggestedBudgetMin: 1000,
        suggestedBudgetMax: 2000,
        suggestedMilestones: [
          {
            title: 'Discovery',
            description: 'Confirm scope',
            acceptanceCriteria: 'Scope approved',
            amount: 2100,
            dueDays: 7,
            orderIndex: 0,
          },
        ],
      }),
    );

    expect(view.getByText(MILESTONE_TOTAL_ABOVE_MAX_MESSAGE)).toBeDefined();

    act(() => {
      fireEvent.click(view.getByText('Publish Job Post'));
    });

    expect(toast.error).toHaveBeenCalledWith(MILESTONE_TOTAL_ABOVE_MAX_MESSAGE);
    expect(view.queryByText('Publish this job post?')).toBeNull();
    expect(jobService.acceptAiJobSuggestion).not.toHaveBeenCalled();
    expect(jobService.updateJob).not.toHaveBeenCalled();
    expect(jobService.publishJob).not.toHaveBeenCalled();
  });

  it('preserves the existing publish sequence after custom confirmation', async () => {
    const view = renderComponent();
    moveToReviewStep(view);

    act(() => {
      fireEvent.click(view.getByText('Publish Job Post'));
    });
    act(() => {
      fireEvent.click(view.getByText('Publish'));
    });

    await waitFor(() => {
      expect(jobService.acceptAiJobSuggestion).toHaveBeenCalledWith('suggest-123', {
        categoryId: 'cat-1',
        selectedSkillIds: ['skill-1'],
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

describe('PostJobPage unsaved AI draft protection', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mutationCalls = [];
    queryClient = new QueryClient();
    vi.mocked(jobService.patchAiJobSuggestion).mockImplementation(async (_suggestionId, data) => ({
      data: {
        ...publishReadySuggestion,
        ...data,
      },
      message: 'Success',
      success: true,
      statusCode: 200,
    } as any));
    vi.mocked(jobService.createJob).mockResolvedValue({
      data: { id: 'saved-job-123' },
      message: 'Success',
      success: true,
      statusCode: 200,
    } as any);
  });

  const PostJobRouteShell = () => (
    <>
        <Link to="/client/job-posts">Go to job posts</Link>
      <PostJobPage />
    </>
  );

  const renderRoutedComponent = () => {
    const router = createMemoryRouter(
      [
        { path: '/client/post-job', element: <PostJobRouteShell /> },
        { path: '/client/job-posts', element: <div>Job Posts Route</div> },
      ],
      { initialEntries: ['/client/post-job'] }
    );

    return render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
  };

  const generateDraft = () => {
    const initMutationCall = findMutation('initAiJobAssistant');
    act(() => {
      initMutationCall.onSuccess({ data: publishReadySuggestion });
    });
  };

  it('blocks in-app navigation after AI draft generation and lets the user stay on the page', async () => {
    renderRoutedComponent();
    generateDraft();

    fireEvent.click(screen.getByRole('link', { name: /go to job posts/i }));

    expect(await screen.findByText('Leave without saving?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /stay on this page/i }));

    await waitFor(() => {
      expect(screen.queryByText('Leave without saving?')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('job-draft-form')).toBeInTheDocument();
    expect(screen.queryByText('Job Posts Route')).not.toBeInTheDocument();
  });

  it('prevents beforeunload while an AI draft is unsaved', async () => {
    renderRoutedComponent();
    generateDraft();

    expect(await screen.findByTestId('job-draft-form')).toBeInTheDocument();

    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('successful save clears beforeunload protection', async () => {
    renderRoutedComponent();
    generateDraft();

    fireEvent.click(await screen.findByTestId('mock-save-btn'));

    await waitFor(() => {
      expect(jobService.createJob).toHaveBeenCalled();
    });

    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('does not show the leave-page modal for normal wizard step transitions', async () => {
    renderRoutedComponent();
    generateDraft();

    fireEvent.click(await screen.findByTestId('mock-skill-btn'));
    fireEvent.click(screen.getByTestId('mock-accept-btn'));

    expect(await screen.findByText('Review Project Details')).toBeInTheDocument();
    expect(screen.queryByText('Leave without saving?')).not.toBeInTheDocument();
  });
});
