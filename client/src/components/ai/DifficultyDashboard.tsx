import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaBrain, FaChartLine, FaCrosshairs, FaBolt, FaBullseye, FaEye, 
  FaFire, FaAdjust, FaPlay, FaLightbulb, FaTrophy, FaArrowUp, 
  FaArrowDown, FaMinus, FaCog, FaToggleOn, FaToggleOff,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle
} from 'react-icons/fa'

import { useDynamicDifficultyStore } from '@/stores/dynamicDifficultyStore'
import { useGameStore } from '@/stores/gameStore'

interface SkillRadarProps {
  skills: {
    accuracy: number
    speed: number
    consistency: number
    flick: number
    tracking: number
    precision: number
  }
}

function SkillRadar({ skills }: SkillRadarProps) {
  const maxSkill = 100
  const radarSize = 120
  const center = radarSize / 2
  
  const skillPoints = [
    { name: 'Accuracy', value: skills.accuracy, angle: 0, color: '#10b981' },
    { name: 'Speed', value: skills.speed, angle: 60, color: '#f59e0b' },
    { name: 'Flick', value: skills.flick, angle: 120, color: '#ef4444' },
    { name: 'Tracking', value: skills.tracking, angle: 180, color: '#8b5cf6' },
    { name: 'Precision', value: skills.precision, angle: 240, color: '#06b6d4' },
    { name: 'Consistency', value: skills.consistency, angle: 300, color: '#ec4899' }
  ]
  
  const polarToCartesian = (angle: number, radius: number) => {
    const rad = (angle - 90) * (Math.PI / 180)
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad)
    }
  }
  
  const skillPath = skillPoints.map(skill => {
    const radius = (skill.value / maxSkill) * (center - 10)
    const point = polarToCartesian(skill.angle, radius)
    return `${point.x},${point.y}`
  }).join(' ')

  return (
    <div className="relative">
      <svg width={radarSize} height={radarSize} className="transform -rotate-90">
        {/* Background circles */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((ratio, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={(center - 10) * ratio}
            fill="none"
            stroke="#374151"
            strokeWidth="1"
            opacity={0.3}
          />
        ))}
        
        {/* Grid lines */}
        {skillPoints.map((skill, i) => {
          const point = polarToCartesian(skill.angle, center - 10)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="#374151"
              strokeWidth="1"
              opacity={0.3}
            />
          )
        })}
        
        {/* Skill polygon */}
        <polygon
          points={skillPath}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        
        {/* Skill points */}
        {skillPoints.map((skill, i) => {
          const radius = (skill.value / maxSkill) * (center - 10)
          const point = polarToCartesian(skill.angle, radius)
          return (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={skill.color}
              stroke="white"
              strokeWidth="2"
            />
          )
        })}
      </svg>
      
      {/* Skill labels */}
      {skillPoints.map((skill, i) => {
        const labelRadius = center + 15
        const point = polarToCartesian(skill.angle + 90, labelRadius)
        return (
          <div
            key={i}
            className="absolute text-xs font-medium text-gray-300 transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: point.x, top: point.y }}
          >
            {skill.name}
          </div>
        )
      })}
    </div>
  )
}

