import { motion } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { useAchievementStore } from '@/stores/achievementStore'
import { AchievementCard } from './AchievementCard'
import { FaTrophy, FaStar, FaCrown, FaBolt, FaGem, FaFire, FaFilter, FaSearch, FaSort, FaEye, FaEyeSlash } from 'react-icons/fa'

const CATEGORIES = [
  { id: 'all', name: 'All', icon: <FaTrophy />, color: 'text-orange-400' },
  { id: 'training', name: 'Training', icon: <FaTrophy />, color: 'text-blue-400' },
  { id: 'accuracy', name: 'Accuracy', icon: <FaBolt />, color: 'text-yellow-400' },
  { id: 'streak', name: 'Streaks', icon: <FaFire />, color: 'text-red-400' },
  { id: 'competition', name: 'Competition', icon: <FaCrown />, color: 'text-purple-400' },
  { id: 'social', name: 'Social', icon: <FaStar />, color: 'text-pink-400' },
  { id: 'progression', name: 'Progression', icon: <FaGem />, color: 'text-green-400' },
  { id: 'special', name: 'Special', icon: <FaStar />, color: 'text-cyan-400' }
]

const DIFFICULTIES = [
  { id: 'all', name: 'All Difficulties', color: '#gray' },
  { id: 'bronze', name: 'Bronze', color: '#CD7F32' },
  { id: 'silver', name: 'Silver', color: '#C0C0C0' },
  { id: 'gold', name: 'Gold', color: '#FFD700' },
  { id: 'platinum', name: 'Platinum', color: '#E5E4E2' },
  { id: 'diamond', name: 'Diamond', color: '#B9F2FF' }
]

const SORT_OPTIONS = [
  { id: 'name', name: 'Name' },
  { id: 'difficulty', name: 'Difficulty' },
  { id: 'progress', name: 'Progress' },
  { id: 'category', name: 'Category' },
  { id: 'xpReward', name: 'XP Reward' }
]

