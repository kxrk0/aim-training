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

// Auto-updater state
let updateCheckInProgress = false
let updateAvailable = false
let downloadInProgress = false

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

// ====================
// MODERN AUTO-UPDATER SYSTEM
// ====================

// Configure auto-updater with modern settings
function configureAutoUpdater() {
  // Basic configuration
  autoUpdater.autoDownload = false // Manual download control
  autoUpdater.autoInstallOnAppQuit = false // Manual install control
  autoUpdater.allowPrerelease = false
  autoUpdater.allowDowngrade = false
  
  // Enhanced error handling
  autoUpdater.logger = {
    info: (message) => console.log(`[AUTO-UPDATER] INFO: ${message}`),
    warn: (message) => console.log(`[AUTO-UPDATER] WARN: ${message}`),
    error: (message) => console.log(`[AUTO-UPDATER] ERROR: ${message}`),
    debug: (message) => console.log(`[AUTO-UPDATER] DEBUG: ${message}`)
  }

  // Set update source
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'kxrk0',
    repo: 'aim-training',
    private: false,
    requestHeaders: {
      'User-Agent': 'AIM-TRAINER-PRO/1.0.0'
    }
  })

  console.log('[AUTO-UPDATER] Configuration completed')
}

// Modern event handlers
function setupAutoUpdaterEvents() {
  // Checking for updates
  autoUpdater.on('checking-for-update', () => {
    console.log('[AUTO-UPDATER] Checking for updates...')
    updateCheckInProgress = true
    sendToRenderer('update-checking')
  })

  // Update available
  autoUpdater.on('update-available', (info) => {
    console.log(`[AUTO-UPDATER] Update available: ${info.version}`)
    updateAvailable = true
    updateCheckInProgress = false
    sendToRenderer('update-available', {
      version: info.version,
      releaseNotes: info.releaseNotes,
      releaseName: info.releaseName,
      releaseDate: info.releaseDate
    })
    
    // Auto-start download
    startUpdateDownload()
  })

  // No update available
  autoUpdater.on('update-not-available', (info) => {
    console.log('[AUTO-UPDATER] No updates available')
    updateCheckInProgress = false
    sendToRenderer('update-not-available', { currentVersion: info.version })
  })

  // Download progress
  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent)
    console.log(`[AUTO-UPDATER] Download progress: ${percent}%`)
    sendToRenderer('update-download-progress', {
      percent: percent,
      bytesPerSecond: progressObj.bytesPerSecond,
      total: progressObj.total,
      transferred: progressObj.transferred
    })
  })

  // Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    console.log(`[AUTO-UPDATER] Update downloaded: ${info.version}`)
    downloadInProgress = false
    sendToRenderer('update-downloaded', {
      version: info.version
    })
    
    // Show install dialog
    showUpdateReadyDialog(info.version)
  })

  // Error handling
  autoUpdater.on('error', (error) => {
    console.error('[AUTO-UPDATER] Error:', error)
    updateCheckInProgress = false
    downloadInProgress = false
    
    let errorMessage = 'Unknown error occurred'
    if (error.message) {
      errorMessage = error.message
    }
    
    sendToRenderer('update-error', { 
      message: errorMessage,
      code: error.code || 'UNKNOWN_ERROR'
    })
  })

  console.log('[AUTO-UPDATER] Event handlers registered')
}

// Send message to renderer safely
function sendToRenderer(channel, data = {}) {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(channel, data)
    }
  } catch (error) {
    console.error(`[AUTO-UPDATER] Failed to send message to renderer: ${error.message}`)
  }
}

// Check for updates with robust error handling
async function checkForUpdates() {
  if (isDev) {
    console.log('[AUTO-UPDATER] Skipping update check in development mode')
    return
  }

  if (updateCheckInProgress) {
    console.log('[AUTO-UPDATER] Update check already in progress')
    return
  }

  try {
    console.log('[AUTO-UPDATER] Starting update check...')
    
    // Test network connectivity first
    const hasNetwork = await testNetworkConnectivity()
    if (!hasNetwork) {
      throw new Error('No network connectivity')
    }

    // Start update check with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Update check timeout')), 30000)
    })

    const updatePromise = autoUpdater.checkForUpdatesAndNotify()
    
    await Promise.race([updatePromise, timeoutPromise])
    
  } catch (error) {
    console.error('[AUTO-UPDATER] Failed to check for updates:', error.message)
    updateCheckInProgress = false
    sendToRenderer('update-error', { 
      message: `Update check failed: ${error.message}`,
      code: 'CHECK_FAILED'
    })
  }
}