export function DifficultyDashboard() {
  const {
    userProfile,
    currentAnalysis,
    latestRecommendation,
    isDynamicModeEnabled,
    autoAdjustEnabled,
    adaptationSensitivity,
    currentDifficulty,
    showRecommendations,
    setDynamicMode,
    setAutoAdjust,
    setAdaptationSensitivity,
    applyRecommendation,
    dismissRecommendation,
    getSkillTrends,
    getPerformanceInsights,
    resetProfile
  } = useDynamicDifficultyStore()
  
  const [selectedTab, setSelectedTab] = useState<'overview' | 'analysis' | 'settings'>('overview')
  
  const skillTrends = getSkillTrends()
  const insights = getPerformanceInsights()
  
  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving': return <FaArrowUp className="text-green-400" />
      case 'declining': return <FaArrowDown className="text-red-400" />
      case 'stable': return <FaMinus className="text-gray-400" />
    }
  }
  
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 25) return 'text-green-400'
    if (difficulty < 50) return 'text-yellow-400'
    if (difficulty < 75) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <FaBrain className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Performance Coach</h2>
            <p className="text-gray-400">Personalized training intelligence</p>
          </div>
        </div>
        
        {/* Dynamic Mode Toggle */}
        <div className="flex items-center space-x-3">
          <span className="text-gray-300">Dynamic AI</span>
          <button
            onClick={() => setDynamicMode(!isDynamicModeEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              isDynamicModeEnabled 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {isDynamicModeEnabled ? <FaToggleOn /> : <FaToggleOff />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800/50 rounded-lg p-1">
        {[
          { id: 'overview', name: 'Overview', icon: FaChartLine },
          { id: 'analysis', name: 'Analysis', icon: FaBrain },
          { id: 'settings', name: 'Settings', icon: FaCog }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              selectedTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <tab.icon />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Skill Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skill Radar */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <FaCrosshairs className="text-blue-400" />
                  <span>Skill Profile</span>
                </h3>
                
                <div className="flex items-center justify-center">
                  <SkillRadar
                    skills={{
                      accuracy: userProfile.accuracyRating,
                      speed: userProfile.speedRating,
                      consistency: userProfile.consistencyRating,
                      flick: userProfile.flickSkill,
                      tracking: userProfile.trackingSkill,
                      precision: userProfile.precisionSkill
                    }}
                  />
                </div>
                
                <div className="mt-4 text-center">
                  <div className="text-3xl font-bold text-white">
                    {Math.round(userProfile.overallSkill)}
                  </div>
                  <div className="text-gray-400">Overall Skill Rating</div>
                </div>
              </div>

              {/* Skill Trends */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <FaChartLine className="text-green-400" />
                  <span>Skill Trends</span>
                </h3>
                
                <div className="space-y-3">
                  {[
                    { name: 'Overall', trend: skillTrends.overall, value: userProfile.overallSkill },
                    { name: 'Accuracy', trend: skillTrends.accuracy, value: userProfile.accuracyRating },
                    { name: 'Speed', trend: skillTrends.speed, value: userProfile.speedRating },
                    { name: 'Consistency', trend: skillTrends.consistency, value: userProfile.consistencyRating }
                  ].map(skill => (
                    <div key={skill.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(skill.trend)}
                        <span className="text-gray-300">{skill.name}</span>
                      </div>
                      <div className="text-white font-medium">
                        {Math.round(skill.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-green-400 mb-3 flex items-center space-x-2">
                  <FaTrophy />
                  <span>Strengths</span>
                </h4>
                <ul className="space-y-1">
                  {insights.strengths.map((strength, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-center space-x-2">
                      <FaCheckCircle className="text-green-400 text-xs" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-orange-400 mb-3 flex items-center space-x-2">
                  <FaExclamationTriangle />
                  <span>Focus Areas</span>
                </h4>
                <ul className="space-y-1">
                  {insights.weaknesses.map((weakness, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-center space-x-2">
                      <FaTimesCircle className="text-orange-400 text-xs" />
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-blue-400 mb-3 flex items-center space-x-2">
                  <FaLightbulb />
                  <span>Next Goals</span>
                </h4>
                <ul className="space-y-1">
                  {insights.nextGoals.map((goal, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-center space-x-2">
                      <FaPlay className="text-blue-400 text-xs" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Current Difficulty */}
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FaAdjust className="text-purple-400" />
                <span>Difficulty Status</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getDifficultyColor(currentDifficulty)}`}>
                    {Math.round(currentDifficulty)}%
                  </div>
                  <div className="text-gray-400">Current Difficulty</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {Math.round(userProfile.optimalDifficulty)}%
                  </div>
                  <div className="text-gray-400">Optimal Difficulty</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {userProfile.confidence}%
                  </div>
                  <div className="text-gray-400">AI Confidence</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analysis Tab */}
        {selectedTab === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {currentAnalysis ? (
              <>
                {/* Performance Analysis */}
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Performance Analysis</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">
                        {currentAnalysis.recentPerformance.averageAccuracy.toFixed(1)}%
                      </div>
                      <div className="text-gray-400">Avg Accuracy</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">
                        {Math.round(currentAnalysis.recentPerformance.averageReactionTime)}ms
                      </div>
                      <div className="text-gray-400">Avg Reaction</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">
                        {currentAnalysis.recentPerformance.averageConsistency.toFixed(1)}%
                      </div>
                      <div className="text-gray-400">Consistency</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xl font-bold text-white">
                        {currentAnalysis.recentPerformance.performanceStability.toFixed(1)}%
                      </div>
                      <div className="text-gray-400">Stability</div>
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-red-400 mb-3">Frustration Risk</h4>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-red-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${currentAnalysis.frustrationRisk}%` }}
                        />
                      </div>
                      <span className="text-white font-medium">
                        {Math.round(currentAnalysis.frustrationRisk)}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <h4 className="text-md font-semibold text-yellow-400 mb-3">Boredom Risk</h4>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${currentAnalysis.boredomRisk}%` }}
                        />
                      </div>
                      <span className="text-white font-medium">
                        {Math.round(currentAnalysis.boredomRisk)}%
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <FaBrain className="text-6xl text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Analysis Available</h3>
                <p className="text-gray-400">Play some games with Dynamic AI enabled to see detailed analysis</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Settings Tab */}
        {selectedTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gray-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">AI Configuration</h3>
              
              <div className="space-y-6">
                {/* Auto Adjust */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Auto-Adjust Difficulty</h4>
                    <p className="text-gray-400 text-sm">Automatically apply AI recommendations</p>
                  </div>
                  <button
                    onClick={() => setAutoAdjust(!autoAdjustEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      autoAdjustEnabled 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {autoAdjustEnabled ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </div>

                {/* Adaptation Sensitivity */}
                <div>
                  <h4 className="text-white font-medium mb-3">Adaptation Sensitivity</h4>
                  <div className="flex space-x-2">
                    {(['low', 'medium', 'high'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => setAdaptationSensitivity(level)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          adaptationSensitivity === level
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    How quickly the AI adapts to your performance changes
                  </p>
                </div>

                {/* Reset Profile */}
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={resetProfile}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Reset AI Profile
                  </button>
                  <p className="text-gray-400 text-sm mt-2">
                    Clear all AI learning data and start fresh
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Recommendation Modal */}
      <AnimatePresence>
        {showRecommendations && latestRecommendation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md mx-4 border border-gray-600"
            >
              <div className="flex items-center space-x-3 mb-4">
                <FaBrain className="text-blue-400 text-xl" />
                <h3 className="text-lg font-semibold text-white">AI Recommendation</h3>
              </div>
              
              <p className="text-gray-300 mb-4">{latestRecommendation.reason}</p>
              
              <div className="bg-gray-700/50 rounded-lg p-3 mb-4">
                <div className="text-sm text-gray-400 mb-1">Recommended Difficulty</div>
                <div className={`text-xl font-bold ${getDifficultyColor(latestRecommendation.targetDifficulty)}`}>
                  {Math.round(latestRecommendation.targetDifficulty)}%
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => applyRecommendation(latestRecommendation)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={dismissRecommendation}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 