import { test, expect } from '@playwright/test';

test.describe('Real-time Chat Flow', () => {
  const mockConversationId = 'conv-111';
  let messagesSent = false;

  test.beforeEach(async ({ page }) => {
    messagesSent = false;

    // Navigate to root to set up localStorage
    await page.goto('/');
    
    // Inject authenticated Client state
    await page.evaluate(() => {
      localStorage.setItem('aivora-auth-store', JSON.stringify({
        state: {
          user: {
            id: 'client-123',
            email: 'client@aivora.com',
            fullName: 'Aivora Client',
            role: 'CLIENT'
          },
          accessToken: 'fake-client-access-token',
          refreshToken: 'fake-client-refresh-token',
          isAuthenticated: true
        },
        version: 0
      }));
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

    // Intercept getMe API call
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

    // Intercept projects list call
    await page.route('**/api/v1/projects**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: [
            {
              id: 'project-777',
              title: 'E-commerce AI Chatbot',
              status: 1,
              totalBudget: 1500,
              endDate: '2026-07-25T00:00:00Z',
              milestones: []
            }
          ],
          metadata: {
            pageIndex: 1,
            pageSize: 100,
            totalCount: 1,
            totalPages: 1,
            hasPreviousPage: false,
            hasNextPage: false
          }
        })
      });
    });

    // Intercept project details call
    await page.route('**/api/v1/projects/project-777**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: {
            id: 'project-777',
            title: 'E-commerce AI Chatbot',
            status: 1,
            totalBudget: 1500,
            endDate: '2026-07-25T00:00:00Z',
            milestones: []
          }
        })
      });
    });

    // Intercept mark as read endpoint
    await page.route(`**/api/v1/conversations/${mockConversationId}/read`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: null
        })
      });
    });

    // 1. Intercept conversations list endpoint
    await page.route('**/api/v1/conversations**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: [
            {
              id: mockConversationId,
              projectId: 'project-777',
              projectTitle: 'E-commerce AI Chatbot',
              clientId: 'client-123',
              clientName: 'Aivora Client',
              expertId: 'expert-456',
              expertName: 'Nguyen Van Expert',
              lastMessage: 'Hello, let us start the project design.',
              updatedAt: new Date().toISOString(),
              unreadCount: 0
            }
          ]
        })
      });
    });

    // 2. Intercept messages for the conversation
    await page.route(`**/api/v1/conversations/${mockConversationId}/messages**`, async route => {
      const messages = [
        {
          id: 'msg-001',
          conversationId: mockConversationId,
          senderId: 'expert-456',
          senderName: 'Nguyen Van Expert',
          content: 'Hello, let us start the project design.',
          createdAt: new Date(Date.now() - 60000).toISOString(),
          isRead: true
        }
      ];

      if (messagesSent) {
        messages.push({
          id: 'msg-002',
          conversationId: mockConversationId,
          senderId: 'client-123',
          senderName: 'Aivora Client',
          content: 'Sounds good, let us do it!',
          createdAt: new Date().toISOString(),
          isRead: false
        });
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          data: messages
        })
      });
    });

    // Navigate to the messages workspace
    await page.goto('/client/messages');
    await page.waitForLoadState('networkidle');
  });

  test('should display active conversations and send message successfully', async ({ page }) => {
    // Verify conversation item displays expert's name
    const expertItem = page.locator('text=Nguyen Van Expert');
    await expect(expertItem).toBeVisible();

    // Click on the conversation
    await expertItem.click();

    // Verify existing message from expert is loaded
    const messageBubble = page.locator('text=Hello, let us start the project design.');
    await expect(messageBubble.first()).toBeVisible();

    // Override chatService.sendMessage to mock SignalR call
    await page.evaluate(() => {
      const customWindow = window as unknown as {
        chatService: {
          sendMessage: () => Promise<void>;
        };
      };
      customWindow.chatService.sendMessage = async () => {
        return Promise.resolve();
      };
    });

    // Type a reply
    const messageInput = page.locator('textarea[placeholder="Message..."]');
    await expect(messageInput).toBeVisible();
    await messageInput.fill('Sounds good, let us do it!');

    // Click Send
    const sendBtn = page.locator('button[aria-label="Send message"]');
    await expect(sendBtn).toBeVisible();
    
    // Set flag in playwright context so subsequent message poll returns the new message
    messagesSent = true;
    
    await sendBtn.click();

    // Verify new message bubble is rendered in chat history
    const sentMessageBubble = page.locator('text=Sounds good, let us do it!');
    await expect(sentMessageBubble).toBeVisible();
  });
});
