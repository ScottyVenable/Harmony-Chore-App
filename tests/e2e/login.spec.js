import { test, expect } from '@playwright/test';
import path from 'path';

// Helper to build dynamic screenshot path
function screenshotPath(category, name) {
  const today = new Date().toISOString().split('T')[0];
  return path.join('tests', 'screenshots', today, category, `${name}.png`);
}

test.describe('Login Screen UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays Harmony branding and login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Harmony/i })).toBeVisible();
    await expect(page.getByPlaceholder(/you@example.com/i)).toBeVisible();
    await expect(page.getByPlaceholder(/••••••••/i)).toBeVisible();

    await page.screenshot({ path: screenshotPath('UI', 'login-screen'), fullPage: true });
  });

  test('shows sign in button by default', async ({ page }) => {
    const signInBtn = page.getByRole('button', { name: /Sign In/i });
    await expect(signInBtn).toBeVisible();
    await expect(signInBtn).toBeEnabled();
  });

  test('toggles to signup mode', async ({ page }) => {
    await page.getByText(/Don't have an account\? Sign up/i).click();

    await expect(page.getByPlaceholder(/e.g. Scotty/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Account/i })).toBeVisible();

    await page.screenshot({ path: screenshotPath('UI', 'signup-screen'), fullPage: true });
  });

  test('toggles back to login mode', async ({ page }) => {
    // Switch to signup
    await page.getByText(/Don't have an account\? Sign up/i).click();
    await expect(page.getByPlaceholder(/e.g. Scotty/i)).toBeVisible();

    // Switch back to login
    await page.getByText(/Already have an account\? Sign in/i).click();
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    await expect(page.locator('input[placeholder="e.g. Scotty"]')).not.toBeVisible();
  });

  test('Google sign-in button is present', async ({ page }) => {
    const googleBtn = page.getByRole('button', { name: /Google/i });
    await expect(googleBtn).toBeVisible();

    await page.screenshot({ path: screenshotPath('UI', 'google-button'), fullPage: true });
  });
});
