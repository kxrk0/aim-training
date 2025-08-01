import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSensitivityStore } from '../../stores/sensitivityStore'
import { 
  FaChartLine, 
  FaTrophy, 
  FaBullseye, 
  FaArrowUp, 
  FaArrowDown, 
  FaMinus,
  FaArrowsAlt,
  FaExchangeAlt,
  FaCrosshairs,
  FaDownload,
  FaRedo
} from 'react-icons/fa'
import type { SensitivityTestType } from '../../../../shared/types'

export const SensitivityResults: React.FC = () => {
  const { 
    currentSession, 
    startNewSession,
    setActivePanel 
  } = useSensitivityStore()

  const { results, recommendation } = currentSession

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    if (results.length === 0) return null
    
    const totalHits = results.reduce((acc, r) => acc + r.totalHits, 0)
    const totalMisses = results.reduce((acc, r) => acc + r.totalMisses, 0)
    const averageAccuracy = results.reduce((acc, r) => acc + r.accuracy, 0) / results.length
    const averageReactionTime = results.reduce((acc, r) => acc + r.averageTimeToHit, 0) / results.length
    const bestAccuracy = Math.max(...results.map(r => r.accuracy))
    const worstAccuracy = Math.min(...results.map(r => r.accuracy))
    
    return {
      totalShots: totalHits + totalMisses,
      totalHits,
      totalMisses,
      averageAccuracy,
      averageReactionTime,
      bestAccuracy,
      worstAccuracy,
      consistency: 100 - (Math.abs(bestAccuracy - worstAccuracy) / 2)
    }
  }, [results])

  // Test type configurations
  const testTypeConfig = {
    'flick': { 
      icon: FaBullseye, 
      color: 'from-red-500 to-orange-500',
      name: 'Flick Shots'
    },
    'tracking': { 
      icon: FaArrowsAlt, 
      color: 'from-blue-500 to-purple-500',
      name: 'Tracking'
    },
    'target-switching': { 
      icon: FaExchangeAlt, 
      color: 'from-green-500 to-teal-500',
      name: 'Target Switching'
    },
    'micro-correction': { 
      icon: FaCrosshairs, 
      color: 'from-purple-500 to-pink-500',
      name: 'Micro Correction'
    }
  }

  // Get performance rating
  const getPerformanceRating = (accuracy: number) => {
    if (accuracy >= 90) return { label: 'Excellent', color: 'text-green-400', icon: FaArrowUp }
    if (accuracy >= 75) return { label: 'Good', color: 'text-blue-400', icon: FaArrowUp }
    if (accuracy >= 60) return { label: 'Average', color: 'text-yellow-400', icon: FaMinus }
    if (accuracy >= 45) return { label: 'Below Average', color: 'text-orange-400', icon: FaArrowDown }
    return { label: 'Needs Work', color: 'text-red-400', icon: FaArrowDown }
  }

  // Handle retake tests
  const handleRetakeTests = () => {
    const testTypes = results.map(r => r.testType)
    startNewSession(testTypes)
    setActivePanel('tests')
  }

  if (results.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <FaChartLine className="text-6xl text-slate-500 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-white mb-2">No Test Results</h3>
          <p className="text-slate-400 mb-6">
            Complete some tests to see your results and recommendations here.
          </p>
          <button
            onClick={() => setActivePanel('tests')}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-500 hover:to-red-500 transition-all duration-200"
          >
            Start Testing
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Test Results & Analysis
        </h2>
        <p className="text-slate-400 text-lg">
          Comprehensive analysis of your sensitivity test performance
        </p>
      </div>

      {/* Overall Performance Summary */}
      {overallStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <FaTrophy className="text-yellow-500 mr-3" />
              Overall Performance
            </h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRetakeTests}
                className="px-4 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 hover:text-white transition-all duration-200 flex items-center"
              >
                <FaRedo className="mr-2" />
                Retake Tests
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-all duration-200 flex items-center">
                <FaDownload className="mr-2" />
                Export Results
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {Math.round(overallStats.averageAccuracy)}%
              </div>
              <div className="text-sm text-slate-400">Average Accuracy</div>
              <div className="text-xs text-slate-500 mt-1">
                {getPerformanceRating(overallStats.averageAccuracy).label}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {Math.round(overallStats.averageReactionTime)}ms
              </div>
              <div className="text-sm text-slate-400">Avg Reaction Time</div>
              <div className="text-xs text-slate-500 mt-1">
                {overallStats.averageReactionTime < 200 ? 'Excellent' : 
                 overallStats.averageReactionTime < 300 ? 'Good' : 'Average'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {Math.round(overallStats.consistency)}%
              </div>
              <div className="text-sm text-slate-400">Consistency</div>
              <div className="text-xs text-slate-500 mt-1">
                {overallStats.consistency > 85 ? 'Very Stable' : 
                 overallStats.consistency > 70 ? 'Stable' : 'Variable'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-1">
                {overallStats.totalShots}
              </div>
              <div className="text-sm text-slate-400">Total Shots</div>
              <div className="text-xs text-slate-500 mt-1">
                {overallStats.totalHits} hits, {overallStats.totalMisses} misses
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Individual Test Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results.map((result, index) => {
          const config = testTypeConfig[result.testType]
          const Icon = config.icon
          const rating = getPerformanceRating(result.accuracy)
          const RatingIcon = rating.icon
          
          return (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200"
            >
              {/* Test Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r ${config.color}`}>
                    <Icon className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{config.name}</h4>
                    <p className="text-sm text-slate-400 capitalize">
                      {result.config.difficulty} • {result.config.duration}s
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center space-x-1 ${rating.color}`}>
                  <RatingIcon className="text-sm" />
                  <span className="text-sm font-medium">{rating.label}</span>
                </div>
              </div>
              
              {/* Performance Metrics */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Accuracy</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${config.color} transition-all duration-500`}
                        style={{ width: `${Math.min(100, result.accuracy)}%` }}
                      />
                    </div>
                    <span className="text-white font-medium text-sm">
                      {Math.round(result.accuracy)}%
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Hits / Misses</span>
                  <span className="text-white">
                    {result.totalHits} / {result.totalMisses}
                  </span>
                </div>
                
                {result.averageTimeToHit > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Avg Reaction</span>
                    <span className="text-white">
                      {Math.round(result.averageTimeToHit)}ms
                    </span>
                  </div>
                )}
                
                {/* Test-specific metrics */}
                {result.testType === 'flick' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Overshoot</span>
                      <span className="text-white">
                        {Math.round(result.flickOvershoot)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Undershoot</span>
                      <span className="text-white">
                        {Math.round(result.flickUndershoot)}%
                      </span>
                    </div>
                  </>
                )}
                
                {result.testType === 'tracking' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Stability</span>
                    <span className="text-white">
                      {Math.round(result.trackingStability)}%
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Consistency</span>
                  <span className="text-white">
                    {Math.round(100 - result.reactionConsistency)}%
                  </span>
                </div>
              </div>
              
              {/* Mini visualization */}
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="text-xs text-slate-500 mb-2">Hit Pattern</div>
                <div className="w-full h-8 bg-slate-700/50 rounded overflow-hidden relative">
                  {result.hitPositions.slice(0, 20).map((hit, idx) => (
                    <div
                      key={idx}
                      className={`absolute top-1 bottom-1 w-1 bg-gradient-to-r ${config.color} opacity-60`}
                      style={{ left: `${(idx / 20) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Sensitivity Recommendation */}
      {recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-600/10 to-red-600/10 backdrop-blur-sm rounded-xl p-6 border border-orange-500/20"
        >
          <div className="flex items-center mb-4">
            <FaBullseye className="text-2xl text-orange-500 mr-3" />
            <div>
              <h3 className="text-xl font-bold text-white">
                Sensitivity Recommendation
              </h3>
              <p className="text-slate-400">
                Based on your performance across all tests
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {recommendation.recommendedSensitivity}
              </div>
              <div className="text-sm text-slate-400">Recommended Sensitivity</div>
              <div className="text-xs text-slate-500 mt-1">
                {recommendation.confidenceScore}% confidence
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400 mb-2 capitalize">
                {recommendation.playStyle.replace('-', ' ')}
              </div>
              <div className="text-sm text-slate-400">Detected Play Style</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-green-400 mb-2">
                +{recommendation.expectedImprovement.accuracy}%
              </div>
              <div className="text-sm text-slate-400">Expected Improvement</div>
            </div>
          </div>
          
          {recommendation.reasoning.length > 0 && (
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Analysis:</h4>
              <ul className="space-y-1">
                {recommendation.reasoning.map((reason, idx) => (
                  <li key={idx} className="text-sm text-slate-400 flex items-start">
                    <div className="w-1 h-1 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <button
          onClick={() => setActivePanel('conversion')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all duration-200"
        >
          Convert to Other Games
        </button>
        
        <button
          onClick={() => setActivePanel('history')}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-500 hover:to-teal-500 transition-all duration-200"
        >
          View History
        </button>
        
        <button
          onClick={handleRetakeTests}
          className="px-6 py-3 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 hover:text-white transition-all duration-200"
        >
          Test Again
        </button>
      </motion.div>
    </div>
  )
}