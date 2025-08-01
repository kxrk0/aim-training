import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaUserFriends, FaUserPlus, FaSearch, FaTrophy, FaFire, FaComment, FaGamepad, FaChartLine, FaCrown, FaStar, FaGift } from 'react-icons/fa'

interface Friend {
  id: string
  username: string
  level: number
  isOnline: boolean
  lastSeen: string
  currentActivity: string
  rank: number
  avatar: string
}

interface Challenge {
  id: string
  title: string
  description: string
  type: 'daily' | 'weekly' | 'friend' | 'community'
  progress: number
  target: number
  reward: string
  timeLeft: string
  isCompleted: boolean
  participants?: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: string
  progress?: number
  target?: number
}

interface LeaderboardEntry {
  rank: number
  username: string
  score: number
  change: number
  avatar: string
  level: number
}

export const SocialFeatures: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'friends' | 'challenges' | 'achievements' | 'leaderboard'>('friends')

  const mockFriends: Friend[] = [
    {
      id: '1',
      username: 'PrecisionAce',
      level: 67,
      isOnline: true,
      lastSeen: '',
      currentActivity: 'Training - Flick Shots',
      rank: 1247,
      avatar: '/api/placeholder/40/40'
    },
    {
      id: '2',
      username: 'QuickShotPro',
      level: 54,
      isOnline: true,
      lastSeen: '',
      currentActivity: 'In Sensitivity Finder',
      rank: 2156,
      avatar: '/api/placeholder/40/40'
    },
    {
      id: '3',
      username: 'AimLegend',
      level: 72,
      isOnline: false,
      lastSeen: '2 hours ago',
      currentActivity: '',
      rank: 892,
      avatar: '/api/placeholder/40/40'
    }
  ]

  const mockChallenges: Challenge[] = [
    {
      id: '1',
      title: 'Daily Precision Master',
      description: 'Achieve 85%+ accuracy in 5 precision training sessions',
      type: 'daily',
      progress: 3,
      target: 5,
      reward: '100 XP + Precision Badge',
      timeLeft: '6h 23m',
      isCompleted: false
    },
    {
      id: '2',
      title: 'Flick Shot Marathon',
      description: 'Complete 500 flick shots with 70%+ accuracy',
      type: 'weekly',
      progress: 347,
      target: 500,
      reward: '500 XP + Flick Master Title',
      timeLeft: '3d 12h',
      isCompleted: false
    },
    {
      id: '3',
      title: 'Community Target Destroyer',
      description: 'Help the community destroy 1M targets this week',
      type: 'community',
      progress: 743521,
      target: 1000000,
      reward: 'Exclusive Avatar Frame',
      timeLeft: '4d 8h',
      isCompleted: false,
      participants: 2847
    },
    {
      id: '4',
      title: 'Friend Duel Victory',
      description: 'Win 3 training duels against friends',
      type: 'friend',
      progress: 1,
      target: 3,
      reward: '200 XP + Duelist Badge',
      timeLeft: '2d 15h',
      isCompleted: false
    }
  ]

  const mockAchievements: Achievement[] = [
    {
      id: '1',
      title: 'First Blood',
      description: 'Hit your first target in training',
      icon: '🎯',
      rarity: 'common',
      unlockedAt: '2024-12-15'
    },
    {
      id: '2',
      title: 'Precision Master',
      description: 'Achieve 90%+ accuracy in a training session',
      icon: '🏆',
      rarity: 'rare',
      unlockedAt: '2024-12-18'
    },
    {
      id: '3',
      title: 'Speed Demon',
      description: 'Complete 100 targets in under 60 seconds',
      icon: '⚡',
      rarity: 'epic',
      progress: 89,
      target: 100
    },
    {
      id: '4',
      title: 'Legendary Aimer',
      description: 'Maintain 95%+ accuracy for 10 consecutive sessions',
      icon: '👑',
      rarity: 'legendary',
      progress: 7,
      target: 10
    }
  ]

  const mockLeaderboard: LeaderboardEntry[] = [
    { rank: 1, username: 'AimGod2024', score: 15420, change: 2, avatar: '/api/placeholder/40/40', level: 89 },
    { rank: 2, username: 'PrecisionKing', score: 14967, change: -1, avatar: '/api/placeholder/40/40', level: 85 },
    { rank: 3, username: 'FlickMaster', score: 14523, change: 1, avatar: '/api/placeholder/40/40', level: 82 },
    { rank: 4, username: 'TrackingPro', score: 13890, change: 0, avatar: '/api/placeholder/40/40', level: 78 },
    { rank: 5, username: 'QuickDraw99', score: 13456, change: 3, avatar: '/api/placeholder/40/40', level: 76 }
  ]

  useEffect(() => {
    setFriends(mockFriends)
    setChallenges(mockChallenges)
    setAchievements(mockAchievements)
    setLeaderboard(mockLeaderboard)
  }, [])

  const addFriend = (username: string) => {
    console.log(`Sending friend request to ${username}`)
  }

  const challengeFriend = (friendId: string) => {
    console.log(`Challenging friend ${friendId}`)
  }

  const joinChallenge = (challengeId: string) => {
    console.log(`Joining challenge ${challengeId}`)
  }

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400/30'
      case 'rare': return 'text-blue-400 border-blue-400/30'
      case 'epic': return 'text-purple-400 border-purple-400/30'
      case 'legendary': return 'text-yellow-400 border-yellow-400/30'
    }
  }

  const getChallengeTypeColor = (type: Challenge['type']) => {
    switch (type) {
      case 'daily': return 'text-green-400 bg-green-400/10'
      case 'weekly': return 'text-blue-400 bg-blue-400/10'
      case 'friend': return 'text-purple-400 bg-purple-400/10'
      case 'community': return 'text-orange-400 bg-orange-400/10'
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Social Hub
          </h1>
          <p className="text-gray-400 text-lg">Connect with friends, complete challenges, and showcase achievements</p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 border border-gray-700 mb-8"
        >
          <div className="flex space-x-2">
            {[
              { id: 'friends', label: 'Friends', icon: FaUserFriends },
              { id: 'challenges', label: 'Challenges', icon: FaFire },
              { id: 'achievements', label: 'Achievements', icon: FaTrophy },
              { id: 'leaderboard', label: 'Leaderboard', icon: FaCrown }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Friends ({friends.length})</h3>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search friends..."
                          className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                        />
                      </div>
                      <button className="bg-pink-600 hover:bg-pink-500 text-white p-2 rounded-lg transition-colors">
                        <FaUserPlus />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {friends.map((friend) => (
                      <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">
                                {friend.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                              friend.isOnline ? 'bg-green-400' : 'bg-gray-500'
                            }`}></div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{friend.username}</h4>
                            <p className="text-sm text-gray-400">Level {friend.level} • #{friend.rank}</p>
                            <p className="text-xs text-gray-500">
                              {friend.isOnline ? friend.currentActivity : `Last seen ${friend.lastSeen}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => challengeFriend(friend.id)}
                            className="bg-orange-600 hover:bg-orange-500 text-white p-2 rounded-lg transition-colors"
                            title="Challenge to duel"
                          >
                            <FaGamepad />
                          </button>
                          <button className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors">
                            <FaComment />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">Your Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Global Rank</span>
                      <span className="text-pink-400 font-bold">#1,247</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Friends Rank</span>
                      <span className="text-green-400 font-bold">#2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win Rate</span>
                      <span className="text-blue-400 font-bold">78.5%</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3 text-sm">
                    <div className="text-gray-300">
                      <span className="text-green-400">PrecisionAce</span> completed a challenge
                    </div>
                    <div className="text-gray-300">
                      <span className="text-blue-400">QuickShotPro</span> reached level 54
                    </div>
                    <div className="text-gray-300">
                      <span className="text-purple-400">AimLegend</span> unlocked an achievement
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Challenges Tab */}
          {activeTab === 'challenges' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-bold text-white">{challenge.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getChallengeTypeColor(challenge.type)}`}>
                          {challenge.type}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{challenge.description}</p>
                    </div>
                    <FaFire className="text-orange-400 text-xl" />
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-pink-400">
                        {challenge.progress.toLocaleString()}/{challenge.target.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Reward</p>
                      <p className="text-green-400 font-semibold">{challenge.reward}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Time left</p>
                      <p className="text-orange-400 font-semibold">{challenge.timeLeft}</p>
                    </div>
                  </div>

                  {challenge.participants && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400">
                        {challenge.participants.toLocaleString()} participants
                      </p>
                    </div>
                  )}

                  <button 
                    onClick={() => joinChallenge(challenge.id)}
                    disabled={challenge.isCompleted}
                    className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
                  >
                    {challenge.isCompleted ? 'Completed' : 'Join Challenge'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border transition-all ${
                    achievement.unlockedAt 
                      ? `${getRarityColor(achievement.rarity)} hover:scale-105` 
                      : 'border-gray-700 opacity-60'
                  }`}
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-1">{achievement.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm text-center mb-4">{achievement.description}</p>

                  {achievement.unlockedAt ? (
                    <div className="text-center">
                      <p className="text-green-400 text-sm">Unlocked</p>
                      <p className="text-gray-400 text-xs">{new Date(achievement.unlockedAt).toLocaleDateString()}</p>
                    </div>
                  ) : achievement.progress !== undefined ? (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-pink-400">{achievement.progress}/{achievement.target}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-pink-500 h-2 rounded-full"
                          style={{ width: `${(achievement.progress! / achievement.target!) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Locked</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Global Leaderboard</h3>
                <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>All Time</option>
                </select>
              </div>

              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div 
                    key={entry.rank}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30' : 'bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xl font-bold ${
                          entry.rank === 1 ? 'text-yellow-400' :
                          entry.rank === 2 ? 'text-gray-300' :
                          entry.rank === 3 ? 'text-orange-400' :
                          'text-gray-400'
                        }`}>
                          #{entry.rank}
                        </span>
                        {entry.rank === 1 && <FaCrown className="text-yellow-400" />}
                      </div>
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {entry.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{entry.username}</h4>
                        <p className="text-sm text-gray-400">Level {entry.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">{entry.score.toLocaleString()}</p>
                      <div className="flex items-center space-x-1">
                        <span className={`text-sm ${
                          entry.change > 0 ? 'text-green-400' :
                          entry.change < 0 ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {entry.change > 0 ? '+' : ''}{entry.change}
                        </span>
                        <FaChartLine className={`text-xs ${
                          entry.change > 0 ? 'text-green-400' :
                          entry.change < 0 ? 'text-red-400' :
                          'text-gray-400'
                        }`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}