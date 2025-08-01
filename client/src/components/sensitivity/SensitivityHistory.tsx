import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSensitivityStore } from '../../stores/sensitivityStore'
import { 
  FaHistory, 
    FaChartLine,
  FaCalendarAlt,
  FaFilter,
  FaEye,
  FaTrashAlt,
  FaBullseye,
  FaArrowsAlt,
  FaExchangeAlt,
  FaCrosshairs,
  FaDownload
} from 'react-icons/fa'
import type { SensitivityTestType, SensitivityTestResult } from '../../../../shared/types'

export const SensitivityHistory: React.FC = () => {
  const { userProfile } = useSensitivityStore()
  const [selectedTest, setSelectedTest] = useState<SensitivityTestResult | null>(null)
  const [filterType, setFilterType] = useState<SensitivityTestType | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'accuracy' | 'testType'>('date')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all')

  const testResults = userProfile?.testResults || []

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

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = testResults

    // Filter by test type
    if (filterType !== 'all') {
      filtered = filtered.filter(result => result.testType === filterType)
    }

    // Filter by time range
    if (timeRange !== 'all') {
      const now = new Date()
      const cutoff = new Date()
      
      if (timeRange === 'week') {
        cutoff.setDate(now.getDate() - 7)
      } else if (timeRange === 'month') {
        cutoff.setMonth(now.getMonth() - 1)
      }
      
      filtered = filtered.filter(result => new Date(result.testedAt) >= cutoff)
    }

    // Sort results
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.testedAt).getTime() - new Date(a.testedAt).getTime()
        case 'accuracy':
          return b.accuracy - a.accuracy
        case 'testType':
          return a.testType.localeCompare(b.testType)
        default:
          return 0
      }
    })
  }, [testResults, filterType, timeRange, sortBy])

  // Calculate performance trends
  const performanceTrends = useMemo(() => {
    if (filteredResults.length < 2) return null

    const recent = filteredResults.slice(0, Math.min(5, filteredResults.length))
    const older = filteredResults.slice(5, Math.min(10, filteredResults.length))

    if (older.length === 0) return null

    const recentAvg = recent.reduce((sum, r) => sum + r.accuracy, 0) / recent.length
    const olderAvg = older.reduce((sum, r) => sum + r.accuracy, 0) / older.length
    const trend = recentAvg - olderAvg

    return {
      accuracy: {
        current: recentAvg,
        previous: olderAvg,
        trend,
        isImproving: trend > 2
      }
    }
  }, [filteredResults])

  // Performance statistics by test type
  const testTypeStats = useMemo(() => {
    const stats: Record<SensitivityTestType, {
      count: number
      averageAccuracy: number
      bestScore: number
      latestScore: number
      trend: number
    } | null> = {
      'flick': null,
      'tracking': null,
      'target-switching': null,
      'micro-correction': null
    }

    Object.keys(testTypeConfig).forEach(testType => {
      const typeResults = testResults.filter(r => r.testType === testType)
      if (typeResults.length === 0) return

      const sortedByDate = typeResults.sort((a, b) => 
        new Date(b.testedAt).getTime() - new Date(a.testedAt).getTime()
      )

      const averageAccuracy = typeResults.reduce((sum, r) => sum + r.accuracy, 0) / typeResults.length
      const bestScore = Math.max(...typeResults.map(r => r.accuracy))
      const latestScore = sortedByDate[0].accuracy

      // Calculate trend (recent vs all-time average)
      const recentTests = sortedByDate.slice(0, 3)
      const recentAvg = recentTests.reduce((sum, r) => sum + r.accuracy, 0) / recentTests.length
      const trend = recentAvg - averageAccuracy

      stats[testType as SensitivityTestType] = {
        count: typeResults.length,
        averageAccuracy,
        bestScore,
        latestScore,
        trend
      }
    })

    return stats
  }, [testResults, testTypeConfig])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (testResults.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <FaHistory className="text-6xl text-slate-500 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-white mb-2">No Test History</h3>
          <p className="text-slate-400 mb-6">
            Complete some sensitivity tests to see your performance history and track improvements.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Performance History
        </h2>
        <p className="text-slate-400 text-lg">
          Track your sensitivity testing progress and improvement over time
        </p>
      </div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center">
            <FaChartLine className="text-blue-500 mr-3" />
            Performance Overview
          </h3>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded hover:bg-slate-600 transition-colors">
              <FaDownload className="mr-1" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Object.entries(testTypeStats).map(([testType, stats]) => {
            if (!stats) return null
            
            const config = testTypeConfig[testType as SensitivityTestType]
            const Icon = config.icon
            
            return (
              <div key={testType} className="text-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-r ${config.color} mx-auto mb-3`}>
                  <Icon className="text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">{config.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tests:</span>
                    <span className="text-white">{stats.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average:</span>
                    <span className="text-white">{Math.round(stats.averageAccuracy)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Best:</span>
                    <span className="text-green-400">{Math.round(stats.bestScore)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Trend:</span>
                    <div className="flex items-center">
                      {stats.trend > 1 ? (
                        <FaChartLine className="text-green-400 text-xs mr-1" />
                      ) : stats.trend < -1 ? (
                        <FaChartLine className="text-red-400 text-xs mr-1" />
                      ) : null}
                      <span className={`text-xs ${
                        stats.trend > 1 ? 'text-green-400' : 
                        stats.trend < -1 ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {stats.trend > 0 ? '+' : ''}{Math.round(stats.trend)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Filters:</span>
          </div>
          
          {/* Test Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as SensitivityTestType | 'all')}
            className="px-3 py-1 bg-slate-700 border border-slate-600 text-white text-sm rounded focus:border-blue-500 outline-none"
          >
            <option value="all">All Tests</option>
            <option value="flick">Flick Shots</option>
            <option value="tracking">Tracking</option>
            <option value="target-switching">Target Switching</option>
            <option value="micro-correction">Micro Correction</option>
          </select>

          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'all')}
            className="px-3 py-1 bg-slate-700 border border-slate-600 text-white text-sm rounded focus:border-blue-500 outline-none"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'accuracy' | 'testType')}
            className="px-3 py-1 bg-slate-700 border border-slate-600 text-white text-sm rounded focus:border-blue-500 outline-none"
          >
            <option value="date">Latest First</option>
            <option value="accuracy">Highest Accuracy</option>
            <option value="testType">Test Type</option>
          </select>

          <div className="ml-auto text-sm text-slate-400">
            {filteredResults.length} results
          </div>
        </div>
      </motion.div>

      {/* Test Results List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <AnimatePresence>
          {filteredResults.map((result, index) => {
            const config = testTypeConfig[result.testType]
            const Icon = config.icon
            
            return (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r ${config.color}`}>
                      <Icon className="text-white text-sm" />
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white">{config.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center">
                          <FaCalendarAlt className="mr-1 text-xs" />
                          {formatDate(result.testedAt)}
                        </span>
                        <span>{result.config.difficulty} difficulty</span>
                        <span>{result.sessionDuration}s duration</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-400">
                          {Math.round(result.accuracy)}%
                        </div>
                        <div className="text-xs text-slate-400">Accuracy</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-400">
                          {result.totalHits}
                        </div>
                        <div className="text-xs text-slate-400">Hits</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-400">
                          {Math.round(result.averageTimeToHit)}ms
                        </div>
                        <div className="text-xs text-slate-400">Avg Time</div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedTest(result)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded transition-all duration-200"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* Test Detail Modal */}
      <AnimatePresence>
        {selectedTest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Test Details - {testTypeConfig[selectedTest.testType].name}
                </h3>
                <button
                  onClick={() => setSelectedTest(null)}
                  className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 text-sm">Date:</span>
                    <div className="text-white">{new Date(selectedTest.testedAt).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Difficulty:</span>
                    <div className="text-white capitalize">{selectedTest.config.difficulty}</div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{Math.round(selectedTest.accuracy)}%</div>
                    <div className="text-xs text-slate-400">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-400">{selectedTest.totalHits}</div>
                    <div className="text-xs text-slate-400">Total Hits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-400">{selectedTest.totalMisses}</div>
                    <div className="text-xs text-slate-400">Total Misses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-400">{Math.round(selectedTest.averageTimeToHit)}ms</div>
                    <div className="text-xs text-slate-400">Avg Time</div>
                  </div>
                </div>
                
                {/* Test-specific metrics */}
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Advanced Metrics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Correction Efficiency:</span>
                      <span className="text-white">{Math.round(selectedTest.correctionEfficiency)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reaction Consistency:</span>
                      <span className="text-white">{Math.round(selectedTest.reactionConsistency)}ms</span>
                    </div>
                    {selectedTest.testType === 'flick' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Overshoot:</span>
                          <span className="text-white">{Math.round(selectedTest.flickOvershoot)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Undershoot:</span>
                          <span className="text-white">{Math.round(selectedTest.flickUndershoot)}%</span>
                        </div>
                      </>
                    )}
                    {selectedTest.testType === 'tracking' && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tracking Stability:</span>
                        <span className="text-white">{Math.round(selectedTest.trackingStability)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}