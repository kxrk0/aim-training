#!/usr/bin/env node

/**
 * Post-Build Optimization Script
 * Optimizes the built application and prepares for distribution
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Running post-build optimizations...')

// Paths
const distElectronPath = path.join(__dirname, '../dist-electron')
const clientDistPath = path.join(__dirname, '../client/dist')
const serverDistPath = path.join(__dirname, '../server/dist')

// Ensure directories exist
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
    console.log(`✅ Created directory: ${dirPath}`)
  }
}

// Copy files with error handling
const copyFile = (src, dest) => {
  try {
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest)
      console.log(`✅ Copied: ${src} -> ${dest}`)
    } else {
      console.log(`⚠️  Source file not found: ${src}`)
    }
  } catch (error) {
    console.error(`❌ Error copying ${src}: ${error.message}`)
  }
}

// Copy directory recursively
const copyDir = (src, dest) => {
  try {
    if (!fs.existsSync(src)) {
      console.log(`⚠️  Source directory not found: ${src}`)
      return
    }

    ensureDir(dest)
    
    const files = fs.readdirSync(src)
    files.forEach(file => {
      const srcFile = path.join(src, file)
      const destFile = path.join(dest, file)
      
      if (fs.lstatSync(srcFile).isDirectory()) {
        copyDir(srcFile, destFile)
      } else {
        copyFile(srcFile, destFile)
      }
    })
  } catch (error) {
    console.error(`❌ Error copying directory ${src}: ${error.message}`)
  }
}

// Main post-build process
try {
  console.log('📁 Ensuring build directories exist...')
  ensureDir(distElectronPath)

  // Check if client build exists
  if (fs.existsSync(clientDistPath)) {
    console.log('✅ Client build found')
  } else {
    console.log('⚠️  Client build not found, you may need to run: npm run client:build')
  }

  // Check if server build exists
  if (fs.existsSync(serverDistPath)) {
    console.log('✅ Server build found')
  } else {
    console.log('⚠️  Server build not found, you may need to run: npm run server:build')
  }

  // Create package.json for electron dist
  const electronPackageJson = {
    name: 'aim-trainer-pro',
    version: '1.0.0',
    main: 'main.js',
    description: 'AIM TRAINER PRO Desktop Application',
    author: 'AIM TRAINER PRO Team',
    private: true
  }

  const electronPackagePath = path.join(distElectronPath, 'package.json')
  fs.writeFileSync(electronPackagePath, JSON.stringify(electronPackageJson, null, 2))
  console.log('✅ Created electron package.json')

  // Copy electron files
  const electronSrcPath = path.join(__dirname, '../electron')
  if (fs.existsSync(electronSrcPath)) {
    const electronFiles = ['main.js', 'preload.js', 'renderer.js']
    electronFiles.forEach(file => {
      const srcFile = path.join(electronSrcPath, file)
      const destFile = path.join(distElectronPath, file)
      copyFile(srcFile, destFile)
    })
  }

  // Create version info file
  const versionInfo = {
    version: '1.0.0',
    buildDate: new Date().toISOString(),
    electronVersion: process.versions.electron || 'unknown',
    nodeVersion: process.versions.node || 'unknown',
    platform: process.platform,
    arch: process.arch
  }

  const versionPath = path.join(distElectronPath, 'version.json')
  fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2))
  console.log('✅ Created version info')

  // Set executable permissions on Unix systems
  if (process.platform !== 'win32') {
    try {
      const { execSync } = require('child_process')
      execSync(`chmod +x ${path.join(distElectronPath, 'main.js')}`)
      console.log('✅ Set executable permissions')
    } catch (error) {
      console.log('⚠️  Could not set executable permissions:', error.message)
    }
  }

  console.log('🎉 Post-build optimizations completed successfully!')

} catch (error) {
  console.error('❌ Post-build script failed:', error.message)
  process.exit(1)
} 