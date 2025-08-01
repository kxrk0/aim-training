import React from 'react'
import { motion } from 'framer-motion'
import { IconType } from 'react-icons'
import { useSensitivityStore } from '../../stores/sensitivityStore'
import type { SensitivityFinderState } from '../../../../shared/types'

interface NavigationPanel {
  id: SensitivityFinderState['activePanel']
  title: string
  description: string
  icon: IconType
  color: string
  component: React.ComponentType
}

interface SensitivityNavigationProps {
  panels: NavigationPanel[]
  activePanel: SensitivityFinderState['activePanel']
  onPanelChange: (panel: SensitivityFinderState['activePanel']) => void
}

export const SensitivityNavigation: React.FC<SensitivityNavigationProps> = ({
  panels,
  activePanel,
  onPanelChange
}) => {
  const { 
    currentSession, 
    testProgress, 
    userProfile 
  } = useSensitivityStore()

  return (
    <div className="space-y-2">
      {panels.map((panel, index) => {
        const Icon = panel.icon
        const isActive = activePanel === panel.id
        const hasResults = panel.id === 'results' && currentSession.results.length > 0
        const hasHistory = panel.id === 'history' && userProfile?.testResults.length
        
        // Add badges/indicators
        let badge = null
        let badgeColor = ''
        
        if (panel.id === 'tests' && testProgress.completedTests > 0) {
          badge = `${testProgress.completedTests}/${testProgress.totalTests}`
          badgeColor = 'bg-orange-500'
        } else if (panel.id === 'results' && hasResults) {
          badge = currentSession.results.length
          badgeColor = 'bg-blue-500'
        } else if (panel.id === 'history' && hasHistory) {
          badge = userProfile?.testResults.length
          badgeColor = 'bg-purple-500'
        }

        return (
          <motion.button
            key={panel.id}
            onClick={() => onPanelChange(panel.id)}
            className={`
              w-full text-left p-4 rounded-xl transition-all duration-200 group relative overflow-hidden
              ${isActive 
                ? 'bg-slate-700/50 border border-slate-600/50 shadow-lg' 
                : 'bg-slate-800/30 border border-slate-700/30 hover:bg-slate-700/30 hover:border-slate-600/50'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Background Gradient (only for active) */}
            {isActive && (
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${panel.color} opacity-10`}
                layoutId="activeBackground"
              />
            )}
            
            <div className="relative flex items-start space-x-4">
              {/* Icon */}
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
                ${isActive 
                  ? `bg-gradient-to-r ${panel.color} text-white shadow-lg` 
                  : 'bg-slate-700/50 text-slate-400 group-hover:text-slate-300'
                }
                transition-all duration-200
              `}>
                <Icon className="text-xl" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`
                    font-semibold text-sm
                    ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}
                    transition-colors duration-200
                  `}>
                    {panel.title}
                  </h3>
                  
                  {/* Badge */}
                  {badge && (
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full text-white
                      ${badgeColor}
                    `}>
                      {badge}
                    </span>
                  )}
                </div>
                
                <p className={`
                  text-xs mt-1 leading-relaxed
                  ${isActive ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-400'}
                  transition-colors duration-200
                `}>
                  {panel.description}
                </p>
                
                {/* Progress indicator for tests panel */}
                {panel.id === 'tests' && testProgress.totalTests > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((testProgress.completedTests / testProgress.totalTests) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <motion.div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${(testProgress.completedTests / testProgress.totalTests) * 100}%` 
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Active indicator line */}
            {isActive && (
              <motion.div
                className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-r-full"
                layoutId="activeIndicator"
              />
            )}
          </motion.button>
        )
      })}
      
      {/* Quick Stats Panel */}
      {userProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: panels.length * 0.1 }}
          className="mt-6 p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl"
        >
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Quick Stats</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Current Game</span>
              <span className="text-white font-medium capitalize">
                {userProfile.primaryGame.replace(/([a-z])([A-Z])/g, '$1 $2')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Tests</span>
              <span className="text-white font-medium">
                {userProfile.testResults.length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Play Style</span>
              <span className="text-white font-medium capitalize">
                {userProfile.preferredPlayStyle.replace('-', ' ')}
              </span>
            </div>
            {userProfile.recommendations.length > 0 && (
              <div className="pt-2 border-t border-slate-700/50">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Last Recommendation</span>
                  <span className="text-orange-400 font-medium">
                    {userProfile.recommendations[userProfile.recommendations.length - 1].recommendedSensitivity}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}