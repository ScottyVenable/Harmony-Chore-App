import { test, expect } from '@playwright/test';
import path from 'path';

function screenshotPath(category, name) {
  const today = new Date().toISOString().split('T')[0];
  return path.join('tests', 'screenshots', today, category, `${name}.png`);
}

test.describe('Login Form Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('fills email and password fields', async ({ page }) => {
    const emailInput = page.getByPlaceholder(/you@example.com/i);
    const passwordInput = page.getByPlaceholder(/••••••••/i);

    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');

    await page.screenshot({ path: screenshotPath('actions', 'login-filled'), fullPage: true });
  });

  test('fills signup form fields', async ({ page }) => {
    // Switch to signup
    await page.getByText(/Don't have an account\? Sign up/i).click();

    const nameInput = page.getByPlaceholder(/e.g. Scotty/i);
    const emailInput = page.getByPlaceholder(/you@example.com/i);
    const passwordInput = page.getByPlaceholder(/••••••••/i);

    await nameInput.fill('Gemini');
    await emailInput.fill('scotty2hotty8019@gmail.com');
    await passwordInput.fill('TestPass123!');

    await expect(nameInput).toHaveValue('Gemini');
    await expect(emailInput).toHaveValue('scotty2hotty8019@gmail.com');
    await expect(passwordInput).toHaveValue('TestPass123!');

    await page.screenshot({ path: screenshotPath('actions', 'signup-filled'), fullPage: true });
  });

  test('shows error on invalid Firebase login attempt', async ({ page }) => {
    const emailInput = page.getByPlaceholder(/you@example.com/i);
    const passwordInput = page.getByPlaceholder(/••••••••/i);

    await emailInput.fill('nonexistent@example.com');
    await passwordInput.fill('wrongpassword');

    await page.getByRole('button', { name: /Sign In/i }).click();

    // Firebase should return an error — wait for error message to appear
    const errorEl = page.locator('text=/invalid|error|not found|wrong|credential/i');
    await expect(errorEl).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: screenshotPath('actions', 'login-error'), fullPage: true });
  });
});