// Start update download
async function startUpdateDownload() {
  if (downloadInProgress) {
    console.log('[AUTO-UPDATER] Download already in progress')
    return
  }

  try {
    console.log('[AUTO-UPDATER] Starting update download...')
    downloadInProgress = true
    sendToRenderer('update-download-started')
    
    await autoUpdater.downloadUpdate()
    
  } catch (error) {
    console.error('[AUTO-UPDATER] Download failed:', error.message)
    downloadInProgress = false
    sendToRenderer('update-error', { 
      message: `Download failed: ${error.message}`,
      code: 'DOWNLOAD_FAILED'
    })
  }
}

// Install update
function installUpdate() {
  try {
    console.log('[AUTO-UPDATER] Installing update and restarting...')
    autoUpdater.quitAndInstall(false, true)
  } catch (error) {
    console.error('[AUTO-UPDATER] Install failed:', error.message)
    sendToRenderer('update-error', { 
      message: `Install failed: ${error.message}`,
      code: 'INSTALL_FAILED'
    })
  }
}

// Show update ready dialog
function showUpdateReadyDialog(version) {
  if (!mainWindow || mainWindow.isDestroyed()) return

  const options = {
    type: 'info',
    title: 'Update Ready',
    message: `AIM TRAINER PRO v${version} is ready to install`,
    detail: 'The update has been downloaded and is ready to install. Do you want to restart now?',
    buttons: ['Restart Now', 'Install Later'],
    defaultId: 0,
    cancelId: 1
  }

  dialog.showMessageBox(mainWindow, options).then((result) => {
    if (result.response === 0) {
      installUpdate()
    }
  }).catch((error) => {
    console.error('[AUTO-UPDATER] Dialog error:', error)
  })
}

// Network connectivity test
async function testNetworkConnectivity() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: '/repos/kxrk0/aim-training/releases/latest',
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'AIM-TRAINER-PRO/1.0.0'
      }
    }

    const req = require('https').request(options, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400)
    })

    req.on('error', () => resolve(false))
    req.on('timeout', () => {
      req.destroy()
      resolve(false)
    })

    req.end()
  })
}

// IPC handlers for renderer communication
function setupUpdateIPC() {
  ipcMain.handle('check-for-updates', async () => {
    await checkForUpdates()
  })

  ipcMain.handle('start-update-download', async () => {
    await startUpdateDownload()
  })

  ipcMain.handle('install-update', () => {
    installUpdate()
  })

  ipcMain.handle('get-update-status', () => {
    return {
      checkInProgress: updateCheckInProgress,
      updateAvailable: updateAvailable,
      downloadInProgress: downloadInProgress
    }
  })

  console.log('[AUTO-UPDATER] IPC handlers registered')
}

// Initialize auto-updater system
function initializeAutoUpdater() {
  if (isDev) {
    console.log('[AUTO-UPDATER] Disabled in development mode')
    return
  }

  console.log('[AUTO-UPDATER] Initializing modern auto-updater system...')
  
  configureAutoUpdater()
  setupAutoUpdaterEvents()
  setupUpdateIPC()
  
  // Start initial update check after app is ready
  app.whenReady().then(() => {
    setTimeout(() => {
      checkForUpdates()
    }, 5000) // Wait 5 seconds before first check
    
    // Schedule periodic checks every 30 minutes
    setInterval(() => {
      checkForUpdates()
    }, 30 * 60 * 1000)
  })

  console.log('[AUTO-UPDATER] Initialization completed')
}

// ====================
// END AUTO-UPDATER SYSTEM
// ====================

// ====================
// CUSTOM HTTP UPDATE SYSTEM (GitHub API Direct)
// ====================

const https = require('https')
// fs already imported at top of file
// const path = require('path') - also already imported

// Custom update configuration
const UPDATE_CONFIG = {
  github: {
    owner: 'kxrk0',
    repo: 'aim-training'
  },
  checkInterval: 30000, // 30 seconds
  downloadPath: path.join(app.getPath('temp'), 'aim-trainer-update')
}

// Custom update state
let customUpdateState = {
  checking: false,
  available: false,
  downloading: false,
  version: null,
  downloadUrl: null,
  filePath: null
}

