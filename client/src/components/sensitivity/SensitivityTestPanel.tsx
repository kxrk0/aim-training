import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSensitivityStore } from '../../stores/sensitivityStore'
import { FlickTest } from './tests/FlickTest'
import { TrackingTest } from './tests/TrackingTest'
import { TargetSwitchingTest } from './tests/TargetSwitchingTest'
import { MicroCorrectionTest } from './tests/MicroCorrectionTest'
import { SensitivityGameCanvas } from './SensitivityGameCanvas'
import { 
  FaBullseye, 
  FaArrowsAlt, 
  FaExchangeAlt, 
  FaCrosshairs,
  FaPlay,
  FaPause,
  FaStop,
  FaChartLine
} from 'react-icons/fa'
import type { SensitivityTestType, Difficulty } from '../../../../shared/types'

export const SensitivityTestPanel: React.FC = () => {
  const {
    isTestActive,
    currentTest,
    testProgress,
    currentSession,
    testSettings,
    startTest,
    stopTest,
    completeTest,
    startNewSession,
    completeSession,
    updateTestSettings,
    setActivePanel
  } = useSensitivityStore()

  const [selectedTestType, setSelectedTestType] = useState<SensitivityTestType | null>(null)
  const [is3DMode, setIs3DMode] = useState(false)
  const [testConfig, setTestConfig] = useState<any>(null)

  // Test configurations
  const testTypes = [
    {
      id: 'flick' as const,
      title: 'Flick Shots',
      description: 'Rapid target acquisition with quick mouse movements',
      icon: FaBullseye,
      color: 'from-red-500 to-orange-500',
      difficulty: 'Medium',
      duration: '60s',
      targets: '30 targets',
      component: FlickTest,
      benefits: ['Improves reaction time', 'Enhances snap accuracy', 'Builds muscle memory']
    },
    {
      id: 'tracking' as const,
      title: 'Tracking',
      description: 'Smooth target following with consistent aim',
      icon: FaArrowsAlt,
      color: 'from-blue-500 to-purple-500',
      difficulty: 'Medium',
      duration: '45s',
      targets: '5 moving targets',
      component: TrackingTest,
      benefits: ['Enhances smooth tracking', 'Improves target prediction', 'Builds consistency']
    },
    {
      id: 'target-switching' as const,
      title: 'Target Switching',
      description: 'Quick transitions between multiple targets',
      icon: FaExchangeAlt,
      color: 'from-green-500 to-teal-500',
      difficulty: 'Medium',
      duration: '30s',
      targets: '20 sequential targets',
      component: TargetSwitchingTest,
      benefits: ['Improves multi-target engagement', 'Enhances spatial awareness', 'Builds switching speed']
    },
    {
      id: 'micro-correction' as const,
      title: 'Micro Correction',
      description: 'Precise adjustments for small movements',
      icon: FaCrosshairs,
      color: 'from-purple-500 to-pink-500',
      difficulty: 'Hard',
      duration: '40s',
      targets: '25 precision targets',
      component: MicroCorrectionTest,
      benefits: ['Enhances precision control', 'Improves fine motor skills', 'Builds micro-adjustment accuracy']
    }
  ]

  const handleStartTest = (testType: SensitivityTestType) => {
    const config = {
      testType,
      duration: testType === 'flick' ? 60 : testType === 'tracking' ? 45 : testType === 'target-switching' ? 30 : 40,
      targetCount: testType === 'flick' ? 30 : testType === 'tracking' ? 5 : testType === 'target-switching' ? 20 : 25,
      targetSize: testType === 'micro-correction' ? 0.6 : 1.0,
      targetSpeed: testType === 'tracking' ? 150 : undefined,
      difficulty: (testType === 'micro-correction' ? 'hard' : 'medium') as Difficulty,
      spawnPattern: testType === 'tracking' ? 'circular' as const : 'random' as const
    }
    
    setSelectedTestType(testType)
    startTest(config)
  }

  // Start 3D test
  const start3DTest = (testType: SensitivityTestType) => {
    const config = {
      testType,
      duration: testType === 'flick' ? 60 : testType === 'tracking' ? 45 : testType === 'target-switching' ? 30 : 40,
      targetCount: testType === 'flick' ? 30 : testType === 'tracking' ? 5 : testType === 'target-switching' ? 20 : 25,
      targetSize: testType === 'micro-correction' ? 0.6 : 1.0,
      targetSpeed: testType === 'tracking' ? 2 : undefined,
      difficulty: (testType === 'micro-correction' ? 'hard' : 'medium') as Difficulty,
      spawnPattern: 'random' as const
    }
    
    setTestConfig(config)
    setIs3DMode(true)
    startTest(config)
  }

  // Handle test completion
  const handleTestComplete = (result: any) => {
    completeTest(result)
    setIs3DMode(false)
    setTestConfig(null)
    setActivePanel('results')
  }

  // Handle test exit
  const handleTestExit = () => {
    setIs3DMode(false)
    setTestConfig(null)
    stopTest()
  }

  const handleCompleteSession = async () => {
    const recommendation = await completeSession()
    setActivePanel('results')
  }

  // If in 3D mode, show the 3D canvas
  if (is3DMode && testConfig) {
    return (
      <SensitivityGameCanvas
        config={testConfig}
        onTestComplete={handleTestComplete}
        onTestExit={handleTestExit}
      />
    )
  }

  // If a test is active, show the test component
  if (isTestActive && currentTest && selectedTestType) {
    const TestComponent = testTypes.find(t => t.id === selectedTestType)?.component
    
    if (TestComponent) {
      return (
        <div className="h-full">
          <TestComponent config={currentTest} />
        </div>
      )
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Sensitivity Tests
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Complete these comprehensive tests to find your optimal sensitivity settings. 
          Each test evaluates different aspects of your aiming performance.
        </p>
      </div>

      {/* Session Progress */}
      {testProgress.totalTests > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Current Session</h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-400">
                {testProgress.completedTests} / {testProgress.totalTests} tests completed
              </span>
              {testProgress.completedTests === testProgress.totalTests && (
                <button
                  onClick={handleCompleteSession}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-500 hover:to-teal-500 transition-all duration-200"
                >
                  <FaChartLine className="inline mr-2" />
                  View Results
                </button>
              )}
            </div>
          </div>
          
          <div className="w-full bg-slate-700 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${(testProgress.completedTests / testProgress.totalTests) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}

      {/* Test Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testTypes.map((test, index) => {
          const Icon = test.icon
          const isCompleted = currentSession.results.some(r => r.testType === test.id)
          
          return (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative group bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border transition-all duration-300
                ${isCompleted 
                  ? 'border-green-500/50 bg-green-500/5' 
                  : 'border-slate-700/50 hover:border-slate-600/50'
                }
              `}
            >
              {/* Completed badge */}
              {isCompleted && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              {/* Test Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-r ${test.color}
                `}>
                  <Icon className="text-xl text-white" />
                </div>
                
                <div className="text-right">
                  <span className={`
                    text-xs px-2 py-1 rounded-full font-medium
                    ${test.difficulty === 'Hard' 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-orange-500/20 text-orange-400'
                    }
                  `}>
                    {test.difficulty}
                  </span>
                </div>
              </div>
              
              {/* Test Info */}
              <h3 className="text-xl font-bold text-white mb-2">
                {test.title}
              </h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                {test.description}
              </p>
              
              {/* Test Details */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Duration</span>
                  <span className="text-slate-300">{test.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Targets</span>
                  <span className="text-slate-300">{test.targets}</span>
                </div>
              </div>
              
              {/* Benefits */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Benefits:</h4>
                <ul className="space-y-1">
                  {test.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-xs text-slate-400 flex items-center">
                      <div className="w-1 h-1 bg-slate-500 rounded-full mr-2" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => start3DTest(test.id)}
                  disabled={isTestActive || is3DMode}
                  className={`
                    w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2
                    ${isCompleted
                      ? 'bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30'
                      : `bg-gradient-to-r ${test.color} text-white hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`
                    }
                    ${isTestActive || is3DMode ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <FaPlay className="text-sm" />
                  <span>🎯 Start 3D Test</span>
                </button>
                
                <button
                  onClick={() => handleStartTest(test.id)}
                  disabled={isTestActive || is3DMode}
                  className="w-full py-2 px-4 rounded-lg text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📊 2D Test (Legacy)
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Start Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => startNewSession(['flick', 'tracking'])}
            disabled={isTestActive}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-500 hover:to-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Quick Test (Flick + Tracking)
          </button>
          
          <button
            onClick={() => startNewSession(['flick', 'tracking', 'target-switching', 'micro-correction'])}
            disabled={isTestActive}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Assessment
          </button>
          
          {testProgress.totalTests > 0 && (
            <button
              onClick={() => setActivePanel('settings')}
              className="px-6 py-3 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 hover:text-white transition-all duration-200"
            >
              Customize Tests
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}