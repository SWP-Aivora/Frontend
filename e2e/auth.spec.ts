import { test, expect } from '@playwright/test';

test.describe('Authentication & Authorization Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page and wait for the form to render
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible();
  });

  test('should display client-side validation errors for empty fields', async ({ page }) => {
    // Submit the form empty
    await page.click('button[type="submit"]');

    // Verify error messages appear under inputs
    // The Zod schema checks for valid email and non-empty password
    const emailError = page.locator('text=Invalid email address');
    const passwordError = page.locator('text=Password must be at least 6 characters');
    
    // Wait for validation errors to be visible
    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });

  test('should display error toast for invalid credentials', async ({ page }) => {
    // Intercept login api call to return 400
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          statusCode: 400,
          message: 'Invalid email or password',
          data: null
        })
      });
    });

    // Fill in credentials
    await page.fill('#email', 'wrong@aivora.com');
    await page.fill('#password', 'WrongPassword123');
    
    // Submit
    await page.click('button[type="submit"]');

    // Verify sonner toast displays the error
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });

  test('should successfully log in as CLIENT and redirect to client dashboard', async ({ page }) => {
    // Intercept login api call to return successful Client auth
    await page.route('**/auth/login', async route => {
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

    // Fill in credentials
    await page.fill('#email', 'client@aivora.com');
    await page.fill('#password', 'ClientPassword123');
    
    // Submit
    await page.click('button[type="submit"]');

    // Verify we redirect to /client
    await page.waitForURL('**/client');
    expect(page.url()).toContain('/client');
  });

  test('should successfully log in as EXPERT and redirect to expert dashboard', async ({ page }) => {
    // Intercept login api call to return successful Expert auth
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          message: 'Login success',
          data: {
            id: 'expert-456',
            email: 'expert@aivora.com',
            fullName: 'Aivora Expert',
            role: 'EXPERT',
            accessToken: 'fake-expert-access-token',
            refreshToken: 'fake-expert-refresh-token'
          }
        })
      });
    });

    // Fill in credentials
    await page.fill('#email', 'expert@aivora.com');
    await page.fill('#password', 'ExpertPassword123');
    
    // Submit
    await page.click('button[type="submit"]');

    // Verify we redirect to /expert
    await page.waitForURL('**/expert');
    expect(page.url()).toContain('/expert');
  });

  test('should successfully log in as ADMIN and redirect to admin dashboard', async ({ page }) => {
    // Intercept login api call to return successful Admin auth
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          statusCode: 200,
          message: 'Login success',
          data: {
            id: 'admin-789',
            email: 'admin@aivora.com',
            fullName: 'Aivora Admin',
            role: 'ADMIN',
            accessToken: 'fake-admin-access-token',
            refreshToken: 'fake-admin-refresh-token'
          }
        })
      });
    });

    // Fill in credentials
    await page.fill('#email', 'admin@aivora.com');
    await page.fill('#password', 'AdminPassword123');
    
    // Submit
    await page.click('button[type="submit"]');

    // Verify we redirect to /admin
    await page.waitForURL('**/admin');
    expect(page.url()).toContain('/admin');
  });
});
