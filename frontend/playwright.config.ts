import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:5174';
const apiURL = process.env.E2E_API_URL || 'http://127.0.0.1:3001';

export default defineConfig({
  testDir: './e2e-tests',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm --prefix ../backend run start',
      url: `${apiURL}/api/docs`,
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        PORT: new URL(apiURL).port || '3001',
      },
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${new URL(baseURL).port || '5174'}`,
      url: baseURL,
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        VITE_API_URL: apiURL,
      },
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
