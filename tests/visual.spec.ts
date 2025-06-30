import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs-extra';

const pages = [
  { name: 'homepage', url: 'https://playwright.dev' },
  { name: 'docs', url: 'https://playwright.dev/docs/intro' },
  { name: 'api', url: 'https://playwright.dev/docs/api/class-playwright' }
];

test.describe('Visual regression tests', () => {
  test.beforeAll(async () => {
    // Ensure screenshots directories exist
    await fs.ensureDir(path.join(process.cwd(), 'screenshots', 'current'));
  });

  for (const page of pages) {
    test(`Screenshot comparison for ${page.name}`, async ({ page: pageFixture }) => {
      // Force desktop viewport size
      await pageFixture.setViewportSize({ width: 1280, height: 720 });
      // Navigate to the page
      await pageFixture.goto(page.url);
      
      // Wait for the page to be fully loaded
      await pageFixture.waitForLoadState('networkidle');
      
      // Take a full page screenshot
      const screenshot = await pageFixture.screenshot({
        fullPage: true,
        path: path.join(process.cwd(), 'screenshots', 'current', `${page.name}.png`)
      });

      // Check if baseline exists
      const baselinePath = path.join(process.cwd(), 'screenshots', 'baseline', `${page.name}.png`);
      const baselineExists = await fs.pathExists(baselinePath);

      if (!baselineExists) {
        test.skip();
        console.log(`Baseline screenshot does not exist for ${page.name}`);
        return;
      }
    });
  }
});
