import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import {
  FaBrain, FaChartLine, FaFire, FaEye, FaLightbulb, FaRocket,
  FaBullseye, FaCog, FaPlay, FaPause, FaDownload, FaSearch,
  FaFilter, FaCalendarAlt, FaTrophy, FaExclamationTriangle,
  FaCheckCircle, FaArrowUp, FaArrowDown, FaCrosshairs, FaGamepad
} from 'react-icons/fa'

interface MLAnalysis {
  weaknessDetection: {
    primaryWeakness: string
    confidenceScore: number
    impactLevel: 'critical' | 'major' | 'minor'
    improveableBy: number // percentage
    recommendations: string[]
  }
  performancePrediction: {
    expectedImprovement: number
    timeToImprove: number // days
    confidenceInterval: [number, number]
    riskFactors: string[]
  }
  patternRecognition: {
    dominantPatterns: string[]
    inefficiencies: string[]
    strengthAreas: string[]
  }
}

interface HeatMapData {
  zones: Array<{
    x: number
    y: number
    intensity: number
    accuracy: number
    shots: number
  }>
  overallAccuracy: number
  hotspots: Array<{ x: number, y: number, radius: number }>
  coldspots: Array<{ x: number, y: number, radius: number }>
}

interface SessionAnalytics {
  sessionId: string
  date: string
  duration: number
  totalShots: number
  accuracy: number
  reactionTime: number
  performance: 'excellent' | 'good' | 'average' | 'poor'
  gameMode: string
  shotBreakdown: {
    hits: number
    misses: number
    perfectShots: number
    nearMisses: number
  }
  performanceByTime: Array<{
    timeSegment: number
    accuracy: number
    reactionTime: number
  }>
}

