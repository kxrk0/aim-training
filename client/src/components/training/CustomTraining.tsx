import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaPlus, FaEdit, FaPlay, FaShare, FaDownload, FaHeart, FaEye, FaStar, FaFilter, FaSearch, FaCog, FaBullseye, FaClock } from 'react-icons/fa'

interface CustomScenario {
  id: string
  name: string
  description: string
  creator: string
  difficulty: number
  duration: number
  targetCount: number
  targetSize: number
  targetSpeed: number
  spawnPattern: 'random' | 'grid' | 'circle' | 'line' | 'wave'
  gameMode: 'precision' | 'speed' | 'tracking' | 'flick' | 'mixed'
  tags: string[]
  likes: number
  plays: number
  rating: number
  isPublic: boolean
  isLiked: boolean
  isOwned: boolean
  createdAt: string
}

interface ScenarioBuilder {
  name: string
  description: string
  difficulty: number
  duration: number
  targetCount: number
  targetSize: number
  targetSpeed: number
  spawnPattern: CustomScenario['spawnPattern']
  gameMode: CustomScenario['gameMode']
  tags: string[]
  isPublic: boolean
}

export const CustomTraining: React.FC = () => {
  const [scenarios, setScenarios] = useState<CustomScenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<CustomScenario | null>(null)
  const [showBuilder, setShowBuilder] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular')
  
  const [builder, setBuilder] = useState<ScenarioBuilder>({
    name: '',
    description: '',
    difficulty: 5,
    duration: 60,
    targetCount: 20,
    targetSize: 1.0,
    targetSpeed: 1.0,
    spawnPattern: 'random',
    gameMode: 'precision',
    tags: [],
    isPublic: true
  })

  const mockScenarios: CustomScenario[] = [
    {
      id: '1',
      name: 'Micro Flick Paradise',
      description: 'Ultra-precise micro flicks with tiny targets for surgical precision training',
      creator: 'PrecisionMaster',
      difficulty: 9,
      duration: 120,
      targetCount: 50,
      targetSize: 0.3,
      targetSpeed: 0.8,
      spawnPattern: 'random',
      gameMode: 'flick',
      tags: ['precision', 'micro', 'advanced'],
      likes: 1247,
      plays: 5623,
      rating: 4.8,
      isPublic: true,
      isLiked: false,
      isOwned: false,
      createdAt: '2024-12-18'
    },
    {
      id: '2',
      name: 'Speed Demon Challenge',
      description: 'Lightning-fast target spawning to push your reaction time to the limit',
      creator: 'SpeedRunner99',
      difficulty: 8,
      duration: 90,
      targetCount: 100,
      targetSize: 1.2,
      targetSpeed: 2.5,
      spawnPattern: 'wave',
      gameMode: 'speed',
      tags: ['speed', 'reflexes', 'intense'],
      likes: 892,
      plays: 3456,
      rating: 4.6,
      isPublic: true,
      isLiked: true,
      isOwned: false,
      createdAt: '2024-12-19'
    },
    {
      id: '3',
      name: 'Tracking Mastery',
      description: 'Advanced tracking scenarios with unpredictable movement patterns',
      creator: 'TrackingPro',
      difficulty: 7,
      duration: 180,
      targetCount: 15,
      targetSize: 1.5,
      targetSpeed: 1.8,
      spawnPattern: 'circle',
      gameMode: 'tracking',
      tags: ['tracking', 'smooth', 'endurance'],
      likes: 654,
      plays: 2341,
      rating: 4.4,
      isPublic: true,
      isLiked: false,
      isOwned: true,
      createdAt: '2024-12-20'
    }
  ]

  const availableTags = ['precision', 'speed', 'tracking', 'flick', 'micro', 'advanced', 'beginner', 'reflexes', 'smooth', 'intense', 'endurance', 'competitive']

  useEffect(() => {
    setScenarios(mockScenarios)
  }, [])

  const filteredScenarios = scenarios
    .filter(scenario => {
      const matchesSearch = scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scenario.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           scenario.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesDifficulty = difficultyFilter === 'all' || 
        (difficultyFilter === 'easy' && scenario.difficulty <= 3) ||
        (difficultyFilter === 'medium' && scenario.difficulty >= 4 && scenario.difficulty <= 6) ||
        (difficultyFilter === 'hard' && scenario.difficulty >= 7 && scenario.difficulty <= 8) ||
        (difficultyFilter === 'extreme' && scenario.difficulty >= 9)
      
      return matchesSearch && matchesDifficulty
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular': return b.likes - a.likes
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'rating': return b.rating - a.rating
        default: return 0
      }
    })

  const toggleLike = (scenarioId: string) => {
    setScenarios(prev => 
      prev.map(scenario => 
        scenario.id === scenarioId 
          ? { 
              ...scenario, 
              isLiked: !scenario.isLiked,
              likes: scenario.isLiked ? scenario.likes - 1 : scenario.likes + 1
            }
          : scenario
      )
    )
  }

  const playScenario = (scenario: CustomScenario) => {
    setScenarios(prev => 
      prev.map(s => 
        s.id === scenario.id 
          ? { ...s, plays: s.plays + 1 }
          : s
      )
    )
    console.log(`Playing scenario: ${scenario.name}`)
  }

  const createScenario = () => {
    const newScenario: CustomScenario = {
      id: Date.now().toString(),
      ...builder,
      creator: 'You',
      likes: 0,
      plays: 0,
      rating: 0,
      isLiked: false,
      isOwned: true,
      createdAt: new Date().toISOString().split('T')[0]
    }
    
    setScenarios(prev => [newScenario, ...prev])
    setShowBuilder(false)
    
    // Reset builder
    setBuilder({
      name: '',
      description: '',
      difficulty: 5,
      duration: 60,
      targetCount: 20,
      targetSize: 1.0,
      targetSpeed: 1.0,
      spawnPattern: 'random',
      gameMode: 'precision',
      tags: [],
      isPublic: true
    })
  }

  const addTag = (tag: string) => {
    if (!builder.tags.includes(tag)) {
      setBuilder(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    }
  }

  const removeTag = (tag: string) => {
    setBuilder(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 3) return 'text-green-400 bg-green-400/10'
    if (difficulty <= 6) return 'text-yellow-400 bg-yellow-400/10'
    if (difficulty <= 8) return 'text-orange-400 bg-orange-400/10'
    return 'text-red-400 bg-red-400/10'
  }

  const getGameModeColor = (mode: CustomScenario['gameMode']) => {
    switch (mode) {
      case 'precision': return 'text-blue-400 bg-blue-400/10'
      case 'speed': return 'text-red-400 bg-red-400/10'
      case 'tracking': return 'text-green-400 bg-green-400/10'
      case 'flick': return 'text-purple-400 bg-purple-400/10'
      case 'mixed': return 'text-yellow-400 bg-yellow-400/10'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Custom Training Creator
          </h1>
          <p className="text-gray-400 text-lg">Create, share, and discover unique training scenarios</p>
        </motion.div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search scenarios..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <FaFilter className="text-gray-400" />
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy (1-3)</option>
                    <option value="medium">Medium (4-6)</option>
                    <option value="hard">Hard (7-8)</option>
                    <option value="extreme">Extreme (9-10)</option>
                  </select>
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={() => setShowBuilder(true)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2"
            >
              <FaPlus />
              <span>Create Scenario</span>
            </button>
          </div>
        </motion.div>

        {/* Scenarios Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredScenarios.map((scenario) => (
            <motion.div
              key={scenario.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{scenario.name}</h3>
                  <p className="text-sm text-gray-400">by {scenario.creator}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => toggleLike(scenario.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      scenario.isLiked ? 'text-red-400 bg-red-400/10' : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <FaHeart />
                  </button>
                  {scenario.isOwned && (
                    <button className="p-2 text-gray-400 hover:text-cyan-400 rounded-lg transition-colors">
                      <FaEdit />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4">{scenario.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-700/50 rounded">
                  <FaClock className="text-cyan-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Duration</p>
                  <p className="text-white font-semibold text-sm">{Math.floor(scenario.duration / 60)}:{(scenario.duration % 60).toString().padStart(2, '0')}</p>
                </div>
                <div className="text-center p-2 bg-gray-700/50 rounded">
                  <FaBullseye className="text-orange-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Targets</p>
                  <p className="text-white font-semibold text-sm">{scenario.targetCount}</p>
                </div>
              </div>

              {/* Tags and Difficulty */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(scenario.difficulty)}`}>
                    Difficulty {scenario.difficulty}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getGameModeColor(scenario.gameMode)}`}>
                    {scenario.gameMode}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {scenario.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs bg-gray-600/50 text-gray-300 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
                {scenario.tags.length > 3 && (
                  <span className="text-xs text-gray-400">+{scenario.tags.length - 3}</span>
                )}
              </div>

              {/* Bottom Stats */}
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <FaHeart className="mr-1" /> {scenario.likes}
                  </span>
                  <span className="flex items-center">
                    <FaEye className="mr-1" /> {scenario.plays}
                  </span>
                  <span className="flex items-center">
                    <FaStar className="mr-1 text-yellow-400" /> {scenario.rating}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => playScenario(scenario)}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                >
                  <FaPlay className="text-sm" />
                  <span>Play</span>
                </button>
                <button className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors">
                  <FaShare />
                </button>
                <button className="p-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors">
                  <FaDownload />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scenario Builder Modal */}
        {showBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Create Custom Scenario</h3>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Scenario Name</label>
                    <input
                      type="text"
                      value={builder.name}
                      onChange={(e) => setBuilder(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      placeholder="My Awesome Scenario"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Game Mode</label>
                    <select
                      value={builder.gameMode}
                      onChange={(e) => setBuilder(prev => ({ ...prev, gameMode: e.target.value as any }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="precision">Precision</option>
                      <option value="speed">Speed</option>
                      <option value="tracking">Tracking</option>
                      <option value="flick">Flick</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Description</label>
                  <textarea
                    value={builder.description}
                    onChange={(e) => setBuilder(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    rows={3}
                    placeholder="Describe your scenario..."
                  />
                </div>

                {/* Settings */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Difficulty (1-10)</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={builder.difficulty}
                      onChange={(e) => setBuilder(prev => ({ ...prev, difficulty: Number(e.target.value) }))}
                      className="w-full"
                    />
                    <span className="text-cyan-400 font-semibold">{builder.difficulty}</span>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Duration (seconds)</label>
                    <input
                      type="number"
                      value={builder.duration}
                      onChange={(e) => setBuilder(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Target Count</label>
                    <input
                      type="number"
                      value={builder.targetCount}
                      onChange={(e) => setBuilder(prev => ({ ...prev, targetCount: Number(e.target.value) }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Target Size</label>
                    <input
                      type="range"
                      min="0.2"
                      max="3"
                      step="0.1"
                      value={builder.targetSize}
                      onChange={(e) => setBuilder(prev => ({ ...prev, targetSize: Number(e.target.value) }))}
                      className="w-full"
                    />
                    <span className="text-cyan-400 font-semibold">{builder.targetSize}x</span>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Target Speed</label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={builder.targetSpeed}
                      onChange={(e) => setBuilder(prev => ({ ...prev, targetSpeed: Number(e.target.value) }))}
                      className="w-full"
                    />
                    <span className="text-cyan-400 font-semibold">{builder.targetSpeed}x</span>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Spawn Pattern</label>
                    <select
                      value={builder.spawnPattern}
                      onChange={(e) => setBuilder(prev => ({ ...prev, spawnPattern: e.target.value as any }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="random">Random</option>
                      <option value="grid">Grid</option>
                      <option value="circle">Circle</option>
                      <option value="line">Line</option>
                      <option value="wave">Wave</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className={`text-xs px-3 py-1 rounded-full transition-colors ${
                          builder.tags.includes(tag)
                            ? 'bg-cyan-600 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {builder.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-cyan-600 text-white px-3 py-1 rounded-full flex items-center space-x-1"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Public/Private */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={builder.isPublic}
                    onChange={(e) => setBuilder(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="w-4 h-4 text-cyan-600"
                  />
                  <label htmlFor="isPublic" className="text-white">Make scenario public</label>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowBuilder(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createScenario}
                    disabled={!builder.name || !builder.description}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors"
                  >
                    Create Scenario
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}