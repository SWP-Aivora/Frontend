import { test, expect } from '@playwright/test';

test.describe('Expert Proposal Workflow', () => {
  const jobId = 'job-888';

  test.beforeEach(async ({ page }) => {
    // Navigate to root to set up localStorage
    await page.goto('/');
    
    // Inject authenticated Expert state
    await page.evaluate(() => {
      localStorage.setItem('aivora-auth-store', JSON.stringify({
        state: {
          user: {
            id: 'expert-456',
            email: 'expert@aivora.com',
            fullName: 'Aivora Expert',
            role: 'EXPERT'
          },
          accessToken: 'fake-expert-access-token',
          refreshToken: 'fake-expert-refresh-token',
          isAuthenticated: true
        },
        version: 0
      }));
    });

    // We must clean up localStorage proposal flags for this job
    await page.evaluate((id) => {
      localStorage.removeItem(`submitted_proposal_${id}`);
    }, jobId);

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

    // Intercept getMe API call
    await page.route('**/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: {
            id: 'expert-456',
            email: 'expert@aivora.com',
            fullName: 'Aivora Expert',
            role: 'EXPERT'
          }
        })
      });
    });

    // Intercept getJobById request
    await page.route(`**/api/v1/jobs/${jobId}`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: {
            id: jobId,
            title: 'E-commerce AI Chatbot',
            originalDescription: 'I need an expert to build a chatbot using OpenAI API and integrate it with my website.',
            finalDescription: 'I need an expert to build a chatbot using OpenAI API and integrate it with my website.',
            budgetType: 'FIXED',
            budgetMin: 1000,
            budgetMax: 2000,
            experienceLevel: 'EXPERIENCED',
            timelineDays: 30,
            skills: [
              { id: 'skill-1', name: 'OpenAI API' },
              { id: 'skill-2', name: 'React' }
            ]
          }
        })
      });
    });

    // Navigate to the job details page
    await page.goto(`/expert/jobs/${jobId}`);
    await page.waitForLoadState('networkidle');
  });

  test('should submit a valid proposal with custom milestones', async ({ page }) => {
    const mockProposalId = 'prop-777';

    // Intercept submit proposal API
    await page.route(`**/api/v1/jobs/${jobId}/proposals`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: {
            id: mockProposalId,
            jobId: jobId,
            expertId: 'expert-456',
            coverLetter: 'This is a long cover letter that meets the requirement of being at least 50 characters long.',
            proposedBudget: 1500,
            proposedTimelineDays: 20,
            status: 'submitted',
            milestones: [
              { id: 'mile-101', title: 'Discovery & implementation plan', amount: 500, dueDays: 5, orderIndex: 0 }
            ]
          }
        })
      });
    });

    // Verify job detail fields
    const jobTitle = page.locator('text=E-commerce AI Chatbot');
    await expect(jobTitle).toBeVisible();

    // Verify default milestone value exists
    const firstMilestoneTitle = page.locator('input[name="milestones.0.title"]');
    await expect(firstMilestoneTitle).toHaveValue('Discovery & implementation plan');

    // Fill in Proposed Bid
    const bidInput = page.locator('input[name="proposedBudget"]');
    await bidInput.fill('1500');

    // Fill in Estimated Delivery Time
    const timelineInput = page.locator('input[name="proposedTimelineDays"]');
    await timelineInput.fill('20');

    // Fill in Cover Letter (must be >= 50 chars)
    const coverLetterTextarea = page.locator('textarea[name="coverLetter"]');
    await coverLetterTextarea.fill('This is a long cover letter that meets the requirement of being at least 50 characters long to standout.');

    // Adjust first milestone values
    const firstMilestoneAmount = page.locator('input[name="milestones.0.amount"]');
    await firstMilestoneAmount.fill('500');

    const firstMilestoneDays = page.locator('input[name="milestones.0.dueDays"]');
    await firstMilestoneDays.fill('5');

    // Submit Proposal
    const submitBtn = page.locator('button[type="submit"]:has-text("Submit Proposal")');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify success toast
    await expect(page.locator('text=Proposal submitted successfully!')).toBeVisible();

    // Verify screen transitions to "Proposal Sent" state
    await expect(page.locator('text=Proposal Sent')).toBeVisible();
    await expect(page.locator('text=View Your Proposal')).toBeVisible();
  });

  test('should display expert earnings, balance, and transaction history on wallet page', async ({ page }) => {
    // 1. Intercept wallet details endpoint
    await page.route('**/api/v1/wallet/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: {
            id: 'wallet-123',
            userId: 'expert-456',
            balance: 5000,
            currency: 'Xu',
            createdAt: '2026-06-25T00:00:00Z',
            updatedAt: '2026-06-25T00:00:00Z'
          }
        })
      });
    });

    // 2. Intercept transaction history endpoint
    await page.route('**/api/v1/payments/history**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: [
            {
              id: 'tx-1',
              walletId: 'wallet-123',
              amount: 500,
              currency: 'Xu',
              type: 0, // DEPOSIT
              status: 1, // COMPLETED
              description: 'Demo Deposit',
              createdAt: '2026-06-25T09:00:00Z'
            },
            {
              id: 'tx-2',
              walletId: 'wallet-123',
              amount: 1000,
              currency: 'Xu',
              type: 1, // PAYMENT
              status: 0, // PENDING
              description: 'Escrow for chatbot',
              createdAt: '2026-06-25T11:00:00Z'
            }
          ],
          metadata: {
            pageIndex: 1,
            pageSize: 20,
            totalCount: 2,
            totalPages: 1,
            hasPreviousPage: false,
            hasNextPage: false
          }
        })
      });
    });

    // Navigate to wallet page
    await page.goto('/expert/wallet');

    // Verify header title "Earnings & Payouts"
    const headerTitle = page.locator('text=Earnings & Payouts');
    await expect(headerTitle).toBeVisible();

    // Verify balance shows 5,000 Xu
    const balanceText = page.getByText('5,000 / 5,000 Xu', { exact: false }).or(page.getByText('5,000 Xu', { exact: true }));
    await expect(balanceText.first()).toBeVisible();

    // Verify Escrow shows 1,000 Xu
    const escrowText = page.getByText('1,000 Xu', { exact: true });
    await expect(escrowText).toBeVisible();

    // Verify Total Earned shows 500 Xu
    const earnedText = page.getByText('500 Xu', { exact: true });
    await expect(earnedText).toBeVisible();

    // Verify transactions in table
    const depositTx = page.locator('text=Demo Deposit');
    await expect(depositTx).toBeVisible();
    const escrowTx = page.locator('text=Escrow for chatbot');
    await expect(escrowTx).toBeVisible();
  });
});
