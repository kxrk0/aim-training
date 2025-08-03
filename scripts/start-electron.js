#!/usr/bin/env node

/**
 * Start Electron Development Script
 * Starts all services and opens Electron app
 */

const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 Starting AIM TRAINER PRO in Development Mode...')

// Check if this is Windows
const isWindows = process.platform === 'win32'
const npmCmd = isWindows ? 'npm.cmd' : 'npm'

// Start backend server
console.log('🔙 Starting backend server...')
const backend = spawn(npmCmd, ['run', 'server:dev'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: isWindows
})

// Wait a bit for backend to start
setTimeout(() => {
  console.log('🎨 Starting frontend client...')
  const frontend = spawn(npmCmd, ['run', 'client:dev'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: isWindows
  })

  // Wait for frontend to start then launch Electron
  setTimeout(() => {
    console.log('🖥️ Launching Electron desktop app...')
    const electron = spawn(npmCmd, ['run', 'electron'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: isWindows
    })

    // Handle process cleanup
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down services...')
      backend.kill()
      frontend.kill()
      electron.kill()
      process.exit(0)
    })

  }, 5000) // Wait 5 seconds for frontend

}, 3000) // Wait 3 seconds for backend

console.log('💡 Tips:')
console.log('   • Frontend: http://localhost:3000')
console.log('   • Backend: http://localhost:3001')
console.log('   • Press Ctrl+C to stop all services')
console.log('   • Use native keyboard shortcuts in the app') 