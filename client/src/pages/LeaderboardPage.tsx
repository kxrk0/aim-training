import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api'

interface LeaderboardEntry {
  id: string
  rank: number
  username: string
  score: number
  accuracy: number
  level: number
  totalScore: number
  hoursPlayed: number
  avatar?: string
  status: 'online' | 'in-game' | 'offline'
  change: string
  joinedAt: Date
  lastActive: Date
}

interface LeaderboardResponse {
  gameMode: string
  period: string
  leaderboard: LeaderboardEntry[]
  totalPlayers: number
  activePlayersNow: number
  lastUpdated: string
}

interface UserRankResponse {
  gameMode: string
  globalRank: number
  dailyRank: number
  weeklyRank: number
  score: number
  accuracy: number
  percentile: number
  pointsToNextRank: number
  trend: 'up' | 'down' | 'stable'
  totalMatches: number
  level: number
}

const timeframes = ['Live', '24h', '7d', '30d', 'All Time']
const categories = ['Overall', 'Precision', 'Speed', 'Tracking', 'Flick']

export function LeaderboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const [selectedTimeframe, setSelectedTimeframe] = useState('Live')
  const [selectedCategory, setSelectedCategory] = useState('Overall')
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [userRankData, setUserRankData] = useState<UserRankResponse | null>(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(true)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [activePlayersNow, setActivePlayersNow] = useState(0)

  // Fetch leaderboard data from API
  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      
      // Map timeframe to API period
      const periodMap = {
        'Live': 'all-time',
        '24h': 'daily', 
        '7d': 'weekly',
        '30d': 'monthly',
        'All Time': 'all-time'
      }
      
      // Map category to gameMode
      const gameModeMap = {
        'Overall': 'precision',
        'Precision': 'precision',
        'Speed': 'speed',
        'Tracking': 'tracking',
        'Flick': 'flick'
      }
      
      const period = periodMap[selectedTimeframe as keyof typeof periodMap] || 'all-time'
      const gameMode = gameModeMap[selectedCategory as keyof typeof gameModeMap] || 'precision'
      
      const response = await axios.get<LeaderboardResponse>(`${API_BASE_URL}/leaderboards/global`, {
        params: { 
          gameMode, 
          period,
          limit: 50
        }
      })
      
      if (response.data) {
        setLeaderboardData(response.data.leaderboard)
        setTotalPlayers(response.data.totalPlayers)
        setActivePlayersNow(response.data.activePlayersNow)
        setLastUpdate(new Date(response.data.lastUpdated))
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
      // Keep existing data on error
    } finally {
      setLoading(false)
    }
  }

  // Fetch user rank data
  const fetchUserRank = async () => {
    if (!user?.id || !isAuthenticated) return
    
    try {
      const gameMode = selectedCategory.toLowerCase() === 'overall' ? 'precision' : selectedCategory.toLowerCase()
      
            const response = await axios.get<UserRankResponse>(`${API_BASE_URL}/leaderboards/user-rank`, {
        params: { 
          gameMode, 
          userId: user.id 
        }
      })
      
      if (response.data) {
        setUserRankData(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch user rank:', error)
    }
  }

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchLeaderboard()
    fetchUserRank()
  }, [selectedTimeframe, selectedCategory, user?.id])

  // Real-time updates for Live mode
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (selectedTimeframe === 'Live') {
      interval = setInterval(() => {
        fetchLeaderboard()
        if (isAuthenticated) {
          fetchUserRank()
        }
      }, 5000) // Update every 5 seconds for real API
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [selectedTimeframe, selectedCategory, isAuthenticated, user?.id])

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      
      {/* Particle System */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 25 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
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
        className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl pointer-events-none"
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-black mb-4"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)',
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
            🏆 ELITE LEADERBOARD
          </motion.h1>
          <p className="text-xl text-gray-300 mb-2">
            Real-time rankings of the world's best FPS players
          </p>
          {selectedTimeframe === 'Live' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center space-x-4 text-green-400"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <span className="text-sm">🌍 {totalPlayers.toLocaleString()} Total Players</span>
              </div>
              <div className="flex items-center space-x-2 text-orange-400">
                <span className="text-sm">🟢 {activePlayersNow.toLocaleString()} Online Now</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Timeframe Filter */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
              <span className="mr-2">⏱️</span>
              Timeframe
            </h3>
            <div className="flex flex-wrap gap-2">
              {timeframes.map((timeframe) => (
                <motion.button
                  key={timeframe}
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    selectedTimeframe === timeframe
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {timeframe === 'Live' && <span className="mr-1">🔴</span>}
                  {timeframe}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Category
            </h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white backdrop-blur-sm focus:border-purple-500 focus:outline-none transition-colors"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </motion.div>
        </div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-gray-600/50">
                <tr>
                  <th className="text-left py-6 px-6 text-blue-400 font-bold">Rank</th>
                  <th className="text-left py-6 px-6 text-blue-400 font-bold">Player</th>
                  <th className="text-left py-6 px-6 text-blue-400 font-bold">Score</th>
                  <th className="text-left py-6 px-6 text-blue-400 font-bold">Accuracy</th>
                  <th className="text-left py-6 px-6 text-blue-400 font-bold">Status</th>
                  <th className="text-left py-6 px-6 text-blue-400 font-bold">Change</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 8 }).map((_, index) => (
                    <tr key={`loading-${index}`} className="border-b border-gray-700/30">
                      <td className="py-6 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
                        </div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="w-32 h-4 bg-gray-700 rounded animate-pulse"></div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="w-16 h-4 bg-gray-700 rounded animate-pulse"></div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="w-20 h-6 bg-gray-700 rounded-full animate-pulse"></div>
                      </td>
                      <td className="py-6 px-6">
                        <div className="w-12 h-4 bg-gray-700 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  leaderboardData.map((player, index) => (
                  <motion.tr
                    key={player.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-all duration-300 group"
                  >
                    <td className="py-6 px-6">
                      <div className="flex items-center space-x-3">
                        <motion.div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                            player.rank === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' :
                            player.rank === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                            player.rank === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' :
                            'bg-gradient-to-r from-gray-600 to-gray-800 text-white'
                          }`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          {player.rank}
                        </motion.div>
                        {player.rank <= 3 && (
                          <motion.span 
                            className="text-2xl"
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {player.rank === 1 ? '👑' : player.rank === 2 ? '🥈' : '🥉'}
                          </motion.span>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">
                            {player.username}
                          </div>
                          <div className="text-gray-400 text-sm">Elite Player</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {player.score.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="text-white font-semibold">{player.accuracy.toFixed(1)}%</div>
                        <div className={`w-2 h-2 rounded-full ${
                          player.accuracy > 90 ? 'bg-green-400' :
                          player.accuracy > 85 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}></div>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                        player.status === 'online' ? 'bg-green-500/20 text-green-400' :
                        player.status === 'in-game' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          player.status === 'online' ? 'bg-green-400 animate-pulse' :
                          player.status === 'in-game' ? 'bg-orange-400 animate-pulse' :
                          'bg-gray-400'
                        }`}></div>
                        <span className="capitalize">{player.status}</span>
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className={`flex items-center space-x-2 font-semibold ${
                        player.change.startsWith('+') ? 'text-green-400' :
                        player.change.startsWith('-') ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        <motion.span
                          animate={{ 
                            y: player.change.startsWith('+') ? [-2, 2, -2] : 
                                player.change.startsWith('-') ? [2, -2, 2] : [0]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {player.change.startsWith('+') ? '↗️' :
                           player.change.startsWith('-') ? '↘️' : '➡️'}
                        </motion.span>
                        <span>{player.change}</span>
                      </div>
                    </td>
                  </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Your Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50"
        >
          <h3 className="text-2xl font-bold text-center text-white mb-8 flex items-center justify-center">
            <span className="mr-3">🎯</span>
            {isAuthenticated ? `${user?.username}'s Elite Performance` : 'Your Elite Performance (Login Required)'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { 
                label: 'Current Rank', 
                value: userRankData ? `#${userRankData.globalRank.toLocaleString()}` : '#--', 
                icon: '🏆', 
                color: 'text-yellow-400' 
              },
              { 
                label: 'Best Score', 
                value: userRankData ? userRankData.score.toLocaleString() : '--', 
                icon: '🎯', 
                color: 'text-blue-400' 
              },
              { 
                label: 'Avg Accuracy', 
                value: userRankData ? `${userRankData.accuracy.toFixed(1)}%` : '--%', 
                icon: '📊', 
                color: 'text-green-400' 
              },
              { 
                label: 'Percentile', 
                value: userRankData ? `${userRankData.percentile}%` : '--%', 
                icon: '📈', 
                color: 'text-purple-400' 
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="text-center group cursor-pointer bg-gray-800/30 rounded-xl p-6 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}