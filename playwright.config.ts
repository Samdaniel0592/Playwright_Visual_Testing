import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
  },
  reporter: 'list',
  workers: 1, // Run tests sequentially to avoid resource conflicts
});