export function AchievementDashboard() {
  const {
    achievements,
    userAchievements,
    isLoading,
    error,
    selectedCategory,
    selectedDifficulty,
    showCompleted,
    showHidden,
    setSelectedCategory,
    setSelectedDifficulty,
    toggleShowCompleted,
    toggleShowHidden,
    fetchAchievements,
    fetchUserAchievements,
    getCompletedAchievements
  } = useAchievementStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Initialize data
  useEffect(() => {
    fetchAchievements()
    fetchUserAchievements()
  }, [fetchAchievements, fetchUserAchievements])
  
  // Statistics
  const completedAchievements = getCompletedAchievements()
  const totalAchievements = achievements.length
  const completionPercentage = totalAchievements > 0 ? (completedAchievements.length / totalAchievements) * 100 : 0
  
  const totalXPEarned = completedAchievements.reduce((sum, ua) => sum + ua.achievement.xpReward, 0)
  
  // Filtered and sorted achievements
  const filteredAchievements = useMemo(() => {
    let filtered = achievements.filter(achievement => {
      // Category filter
      if (selectedCategory && selectedCategory !== 'all' && achievement.category !== selectedCategory) {
        return false
      }
      
      // Difficulty filter
      if (selectedDifficulty && selectedDifficulty !== 'all' && achievement.difficulty !== selectedDifficulty) {
        return false
      }
      
      // Search filter
      if (searchTerm && !achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !achievement.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Get user achievement
      const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id)
      
      // Completed filter
      if (!showCompleted && userAchievement?.isCompleted) {
        return false
      }
      
      // Hidden filter
      if (!showHidden && achievement.isHidden && !userAchievement) {
        return false
      }
      
      return true
    })
    
    // Sort achievements
    filtered.sort((a, b) => {
      const userAchievementA = userAchievements.find(ua => ua.achievementId === a.id)
      const userAchievementB = userAchievements.find(ua => ua.achievementId === b.id)
      
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'difficulty':
          const difficultyOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
          comparison = difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty)
          break
        case 'progress':
          const progressA = userAchievementA ? (userAchievementA.currentProgress / a.maxProgress) * 100 : 0
          const progressB = userAchievementB ? (userAchievementB.currentProgress / b.maxProgress) * 100 : 0
          comparison = progressB - progressA // Higher progress first
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
        case 'xpReward':
          comparison = b.xpReward - a.xpReward // Higher XP first
          break
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [achievements, userAchievements, selectedCategory, selectedDifficulty, searchTerm, showCompleted, showHidden, sortBy, sortOrder])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          className="text-4xl text-orange-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FaTrophy />
        </motion.div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center text-red-400 py-8">
        <p>Failed to load achievements: {error}</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">🏆 Achievements</h1>
          <p className="text-gray-400">
            Track your progress and unlock amazing rewards
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-400">
            {completedAchievements.length} / {totalAchievements}
          </div>
          <div className="text-sm text-gray-400">
            {Math.round(completionPercentage)}% Complete
          </div>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center space-x-3">
            <FaTrophy className="text-2xl text-blue-400" />
            <div>
              <div className="text-xl font-bold text-white">{completedAchievements.length}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center space-x-3">
            <FaBolt className="text-2xl text-yellow-400" />
            <div>
              <div className="text-xl font-bold text-white">{totalXPEarned.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total XP Earned</div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center space-x-3">
            <FaGem className="text-2xl text-green-400" />
            <div>
              <div className="text-xl font-bold text-white">{Math.round(completionPercentage)}%</div>
              <div className="text-sm text-gray-400">Completion Rate</div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center space-x-3">
            <FaFire className="text-2xl text-purple-400" />
            <div>
              <div className="text-xl font-bold text-white">
                {achievements.filter(a => a.difficulty === 'diamond').length}
              </div>
              <div className="text-sm text-gray-400">Diamond Tier</div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-lg p-4">
        {/* Category Filters */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id === 'all' ? null : category.id)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all
                  ${selectedCategory === category.id || (selectedCategory === null && category.id === 'all')
                    ? 'border-orange-400/50 bg-orange-400/20 text-orange-400'
                    : 'border-gray-600/30 bg-gray-700/30 text-gray-300 hover:border-gray-500/50'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={category.color}>{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:border-orange-400/50 focus:outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedDifficulty || 'all'}
              onChange={(e) => setSelectedDifficulty(e.target.value === 'all' ? null : e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:border-orange-400/50 focus:outline-none"
            >
              {DIFFICULTIES.map(difficulty => (
                <option key={difficulty.id} value={difficulty.id}>
                  {difficulty.name}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:border-orange-400/50 focus:outline-none"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.id} value={option.id}>
                  Sort by {option.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white hover:border-gray-500/50 transition-colors"
            >
              <FaSort />
            </button>
            
            <button
              onClick={toggleShowCompleted}
              className={`p-2 border rounded-lg transition-colors ${
                showCompleted 
                  ? 'border-green-400/50 bg-green-400/20 text-green-400' 
                  : 'border-gray-600/30 bg-gray-700/50 text-gray-300'
              }`}
              title={showCompleted ? 'Hide completed' : 'Show completed'}
            >
              {showCompleted ? <FaEye /> : <FaEyeSlash />}
            </button>
            
            <button
              onClick={toggleShowHidden}
              className={`p-2 border rounded-lg transition-colors ${
                showHidden 
                  ? 'border-yellow-400/50 bg-yellow-400/20 text-yellow-400' 
                  : 'border-gray-600/30 bg-gray-700/50 text-gray-300'
              }`}
              title={showHidden ? 'Hide locked achievements' : 'Show locked achievements'}
            >
              <FaFilter />
            </button>
          </div>
        </div>
      </div>
      
      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAchievements.map(achievement => {
          const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id)
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AchievementCard
                achievement={achievement}
                userAchievement={userAchievement}
                size="medium"
                showProgress={true}
              />
            </motion.div>
          )
        })}
      </div>
      
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <FaTrophy className="text-4xl text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No achievements found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </div>
  )
} 