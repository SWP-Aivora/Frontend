import { test, expect } from '@playwright/test';

test.describe('Client Hiring Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept login api call to return successful Client auth
    await page.route('**/api/v1/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          message: 'Login success',
          data: {
            id: 'client-123',
            email: 'client@aivora.com',
            fullName: 'Aivora Client',
            role: 'CLIENT',
            accessToken: 'fake-client-access-token',
            refreshToken: 'fake-client-refresh-token'
          }
        })
      });
    });

    // Intercept getMe API call to return Client data
    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: {
            id: 'client-123',
            email: 'client@aivora.com',
            fullName: 'Aivora Client',
            role: 'CLIENT'
          }
        })
      });
    });

    // Intercept notifications API call to prevent 401 logouts
    await page.route('**/api/v1/notifications**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: [],
          metadata: {
            pageIndex: 1,
            pageSize: 20,
            totalCount: 0,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false
          }
        })
      });
    });

    // Go to login page
    await page.goto('/login');

    // Fill credentials and login
    await page.fill('#email', 'client@aivora.com');
    await page.fill('#password', 'ClientPassword123');
    await page.click('button[type="submit"]');

    // Wait for redirect to /client dashboard
    await page.waitForURL('**/client');

    // Navigate to the post-job page
    await page.goto('/client/post-job');
  });

  test('should guide client through AI project creation and matching experts', async ({ page }) => {
    const mockSuggestionId = 'suggest-999';
    const mockJobId = 'job-888';

    // 1. Intercept AI initialization endpoint
    await page.route('**/api/v1/ai/job-assistant', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          message: 'AI assistant initialized',
          data: {
            id: mockSuggestionId,
            jobId: null,
            clientId: 'client-123',
            rawInput: 'I want to build an e-commerce AI chatbot for product recommendations',
            suggestedTitle: 'E-commerce AI Chatbot',
            suggestedDescription: 'Develop a chatbot to recommend products and handle customer support.',
            businessDomain: 'E-commerce',
            expectedOutcome: 'Functional AI recommendation chatbot',
            categoryId: 'cat-1',
            categoryName: 'AI Chatbots',
            budgetType: 0,
            suggestedBudgetMin: 1000,
            suggestedBudgetMax: 2000,
            currency: 'Xu',
            suggestedTimelineDays: 30,
            experienceLevel: 2,
            suggestedSkills: ['React', 'AI', 'Chatbot'],
            suggestedMilestones: [
              { orderIndex: 1, title: 'Requirements & Design', amount: 30, dueDays: 7, description: 'Design requirements', acceptanceCriteria: 'SRS Approved' },
              { orderIndex: 2, title: 'Development & Integration', amount: 50, dueDays: 15, description: 'Code the chatbot', acceptanceCriteria: 'Code merged' },
              { orderIndex: 3, title: 'Testing & Deploy', amount: 20, dueDays: 8, description: 'Deploy the chatbot', acceptanceCriteria: 'App live' }
            ],
            status: 'GENERATED',
            createdAt: new Date().toISOString()
          }
        })
      });
    });

    // 2. Intercept categories request
    await page.route('**/api/v1/categories', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: [
            { id: 'cat-1', name: 'AI Chatbots' },
            { id: 'cat-2', name: 'Machine Learning' }
          ]
        })
      });
    });

    // 3. Intercept accept suggestion endpoint
    await page.route(`**/api/v1/ai/job-assistant/${mockSuggestionId}/accept`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: {
            job: {
              id: mockJobId,
              categoryId: 'cat-1',
              status: 0,
              milestones: [
                { id: 'mile-1', orderIndex: 1, title: 'Requirements & Design', amount: 30, dueDays: 7, description: 'Design requirements', acceptanceCriteria: 'SRS Approved' },
                { id: 'mile-2', orderIndex: 2, title: 'Development & Integration', amount: 50, dueDays: 15, description: 'Code the chatbot', acceptanceCriteria: 'Code merged' },
                { id: 'mile-3', orderIndex: 3, title: 'Testing & Deploy', amount: 20, dueDays: 8, description: 'Deploy the chatbot', acceptanceCriteria: 'App live' }
              ]
            }
          }
        })
      });
    });

    // 3.5. Intercept update job endpoint (PUT)
    await page.route(`**/api/v1/jobs/${mockJobId}`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: {
            id: mockJobId,
            categoryId: 'cat-1',
            status: 0,
            milestones: [
              { id: 'mile-1', orderIndex: 1, title: 'Requirements & Design', amount: 30, dueDays: 7, description: 'Design requirements', acceptanceCriteria: 'SRS Approved' },
              { id: 'mile-2', orderIndex: 2, title: 'Development & Integration', amount: 50, dueDays: 15, description: 'Code the chatbot', acceptanceCriteria: 'Code merged' },
              { id: 'mile-3', orderIndex: 3, title: 'Testing & Deploy', amount: 20, dueDays: 8, description: 'Deploy the chatbot', acceptanceCriteria: 'App live' }
            ]
          }
        })
      });
    });

    // 4. Intercept publish job endpoint
    await page.route(`**/api/v1/jobs/${mockJobId}/publish`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: {
            id: mockJobId,
            status: 'PUBLISHED'
          }
        })
      });
    });

    // 5. Intercept recommendations endpoint
    await page.route(`**/api/v1/jobs/${mockJobId}/recommendations`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: [
            {
              id: 'match-1',
              name: 'Nguyen Van Expert',
              title: 'Senior AI Engineer',
              rating: 4.9,
              matchScore: 95,
              skills: ['React', 'AI', 'Chatbot']
            }
          ]
        })
      });
    });

    // Act: Type raw project idea
    const chatInput = page.locator('input[placeholder*="Describe your project idea"]');
    await expect(chatInput).toBeVisible();
    await chatInput.fill('I want to build an e-commerce AI chatbot for product recommendations');
    
    // Press Send
    await page.keyboard.press('Enter');

    // Wait for step DRAFTING to load.
    // The panel on the right (JobDraftForm) should be visible
    const draftHeading = page.locator('#job-draft-heading');
    await expect(draftHeading).toBeVisible();

    // Verify draft values
    const titleInput = page.locator('input[placeholder="Job Title"]');
    await expect(titleInput).toHaveValue('E-commerce AI Chatbot');

    // Click "Continue to Review" (Accept suggestion)
    const proceedBtn = page.locator('button:has-text("Continue to Review")');
    await expect(proceedBtn).toBeVisible();
    await proceedBtn.click();

    // Setup dialog handler to accept the confirm dialog when publishing
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Are you sure you want to publish this project');
      await dialog.accept();
    });

    // Verify transition to REVIEWING phase and click "Publish Project"
    const publishBtn = page.locator('button:has-text("Publish Project")');
    await expect(publishBtn).toBeVisible();
    await publishBtn.click();

    // Verify matches display Nguyen Van Expert
    const expertName = page.locator('text=Nguyen Van Expert');
    await expect(expertName).toBeVisible();
  });
});
