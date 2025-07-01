import { test } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs-extra';

const pages = [
  {
    name: 'homepage',
    staging: 'https://images.google.com/',
    production: 'https://www.google.com/',
  },
  // {
  //   name: 'docs',
  //   staging: 'https://staging.example.com/docs/intro',
  //   production: 'https://example.com/docs/intro',
  // },
  // {
  //   name: 'api',
  //   staging: 'https://staging.example.com/api/class-playwright',
  //   production: 'https://example.com/api/class-playwright',
  // },
];

test.beforeAll(async () => {
  await fs.ensureDir(path.join(process.cwd(), 'screenshots', 'staging'));
  await fs.ensureDir(path.join(process.cwd(), 'screenshots', 'production'));
});

for (const page of pages) {
  test(`Screenshot for ${page.name} (staging)`, async ({ page: pageFixture }) => {
    await pageFixture.setViewportSize({ width: 1280, height: 720 });
    await pageFixture.goto(page.staging);
    await pageFixture.waitForLoadState('networkidle');
    await pageFixture.screenshot({
      fullPage: true,
      path: path.join(process.cwd(), 'screenshots', 'staging', `${page.name}.png`)
    });
  });

  test(`Screenshot for ${page.name} (production)`, async ({ page: pageFixture }) => {
    await pageFixture.setViewportSize({ width: 1280, height: 720 });
    await pageFixture.goto(page.production);
    await pageFixture.waitForLoadState('networkidle');
    await pageFixture.screenshot({
      fullPage: true,
      path: path.join(process.cwd(), 'screenshots', 'production', `${page.name}.png`)
    });
  });
}

test.afterAll(async () => {
  // Run the compare-images script after all screenshots are taken
  const { execSync } = require('child_process');
  try {
    execSync('node ./utils/compare-images.js', { stdio: 'inherit' });
  } catch (e) {
    // The compare script will handle its own errors and exit code
  }
});
