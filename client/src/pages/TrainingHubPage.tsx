import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPlay, FaTrophy, FaChartLine, FaFire, FaClock, FaBullseye, FaBolt, FaEye, FaHeart, FaBrain, FaRocket, FaStar, FaLock, FaUnlock } from 'react-icons/fa'
import { useAuthStore } from '@/stores/authStore'
import { useLevelStore } from '@/stores/levelStore'
import { PerformanceTracker } from '@/components/training/PerformanceTracker'

// Training Categories
const trainingCategories = [
  {
    id: 'fundamentals',
    name: 'Fundamentals',
    description: 'Master the core aiming mechanics',
    icon: FaBullseye,
    color: 'from-blue-500 to-cyan-500',
    modes: [
      { id: 'static-clicking', name: 'Static Clicking', difficulty: 'Beginner', duration: '60s', description: 'Click static targets to build precision' },
      { id: 'dynamic-clicking', name: 'Dynamic Clicking', difficulty: 'Intermediate', duration: '45s', description: 'Click disappearing targets' },
      { id: 'grid-shot', name: 'Gridshot', difficulty: 'Beginner', duration: '30s', description: 'Classic grid shooting exercise' },
      { id: 'micro-shots', name: 'Microshots', difficulty: 'Advanced', duration: '60s', description: 'Tiny targets for pixel-perfect precision' }
    ]
  },
  {
    id: 'tracking',
    name: 'Tracking',
    description: 'Smooth target following and prediction',
    icon: FaEye,
    color: 'from-green-500 to-emerald-500',
    modes: [
      { id: 'sphere-track', name: 'Sphere Track', difficulty: 'Intermediate', duration: '60s', description: 'Track spheres moving in 3D space' },
      { id: 'close-tracking', name: 'Close Tracking', difficulty: 'Beginner', duration: '45s', description: 'Track targets at close range' },
      { id: 'long-tracking', name: 'Long Range Tracking', difficulty: 'Advanced', duration: '60s', description: 'Track distant moving targets' },
      { id: 'air-tracking', name: 'Air Tracking', difficulty: 'Expert', duration: '60s', description: 'Track airborne targets with physics' },
      { id: 'ai-prediction', name: 'AI Prediction', difficulty: 'Master', duration: 'Variable', description: 'AI-powered prediction challenges with machine learning', isNew: true }
    ]
  },
  {
    id: 'flicking',
    name: 'Flicking',
    description: 'Quick and precise target acquisition',
    icon: FaBolt,
    color: 'from-orange-500 to-red-500',
    modes: [
      { id: 'sixshot', name: 'Sixshot', difficulty: 'Intermediate', duration: '30s', description: 'Six targets in sequence' },
      { id: 'multishot', name: 'Multishot', difficulty: 'Advanced', duration: '45s', description: 'Multiple simultaneous targets' },
      { id: 'arc-flick', name: 'Arc Flick', difficulty: 'Expert', duration: '40s', description: 'Flick in arc patterns' },
      { id: 'speed-flick', name: 'Speed Flick', difficulty: 'Expert', duration: '20s', description: 'Ultra-fast flick challenges' },
      { id: 'advanced-flick', name: 'Advanced Flick', difficulty: 'Master', duration: 'Variable', description: 'Multi-directional patterns with advanced analytics', isNew: true }
    ]
  },
  {
    id: 'switching',
    name: 'Target Switching',
    description: 'Rapid target transitions',
    icon: FaRocket,
    color: 'from-purple-500 to-pink-500',
    modes: [
      { id: 'switch-track', name: 'Switch Track', difficulty: 'Intermediate', duration: '45s', description: 'Switch between tracking targets' },
      { id: 'detection', name: 'Detection', difficulty: 'Advanced', duration: '60s', description: 'Identify and engage priority targets' },
      { id: 'motion-switch', name: 'Motion Switch', difficulty: 'Expert', duration: '50s', description: 'Switch between moving targets' }
    ]
  },
  {
    id: 'scenarios',
    name: 'Scenarios',
    description: 'Game-specific training scenarios',
    icon: FaBrain,
    color: 'from-indigo-500 to-purple-500',
    modes: [
      { id: 'valorant-recon', name: 'VALORANT Recon', difficulty: 'Intermediate', duration: '90s', description: 'VALORANT-style combat scenarios' },
      { id: 'cs2-rifles', name: 'CS2 Rifles', difficulty: 'Advanced', duration: '75s', description: 'Counter-Strike rifle scenarios' },
      { id: 'apex-ads', name: 'Apex ADS', difficulty: 'Expert', duration: '60s', description: 'Apex Legends ADS training' }
    ]
  }
]