// Custom HTTP update functions
async function checkForCustomUpdates() {
  if (isDev) {
    console.log('[CUSTOM-UPDATER] Skipping in development mode')
    return
  }

  if (customUpdateState.checking) {
    console.log('[CUSTOM-UPDATER] Check already in progress')
    return
  }

  try {
    customUpdateState.checking = true
    console.log('[CUSTOM-UPDATER] Checking for updates via GitHub API...')
    sendToRenderer('update-checking')

    const currentVersion = app.getVersion()
    console.log(`[CUSTOM-UPDATER] Current version: ${currentVersion}`)

    // Get latest release from GitHub API
    const releaseInfo = await fetchLatestRelease()
    
    if (!releaseInfo) {
      throw new Error('Failed to fetch release info')
    }

    const latestVersion = releaseInfo.tag_name.replace('v', '')
    console.log(`[CUSTOM-UPDATER] Latest version: ${latestVersion}`)

    // Compare versions
    if (compareVersions(latestVersion, currentVersion) > 0) {
      // Update available!
      const asset = releaseInfo.assets.find(asset => 
        asset.name.includes('.exe') && asset.name.includes('Setup')
      )

      if (asset) {
        customUpdateState.available = true
        customUpdateState.version = latestVersion
        customUpdateState.downloadUrl = asset.browser_download_url
        
        console.log(`[CUSTOM-UPDATER] Update available: ${latestVersion}`)
        sendToRenderer('update-available', {
          version: latestVersion,
          releaseNotes: releaseInfo.body,
          releaseName: releaseInfo.name,
          releaseDate: releaseInfo.published_at,
          downloadUrl: asset.browser_download_url,
          fileSize: asset.size
        })

        // Auto-start download
        setTimeout(() => startCustomUpdateDownload(), 2000)
      } else {
        throw new Error('No compatible installer found in release')
      }
    } else {
      console.log('[CUSTOM-UPDATER] No updates available')
      sendToRenderer('update-not-available', { currentVersion })
    }

  } catch (error) {
    console.error('[CUSTOM-UPDATER] Check failed:', error.message)
    sendToRenderer('update-error', { 
      message: `Update check failed: ${error.message}`,
      code: 'CUSTOM_CHECK_FAILED'
    })
  } finally {
    customUpdateState.checking = false
  }
}

// Fetch latest release from GitHub API
function fetchLatestRelease() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${UPDATE_CONFIG.github.owner}/${UPDATE_CONFIG.github.repo}/releases/latest`,
      method: 'GET',
      headers: {
        'User-Agent': 'AIM-TRAINER-PRO/1.0.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const releaseInfo = JSON.parse(data)
            resolve(releaseInfo)
          } else {
            reject(new Error(`GitHub API returned ${res.statusCode}: ${data}`))
          }
        } catch (error) {
          reject(new Error(`Failed to parse GitHub API response: ${error.message}`))
        }
      })
    })

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`))
    })

    req.setTimeout(15000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })

    req.end()
  })
}

// Download update file
async function startCustomUpdateDownload() {
  if (!customUpdateState.available || customUpdateState.downloading) {
    return
  }

  try {
    customUpdateState.downloading = true
    console.log('[CUSTOM-UPDATER] Starting download...')
    sendToRenderer('update-download-started')

    // Ensure download directory exists
    if (!fs.existsSync(UPDATE_CONFIG.downloadPath)) {
      fs.mkdirSync(UPDATE_CONFIG.downloadPath, { recursive: true })
    }

    const fileName = `AIM-TRAINER-PRO-Setup-${customUpdateState.version}.exe`
    const filePath = path.join(UPDATE_CONFIG.downloadPath, fileName)
    
    await downloadFile(customUpdateState.downloadUrl, filePath)
    
    customUpdateState.filePath = filePath
    customUpdateState.downloading = false
    
    console.log(`[CUSTOM-UPDATER] Download completed: ${filePath}`)
    sendToRenderer('update-downloaded', {
      version: customUpdateState.version,
      filePath: filePath
    })

    // Show install dialog
    showCustomUpdateDialog()

  } catch (error) {
    console.error('[CUSTOM-UPDATER] Download failed:', error.message)
    customUpdateState.downloading = false
    sendToRenderer('update-error', { 
      message: `Download failed: ${error.message}`,
      code: 'CUSTOM_DOWNLOAD_FAILED'
    })
  }
}

