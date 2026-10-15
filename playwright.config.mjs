import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/auth',
  workers: 1,
  timeout: 20000,
  use: {
    baseURL: 'http://127.0.0.1:3100',
    headless: true,
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {},
  },
  webServer: {
    command: 'node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3100',
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: !process.env.CI,
  },
});