// Training Playlists
const trainingPlaylists = [
  {
    id: 'daily-warmup',
    name: 'Daily Warmup',
    description: '15-minute routine to start your session',
    duration: '15 min',
    modes: ['gridshot', 'sphere-track', 'sixshot'],
    difficulty: 'All Levels',
    icon: FaFire,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'precision-master',
    name: 'Precision Master',
    description: 'Build pixel-perfect accuracy',
    duration: '25 min',
    modes: ['static-clicking', 'microshots', 'detection'],
    difficulty: 'Advanced',
    icon: FaBullseye,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'reaction-boost',
    name: 'Reaction Boost',
    description: 'Maximize your reaction speed',
    duration: '20 min',
    modes: ['speed-flick', 'dynamic-clicking', 'switch-track'],
    difficulty: 'Expert',
    icon: FaBolt,
    color: 'from-red-500 to-pink-500'
  }
]

export function TrainingHubPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentLevel, totalXP } = useLevelStore()
  const [selectedCategory, setSelectedCategory] = useState('fundamentals')
  const [activeTab, setActiveTab] = useState<'modes' | 'playlists' | 'challenges' | 'analytics'>('modes')

  // Calculate user progress
  const getUnlockedModes = () => {
    const level = currentLevel
    const unlockedModes = new Set<string>()
    
    trainingCategories.forEach(category => {
      category.modes.forEach(mode => {
        const requiredLevel = getDifficultyLevel(mode.difficulty)
        if (level >= requiredLevel) {
          unlockedModes.add(mode.id)
        }
      })
    })
    
    return unlockedModes
  }

  const getDifficultyLevel = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 1
      case 'Intermediate': return 5
      case 'Advanced': return 10
      case 'Expert': return 15
      case 'Master': return 20
      default: return 1
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400'
      case 'Intermediate': return 'text-yellow-400'
      case 'Advanced': return 'text-orange-400'
      case 'Expert': return 'text-red-400'
      case 'Master': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const unlockedModes = getUnlockedModes()

  const handleModeSelect = (modeId: string) => {
    if (unlockedModes.has(modeId)) {
      // Special handling for advanced training modes
      if (modeId === 'advanced-flick') {
        navigate('/advanced-flick-training')
      } else if (modeId === 'ai-prediction') {
        navigate('/ai-prediction-training')
      } else {
        navigate('/train', { state: { selectedMode: modeId } })
      }
    }
  }

  const handlePlaylistStart = (playlistId: string) => {
    navigate('/train', { state: { playlist: playlistId } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600/10 to-red-600/10 border-b border-orange-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-600/5 via-transparent to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
                TRAINING HUB
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Master your aim with scientifically designed training scenarios. 
              Track your progress, unlock new challenges, and dominate the competition.
            </p>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-orange-400">{currentLevel}</div>
                <div className="text-sm text-gray-400">Current Level</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-blue-400">{totalXP.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total XP</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-green-400">{unlockedModes.size}</div>
                <div className="text-sm text-gray-400">Unlocked Modes</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-purple-400">S+</div>
                <div className="text-sm text-gray-400">Best Rank</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-1 border border-gray-700">
            {[
              { id: 'modes', label: 'Training Modes', icon: FaBullseye },
              { id: 'playlists', label: 'Playlists', icon: FaFire },
              { id: 'challenges', label: 'Challenges', icon: FaTrophy },
              { id: 'analytics', label: 'Analytics', icon: FaChartLine }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="text-lg" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Training Modes Tab */}
          {activeTab === 'modes' && (
            <motion.div
              key="modes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Category Selector */}
              <div className="flex flex-wrap gap-3 justify-center">
                {trainingCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 ${
                      selectedCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                        : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 border border-gray-700'
                    }`}
                  >
                    <category.icon className="text-lg" />
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>

              {/* Selected Category Modes */}
              {trainingCategories
                .filter(cat => cat.id === selectedCategory)
                .map(category => (
                  <div key={category.id} className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-white mb-2">{category.name}</h2>
                      <p className="text-gray-400">{category.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {category.modes.map((mode) => {
                        const isUnlocked = unlockedModes.has(mode.id)
                        return (
                          <motion.div
                            key={mode.id}
                            whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
                            whileTap={{ scale: isUnlocked ? 0.98 : 1 }}
                            className={`group relative rounded-xl p-6 border transition-all duration-300 ${
                              isUnlocked
                                ? 'bg-gray-800/50 border-gray-600 hover:border-orange-500/50 cursor-pointer'
                                : 'bg-gray-900/50 border-gray-800 cursor-not-allowed'
                            }`}
                            onClick={() => handleModeSelect(mode.id)}
                          >
                            {/* Lock Overlay */}
                            {!isUnlocked && (
                              <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                                <div className="text-center">
                                  <FaLock className="text-3xl text-gray-500 mx-auto mb-2" />
                                  <p className="text-sm text-gray-400">
                                    Requires Level {getDifficultyLevel(mode.difficulty)}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mb-4">
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                                <category.icon className="text-white text-lg" />
                              </div>
                              {isUnlocked ? (
                                <FaUnlock className="text-green-400" />
                              ) : (
                                <FaLock className="text-gray-500" />
                              )}
                            </div>

                            <div className="flex items-center justify-between mb-2">
                              <h3 className={`text-lg font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                                {mode.name}
                              </h3>
                              {(mode as any).isNew && isUnlocked && (
                                <span className="bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                  NEW
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mb-4 ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                              {mode.description}
                            </p>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className={isUnlocked ? 'text-gray-400' : 'text-gray-600'}>
                                  Difficulty
                                </span>
                                <span className={isUnlocked ? getDifficultyColor(mode.difficulty) : 'text-gray-600'}>
                                  {mode.difficulty}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className={isUnlocked ? 'text-gray-400' : 'text-gray-600'}>
                                  Duration
                                </span>
                                <span className={isUnlocked ? 'text-gray-300' : 'text-gray-600'}>
                                  {mode.duration}
                                </span>
                              </div>
                            </div>

                            {isUnlocked && (
                              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-medium flex items-center justify-center space-x-2">
                                  <FaPlay className="text-sm" />
                                  <span>Start Training</span>
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                ))}
            </motion.div>
          )}

          {/* Playlists Tab */}
          {activeTab === 'playlists' && (
            <motion.div
              key="playlists"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Training Playlists</h2>
                <p className="text-gray-400">Structured training routines for focused improvement</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trainingPlaylists.map((playlist) => (
                  <motion.div
                    key={playlist.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="group bg-gray-800/50 rounded-xl p-6 border border-gray-600 hover:border-orange-500/50 cursor-pointer transition-all duration-300"
                    onClick={() => handlePlaylistStart(playlist.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${playlist.color}`}>
                        <playlist.icon className="text-white text-xl" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Duration</div>
                        <div className="text-white font-medium">{playlist.duration}</div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{playlist.name}</h3>
                    <p className="text-gray-400 mb-4">{playlist.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Difficulty</span>
                        <span className="text-white">{playlist.difficulty}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Modes</span>
                        <span className="text-white">{playlist.modes.length}</span>
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
                        <FaPlay className="text-sm" />
                        <span>Start Playlist</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <FaTrophy className="text-6xl text-orange-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">Challenges Coming Soon</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Weekly challenges, seasonal tournaments, and special events will be available here. 
                Stay tuned for exciting competitive opportunities!
              </p>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Performance Analytics</h2>
                <p className="text-gray-400">Track your improvement with detailed performance analytics</p>
              </div>

              <PerformanceTracker />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}