// Download file with progress
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath)
    let totalBytes = 0
    let downloadedBytes = 0

    const request = https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, filePath).then(resolve).catch(reject)
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with status ${response.statusCode}`))
        return
      }

      totalBytes = parseInt(response.headers['content-length'], 10) || 0

      response.on('data', (chunk) => {
        downloadedBytes += chunk.length
        if (totalBytes > 0) {
          const percent = Math.round((downloadedBytes / totalBytes) * 100)
          sendToRenderer('update-download-progress', {
            percent: percent,
            bytesPerSecond: 0, // Could calculate this
            total: totalBytes,
            transferred: downloadedBytes
          })
        }
      })

      response.pipe(file)

      file.on('finish', () => {
        file.close()
        resolve()
      })

      file.on('error', (error) => {
        fs.unlink(filePath, () => {}) // Delete partial file
        reject(error)
      })
    })

    request.on('error', (error) => {
      fs.unlink(filePath, () => {}) // Delete partial file
      reject(error)
    })

    request.setTimeout(60000, () => {
      request.destroy()
      reject(new Error('Download timeout'))
    })
  })
}

// Show custom update dialog
function showCustomUpdateDialog() {
  const { dialog } = require('electron')
  
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Available',
    message: `AIM TRAINER PRO v${customUpdateState.version} is ready to install`,
    detail: 'The application will close and the installer will launch. Your settings will be preserved.',
    buttons: ['Install Now', 'Install Later'],
    defaultId: 0,
    cancelId: 1
  }).then((response) => {
    if (response.response === 0) {
      installCustomUpdate()
    }
  })
}

// Install custom update
function installCustomUpdate() {
  try {
    console.log('[CUSTOM-UPDATER] Installing update...')
    
    if (!customUpdateState.filePath || !fs.existsSync(customUpdateState.filePath)) {
      throw new Error('Update file not found')
    }

    // Launch installer
    const { spawn } = require('child_process')
    spawn(customUpdateState.filePath, [], { 
      detached: true,
      stdio: 'ignore'
    })

    // Quit application
    setTimeout(() => {
      app.quit()
    }, 1000)

  } catch (error) {
    console.error('[CUSTOM-UPDATER] Install failed:', error.message)
    sendToRenderer('update-error', { 
      message: `Install failed: ${error.message}`,
      code: 'CUSTOM_INSTALL_FAILED'
    })
  }
}

// Compare version strings (semver-like)
function compareVersions(version1, version2) {
  const v1parts = version1.split('.').map(Number)
  const v2parts = version2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0
    const v2part = v2parts[i] || 0
    
    if (v1part > v2part) return 1
    if (v1part < v2part) return -1
  }
  
  return 0
}

// IPC handlers for custom updater
function setupCustomUpdateIPC() {
  ipcMain.handle('custom-check-for-updates', () => {
    checkForCustomUpdates()
  })

  ipcMain.handle('custom-download-update', () => {
    if (customUpdateState.available) {
      startCustomUpdateDownload()
    }
  })

  ipcMain.handle('custom-install-update', () => {
    installCustomUpdate()
  })

  console.log('[CUSTOM-UPDATER] IPC handlers registered')
}

// Initialize custom update system
function initializeCustomUpdater() {
  console.log('[CUSTOM-UPDATER] Initializing custom HTTP update system...')
  
  // Setup IPC handlers
  setupCustomUpdateIPC()
  
  // Start periodic checks (only in production)
  if (!isDev) {
    setTimeout(() => {
      checkForCustomUpdates()
    }, 5000) // First check after 5 seconds
    
    setInterval(() => {
      checkForCustomUpdates()
    }, UPDATE_CONFIG.checkInterval)
  }
  
  console.log('[CUSTOM-UPDATER] Custom update system initialized')
}

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

// App event handlers
app.whenReady().then(async () => {
  // Initialize CUSTOM HTTP update system (more reliable than electron-updater)
  initializeCustomUpdater()

  // Create splash screen for production
  if (!isDev) {
    createSplashWindow()
    
    // In production, create main window after splash
    setTimeout(() => {
      if (!mainWindow) {
        createWindow()
      }
    }, 3000)
  } else {
    // Development mode - create window immediately
    createWindow()
  }

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