const fs = require('fs-extra');
const path = require('path');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const chalk = require('chalk');

const THRESHOLD = 100; // Maximum number of pixels that can be different

async function compareImages() {
  console.log(chalk.blue('Comparing screenshots...'));
  
  const baselineDir = path.join(process.cwd(), 'screenshots', 'baseline');
  const currentDir = path.join(process.cwd(), 'screenshots', 'current');
  const diffDir = path.join(process.cwd(), 'screenshots', 'diff');
  
  // Ensure diff directory exists
  await fs.ensureDir(diffDir);
  
  let hasFailures = false;
  
  const baselineFiles = await fs.readdir(baselineDir);
  
  for (const file of baselineFiles) {
    const baselinePath = path.join(baselineDir, file);
    const currentPath = path.join(currentDir, file);
    const diffPath = path.join(diffDir, file);
    
    // Skip if current screenshot doesn't exist
    if (!await fs.pathExists(currentPath)) {
      console.log(chalk.yellow(`⚠ Current screenshot missing for ${file}`));
      continue;
    }
    
    const baseline = PNG.sync.read(await fs.readFile(baselinePath));
    const current = PNG.sync.read(await fs.readFile(currentPath));
    
    const {width, height} = baseline;
    const diff = new PNG({width, height});
    
    const pixelDiff = pixelmatch(
      baseline.data,
      current.data,
      diff.data,
      width,
      height,
      {threshold: 0.1}
    );
    
    if (pixelDiff > THRESHOLD) {
      hasFailures = true;
      await fs.writeFile(diffPath, PNG.sync.write(diff));
      console.log(chalk.red(`✗ ${file} - ${pixelDiff} pixels different`));
    } else {
      console.log(chalk.green(`✓ ${file} - ${pixelDiff} pixels different`));
    }
  }
  
  if (hasFailures) {
    console.log(chalk.red('Visual comparison failed!'));
    process.exit(1);
  } else {
    console.log(chalk.green('Visual comparison passed!'));
  }
}

compareImages();
