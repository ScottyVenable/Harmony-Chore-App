import { defineConfig, devices } from '@playwright/test';

// Dynamic date-based screenshot directory
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github'], ['list']]
    : [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'off', // We take manual screenshots in tests
  },
  projects: [
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  // Dynamic screenshot path exposed via metadata
  metadata: {
    screenshotDir: `tests/screenshots/${today}`,
  },
});
