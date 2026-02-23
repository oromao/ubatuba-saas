// @ts-check
const { defineConfig } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const humanSlowMo = Number(process.env.HUMAN_SLOWMO || '200');

module.exports = defineConfig({
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  outputDir: 'test-results/artifacts',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/playwright-report.json' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'default',
      testDir: './poc/checks',
      testMatch: ['**/*.spec.js'],
    },
    {
      name: 'human',
      testDir: './tests/e2e/fullscan',
      testMatch: ['**/*.spec.ts'],
      timeout: 1_200_000,
      fullyParallel: false,
      use: {
        baseURL,
        headless: false,
        viewport: { width: 1600, height: 1000 },
        trace: 'on',
        video: 'on',
        screenshot: process.env.HUMAN_SCREENSHOT || 'on',
        actionTimeout: 20_000,
        navigationTimeout: 45_000,
        launchOptions: {
          slowMo: humanSlowMo,
        },
      },
    },
    {
      name: 'scan',
      testDir: './tests/e2e/fullscan',
      testMatch: ['**/*.spec.ts'],
      timeout: 1_200_000,
      fullyParallel: false,
      use: {
        baseURL,
        headless: true,
        viewport: { width: 1600, height: 1000 },
        trace: 'on-first-retry',
        video: 'retain-on-failure',
        screenshot: 'only-on-failure',
        actionTimeout: 20_000,
        navigationTimeout: 45_000,
      },
    },
  ],
});
