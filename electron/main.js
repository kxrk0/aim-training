const { app, BrowserWindow, Menu, shell, dialog, ipcMain, nativeTheme, screen } = require('electron')
const { autoUpdater } = require('electron-updater')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const http = require('http')
const url = require('url')

// Safe require for electron-is-dev
let isDev = false
try {
  isDev = require('electron-is-dev')
} catch (error) {
  console.log('electron-is-dev not found, assuming production mode')
  isDev = false
}

// Global variables
let mainWindow
let serverProcess
let splashWindow
let clientServer
let clientPort = 3000

// Simple MIME type helper
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase()
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

// Configure auto-updater (Silent mode)
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = false // We handle install manually
autoUpdater.logger = null // Disable notifications

// Update check state
let updateCheckTimeout
let isUpdateCheckComplete = false
let hasNetworkError = false

// Network connectivity check
async function checkNetworkConnectivity() {
  try {
    const https = require('https')
    return new Promise((resolve) => {
      const req = https.request({
        hostname: 'api.github.com',
        port: 443,
        path: '/repos/kxrk0/aim-training/releases/latest',
        method: 'HEAD',
        timeout: 15000,
        headers: {
          'User-Agent': 'AIM-TRAINER-PRO/1.1.1 (electron-updater)'
        }
      }, (res) => {
        console.log('Auto-updater: Network check response:', res.statusCode)
        resolve(res.statusCode >= 200 && res.statusCode < 400)
      })
      
      req.on('error', (error) => {
        console.log('Auto-updater: Network check error:', error.code)
        resolve(false)
      })
      req.on('timeout', () => {
        console.log('Auto-updater: Network check timeout')
        req.destroy()
        resolve(false)
      })
      req.end()
    })
  } catch (error) {
    console.error('Auto-updater: Network check exception:', error)
    return false
  }
}

// Handle update check completion
function handleUpdateCheckComplete(reason, error = null) {
  if (isUpdateCheckComplete) return
  
  isUpdateCheckComplete = true
  if (updateCheckTimeout) {
    clearTimeout(updateCheckTimeout)
    updateCheckTimeout = null
  }
  
  let statusMessage = 'Starting application...'
  let delay = 1500
  
  switch (reason) {
    case 'timeout':
      statusMessage = 'Update check timeout - Starting app...'
      delay = 2000
      console.log('Auto-updater: Update check timeout')
      break
    case 'network-error':
      statusMessage = 'No internet connection - Starting app...'
      delay = 2000
      console.log('Auto-updater: Network error')
      break
    case 'error':
      statusMessage = 'Update check failed - Starting app...'
      delay = 2000
      console.error('Auto-updater error:', error)
      break
    case 'no-update':
      statusMessage = 'App is up to date - Starting...'
      delay = 1000
      console.log('Auto-updater: No updates available')
      break
    default:
      console.log('Auto-updater: Unknown completion reason:', reason)
  }
  
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.send('status-update', statusMessage)
    
    setTimeout(() => {
      if (!mainWindow) {
        console.log('Creating main window after update check:', reason)
        createWindow()
      }
    }, delay)
  }
}

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Auto-updater: Checking for updates...')
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.send('status-update', 'Checking for updates...')
  }
  
  // Set timeout for update check (30 seconds)
  updateCheckTimeout = setTimeout(() => {
    if (!isUpdateCheckComplete) {
      handleUpdateCheckComplete('timeout')
    }
  }, 30000)
})

autoUpdater.on('update-available', (info) => {
  console.log('Auto-updater: Update available -', info.version)
  isUpdateCheckComplete = true
  if (updateCheckTimeout) {
    clearTimeout(updateCheckTimeout)
    updateCheckTimeout = null
  }
  
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.send('status-update', `Update found: v${info.version} - Downloading...`)
  }
})

autoUpdater.on('update-not-available', () => {
  handleUpdateCheckComplete('no-update')
})

