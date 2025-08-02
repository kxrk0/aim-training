import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { FaChartLine, FaBrain, FaBullseye, FaLightbulb, FaTrophy, FaArrowUp, FaArrowDown, FaRocket, FaEye, FaFire, FaClock, FaUser } from 'react-icons/fa'

interface PerformanceMetrics {
  accuracy: number
  reactionTime: number
  consistency: number
  improvement: number
  weakestArea: string
  strongestArea: string
  recommendation: string
  trend: 'improving' | 'declining' | 'stable'
  sessionsPlayed: number
  totalShots: number
  avgScore: number
  playTime: number
}

interface AIInsight {
  id: string
  type: 'improvement' | 'warning' | 'achievement'
  title: string
  description: string
  actionable: string
  priority: 'high' | 'medium' | 'low'
  timestamp: Date
}

interface RealTimeStats {
  playersAnalyzed: number
  aiPredictions: number
  accuracyImprovement: number
  lastUpdate: Date
}

export const PerformanceAnalytics: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -30])

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Initial analysis
  useEffect(() => {
    const analyzePerformance = async () => {
      setIsAnalyzing(true)
      
      // Simulate AI analysis with realistic timing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const mockMetrics: PerformanceMetrics = {
        accuracy: 78.5 + Math.random() * 10,
        reactionTime: 285 + Math.floor(Math.random() * 50 - 25),
        consistency: 82.3 + Math.random() * 15,
        improvement: 12.7 + Math.random() * 10,
        weakestArea: ['Flick Shots', 'Tracking', 'Precision'][Math.floor(Math.random() * 3)],
        strongestArea: ['Speed', 'Tracking', 'Consistency'][Math.floor(Math.random() * 3)],
        recommendation: 'Focus on micro-adjustments and crosshair placement for optimal performance',
        trend: ['improving', 'declining', 'stable'][Math.floor(Math.random() * 3)] as any,
        sessionsPlayed: 47 + Math.floor(Math.random() * 20),
        totalShots: 8547 + Math.floor(Math.random() * 2000),
        avgScore: 2340 + Math.floor(Math.random() * 500),
        playTime: 23.5 + Math.random() * 10
      }

      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'improvement',
          title: 'Advanced Flick Optimization',
          description: 'AI detected 23% inconsistency in overshoot patterns during rapid target acquisition',
          actionable: 'Implement micro-pause training with 0.85x sensitivity multiplier',
          priority: 'high',
          timestamp: new Date()
        },
        {
          id: '2',
          type: 'achievement',
          title: 'Elite Tracking Performance',
          description: 'Your tracking accuracy reached top 5% globally with 89.3% precision',
          actionable: 'Maintain current practice routine for tracking scenarios',
          priority: 'medium',
          timestamp: new Date(Date.now() - 300000)
        },
        {
          id: '3',
          type: 'warning',
          title: 'Neural Fatigue Detection',
          description: 'Reaction time degradation pattern suggests cognitive overload',
          actionable: 'Implement 15-minute breaks between intensive sessions',
          priority: 'medium',
          timestamp: new Date(Date.now() - 600000)
        },
        {
          id: '4',
          type: 'improvement',
          title: 'Crosshair Placement Analysis',
          description: 'Pre-aim positioning improved by 34% in corner scenarios',
          actionable: 'Focus on vertical adjustment drills for elevation changes',
          priority: 'low',
          timestamp: new Date(Date.now() - 900000)
        }
      ]

      const mockRealTimeStats: RealTimeStats = {
        playersAnalyzed: 15847 + Math.floor(Math.random() * 100),
        aiPredictions: 847329 + Math.floor(Math.random() * 1000),
        accuracyImprovement: 23.7 + Math.random() * 5,
        lastUpdate: new Date()
      }

      setMetrics(mockMetrics)
      setInsights(mockInsights)
      setRealTimeStats(mockRealTimeStats)
      setIsAnalyzing(false)
    }

    analyzePerformance()
  }, [])

  // Real-time updates
  useEffect(() => {
    if (!isAnalyzing && realTimeStats) {
      const interval = setInterval(() => {
        setRealTimeStats(prev => prev ? {
          ...prev,
          playersAnalyzed: prev.playersAnalyzed + Math.floor(Math.random() * 5),
          aiPredictions: prev.aiPredictions + Math.floor(Math.random() * 50),
          accuracyImprovement: Math.max(0, prev.accuracyImprovement + (Math.random() - 0.5) * 0.5),
          lastUpdate: new Date()
        } : null)

        // Update metrics slightly
        setMetrics(prev => prev ? {
          ...prev,
          accuracy: Math.max(0, Math.min(100, prev.accuracy + (Math.random() - 0.5) * 0.2)),
          reactionTime: Math.max(100, prev.reactionTime + Math.floor((Math.random() - 0.5) * 10)),
          consistency: Math.max(0, Math.min(100, prev.consistency + (Math.random() - 0.5) * 0.3))
        } : null)
      }, 3000) // Update every 3 seconds

      return () => clearInterval(interval)
    }
  }, [isAnalyzing, realTimeStats])

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        
        {/* Particle System */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-500/30 rounded-full"
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
              className="mx-auto text-8xl text-cyan-500 mb-8"
            >
              🧠
            </motion.div>
            <h2 className="text-3xl font-black mb-4"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              AI ANALYTICS
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Advanced machine learning performance insights
            </p>
            <motion.button
              onClick={() => window.location.href = '/login'}
              className="relative inline-block px-8 py-4 text-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl shadow-2xl transition-all duration-300 group hover:shadow-cyan-500/50"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center space-x-3">
                <FaUser />
                <span>ACCESS AI SYSTEM</span>
                <FaBrain />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        
        {/* Particle System */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-500/30 rounded-full"
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

        <div className="relative max-w-6xl mx-auto min-h-screen flex items-center justify-center p-6">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
              className="inline-block text-8xl text-cyan-500 mb-8"
            >
              <FaBrain />
            </motion.div>
            <motion.h2 
              className="text-5xl font-black mb-6"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              AI ANALYZING PERFORMANCE
            </motion.h2>
            <motion.p 
              className="text-gray-300 text-xl mb-8"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Advanced neural networks processing your gameplay data...
            </motion.p>
            
            <div className="flex justify-center space-x-4 mb-8">
              {[
                { icon: '🎯', label: 'Accuracy Analysis' },
                { icon: '⚡', label: 'Reaction Mapping' },
                { icon: '🧠', label: 'Pattern Recognition' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.3 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    className="text-3xl mb-2"
                  >
                    {item.icon}
                  </motion.div>
                  <div className="text-sm text-gray-400">{item.label}</div>
                </motion.div>
              ))}
            </div>
            
            <div className="flex justify-center space-x-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  className="w-3 h-3 bg-cyan-500 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      
      {/* Particle System */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-500/30 rounded-full"
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

      {/* Interactive Cursor Effect */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-3xl pointer-events-none"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />

      <div className="relative max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          style={{ y: y1 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-6xl md:text-8xl font-black mb-6 leading-none"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            🧠 AI ANALYTICS
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl font-bold text-gray-300 mb-4"
          >
            Advanced Machine Learning Performance Insights
          </motion.div>
          {realTimeStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center space-x-6 text-sm"
            >
              <div className="flex items-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>🔴 LIVE: {realTimeStats.playersAnalyzed.toLocaleString()} Players Analyzed</span>
              </div>
              <div className="text-cyan-400">
                <span>⚡ {realTimeStats.aiPredictions.toLocaleString()} AI Predictions</span>
              </div>
              <div className="text-purple-400">
                <span>📈 +{realTimeStats.accuracyImprovement.toFixed(1)}% Avg Improvement</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Enhanced Metrics Overview */}
        {metrics && (
          <motion.div 
            style={{ y: y2 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {[
              {
                icon: FaBullseye,
                title: 'Elite Accuracy',
                value: `${metrics.accuracy.toFixed(1)}%`,
                subtitle: `+${metrics.improvement.toFixed(1)}% this week`,
                color: 'from-orange-500 to-red-500',
                bgGlow: 'shadow-orange-500/20',
                trend: metrics.trend
              },
              {
                icon: FaRocket,
                title: 'Reaction Speed',
                value: `${metrics.reactionTime}ms`,
                subtitle: 'Pro-level timing',
                color: 'from-blue-500 to-cyan-500',
                bgGlow: 'shadow-blue-500/20',
                trend: 'stable'
              },
              {
                icon: FaBrain,
                title: 'AI Consistency',
                value: `${metrics.consistency.toFixed(1)}%`,
                subtitle: 'Neural stability',
                color: 'from-purple-500 to-pink-500',
                bgGlow: 'shadow-purple-500/20',
                trend: 'improving'
              },
              {
                icon: FaTrophy,
                title: 'Elite Rating',
                value: 'S+',
                subtitle: 'Global top 1%',
                color: 'from-yellow-500 to-orange-500',
                bgGlow: 'shadow-yellow-500/20',
                trend: 'improving'
              }
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 0.3 + index * 0.1, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                }}
                className={`group relative p-6 h-full bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm rounded-2xl border border-gray-700/50 transition-all duration-500 hover:border-transparent shadow-xl ${metric.bgGlow} hover:shadow-2xl`}
              >
                {/* Glowing border effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${metric.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur`}></div>
                
                <div className="flex items-center justify-between mb-4">
                  <motion.div 
                    className="text-3xl group-hover:scale-110 transition-all duration-500"
                    whileHover={{ rotateY: 180 }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <metric.icon className={`bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`} />
                  </motion.div>
                  <span className={`text-sm px-2 py-1 rounded-full flex items-center space-x-1 ${
                    metric.trend === 'improving' ? 'bg-green-500/20 text-green-400' :
                    metric.trend === 'declining' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {metric.trend === 'improving' ? <FaArrowUp /> : 
                     metric.trend === 'declining' ? <FaArrowDown /> : <FaFire />}
                  </span>
                </div>
                
                <h3 className={`text-lg font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:${metric.color} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500`}>
                  {metric.title}
                </h3>
                <p className="text-3xl font-black text-white mb-2">{metric.value}</p>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-500">{metric.subtitle}</p>

                {/* Hover arrow */}
                <motion.div
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500"
                  initial={{ x: -10 }}
                  whileHover={{ x: 0 }}
                >
                  <span className="text-cyan-400 text-xl">→</span>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Enhanced Real-time Performance Stats */}
        {metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            {[
              { label: 'Sessions Played', value: metrics.sessionsPlayed, icon: '🎮', color: 'text-blue-400' },
              { label: 'Total Shots', value: metrics.totalShots.toLocaleString(), icon: '🎯', color: 'text-orange-400' },
              { label: 'Average Score', value: metrics.avgScore.toLocaleString(), icon: '⭐', color: 'text-yellow-400' },
              { label: 'Play Time', value: `${metrics.playTime.toFixed(1)}h`, icon: '⏱️', color: 'text-purple-400' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Enhanced AI Insights & Analysis */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12"
        >
          {/* AI Insights */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="mr-4"
              >
                <FaBrain className="text-cyan-500" />
              </motion.div>
              Real-Time AI Insights
              {realTimeStats && (
                <span className="ml-3 text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                  Updated {new Date(realTimeStats.lastUpdate).toLocaleTimeString()}
                </span>
              )}
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className={`p-4 rounded-xl border ${getPriorityColor(insight.priority)} hover:scale-102 transition-all duration-300`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="mt-1 text-xl">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white">{insight.title}</h4>
                        <span className="text-xs text-gray-400">
                          {insight.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">{insight.description}</p>
                      <div className="bg-black/30 rounded-lg p-3">
                        <p className="text-xs text-cyan-400 font-medium flex items-center">
                          <FaLightbulb className="mr-2" />
                          {insight.actionable}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Enhanced Performance Breakdown */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FaChartLine className="mr-4 text-orange-500" />
              Performance Analysis
            </h3>
            {metrics && (
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-300 font-medium">Strongest Area</span>
                    <span className="text-green-400 font-bold">{metrics.strongestArea}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ delay: 1, duration: 1 }}
                    />
                  </div>
                  <div className="text-right text-sm text-green-400 mt-1">85% Mastery</div>
                </div>

                <div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-300 font-medium">Improvement Focus</span>
                    <span className="text-orange-400 font-bold">{metrics.weakestArea}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '45%' }}
                      transition={{ delay: 1.5, duration: 1 }}
                    />
                  </div>
                  <div className="text-right text-sm text-orange-400 mt-1">45% Development</div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 }}
                  className="mt-8 p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl"
                >
                  <h4 className="font-bold text-cyan-400 mb-3 flex items-center">
                    <FaRocket className="mr-2" />
                    Elite AI Recommendation
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{metrics.recommendation}</p>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Enhanced Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <motion.button 
            className="relative inline-block px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl shadow-2xl transition-all duration-300 group hover:shadow-cyan-500/50"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10 flex items-center space-x-3">
              <FaBrain />
              <span>Generate AI Training Plan</span>
              <FaRocket />
            </span>
          </motion.button>
          
          <motion.button 
            className="px-8 py-4 text-lg font-bold bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-2xl border border-gray-600/50 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center space-x-3">
              <FaEye />
              <span>Export Analysis</span>
            </span>
          </motion.button>
        </motion.div>
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
          🧠
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
          📊
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