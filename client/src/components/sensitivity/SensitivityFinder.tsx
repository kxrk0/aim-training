import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { useSensitivityStore } from '../../stores/sensitivityStore'
import { useAuthStore } from '../../stores/authStore'
import { SensitivityTestPanel } from './SensitivityTestPanel'
import { SensitivityResults } from './SensitivityResults'
import { SensitivityConversion } from './SensitivityConversion'
import { SensitivityHistory } from './SensitivityHistory'
import { SensitivitySettings } from './SensitivitySettings'
import { SensitivityNavigation } from './SensitivityNavigation'
import { 
  FaBullseye, 
  FaCrosshairs, 
  FaExchangeAlt, 
  FaHistory, 
  FaCog,
  FaChartLine,
  FaMouse,
  FaRocket,
  FaUser
} from 'react-icons/fa'

export const SensitivityFinder: React.FC = () => {
  const { user } = useAuthStore()
  const { 
    activePanel, 
    isLoading, 
    error, 
    userProfile,
    loadUserProfile,
    setActivePanel,
    clearError 
  } = useSensitivityStore()

  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -30])

  // Load user profile on component mount
  useEffect(() => {
    if (user && !userProfile) {
      loadUserProfile(user.id)
    }
  }, [user, userProfile, loadUserProfile])

  // Panel configuration with enhanced design
  const panelConfig = [
    {
      id: 'tests' as const,
      title: 'Elite Tests',
      description: 'Advanced sensitivity testing with 3D environments',
      icon: FaBullseye,
      color: 'from-orange-500 to-red-500',
      bgGlow: 'group-hover:shadow-orange-500/20',
      component: SensitivityTestPanel
    },
    {
      id: 'results' as const,
      title: 'Analytics',
      description: 'AI-powered performance analysis and insights',
      icon: FaChartLine,
      color: 'from-blue-500 to-purple-500',
      bgGlow: 'group-hover:shadow-blue-500/20',
      component: SensitivityResults
    },
    {
      id: 'conversion' as const,
      title: 'Game Converter',
      description: 'Professional cross-game sensitivity conversion',
      icon: FaExchangeAlt,
      color: 'from-green-500 to-emerald-500',
      bgGlow: 'group-hover:shadow-green-500/20',
      component: SensitivityConversion
    },
    {
      id: 'history' as const,
      title: 'Progress Tracker',
      description: 'Track your elite training progression over time',
      icon: FaHistory,
      color: 'from-purple-500 to-pink-500',
      bgGlow: 'group-hover:shadow-purple-500/20',
      component: SensitivityHistory
    },
    {
      id: 'settings' as const,
      title: 'Elite Setup',
      description: 'Configure your professional gaming preferences',
      icon: FaCog,
      color: 'from-gray-500 to-slate-500',
      bgGlow: 'group-hover:shadow-gray-500/20',
      component: SensitivitySettings
    }
  ]

  const activeConfig = panelConfig.find(p => p.id === activePanel)
  const ActiveComponent = activeConfig?.component || SensitivityTestPanel

  if (!user) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        
        {/* Particle System */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-orange-500/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-12 bg-gray-800/30 backdrop-blur-sm rounded-3xl border border-gray-700/50 max-w-md"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mx-auto text-8xl text-orange-500 mb-8"
            >
              🎯
            </motion.div>
            <h2 className="text-3xl font-black mb-4"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              ELITE SENSITIVITY FINDER
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Professional FPS sensitivity optimization system
            </p>
            <motion.button
              onClick={() => window.location.href = '/login'}
              className="relative inline-block px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl shadow-2xl transition-all duration-300 group hover:shadow-orange-500/50"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center space-x-3">
                <FaUser />
                <span>ACCESS ELITE SYSTEM</span>
                <FaRocket />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      
      {/* Optimized Particle System */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: window.innerWidth < 768 ? 20 : 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-orange-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -80, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>



      {/* Header */}
      <motion.div 
        style={{ y: y1 }}
        className="relative border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <motion.div 
                className="flex items-center space-x-4"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <FaCrosshairs className="text-4xl text-orange-500" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-black"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    ELITE SENSITIVITY FINDER
                  </h1>
                  <p className="text-gray-300 font-medium">
                    Professional FPS Optimization System
                  </p>
                </div>
              </motion.div>
            </div>
            
            {/* Enhanced Quick Stats */}
            {userProfile && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8"
              >
                {[
                  { label: 'Tests Completed', value: userProfile.testResults.length, icon: '🎯', color: 'text-orange-400' },
                  { label: 'Current DPI', value: userProfile.currentDPI, icon: '🖱️', color: 'text-blue-400' },
                  { label: 'Sensitivity', value: userProfile.currentSensitivity, icon: '⚡', color: 'text-purple-400' },
                  { label: 'Primary Game', value: userProfile.primaryGame.toUpperCase(), icon: '🎮', color: 'text-green-400' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center group cursor-pointer bg-gray-800/50 rounded-lg lg:rounded-xl p-2 lg:p-3 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 min-w-[70px] lg:min-w-[80px]"
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="text-sm lg:text-lg mb-1">{stat.icon}</div>
                    <div className={`text-sm lg:text-lg font-bold ${stat.color} truncate`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border-b border-red-500/20 backdrop-blur-sm"
          >
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-red-400 font-medium">{error}</p>
                </div>
                <motion.button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-300 font-medium px-3 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Dismiss
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Enhanced Navigation Sidebar */}
          <motion.div 
            style={{ y: y2 }}
            className="lg:w-80 xl:w-96 flex-shrink-0"
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center" id="control-center-heading">
                <span className="mr-3" aria-hidden="true">🎛️</span>
                Control Center
              </h3>
              
              <nav className="space-y-3" role="navigation" aria-labelledby="control-center-heading">
                {panelConfig.map((panel, index) => (
                  <motion.button
                    key={panel.id}
                    onClick={() => setActivePanel(panel.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    aria-label={`Navigate to ${panel.title} - ${panel.description}`}
                    aria-current={activePanel === panel.id ? 'page' : undefined}
                    className={`group relative w-full p-3 sm:p-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                      activePanel === panel.id
                        ? `border-transparent bg-gradient-to-r ${panel.color}/20 text-white shadow-lg`
                        : 'border-gray-600/50 bg-gray-700/30 text-gray-300 hover:border-gray-500/50 hover:bg-gray-600/30'
                    }`}
                    whileHover={{ scale: 1.02, x: 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Glowing border effect */}
                    {activePanel === panel.id && (
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${panel.color} opacity-20 blur`}></div>
                    )}
                    
                    <div className="relative flex items-center space-x-3 sm:space-x-4">
                      <motion.div 
                        className={`text-xl sm:text-2xl flex-shrink-0 ${activePanel === panel.id ? 'text-white' : 'text-gray-400'}`}
                        whileHover={{ rotate: 180, scale: 1.2 }}
                        transition={{ duration: 0.3 }}
                        aria-hidden="true"
                      >
                        <panel.icon />
                      </motion.div>
                      <div className="text-left min-w-0 flex-1">
                        <h4 className="font-bold text-base sm:text-lg truncate">{panel.title}</h4>
                        <p className="text-xs sm:text-sm opacity-80 line-clamp-2 overflow-hidden">{panel.description}</p>
                      </div>
                    </div>
                    
                    {/* Active indicator */}
                    {activePanel === panel.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full"
                      />
                    )}
                  </motion.button>
                ))}
              </nav>
            </motion.div>
          </motion.div>

          {/* Enhanced Main Content */}
          <main className="flex-1 min-w-0" role="main" aria-label="Sensitivity testing content">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePanel}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {isLoading ? (
                  <motion.div 
                    className="flex items-center justify-center h-96 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-6"
                      />
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"
                      >
                        Loading Elite System...
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 min-h-[600px]">
                    <ActiveComponent />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 text-6xl opacity-10"
        >
          🎯
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 40, 0],
            rotate: [360, 180, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 left-20 text-5xl opacity-10"
        >
          🖱️
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -25, 0],
            rotate: [0, -180, -360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 left-10 text-5xl opacity-10"
        >
          ⚡
        </motion.div>
      </div>
    </div>
  )
}

export default SensitivityFinder