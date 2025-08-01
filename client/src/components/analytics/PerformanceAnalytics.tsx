import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaChartLine, FaBrain, FaBullseye, FaLightbulb, FaTrophy, FaArrowUp, FaArrowDown } from 'react-icons/fa'

interface PerformanceMetrics {
  accuracy: number
  reactionTime: number
  consistency: number
  improvement: number
  weakestArea: string
  strongestArea: string
  recommendation: string
  trend: 'improving' | 'declining' | 'stable'
}

interface AIInsight {
  id: string
  type: 'improvement' | 'warning' | 'achievement'
  title: string
  description: string
  actionable: string
  priority: 'high' | 'medium' | 'low'
}

export const PerformanceAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(true)

  useEffect(() => {
    // Simulate AI analysis
    const analyzePerformance = async () => {
      setIsAnalyzing(true)
      
      // Simulate API call to AI analytics
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockMetrics: PerformanceMetrics = {
        accuracy: 78.5,
        reactionTime: 285,
        consistency: 82.3,
        improvement: 12.7,
        weakestArea: 'Flick Shots',
        strongestArea: 'Tracking',
        recommendation: 'Focus on micro-adjustments and crosshair placement',
        trend: 'improving'
      }

      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'improvement',
          title: 'Flick Shot Optimization',
          description: 'Your flick shots show 23% inconsistency in overshoot patterns',
          actionable: 'Practice with lower sensitivity and focus on stopping power',
          priority: 'high'
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Tracking Excellence',
          description: 'Your tracking accuracy improved by 15% this week',
          actionable: 'Maintain current practice routine for tracking scenarios',
          priority: 'medium'
        },
        {
          id: '3',
          type: 'warning',
          title: 'Reaction Time Decline',
          description: 'Reaction time increased by 12ms compared to last week',
          actionable: 'Consider adjusting sleep schedule and warm-up routine',
          priority: 'medium'
        }
      ]

      setMetrics(mockMetrics)
      setInsights(mockInsights)
      setIsAnalyzing(false)
    }

    analyzePerformance()
  }, [])

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'improvement': return <FaLightbulb className="text-yellow-400" />
      case 'achievement': return <FaTrophy className="text-green-400" />
      case 'warning': return <FaBullseye className="text-orange-400" />
    }
  }

  const getPriorityColor = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 bg-red-500/10'
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10'
      case 'low': return 'border-blue-500/50 bg-blue-500/10'
    }
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block text-6xl text-orange-500 mb-6"
            >
              <FaBrain />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-4">AI Analyzing Your Performance</h2>
            <p className="text-gray-400 text-lg">Processing your gameplay data and generating insights...</p>
            
            <div className="mt-8 flex justify-center space-x-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-3 h-3 bg-orange-500 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-4">
            AI Performance Analytics
          </h1>
          <p className="text-gray-400 text-lg">Advanced machine learning insights into your aim training progress</p>
        </motion.div>

        {/* Metrics Overview */}
        {metrics && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <FaBullseye className="text-2xl text-orange-500" />
                <span className={`text-sm px-2 py-1 rounded-full ${
                  metrics.trend === 'improving' ? 'bg-green-500/20 text-green-400' :
                  metrics.trend === 'declining' ? 'bg-red-500/20 text-red-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {metrics.trend === 'improving' ? <FaArrowUp /> : 
                   metrics.trend === 'declining' ? <FaArrowDown /> : '→'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Accuracy</h3>
              <p className="text-3xl font-bold text-orange-400">{metrics.accuracy}%</p>
              <p className="text-sm text-gray-400 mt-2">+{metrics.improvement}% this week</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <FaChartLine className="text-2xl text-blue-500" />
                <span className="text-sm text-gray-400">avg</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Reaction Time</h3>
              <p className="text-3xl font-bold text-blue-400">{metrics.reactionTime}ms</p>
              <p className="text-sm text-gray-400 mt-2">Professional level</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <FaBrain className="text-2xl text-purple-500" />
                <span className="text-sm text-gray-400">AI Score</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Consistency</h3>
              <p className="text-3xl font-bold text-purple-400">{metrics.consistency}%</p>
              <p className="text-sm text-gray-400 mt-2">Excellent control</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <FaTrophy className="text-2xl text-yellow-500" />
                <span className="text-sm text-gray-400">Overall</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Rating</h3>
              <p className="text-3xl font-bold text-yellow-400">A+</p>
              <p className="text-sm text-gray-400 mt-2">Elite tier</p>
            </div>
          </motion.div>
        )}

        {/* AI Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <FaBrain className="mr-3 text-orange-500" />
              AI Insights & Recommendations
            </h3>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-300 mb-2">{insight.description}</p>
                      <p className="text-xs text-orange-400 font-medium">{insight.actionable}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Performance Breakdown</h3>
            {metrics && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Strongest Area</span>
                    <span className="text-green-400 font-semibold">{metrics.strongestArea}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300">Needs Improvement</span>
                    <span className="text-orange-400 font-semibold">{metrics.weakestArea}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <h4 className="font-semibold text-orange-400 mb-2">AI Recommendation</h4>
                  <p className="text-gray-300 text-sm">{metrics.recommendation}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center space-x-4"
        >
          <button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105">
            Generate Training Plan
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
            Export Analysis
          </button>
        </motion.div>
      </div>
    </div>
  )
}