import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  FaMouse
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

  // Load user profile on component mount
  useEffect(() => {
    if (user && !userProfile) {
      loadUserProfile(user.id)
    }
  }, [user, userProfile, loadUserProfile])

  // Panel configuration
  const panelConfig = [
    {
      id: 'tests' as const,
      title: 'Sensitivity Tests',
      description: 'Find your optimal sensitivity through comprehensive testing',
      icon: FaBullseye,
      color: 'from-orange-600 to-red-600',
      component: SensitivityTestPanel
    },
    {
      id: 'results' as const,
      title: 'Test Results',
      description: 'View your performance analytics and recommendations',
      icon: FaChartLine,
      color: 'from-blue-600 to-purple-600',
      component: SensitivityResults
    },
    {
      id: 'conversion' as const,
      title: 'Game Conversion',
      description: 'Convert sensitivity between different FPS games',
      icon: FaExchangeAlt,
      color: 'from-green-600 to-teal-600',
      component: SensitivityConversion
    },
    {
      id: 'history' as const,
      title: 'Performance History',
      description: 'Track your progress and improvement over time',
      icon: FaHistory,
      color: 'from-purple-600 to-pink-600',
      component: SensitivityHistory
    },
    {
      id: 'settings' as const,
      title: 'Settings',
      description: 'Configure test parameters and preferences',
      icon: FaCog,
      color: 'from-gray-600 to-slate-600',
      component: SensitivitySettings
    }
  ]

  const activeConfig = panelConfig.find(p => p.id === activePanel)
  const ActiveComponent = activeConfig?.component || SensitivityTestPanel

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50"
        >
          <FaMouse className="mx-auto text-6xl text-orange-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Sensitivity Finder
          </h2>
          <p className="text-slate-400 mb-6">
            Please log in to access the sensitivity finder system
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
          >
            Sign In
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <FaCrosshairs className="text-2xl text-orange-500" />
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Sensitivity Finder
                  </h1>
                  <p className="text-sm text-slate-400">
                    Professional FPS sensitivity optimization
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            {userProfile && (
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-white font-semibold">
                    {userProfile.testResults.length}
                  </div>
                  <div className="text-slate-400">Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">
                    {userProfile.currentDPI}
                  </div>
                  <div className="text-slate-400">DPI</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold">
                    {userProfile.currentSensitivity}
                  </div>
                  <div className="text-slate-400">Sensitivity</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border-b border-red-500/20"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between">
                <p className="text-red-400 text-sm">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <SensitivityNavigation 
              panels={panelConfig}
              activePanel={activePanel}
              onPanelChange={setActivePanel}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePanel}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-slate-400">Loading...</p>
                    </div>
                  </div>
                ) : (
                  <ActiveComponent />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SensitivityFinder