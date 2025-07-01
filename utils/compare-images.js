const fs = require('fs-extra');
const path = require('path');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const chalk = require('chalk');

const THRESHOLD = 100; // Maximum number of pixels that can be different

async function compareImages() {
  console.log(chalk.blue('Comparing staging vs production screenshots...'));
  
  const stagingDir = path.join(process.cwd(), 'screenshots', 'staging');
  const productionDir = path.join(process.cwd(), 'screenshots', 'production');
  const diffDir = path.join(process.cwd(), 'screenshots', 'diff');
  
  // Ensure diff directory exists
  await fs.ensureDir(diffDir);
  
  let hasFailures = false;
  
  const stagingFiles = await fs.readdir(stagingDir);
  
  for (const file of stagingFiles) {
    const stagingPath = path.join(stagingDir, file);
    const productionPath = path.join(productionDir, file);
    const diffPath = path.join(diffDir, file);
    
    // Skip if production screenshot doesn't exist
    if (!await fs.pathExists(productionPath)) {
      console.log(chalk.yellow(`⚠ Production screenshot missing for ${file}`));
      continue;
    }
    
    const staging = PNG.sync.read(await fs.readFile(stagingPath));
    const production = PNG.sync.read(await fs.readFile(productionPath));
    
    const {width, height} = staging;
    const diff = new PNG({width, height});
    
    const pixelDiff = pixelmatch(
      staging.data,
      production.data,
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