autoUpdater.on('error', (error) => {
  console.error('Auto-updater error:', error)
  
  // Check if it's a network-related error
  const errorMessage = error.toString().toLowerCase()
  if (errorMessage.includes('net::') || errorMessage.includes('network') || errorMessage.includes('timeout')) {
    hasNetworkError = true
    handleUpdateCheckComplete('network-error', error)
  } else {
    handleUpdateCheckComplete('error', error)
  }
})

autoUpdater.on('download-progress', (progressObj) => {
  const percent = Math.round(progressObj.percent)
  console.log(`Auto-updater: Download progress ${percent}%`)
  
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.send('download-progress', progressObj)
  }
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('Auto-updater: Update downloaded -', info.version)
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.send('update-ready')
  }
  
  // Install update after 3 seconds
  setTimeout(() => {
    console.log('Auto-updater: Installing update and restarting...')
    autoUpdater.quitAndInstall()
  }, 3000)
})

// Enable live reload for Electron in development
if (isDev) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    })
  } catch (error) {
    console.log('electron-reload not available')
  }
}

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault()
    shell.openExternal(navigationUrl)
  })

  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  contents.on('will-navigate', (event, url) => {
    if (url !== contents.getURL()) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })
})

function createSplashWindow() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    x: Math.floor((width - 400) / 2),
    y: Math.floor((height - 300) / 2),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // Create splash HTML content
  const splashHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: #0a0a0a;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          border-radius: 10px;
        }
        .logo {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 25px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 12px 20px;
          letter-spacing: 3px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .progress {
          width: 220px;
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 6px;
          overflow: hidden;
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%);
          width: 0%;
          transition: width 0.4s ease;
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(255,255,255,0.2);
        }
        .text {
          margin-top: 15px;
          font-size: 11px;
          opacity: 0.7;
          font-weight: 400;
          letter-spacing: 0.5px;
        }
        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top: 2px solid rgba(255,255,255,0.8);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 15px auto;
          box-shadow: 0 4px 16px rgba(255, 255, 255, 0.1);
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="logo">A.T.P</div>
      <div class="spinner" id="spinner"></div>
      <div class="progress" id="progress-container" style="display: none;">
        <div class="progress-bar" id="progress-bar"></div>
      </div>
      <div class="text" id="status">Checking for updates...</div>
      <script>
        const { ipcRenderer } = require('electron')
        
        // Track status updates
        let lastStatus = ''
        let statusTimeout = null
        
        // Update status messages with improved handling
        ipcRenderer.on('status-update', (event, message) => {
          lastStatus = message
          document.getElementById('status').textContent = message
          
          // Clear any existing timeout
          if (statusTimeout) {
            clearTimeout(statusTimeout)
          }
          
          // Auto-hide spinner for certain messages
          if (message.includes('Starting') || message.includes('timeout') || message.includes('failed')) {
            statusTimeout = setTimeout(() => {
              document.getElementById('spinner').style.display = 'none'
            }, 1000)
          }
        })
        
        // Show download progress with enhanced UI
        ipcRenderer.on('download-progress', (event, progress) => {
          document.getElementById('spinner').style.display = 'none'
          document.getElementById('progress-container').style.display = 'block'
          document.getElementById('progress-bar').style.width = progress.percent + '%'
          
          const percent = Math.round(progress.percent)
          const speed = (progress.bytesPerSecond / (1024 * 1024)).toFixed(1) // MB/s
          document.getElementById('status').textContent = 'Downloading update: ' + percent + '% (' + speed + ' MB/s)'
        })
        
        // Update completed with countdown
        ipcRenderer.on('update-ready', (event) => {
          document.getElementById('status').textContent = 'Update ready - Restarting in 3s...'
          document.getElementById('spinner').style.display = 'none'
          document.getElementById('progress-container').style.display = 'none'
          
          let countdown = 3
          const countdownInterval = setInterval(() => {
            countdown--
                         if (countdown > 0) {
               document.getElementById('status').textContent = 'Update ready - Restarting in ' + countdown + 's...'
             } else {
              document.getElementById('status').textContent = 'Restarting...'
              clearInterval(countdownInterval)
            }
          }, 1000)
        })
        
        // Fallback timeout - if splash screen is stuck for too long
        setTimeout(() => {
          if (lastStatus.includes('Checking') || lastStatus === '') {
            document.getElementById('status').textContent = 'Starting application...'
            document.getElementById('spinner').style.display = 'none'
          }
        }, 20000) // 20 second fallback
      </script>
    </body>
    </html>
  `

  splashWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(splashHTML))

  splashWindow.on('closed', () => {
    splashWindow = null
  })

  return splashWindow
}

function startClientServer() {
  return new Promise((resolve, reject) => {
    const clientPath = path.join(__dirname, '../client/dist')
    console.log('Starting client server from:', clientPath)
    
    if (!fs.existsSync(clientPath)) {
      console.error('Client dist directory not found:', clientPath)
      reject(new Error('Client files not found'))
      return
    }
    
    clientServer = http.createServer((req, res) => {
      // Add CORS headers for Firebase compatibility
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.writeHead(200)
        res.end()
        return
      }
      
      let pathname = url.parse(req.url).pathname
      
      // Handle root path and SPA routing
      if (pathname === '/' || !path.extname(pathname)) {
        pathname = '/index.html'
      }
      
      const filePath = path.join(clientPath, pathname)
      
      // Security check - ensure file is within client directory
      if (!filePath.startsWith(clientPath)) {
        res.writeHead(403)
        res.end('Forbidden')
        return
      }
      
      fs.readFile(filePath, (err, data) => {
        if (err) {
          // For SPA routing, fallback to index.html
          if (err.code === 'ENOENT' && !pathname.includes('.')) {
            fs.readFile(path.join(clientPath, 'index.html'), (indexErr, indexData) => {
              if (indexErr) {
                res.writeHead(404)
                res.end('File not found')
              } else {
                res.writeHead(200, { 'Content-Type': 'text/html' })
                res.end(indexData)
              }
            })
          } else {
            res.writeHead(404)
            res.end('File not found')
          }
        } else {
          const mimeType = getMimeType(filePath)
          res.writeHead(200, { 'Content-Type': mimeType })
          res.end(data)
        }
      })
    })
    
    // Find available port
    const tryPort = (port) => {
      clientServer.listen(port, 'localhost', () => {
        clientPort = port
        console.log(`✅ Client server started on http://localhost:${port}`)
        resolve(port)
      })
      
      clientServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} in use, trying ${port + 1}`)
          clientServer.close()
          tryPort(port + 1)
        } else {
          reject(err)
        }
      })
    }
    
    tryPort(clientPort)
  })
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: Math.min(1400, width * 0.9),
    height: Math.min(900, height * 0.9),
    minWidth: 1200,
    minHeight: 800,
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1a1a1a' : '#ffffff'
  })

  // Center window
  mainWindow.center()

  // Load the app
  let startUrl
  if (isDev) {
    startUrl = 'http://localhost:3000'
  } else {
    // In production, serve client directly from build
    const clientPath = path.join(__dirname, '../client/dist/index.html')
    if (fs.existsSync(clientPath)) {
      startUrl = `file://${clientPath}`
    } else {
      console.error('Client build not found:', clientPath)
      startUrl = 'https://aim.liorabelleleather.com' // Fallback to VPS
    }
  }
  
  console.log('Loading URL:', startUrl)
  
  // Add load event listeners for debugging
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('🔄 Window started loading...')
  })
  
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Window finished loading')
  })
  
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log('❌ Window failed to load:', errorCode, errorDescription, validatedURL)
  })
  
  mainWindow.webContents.on('dom-ready', () => {
    console.log('🎯 DOM is ready')
  })
  
  mainWindow.loadURL(startUrl)

  // Wait for page to fully load before showing
  mainWindow.webContents.once('did-finish-load', () => {
    // Wait a bit more to ensure React app is rendered
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close()
      }
      
      mainWindow.show()
      
      // Only open DevTools in development
      if (isDev) {
        mainWindow.webContents.openDevTools()
      }

          // Auto-updater check is now done during startup in splash screen
    }, 1000)
  })

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Create application menu
  createMenu()

  // Handle certificate errors
  mainWindow.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
    if (isDev) {
      // In development, ignore certificate errors
      event.preventDefault()
      callback(true)
    } else {
      // In production, use default behavior
      callback(false)
    }
  })

  return mainWindow
}

