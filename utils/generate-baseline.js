const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

const pages = [
  { name: 'homepage', url: 'https://playwright.dev' },
  { name: 'docs', url: 'https://playwright.dev/docs/intro' },
  { name: 'api', url: 'https://playwright.dev/docs/api/class-playwright' }
];

async function generateBaseline() {
  console.log(chalk.blue('Generating baseline screenshots...'));
  
  // Ensure baseline directory exists
  await fs.ensureDir(path.join(process.cwd(), 'screenshots', 'baseline'));
  
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  try {
    for (const page of pages) {
      const pageInstance = await context.newPage();
      await pageInstance.goto(page.url);
      await pageInstance.waitForLoadState('networkidle');
      
      const screenshotPath = path.join(process.cwd(), 'screenshots', 'baseline', `${page.name}.png`);
      await pageInstance.screenshot({
        fullPage: true,
        path: screenshotPath
      });
      
      console.log(chalk.green(`✓ Generated baseline for ${page.name}`));
    }
  } catch (error) {
    console.error(chalk.red('Error generating baseline:'), error);
    process.exit(1);
  } finally {
    await browser.close();
  }
  
  console.log(chalk.blue('Baseline generation completed!'));
}

generateBaseline();
