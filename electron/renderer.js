// Electron renderer utilities for the main app

// Check if running in Electron
export const isElectron = () => {
  return window.electronAPI && window.electronAPI.isElectron
}

// Get platform info
export const getPlatform = () => {
  return window.electronAPI ? window.electronAPI.platform : 'web'
}

// Get app version
export const getAppVersion = async () => {
  if (window.electronAPI) {
    return await window.electronAPI.getAppVersion()
  }
  return 'Web Version'
}

// File operations
export const showSaveDialog = async () => {
  if (window.electronAPI) {
    return await window.electronAPI.showSaveDialog()
  }
  return null
}

export const showOpenDialog = async () => {
  if (window.electronAPI) {
    return await window.electronAPI.showOpenDialog()
  }
  return null
}

// Navigation listener
export const onElectronNavigate = (callback) => {
  if (window.electronAPI) {
    window.electronAPI.onNavigate(callback)
  }
}

// Keyboard shortcuts for Electron
export const setupElectronShortcuts = () => {
  if (!isElectron()) return

  document.addEventListener('keydown', (e) => {
    const isMac = getPlatform() === 'darwin'
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

    // F11 for fullscreen toggle
    if (e.key === 'F11') {
      e.preventDefault()
      // Fullscreen is handled by Electron menu
    }

    // ESC to exit fullscreen
    if (e.key === 'Escape') {
      // Let the app handle ESC naturally
    }
  })
} 