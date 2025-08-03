import { useState, useEffect, useCallback } from 'react'

// Type definitions for our Electron API
interface ElectronAPI {
  // App information
  getVersion: () => Promise<string>
  getSystemInfo: () => Promise<{
    platform: string
    arch: string
    version: string
    electronVersion: string
  }>

  // Navigation
  onNavigate: (callback: (route: string) => void) => () => void

  // File operations
  showSaveDialog: () => Promise<{ canceled: boolean; filePath?: string }>
  showOpenDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>

  // Auto-updater
  checkForUpdates: () => Promise<boolean>
  onUpdateAvailable: (callback: (info: any) => void) => () => void
  onUpdateDownloaded: (callback: (info: any) => void) => () => void
  onDownloadProgress: (callback: (progress: any) => void) => () => void

  // App control
  restartApp: () => Promise<void>

  // External links
  openExternal: (url: string) => Promise<void>

  // Platform info
  platform: string
  isWindows: boolean
  isMac: boolean
  isLinux: boolean
  isDev: boolean

  // Window controls
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>

  // Theme
  onThemeChanged: (callback: (theme: string) => void) => () => void
}

interface NodeAPI {
  path: {
    join: (...args: string[]) => string
    basename: (path: string) => string
    dirname: (path: string) => string
    extname: (path: string) => string
  }
  os: {
    platform: () => string
    arch: () => string
    release: () => string
    type: () => string
  }
}

interface DevAPI {
  log: (...args: any[]) => void
  error: (...args: any[]) => void
  warn: (...args: any[]) => void
}

interface PerformanceAPI {
  mark: (name: string) => void
  measure: (name: string, startMark?: string, endMark?: string) => void
  getEntriesByType: (type: string) => any[]
  now: () => number
}

interface MemoryAPI {
  getUsage: () => any
  getCpuUsage: () => any
}

// Global electron APIs
declare global {
  interface Window {
    electronAPI?: ElectronAPI
    nodeAPI?: NodeAPI
    devAPI?: DevAPI
    performanceAPI?: PerformanceAPI
    memoryAPI?: MemoryAPI
  }
}