export function AdvancedAnalyticsDashboard() {
  const { user, isAuthenticated } = useAuthStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [activeTab, setActiveTab] = useState<'overview' | 'heatmap' | 'sessions' | 'ml-insights'>('overview')
  const [mlAnalysis, setMlAnalysis] = useState<MLAnalysis | null>(null)
  const [heatMapData, setHeatMapData] = useState<HeatMapData | null>(null)
  const [sessionAnalytics, setSessionAnalytics] = useState<SessionAnalytics[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')

  // Initialize ML Analysis
  useEffect(() => {
    const performMLAnalysis = async () => {
      setIsAnalyzing(true)
      setAnalysisProgress(0)
      
      // Generate mock data first
      const mockMLAnalysis: MLAnalysis = {
        weaknessDetection: {
          primaryWeakness: 'Vertical Tracking Precision',
          confidenceScore: 87.3,
          impactLevel: 'major',
          improveableBy: 23.5,
          recommendations: [
            'Practice slow, controlled vertical movements',
            'Focus on crosshair placement before firing',
            'Increase vertical sensitivity slightly',
            'Use aim training maps with vertical targets'
          ]
        },
        performancePrediction: {
          expectedImprovement: 18.2,
          timeToImprove: 14,
          confidenceInterval: [15.1, 21.3],
          riskFactors: ['Inconsistent practice schedule', 'High mouse sensitivity']
        },
        patternRecognition: {
          dominantPatterns: ['Quick flick shots', 'Corner peeking', 'Long-range tracking'],
          inefficiencies: ['Overshooting targets', 'Delayed reaction time', 'Inconsistent crosshair placement'],
          strengthAreas: ['Fast target acquisition', 'Muscle memory consistency', 'Hand-eye coordination']
        }
      }

      const mockHeatMapData: HeatMapData = {
        zones: Array.from({ length: 100 }, (_, i) => ({
          x: (i % 10) * 40 + 20,
          y: Math.floor(i / 10) * 30 + 15,
          intensity: Math.random() * 100,
          accuracy: 60 + Math.random() * 35,
          shots: Math.floor(Math.random() * 50) + 5
        })),
        overallAccuracy: 73.2,
        hotspots: [
          { x: 160, y: 120, radius: 25 },
          { x: 240, y: 90, radius: 20 },
          { x: 320, y: 150, radius: 30 }
        ],
        coldspots: [
          { x: 80, y: 180, radius: 15 },
          { x: 360, y: 60, radius: 18 }
        ]
      }

      const mockSessions: SessionAnalytics[] = Array.from({ length: 10 }, (_, i) => ({
        sessionId: `session_${i + 1}`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        duration: Math.floor(Math.random() * 3600) + 1800,
        totalShots: Math.floor(Math.random() * 500) + 200,
        accuracy: 60 + Math.random() * 35,
        reactionTime: 240 + Math.floor(Math.random() * 80),
        performance: 'good' as any,
        gameMode: 'Aim Lab',
        shotBreakdown: {
          hits: Math.floor(Math.random() * 200) + 100,
          misses: Math.floor(Math.random() * 50) + 10,
          perfectShots: Math.floor(Math.random() * 30) + 5,
          nearMisses: Math.floor(Math.random() * 20) + 5
        },
        performanceByTime: Array.from({ length: 10 }, (_, j) => ({
          timeSegment: j + 1,
          accuracy: 60 + Math.random() * 35,
          reactionTime: 240 + Math.floor(Math.random() * 80)
        })),
        heatMapData: Array.from({ length: 20 }, (_, j) => ({
          x: Math.random() * 400,
          y: Math.random() * 300,
          intensity: Math.random() * 100,
          accuracy: 60 + Math.random() * 35,
          reactionTime: 240 + Math.floor(Math.random() * 80)
        }))
      }))

      // Real-time progress tracking with completion callback
      const totalDuration = 7000 // 7 seconds
      const updateInterval = 50 // Update every 50ms
      const totalSteps = totalDuration / updateInterval
      let currentStep = 0
      
      const progressInterval = setInterval(() => {
        currentStep++
        const progress = (currentStep / totalSteps) * 100
        setAnalysisProgress(Math.min(progress, 100))
        
        if (currentStep >= totalSteps) {
          clearInterval(progressInterval)
          // Complete analysis when progress reaches 100%
          setMlAnalysis(mockMLAnalysis)
          setHeatMapData(mockHeatMapData)
          setSessionAnalytics(mockSessions)
          setIsAnalyzing(false)
        }
      }, updateInterval)
    }

    if (isAuthenticated) {
      performMLAnalysis()
    }
  }, [isAuthenticated])

  // Draw Heat Map
  useEffect(() => {
    if (heatMapData && canvasRef.current && activeTab === 'heatmap') {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      // Draw heat map zones
      heatMapData.zones.forEach(zone => {
        const alpha = zone.intensity / 100
        const hue = zone.accuracy * 1.2 // Red (0) to Green (120)
        
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha * 0.7})`
        ctx.fillRect(
          (zone.x / 100) * width - 5,
          (zone.y / 100) * height - 5,
          10,
          10
        )
      })

      // Draw hotspots
      heatMapData.hotspots.forEach(hotspot => {
        const gradient = ctx.createRadialGradient(
          (hotspot.x / 100) * width,
          (hotspot.y / 100) * height,
          0,
          (hotspot.x / 100) * width,
          (hotspot.y / 100) * height,
          hotspot.radius
        )
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)')
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(
          (hotspot.x / 100) * width,
          (hotspot.y / 100) * height,
          hotspot.radius,
          0,
          2 * Math.PI
        )
        ctx.fill()
      })

      // Draw coldspots
      heatMapData.coldspots.forEach(coldspot => {
        ctx.strokeStyle = 'rgba(0, 100, 255, 0.6)'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(
          (coldspot.x / 100) * width,
          (coldspot.y / 100) * height,
          coldspot.radius,
          0,
          2 * Math.PI
        )
        ctx.stroke()
        ctx.setLineDash([])
      })
    }
  }, [heatMapData, activeTab])

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <FaChartLine /> },
    { id: 'ml-insights', name: 'ML Insights', icon: <FaBrain /> },
    { id: 'heatmap', name: 'Heat Maps', icon: <FaFire /> },
    { id: 'sessions', name: 'Sessions', icon: <FaGamepad /> }
  ]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaLightbulb className="text-6xl text-orange-600/60 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Advanced Analytics</h2>
          <p className="text-gray-300">Please sign in to access advanced performance analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center space-x-3">
            <FaBrain className="text-orange-400" />
            <span>Advanced Analytics Dashboard</span>
          </h1>
          <p className="text-gray-300">AI-Powered Performance Analysis & Coaching</p>
        </div>

        {/* Optimized AI Neural Interface */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-gradient-to-br from-black/80 via-gray-950/90 to-black/80 backdrop-blur-md rounded-2xl p-8 text-center mb-6 border border-orange-500/20 shadow-xl shadow-orange-500/10 relative overflow-hidden"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Simplified Background Effects */}
            <div className="absolute inset-0 opacity-5">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-orange-400 text-xs font-mono"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    willChange: 'transform, opacity'
                  }}
                  animate={{
                    y: [0, -120],
                    opacity: [0, 0.6, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: Math.random() * 4,
                    ease: "linear"
                  }}
                >
                  {['01', '10', 'AI'][Math.floor(Math.random() * 3)]}
                </motion.div>
              ))}
            </div>

            {/* Simplified Neural Network */}
            <div className="relative z-10">
              <div className="flex items-center justify-center space-x-6 mb-8 relative">
                {/* AI Processing Nodes */}
                {[
                  { icon: '🔬', label: 'Analysis' },
                  { icon: '🧠', label: 'Processing' },
                  { icon: '🎯', label: 'Results' },
                ].map((node, i) => (
                  <motion.div
                    key={node.label}
                    className="flex flex-col items-center space-y-2"
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                    style={{ willChange: 'transform' }}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                      }}
                      className="text-2xl p-2 rounded-full bg-gray-900/40 border border-orange-400/30"
                    >
                      {node.icon}
                    </motion.div>
                    <span className="text-xs text-gray-400 font-mono">{node.label}</span>
                  </motion.div>
                ))}

                {/* Central Brain - Smaller */}
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                    scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="relative mx-6"
                  style={{ willChange: 'transform' }}
                >
                  {/* Simple Aura */}
                  <motion.div
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl w-20 h-20 -top-2 -left-2"
                  />
                  
                  <div className="relative bg-gradient-to-br from-orange-500/10 to-red-500/10 p-4 rounded-full border border-orange-400/40">
                    <FaBrain className="text-5xl text-orange-400 drop-shadow-lg" />
                  </div>
                </motion.div>

                {/* Right Side Nodes */}
                {[
                  { icon: '🚀', label: 'Optimize' },
                  { icon: '💡', label: 'Insights' },
                  { icon: '⚡', label: 'Results' },
                ].map((node, i) => (
                  <motion.div
                    key={node.label}
                    className="flex flex-col items-center space-y-2"
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: (i + 3) * 0.3,
                      ease: "easeInOut"
                    }}
                    style={{ willChange: 'transform' }}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, -360],
                      }}
                      transition={{
                        rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                      }}
                      className="text-2xl p-2 rounded-full bg-gray-900/40 border border-orange-400/30"
                    >
                      {node.icon}
                    </motion.div>
                    <span className="text-xs text-gray-400 font-mono">{node.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Ultra-Dynamic Analysis Interface */}
              <div className="relative mb-8">
                {/* Holographic Title */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.02, 1],
                    opacity: [0.9, 1, 0.9] 
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <motion.div
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="text-4xl font-black text-transparent bg-gradient-to-r from-orange-400 via-red-400 via-orange-500 to-red-500 bg-clip-text mb-4"
                    style={{ backgroundSize: '200% 200%' }}
                  >
                    🧠 NEURAL MATRIX ANALYSIS
                  </motion.div>
                  
                  {/* Scanning Lines */}
                  <motion.div
                    animate={{ x: [-300, 300] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-400/60 to-transparent blur-sm"
                  />
                </motion.div>

                {/* Advanced Status Display */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'CPU CORES', value: '∞', color: 'text-blue-400', icon: '⚡' },
                    { label: 'NEURAL NETS', value: '1024', color: 'text-green-400', icon: '🧠' },
                    { label: 'DATA POINTS', value: '50M+', color: 'text-yellow-400', icon: '📊' },
                    { label: 'PRECISION', value: '99.9%', color: 'text-orange-400', icon: '🎯' },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: [0.7, 1, 0.7],
                        scale: [0.98, 1.02, 0.98],
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: i * 0.2,
                        ease: "easeInOut" 
                      }}
                      className="text-center p-3 bg-gray-900/40 rounded-lg border border-gray-700/50"
                    >
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-gray-400 font-mono">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Ultra-Dynamic Status Messages */}
                <motion.div
                  className="relative h-16 overflow-hidden rounded-lg bg-gray-900/30 border border-orange-500/20 mb-6"
                >
                  <motion.div
                    animate={{ 
                      y: [0, -64, -128, -192, -256, -320, -384],
                      opacity: [1, 1, 1, 1, 1, 1, 0, 1]
                    }}
                    transition={{ 
                      duration: 14, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="absolute inset-0"
                  >
                    {[
                      { text: "🔬 INITIALIZING QUANTUM NEURAL PROCESSORS...", color: "text-blue-400" },
                      { text: "⚡ ANALYZING 847,293 AIM PATTERNS PER NANOSECOND...", color: "text-yellow-400" },
                      { text: "🎯 CALCULATING TRAJECTORY PREDICTION MATRICES...", color: "text-green-400" },
                      { text: "🧬 DECODING MUSCLE MEMORY DNA SEQUENCES...", color: "text-purple-400" },
                      { text: "💡 GENERATING HYPER-PERSONALIZED INSIGHTS...", color: "text-cyan-400" },
                      { text: "🚀 OPTIMIZING NEURAL PATHWAY EFFICIENCY...", color: "text-orange-400" },
                      { text: "🎮 CALIBRATING GAMING PERFORMANCE ENHANCERS...", color: "text-red-400" },
                    ].map((msg, i) => (
                      <div
                        key={i}
                        className={`h-16 flex items-center justify-center px-4 text-center font-mono text-lg font-bold ${msg.color}`}
                      >
                        <motion.span
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          {msg.text}
                        </motion.span>
                      </div>
                    ))}
                  </motion.div>
                  
                  {/* Scanning Effect */}
                  <motion.div
                    animate={{ x: [-100, 400] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 w-20 h-full bg-gradient-to-r from-transparent via-orange-400/30 to-transparent blur-sm"
                  />
                </motion.div>
              </div>

              {/* Extended Progress Matrix */}
              <div className="space-y-6">
                {/* Master Progress Bar */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono text-gray-400">NEURAL PROCESSING</span>
                    <motion.span
                      animate={{ 
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-sm font-bold text-orange-400"
                    >
                      QUANTUM MODE ACTIVE
                    </motion.span>
                  </div>
                  
                  <div className="relative w-full bg-gray-900/60 rounded-full h-4 overflow-hidden border border-gray-700/50">
                    {/* Real-time progress */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-500 via-orange-400 to-red-600 h-4 rounded-full"
                      style={{ 
                        width: `${analysisProgress}%`,
                        backgroundSize: '200% 100%' 
                      }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                    >
                      {/* Animated gradient */}
                      <motion.div
                        animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                      
                      {/* Energy pulses */}
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute top-0 w-1 h-full bg-white/60"
                          animate={{ 
                            x: [-10, 400],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            delay: i * 0.6,
                            ease: "linear" 
                          }}
                        />
                      ))}
                    </motion.div>
                    
                    {/* Progress percentage */}
                    <motion.div
                      style={{ x: `${analysisProgress * 0.85}%` }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                      className="absolute top-0 -mt-6 text-xs font-bold text-orange-400"
                    >
                      <motion.span
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        🧠 {Math.round(analysisProgress)}% PROCESSING...
                      </motion.span>
                    </motion.div>
                  </div>
                </div>

                {/* Advanced Processing Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { name: 'Neural Scan', icon: '🔬', delay: 0, color: 'blue', progressRange: [0, 20] },
                    { name: 'Data Mining', icon: '⛏️', delay: 0.3, color: 'green', progressRange: [15, 40] },
                    { name: 'Pattern Rec', icon: '🧩', delay: 0.6, color: 'yellow', progressRange: [35, 60] },
                    { name: 'AI Learning', icon: '🤖', delay: 0.9, color: 'purple', progressRange: [55, 80] },
                    { name: 'Optimization', icon: '🚀', delay: 1.2, color: 'red', progressRange: [75, 100] }
                  ].map((stage, i) => {
                    const isActive = analysisProgress >= stage.progressRange[0] && analysisProgress <= stage.progressRange[1]
                    const isCompleted = analysisProgress > stage.progressRange[1]
                    return (
                                         <motion.div
                       key={i}
                       initial={{ opacity: 0.2, scale: 0.9 }}
                       animate={{ 
                         opacity: isActive ? [0.8, 1, 0.8] : isCompleted ? 0.6 : 0.3,
                         scale: isActive ? [1, 1.1, 1] : isCompleted ? 1 : 0.95,
                         y: isActive ? [0, -5, 0] : 0
                       }}
                       transition={{ 
                         duration: isActive ? 1.5 : 0.5, 
                         repeat: isActive ? Infinity : 0,
                         ease: "easeInOut" 
                       }}
                       className="text-center relative"
                     >
                      {/* Stage container */}
                      <div className="relative p-4 bg-gray-900/40 rounded-xl border border-gray-700/50">
                        {/* Icon with rotation */}
                        <motion.div
                          animate={{ 
                            rotate: [0, 360],
                            scale: [1, 1.2, 1]
                          }}
                          transition={{ 
                            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                            scale: { duration: 1.5, repeat: Infinity, delay: stage.delay }
                          }}
                          className="text-3xl mb-2"
                        >
                          {stage.icon}
                        </motion.div>
                        
                        {/* Stage name */}
                        <div className="text-xs text-gray-400 font-mono font-bold">{stage.name}</div>
                        
                                                 {/* Progress indicator */}
                         <motion.div
                           animate={{ 
                             scaleX: [0, 1, 0],
                             opacity: [0, 1, 0]
                           }}
                           transition={{ 
                             duration: 3, 
                             repeat: Infinity, 
                             delay: stage.delay + 0.5 
                           }}
                           className="mt-2 h-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"
                         />
                        
                                                 {/* Glow effect */}
                         <motion.div
                           animate={{ 
                             opacity: [0, 0.6, 0],
                             scale: [0.8, 1.5, 0.8]
                           }}
                           transition={{ 
                             duration: 3, 
                             repeat: Infinity, 
                             delay: stage.delay 
                           }}
                           className="absolute inset-0 bg-orange-400/10 rounded-xl blur-md"
                         />
                      </div>
                    </motion.div>
                    )
                  })}
                </div>

                {/* Quantum Processing Status */}
                <div className="flex items-center justify-center space-x-4 mt-8">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    className="text-lg font-mono font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent"
                  >
                    QUANTUM NEURAL MATRIX ACTIVE...
                  </motion.span>
                  <motion.div
                    animate={{ rotate: [360, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-red-400 border-b-transparent rounded-full"
                  />
                </div>
              </div>

              {/* Pulse Ring Effect */}
              <motion.div
                animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-orange-400/30 rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        {!isAnalyzing && (
          <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <FaCalendarAlt className="text-gray-400" />
                <div className="flex bg-black/60 rounded-lg p-1 border border-gray-800/50">
                  {[
                    { id: '24h', name: '24 Hours' },
                    { id: '7d', name: '7 Days' },
                    { id: '30d', name: '30 Days' },
                    { id: 'all', name: 'All Time' }
                  ].map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedTimeRange(range.id as any)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedTimeRange === range.id
                          ? 'bg-orange-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {range.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                <FaDownload />
                <span>Export Data</span>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="bg-black/70 backdrop-blur-md rounded-xl border border-gray-800/50 overflow-hidden shadow-2xl">
              <div className="flex border-b border-gray-700">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-6 py-4 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Key Metrics */}
                        <StatCard
                          title="Overall Accuracy"
                          value="78.4%"
                          change={+5.2}
                          icon={<FaBullseye />}
                          color="blue"
                        />
                        <StatCard
                          title="Avg Reaction Time"
                          value="284ms"
                          change={-12}
                          icon={<FaRocket />}
                          color="green"
                        />
                        <StatCard
                          title="Sessions Played"
                          value="47"
                          change={+8}
                          icon={<FaGamepad />}
                          color="orange"
                        />
                        <StatCard
                          title="Improvement Rate"
                          value="23.5%"
                          change={+15.7}
                          icon={<FaTrophy />}
                          color="yellow"
                        />
                      </div>

                      {/* Quick Insights */}
                      <div className="bg-gray-700/50 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Quick Insights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <FaCheckCircle className="text-green-400" />
                              <span className="text-green-400 font-medium">Strength Detected</span>
                            </div>
                            <p className="text-gray-300 text-sm">Excellent tracking consistency - maintain current practice routine</p>
                          </div>
                          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <FaExclamationTriangle className="text-yellow-400" />
                              <span className="text-yellow-400 font-medium">Area for Improvement</span>
                            </div>
                            <p className="text-gray-300 text-sm">Vertical tracking precision needs work - 23.5% improvement potential</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ML Insights Tab */}
                  {activeTab === 'ml-insights' && mlAnalysis && (
                    <motion.div
                      key="ml-insights"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      {/* Weakness Detection */}
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                          <FaBrain className="text-red-400" />
                          <span>AI Weakness Detection</span>
                        </h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400">Primary Weakness</span>
                                <span className="text-red-400 font-bold">{mlAnalysis.weaknessDetection.confidenceScore}% confidence</span>
                              </div>
                              <h4 className="text-xl font-bold text-white">{mlAnalysis.weaknessDetection.primaryWeakness}</h4>
                              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                <div
                                  className="bg-red-500 h-2 rounded-full"
                                  style={{ width: `${mlAnalysis.weaknessDetection.improveableBy}%` }}
                                />
                              </div>
                              <span className="text-gray-400 text-sm">
                                {mlAnalysis.weaknessDetection.improveableBy}% improvement potential
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-3">AI Recommendations</h4>
                            <div className="space-y-2">
                              {mlAnalysis.weaknessDetection.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <FaLightbulb className="text-yellow-400 mt-1 flex-shrink-0" />
                                  <span className="text-gray-300 text-sm">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Prediction */}
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                          <FaRocket className="text-blue-400" />
                          <span>Performance Prediction</span>
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400">{mlAnalysis.performancePrediction.expectedImprovement}%</div>
                            <div className="text-gray-400">Expected Improvement</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-400">{mlAnalysis.performancePrediction.timeToImprove} days</div>
                            <div className="text-gray-400">Time to Achieve</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-400">
                              {mlAnalysis.performancePrediction.confidenceInterval[0]}% - {mlAnalysis.performancePrediction.confidenceInterval[1]}%
                            </div>
                            <div className="text-gray-400">Confidence Interval</div>
                          </div>
                        </div>
                      </div>

                      {/* Pattern Recognition */}
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                          <FaEye className="text-orange-400" />
                          <span>Pattern Recognition</span>
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-3">Dominant Patterns</h4>
                            <div className="space-y-2">
                              {mlAnalysis.patternRecognition.dominantPatterns.map((pattern, index) => (
                                <div key={index} className="text-gray-300 text-sm">• {pattern}</div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-3">Inefficiencies</h4>
                            <div className="space-y-2">
                              {mlAnalysis.patternRecognition.inefficiencies.map((inefficiency, index) => (
                                <div key={index} className="text-orange-300 text-sm">• {inefficiency}</div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-3">Strength Areas</h4>
                            <div className="space-y-2">
                              {mlAnalysis.patternRecognition.strengthAreas.map((strength, index) => (
                                <div key={index} className="text-green-300 text-sm">• {strength}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Heat Map Tab */}
                  {activeTab === 'heatmap' && heatMapData && (
                    <motion.div
                      key="heatmap"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Shot Pattern Heat Map</h2>
                        <p className="text-gray-400">Visual analysis of your aim patterns and accuracy zones</p>
                      </div>

                      <div className="bg-black/60 rounded-lg p-6 border border-gray-800/50">
                        <div className="relative">
                          <canvas
                            ref={canvasRef}
                            width={800}
                            height={600}
                            className="w-full max-w-4xl mx-auto bg-gray-900 rounded-lg border border-gray-700"
                          />
                          
                          {/* Heat Map Legend */}
                          <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-md rounded-lg p-4 border border-gray-800/50">
                            <h4 className="text-white font-semibold mb-2">Legend</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-red-500 rounded"></div>
                                <span className="text-gray-300">Hot Zones (High Activity)</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-500 border-2 border-blue-500 border-dashed rounded"></div>
                                <span className="text-gray-300">Cold Zones (Low Activity)</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-green-500 rounded"></div>
                                <span className="text-gray-300">Accuracy (Red: Low, Green: High)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Heat Map Stats */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-400">{heatMapData.overallAccuracy.toFixed(1)}%</div>
                            <div className="text-gray-400">Overall Zone Accuracy</div>
                          </div>
                          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-red-400">{heatMapData.hotspots.length}</div>
                            <div className="text-gray-400">Active Hot Zones</div>
                          </div>
                          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-400">{heatMapData.coldspots.length}</div>
                            <div className="text-gray-400">Neglected Areas</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Sessions Tab */}
                  {activeTab === 'sessions' && (
                    <motion.div
                      key="sessions"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Deep Session Analytics</h2>
                        <p className="text-gray-400">Detailed breakdown of your training sessions</p>
                      </div>

                      <div className="space-y-4">
                        {sessionAnalytics.slice(0, 8).map((session) => (
                          <div key={session.sessionId} className="bg-black/60 rounded-lg p-4 border border-gray-800/50 hover:bg-black/80 transition-all">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  session.performance === 'excellent' ? 'bg-green-500' :
                                  session.performance === 'good' ? 'bg-blue-500' :
                                  session.performance === 'average' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                                <span className="text-white font-medium">{session.gameMode} Session</span>
                                <span className="text-gray-400 text-sm">
                                  {new Date(session.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-gray-400 text-sm">
                                {session.duration.toFixed(1)} min
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">{session.accuracy.toFixed(1)}%</div>
                                <div className="text-gray-400 text-sm">Accuracy</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">{session.reactionTime}ms</div>
                                <div className="text-gray-400 text-sm">Avg RT</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">{session.totalShots}</div>
                                <div className="text-gray-400 text-sm">Total Shots</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-white">{session.shotBreakdown.perfectShots}</div>
                                <div className="text-gray-400 text-sm">Perfect Shots</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  icon,
  color
}: {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'orange' | 'yellow' | 'red'
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    green: 'bg-green-500/10 border-green-500/30 text-green-400',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
    red: 'bg-red-500/10 border-red-500/30 text-red-400'
  }

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="flex items-center space-x-1">
        {change >= 0 ? (
          <FaArrowUp className="text-green-400 text-xs" />
        ) : (
          <FaArrowDown className="text-red-400 text-xs" />
        )}
        <span className={`text-xs font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {Math.abs(change)}%
        </span>
      </div>
    </div>
  )
} 