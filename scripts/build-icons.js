#!/usr/bin/env node

/**
 * Build Icons Script
 * Generates proper icon files for Electron app distribution
 */

const fs = require('fs')
const path = require('path')

console.log('🎯 Building AIM TRAINER PRO Icons...')

// Create a simple SVG icon as base
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ef4444;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background Circle -->
  <circle cx="256" cy="256" r="240" fill="url(#grad1)" stroke="#ffffff" stroke-width="8"/>
  
  <!-- Crosshair -->
  <g stroke="#ffffff" stroke-width="12" stroke-linecap="round">
    <!-- Horizontal line -->
    <line x1="156" y1="256" x2="356" y2="256" />
    <!-- Vertical line -->
    <line x1="256" y1="156" x2="256" y2="356" />
  </g>
  
  <!-- Center dot -->
  <circle cx="256" cy="256" r="16" fill="#ffffff" />
  
  <!-- Outer rings for precision -->
  <circle cx="256" cy="256" r="100" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.6"/>
  <circle cx="256" cy="256" r="140" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.4"/>
  
  <!-- Target numbers -->
  <text x="256" y="120" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="24" font-weight="bold">AIM</text>
  <text x="256" y="420" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="24" font-weight="bold">PRO</text>
</svg>
`.trim()

// Ensure assets directory exists
const assetsDir = path.join(__dirname, '../assets')
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true })
}

// Write SVG file
const svgPath = path.join(assetsDir, 'icon.svg')
fs.writeFileSync(svgPath, svgIcon)
console.log('✅ Created base SVG icon')

// Create placeholder files for different formats
const placeholders = [
  { file: 'icon.png', desc: 'PNG icon (512x512)' },
  { file: 'icon.ico', desc: 'Windows ICO icon' },
  { file: 'icon.icns', desc: 'macOS ICNS icon' },
  { file: 'icon@2x.png', desc: 'High-DPI PNG icon (1024x1024)' }
]

placeholders.forEach(({ file, desc }) => {
  const filePath = path.join(assetsDir, file)
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `# ${desc}\n# Replace this placeholder with actual icon file\n`)
    console.log(`📄 Created placeholder: ${file}`)
  }
})

console.log('\n🎨 Icon generation complete!')
console.log('\n📝 Next steps:')
console.log('1. Use the SVG as base to create proper icon files')
console.log('2. Generate PNG files at multiple resolutions (16x16, 32x32, 64x64, 128x128, 256x256, 512x512)')
console.log('3. Convert PNG to ICO for Windows using online tools or ImageMagick')
console.log('4. Convert PNG to ICNS for macOS using iconutil or online tools')
console.log('\n🛠️  Recommended tools:')
console.log('- Online: https://convertio.co/png-ico/')
console.log('- ImageMagick: convert icon.png icon.ico')
console.log('- macOS iconutil: iconutil -c icns icon.iconset')

module.exports = { svgIcon } 