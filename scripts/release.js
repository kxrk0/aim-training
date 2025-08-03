#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('🚀 AIM TRAINER PRO Release Helper\n');

  // Get current version
  const currentVersion = require('../package.json').version;
  console.log(`Current version: ${currentVersion}`);

  // Ask for new version
  const newVersion = await ask('Enter new version (e.g., 1.0.1): ');
  
  if (!newVersion.match(/^\d+\.\d+\.\d+$/)) {
    console.error('❌ Invalid version format! Use semantic versioning (e.g., 1.0.1)');
    process.exit(1);
  }

  console.log(`\n📝 Release Summary:`);
  console.log(`   Old Version: ${currentVersion}`);
  console.log(`   New Version: ${newVersion}`);

  const confirm = await ask('\nProceed with release? (y/N): ');
  
  if (confirm.toLowerCase() !== 'y') {
    console.log('❌ Release cancelled');
    process.exit(0);
  }

  try {
    console.log('\n🔄 Starting release process...\n');

    // Update version in package.json
    console.log('1. Updating package.json version...');
    execSync(`npm version ${newVersion} --no-git-tag-version`, { stdio: 'inherit' });

    // Commit changes
    console.log('2. Committing version changes...');
    execSync('git add package.json', { stdio: 'inherit' });
    execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });

    // Create and push tag
    console.log('3. Creating and pushing git tag...');
    execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    execSync(`git push origin v${newVersion}`, { stdio: 'inherit' });

    console.log('\n✅ Release process completed!');
    console.log(`\n🔗 GitHub Actions will automatically:`);
    console.log(`   • Build the Electron app`);
    console.log(`   • Create GitHub release`);
    console.log(`   • Upload installers`);
    console.log(`   • Configure auto-updater`);
    
    console.log(`\n📦 Release will be available at:`);
    console.log(`   https://github.com/kxrk0/aim-training/releases/tag/v${newVersion}`);

  } catch (error) {
    console.error('\n❌ Release failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch(console.error); 