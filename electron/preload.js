const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // Navigation
  onNavigate: (callback) => {
    const subscription = (event, route) => callback(route)
    ipcRenderer.on('navigate-to', subscription)
    
    return () => {
      ipcRenderer.removeListener('navigate-to', subscription)
    }
  },

  // File operations
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),

  // Auto-updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  onUpdateAvailable: (callback) => {
    const subscription = (event, info) => callback(info)
    ipcRenderer.on('update-available', subscription)
    
    return () => {
      ipcRenderer.removeListener('update-available', subscription)
    }
  },
  onUpdateDownloaded: (callback) => {
    const subscription = (event, info) => callback(info)
    ipcRenderer.on('update-downloaded', subscription)
    
    return () => {
      ipcRenderer.removeListener('update-downloaded', subscription)
    }
  },
  onDownloadProgress: (callback) => {
    const subscription = (event, progress) => callback(progress)
    ipcRenderer.on('download-progress', subscription)
    
    return () => {
      ipcRenderer.removeListener('download-progress', subscription)
    }
  },

  // App control
  restartApp: () => ipcRenderer.invoke('restart-app'),

  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Platform info
  platform: process.platform,
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux',

  // Environment
  isDev: process.env.NODE_ENV === 'development',

  // Window controls (for custom title bar if needed)
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  // Theme
  onThemeChanged: (callback) => {
    const subscription = (event, theme) => callback(theme)
    ipcRenderer.on('theme-changed', subscription)
    
    return () => {
      ipcRenderer.removeListener('theme-changed', subscription)
    }
  }
})

// Expose a limited set of Node.js APIs for specific use cases
contextBridge.exposeInMainWorld('nodeAPI', {
  // Path utilities (safe subset)
  path: {
    join: (...args) => require('path').join(...args),
    basename: (path) => require('path').basename(path),
    dirname: (path) => require('path').dirname(path),
    extname: (path) => require('path').extname(path)
  },

  // OS info (read-only)
  os: {
    platform: () => require('os').platform(),
    arch: () => require('os').arch(),
    release: () => require('os').release(),
    type: () => require('os').type()
  }
})

// Security: Remove Node.js APIs from window object
window.nodeRequire = undefined
window.require = undefined
window.exports = undefined
window.module = undefined

// Custom console for development
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('devAPI', {
    log: (...args) => console.log('[Renderer]', ...args),
    error: (...args) => console.error('[Renderer]', ...args),
    warn: (...args) => console.warn('[Renderer]', ...args)
  })
}

// Performance monitoring
contextBridge.exposeInMainWorld('performanceAPI', {
  mark: (name) => performance.mark(name),
  measure: (name, startMark, endMark) => performance.measure(name, startMark, endMark),
  getEntriesByType: (type) => performance.getEntriesByType(type),
  now: () => performance.now()
})

// Memory usage (for development)
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('memoryAPI', {
    getUsage: () => process.memoryUsage(),
    getCpuUsage: () => process.cpuUsage()
  })
}

console.log('Preload script loaded successfully')

// Initialize performance monitoring
performance.mark('preload-end') 