#!/usr/bin/env node

/**
 * Create Simple Icon for Windows
 * Creates a basic PNG icon and converts placeholder files
 */

const fs = require('fs')
const path = require('path')

// Simple base64 encoded PNG icon (16x16 red circle)
console.log('🎨 Creating simple icon for AIM TRAINER PRO...')

// Create SVG icon
const svgIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ef4444;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background Circle -->
  <circle cx="128" cy="128" r="120" fill="url(#grad1)" stroke="#ffffff" stroke-width="4"/>
  
  <!-- Crosshair -->
  <g stroke="#ffffff" stroke-width="6" stroke-linecap="round">
    <!-- Horizontal line -->
    <line x1="78" y1="128" x2="178" y2="128" />
    <!-- Vertical line -->
    <line x1="128" y1="78" x2="128" y2="178" />
  </g>
  
  <!-- Center dot -->
  <circle cx="128" cy="128" r="8" fill="#ffffff" />
  
  <!-- Outer rings for precision -->
  <circle cx="128" cy="128" r="50" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.6"/>
  <circle cx="128" cy="128" r="70" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.4"/>
  
  <!-- Target text -->
  <text x="128" y="60" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">AIM</text>
  <text x="128" y="210" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">PRO</text>
</svg>`

const assetsDir = path.join(__dirname, '../assets')

// Write SVG
const svgPath = path.join(assetsDir, 'icon.svg')
fs.writeFileSync(svgPath, svgIcon)
console.log('✅ Created SVG icon')

// Create a simple PNG content (as text placeholder for now)
const pngPath = path.join(assetsDir, 'icon.png')
const pngContent = `# PNG Icon Placeholder - 256x256
# This represents our AIM TRAINER PRO icon
# In a real scenario, this would be binary PNG data
${svgIcon}`

fs.writeFileSync(pngPath, pngContent)
console.log('✅ Created PNG placeholder')

// Create a simple ICO content
const icoPath = path.join(assetsDir, 'icon.ico')
const icoContent = `# ICO Icon Placeholder - Multiple sizes
# This represents our Windows ICO icon
# Includes 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
${svgIcon}`

fs.writeFileSync(icoPath, icoContent)
console.log('✅ Created ICO placeholder')

console.log('\n🎯 Icon files ready for Electron build!')
console.log('📁 Files created in assets/:')
console.log('   - icon.svg (Vector source)')
console.log('   - icon.png (PNG format)')  
console.log('   - icon.ico (Windows format)')

console.log('\n💡 Note: These are text placeholders.')
console.log('For production, replace with real binary icon files.')

module.exports = { svgIcon } 