export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false)
  const [appVersion, setAppVersion] = useState<string>('')
  const [systemInfo, setSystemInfo] = useState<any>(null)
  const [updateStatus, setUpdateStatus] = useState<{
    checking: boolean
    available: boolean
    downloading: boolean
    downloaded: boolean
    progress?: number
  }>({
    checking: false,
    available: false,
    downloading: false,
    downloaded: false
  })

  // Check if we're running in Electron
  useEffect(() => {
    const isElectronEnv = !!(window.electronAPI && window.nodeAPI)
    setIsElectron(isElectronEnv)

    if (isElectronEnv) {
      // Get app version
      window.electronAPI!.getVersion().then(setAppVersion).catch(console.error)
      
      // Get system info
      window.electronAPI!.getSystemInfo().then(setSystemInfo).catch(console.error)

      // Setup update listeners
      const unsubscribeUpdateAvailable = window.electronAPI!.onUpdateAvailable((info) => {
        setUpdateStatus(prev => ({ ...prev, available: true, checking: false }))
      })

      const unsubscribeUpdateDownloaded = window.electronAPI!.onUpdateDownloaded((info) => {
        setUpdateStatus(prev => ({ ...prev, downloaded: true, downloading: false }))
      })

      const unsubscribeDownloadProgress = window.electronAPI!.onDownloadProgress((progress) => {
        setUpdateStatus(prev => ({ 
          ...prev, 
          downloading: true, 
          progress: Math.round(progress.percent) 
        }))
      })

      // Cleanup listeners
      return () => {
        unsubscribeUpdateAvailable()
        unsubscribeUpdateDownloaded()
        unsubscribeDownloadProgress()
      }
    }
  }, [])

  // Navigation handler
  const onNavigate = useCallback((callback: (route: string) => void) => {
    if (!window.electronAPI) return () => {}
    return window.electronAPI.onNavigate(callback)
  }, [])

  // File operations
  const showSaveDialog = useCallback(async () => {
    if (!window.electronAPI) return { canceled: true }
    return window.electronAPI.showSaveDialog()
  }, [])

  const showOpenDialog = useCallback(async () => {
    if (!window.electronAPI) return { canceled: true, filePaths: [] }
    return window.electronAPI.showOpenDialog()
  }, [])

  // Update operations
  const checkForUpdates = useCallback(async () => {
    if (!window.electronAPI) return false
    setUpdateStatus(prev => ({ ...prev, checking: true }))
    try {
      const result = await window.electronAPI.checkForUpdates()
      if (!result) {
        setUpdateStatus(prev => ({ ...prev, checking: false }))
      }
      return result
    } catch (error) {
      setUpdateStatus(prev => ({ ...prev, checking: false }))
      return false
    }
  }, [])

  const restartApp = useCallback(async () => {
    if (!window.electronAPI) return
    return window.electronAPI.restartApp()
  }, [])

  // Window controls
  const minimizeWindow = useCallback(async () => {
    if (!window.electronAPI) return
    return window.electronAPI.minimizeWindow()
  }, [])

  const maximizeWindow = useCallback(async () => {
    if (!window.electronAPI) return
    return window.electronAPI.maximizeWindow()
  }, [])

  const closeWindow = useCallback(async () => {
    if (!window.electronAPI) return
    return window.electronAPI.closeWindow()
  }, [])

  // Development utilities
  const devLog = useCallback((...args: any[]) => {
    if (window.devAPI) {
      window.devAPI.log(...args)
    } else {
      console.log(...args)
    }
  }, [])

  const devError = useCallback((...args: any[]) => {
    if (window.devAPI) {
      window.devAPI.error(...args)
    } else {
      console.error(...args)
    }
  }, [])

  const devWarn = useCallback((...args: any[]) => {
    if (window.devAPI) {
      window.devAPI.warn(...args)
    } else {
      console.warn(...args)
    }
  }, [])

  // Performance monitoring
  const performanceMark = useCallback((name: string) => {
    if (window.performanceAPI) {
      window.performanceAPI.mark(name)
    }
  }, [])

  const performanceMeasure = useCallback((name: string, startMark?: string, endMark?: string) => {
    if (window.performanceAPI) {
      window.performanceAPI.measure(name, startMark, endMark)
    }
  }, [])

  // Memory monitoring (development only)
  const getMemoryUsage = useCallback(() => {
    if (window.memoryAPI) {
      return window.memoryAPI.getUsage()
    }
    return null
  }, [])

  const getCpuUsage = useCallback(() => {
    if (window.memoryAPI) {
      return window.memoryAPI.getCpuUsage()
    }
    return null
  }, [])

  // Path utilities
  const pathJoin = useCallback((...args: string[]) => {
    if (window.nodeAPI) {
      return window.nodeAPI.path.join(...args)
    }
    return args.join('/')
  }, [])

  const pathBasename = useCallback((path: string) => {
    if (window.nodeAPI) {
      return window.nodeAPI.path.basename(path)
    }
    return path.split('/').pop() || path
  }, [])

  const pathDirname = useCallback((path: string) => {
    if (window.nodeAPI) {
      return window.nodeAPI.path.dirname(path)
    }
    return path.split('/').slice(0, -1).join('/')
  }, [])

  const pathExtname = useCallback((path: string) => {
    if (window.nodeAPI) {
      return window.nodeAPI.path.extname(path)
    }
    const parts = path.split('.')
    return parts.length > 1 ? '.' + parts.pop() : ''
  }, [])

  return {
    // Status
    isElectron,
    appVersion,
    systemInfo,
    updateStatus,
    
    // Platform info
    platform: window.electronAPI?.platform || 'web',
    isWindows: window.electronAPI?.isWindows || false,
    isMac: window.electronAPI?.isMac || false,
    isLinux: window.electronAPI?.isLinux || false,
    isDev: window.electronAPI?.isDev || false,

    // Navigation
    onNavigate,

    // File operations
    showSaveDialog,
    showOpenDialog,

    // Update operations
    checkForUpdates,
    restartApp,

    // Window controls
    minimizeWindow,
    maximizeWindow,
    closeWindow,

    // Development utilities
    devLog,
    devError,
    devWarn,

    // Performance monitoring
    performanceMark,
    performanceMeasure,

    // Memory monitoring
    getMemoryUsage,
    getCpuUsage,

    // Path utilities
    pathJoin,
    pathBasename,
    pathDirname,
    pathExtname,

    // Raw APIs (for advanced usage)
    electronAPI: window.electronAPI,
    nodeAPI: window.nodeAPI,
    devAPI: window.devAPI,
    performanceAPI: window.performanceAPI,
    memoryAPI: window.memoryAPI
  }
}

export default useElectron 