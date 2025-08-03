import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Navigation } from './Navigation'
import { useElectron } from '@/hooks/useElectron'

export function Layout() {
  const { isElectron, platform, appVersion } = useElectron()
  
  console.log('🏗️ Layout rendering, isElectron:', isElectron)

  useEffect(() => {
    // Set body class for platform-specific styling
    if (isElectron) {
      document.body.classList.add('electron-app', `platform-${platform}`)
      document.title = `AIM TRAINER PRO v${appVersion}`
    }

    return () => {
      document.body.classList.remove('electron-app', `platform-${platform}`)
    }
  }, [isElectron, platform, appVersion])

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 ${isElectron ? 'electron-layout' : ''}`}>
      {/* Electron title bar spacer for macOS */}
      {isElectron && platform === 'darwin' && (
        <div className="h-8 bg-black/20 drag-region" />
      )}
      
      <Navigation />
      
      <main className={`transition-all duration-300 ${isElectron ? 'electron-main' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.4, 0, 0.2, 1],
            staggerChildren: 0.1 
          }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Electron status bar */}
      {isElectron && (
        <div className="fixed bottom-0 right-0 p-2 text-xs text-gray-400 bg-black/20 rounded-tl-lg">
          🖥️ Desktop v{appVersion} • {platform}
        </div>
      )}

      {/* Platform-specific styles */}
      {isElectron && (
        <style>
          {`
            .electron-layout {
              border-radius: 0;
            }
            
            .drag-region {
              -webkit-app-region: drag;
            }
            
            .electron-main {
              padding-top: ${platform === 'darwin' ? '0' : '0'};
            }
            
            .platform-darwin .electron-layout {
              padding-top: 28px;
            }
            
            .platform-win32 .electron-layout {
              /* Windows specific styles */
            }
            
            .platform-linux .electron-layout {
              /* Linux specific styles */
            }
          `}
        </style>
      )}
    </div>
  )
} 