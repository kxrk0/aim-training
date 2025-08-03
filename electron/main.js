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

// Configure auto-updater
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true
autoUpdater.checkForUpdatesAndNotify()

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...')
})

autoUpdater.on('update-available', (info) => {
  console.log('Update available.')
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Available',
    message: 'A new version is available. It will be downloaded in the background.',
    detail: `Version ${info.version} is now available. The application will restart to apply the update when ready.`,
    buttons: ['OK']
  })
})

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.')
})

autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater. ' + err)
})

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
  console.log(log_message)
  
  // Update splash screen with progress if it exists
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.send('download-progress', progressObj)
  }
})

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded')
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Ready',
    message: 'Update downloaded successfully.',
    detail: 'The application will restart to apply the update.',
    buttons: ['Restart Now', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall()
    }
  })
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .progress {
          width: 200px;
          height: 4px;
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          background: white;
          width: 0%;
          transition: width 0.3s ease;
        }
        .text {
          margin-top: 10px;
          font-size: 12px;
          opacity: 0.8;
        }
      </style>
    </head>
    <body>
      <div class="logo">AIM TRAINER PRO</div>
      <div class="progress">
        <div class="progress-bar" id="progress-bar"></div>
      </div>
      <div class="text" id="status">Starting...</div>
      <script>
        const { ipcRenderer } = require('electron')
        ipcRenderer.on('download-progress', (event, progress) => {
          document.getElementById('progress-bar').style.width = progress.percent + '%'
          document.getElementById('status').textContent = 'Downloading update: ' + Math.round(progress.percent) + '%'
        })
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

          // Check for updates after window is shown (production only)
    if (!isDev) {
      setTimeout(() => {
        autoUpdater.checkForUpdatesAndNotify()
      }, 3000)
      
      // Set up periodic update checks (every 4 hours)
      setInterval(() => {
        autoUpdater.checkForUpdatesAndNotify()
      }, 4 * 60 * 60 * 1000)
    }
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

// App event handlers
app.whenReady().then(async () => {
  // Create splash screen
  if (!isDev) {
    createSplashWindow()
  }

  // VPS Backend kullanıyoruz - local server başlatma gerekmiyor
  // startBackendServer()
  
  // Create main window - No HTTP server needed
  setTimeout(() => {
    createWindow()
  }, isDev ? 0 : 500)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
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