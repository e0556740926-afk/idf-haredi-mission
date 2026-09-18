import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5183',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
        },
      },
    },
  ],
  webServer: {
    command: 'npm run dev -- --port 5183 --strictPort',
    url: 'http://localhost:5183',
    reuseExistingServer: !process.env.CI,
  },
});