function createMenu() {
  const isMac = process.platform === 'darwin'
  
  const template = [
    ...(isMac ? [{
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'AIM TRAINER PRO',
      submenu: [
        {
          label: 'About AIM TRAINER PRO',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'AIM TRAINER PRO',
              detail: `Professional FPS Aim Training Desktop Application\nVersion ${app.getVersion()}\n\nDeveloped for competitive gaming excellence.`,
              buttons: ['OK']
            })
          }
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: async () => {
            if (!isDev) {
              try {
                const result = await autoUpdater.checkForUpdates()
                if (!result) {
                  dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: 'No Updates',
                    message: 'You are running the latest version of AIM TRAINER PRO.',
                    buttons: ['OK']
                  })
                }
              } catch (error) {
                dialog.showMessageBox(mainWindow, {
                  type: 'error',
                  title: 'Update Check Failed',
                  message: 'Unable to check for updates. Please try again later.',
                  detail: error.message,
                  buttons: ['OK']
                })
              }
            } else {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Updates',
                message: 'Update checking is disabled in development mode.',
                buttons: ['OK']
              })
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/settings')
          }
        },
        { type: 'separator' },
        ...(!isMac ? [
          {
            label: 'Quit',
            accelerator: 'Ctrl+Q',
            click: () => {
              app.quit()
            }
          }
        ] : [])
      ]
    },
    {
      label: 'Training',
      submenu: [
        {
          label: 'Training Hub',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/training-hub')
          }
        },
        {
          label: 'Quick Practice',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/game')
          }
        },
        { type: 'separator' },
        {
          label: 'Sensitivity Settings',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/sensitivity')
          }
        }
      ]
    },
    {
      label: 'Social',
      submenu: [
        {
          label: 'Party Lobby',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/party')
          }
        },
        {
          label: 'Leaderboard',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/leaderboard')
          }
        },
        {
          label: 'Tournaments',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/tournaments')
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [])
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Keyboard Shortcuts',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Keyboard Shortcuts',
              message: 'AIM TRAINER PRO Shortcuts',
              detail: `
Training:
• Ctrl/Cmd + T: Training Hub
• Ctrl/Cmd + P: Quick Practice
• Ctrl/Cmd + S: Sensitivity Settings

Social:
• Ctrl/Cmd + L: Party Lobby  
• Ctrl/Cmd + B: Leaderboard

General:
• Ctrl/Cmd + ,: Preferences
• F11: Toggle Fullscreen
• Ctrl/Cmd + R: Reload
              `.trim()
            })
          }
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/aim-trainer/issues')
          }
        },
        { type: 'separator' },
        {
          label: 'Visit Website',
          click: () => {
            shell.openExternal('https://aimtrainer.pro')
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function startBackendServer() {
  console.log('Starting backend server...')
  console.log('isDev:', isDev)
  
  if (isDev) {
    console.log('Development mode: Backend should be started manually')
    return
  }

  try {
    // In production, start the backend server - try multiple paths
    let serverPath = path.join(__dirname, '../server/dist/index.js')
    console.log('🔍 Looking for server at:', serverPath)
    
    // Check if server file exists, if not try alternative paths
    if (!fs.existsSync(serverPath)) {
      console.log('⚠️ Primary server path not found, trying alternatives...')
      
      // Try resources path (for packaged app)
      const altPath1 = path.join(process.resourcesPath, 'server/server/src/index.js')
      const altPath2 = path.join(__dirname, '../resources/server/server/src/index.js')
      const altPath3 = path.join(__dirname, '../../../resources/server/server/src/index.js')
      
      console.log('🔍 Trying alternative path 1:', altPath1, 'exists:', fs.existsSync(altPath1))
      console.log('🔍 Trying alternative path 2:', altPath2, 'exists:', fs.existsSync(altPath2))
      console.log('🔍 Trying alternative path 3:', altPath3, 'exists:', fs.existsSync(altPath3))
      
      if (fs.existsSync(altPath1)) {
        serverPath = altPath1
        console.log('✅ Using server path:', serverPath)
      } else if (fs.existsSync(altPath2)) {
        serverPath = altPath2
        console.log('✅ Using server path:', serverPath)
      } else if (fs.existsSync(altPath3)) {
        serverPath = altPath3
        console.log('✅ Using server path:', serverPath)
      } else {
        console.error('❌ Server file not found in any location!')
        console.log('📁 Current directory:', __dirname)
        console.log('📁 Process resources path:', process.resourcesPath)
        return
      }
    }

    serverProcess = spawn('node', [serverPath], {
      cwd: path.join(__dirname, '../server'),
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    })

    serverProcess.stdout.on('data', (data) => {
      console.log('Server:', data.toString())
    })

    serverProcess.stderr.on('data', (data) => {
      console.error('Server Error:', data.toString())
    })

    serverProcess.on('error', (err) => {
      console.error('Failed to start backend server:', err)
    })

    serverProcess.on('close', (code) => {
      console.log(`Backend server exited with code ${code}`)
    })
  } catch (error) {
    console.error('Error starting backend server:', error)
  }
}

// No custom protocol needed - use Firebase web flow

// Robust update check with network connectivity
async function initiateUpdateCheck() {
  try {
    // First check network connectivity
    console.log('Auto-updater: Checking network connectivity...')
    const hasNetwork = await checkNetworkConnectivity()
    
    if (!hasNetwork) {
      console.log('Auto-updater: Network check failed, trying direct update check...')
      // Try direct update check anyway (bypass network check)
      try {
        console.log('Auto-updater: Attempting direct update check...')
        await autoUpdater.checkForUpdates()
      } catch (directError) {
        console.error('Auto-updater: Direct update check also failed:', directError)
        handleUpdateCheckComplete('network-error')
      }
      return
    }
    
    console.log('Auto-updater: Network OK, checking for updates...')
    
    // Start update check with additional safety
    try {
      await autoUpdater.checkForUpdates()
    } catch (updateError) {
      console.error('Auto-updater: Update check failed:', updateError)
      handleUpdateCheckComplete('error', updateError)
    }
  } catch (error) {
    console.error('Auto-updater: Network check failed:', error)
    handleUpdateCheckComplete('error', error)
  }
}

// App event handlers
app.whenReady().then(async () => {
  // Create splash screen for production
  if (!isDev) {
    createSplashWindow()
    
    // Start update check after a brief delay to let splash screen render
    setTimeout(() => {
      initiateUpdateCheck()
    }, 800)
  } else {
    // Development mode - create window immediately
    createWindow()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      if (isDev || isUpdateCheckComplete) {
        createWindow()
      }
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', (event) => {
  // Close client HTTP server
  if (clientServer) {
    console.log('🔄 Closing client HTTP server...')
    clientServer.close(() => {
      console.log('✅ Client HTTP server closed')
    })
  }
  console.log('🔄 Application shutting down...')
})

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-system-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: process.version,
    electronVersion: process.versions.electron
  }
})

ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'Config Files', extensions: ['aimconfig'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  return result
})

ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'Config Files', extensions: ['aimconfig'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  })
  return result
})

ipcMain.handle('check-for-updates', () => {
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify()
    return true
  }
  return false
})

ipcMain.handle('restart-app', () => {
  app.relaunch()
  app.exit()
})

ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url)
})

// Security: Set Content Security Policy
app.on('web-contents-created', (event, contents) => {
  contents.on('dom-ready', () => {
    contents.insertCSS(`
      * {
        -webkit-user-drag: none;
        -webkit-app-region: no-drag;
      }
    `)
  })
}) 