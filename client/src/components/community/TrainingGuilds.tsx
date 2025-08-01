import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaUsers, FaTrophy, FaPlus, FaCrown, FaFire, FaStar, FaSearch, FaFilter, FaUserPlus, FaChartLine } from 'react-icons/fa'

interface Guild {
  id: string
  name: string
  description: string
  memberCount: number
  maxMembers: number
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  weeklyGoal: number
  currentProgress: number
  leader: string
  isPublic: boolean
  isJoined: boolean
  rank: number
}

interface GuildMember {
  id: string
  username: string
  level: number
  weeklyContribution: number
  rank: 'Leader' | 'Officer' | 'Member'
  isOnline: boolean
}

interface Challenge {
  id: string
  title: string
  description: string
  target: number
  current: number
  reward: string
  endDate: string
  isActive: boolean
}

export const TrainingGuilds: React.FC = () => {
  const [guilds, setGuilds] = useState<Guild[]>([])
  const [selectedGuild, setSelectedGuild] = useState<Guild | null>(null)
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [skillFilter, setSkillFilter] = useState<string>('all')
  const [showCreateGuild, setShowCreateGuild] = useState(false)

  const mockGuilds: Guild[] = [
    {
      id: '1',
      name: 'Elite Precision Squad',
      description: 'Dedicated to mastering precision aiming through consistent daily practice',
      memberCount: 24,
      maxMembers: 30,
      skillLevel: 'Advanced',
      weeklyGoal: 500,
      currentProgress: 387,
      leader: 'AimMaster2024',
      isPublic: true,
      isJoined: true,
      rank: 3
    },
    {
      id: '2',
      name: 'Flick Shot Legends',
      description: 'Masters of flick shots and quick reflexes. Join us for daily flick challenges!',
      memberCount: 18,
      maxMembers: 25,
      skillLevel: 'Expert',
      weeklyGoal: 750,
      currentProgress: 623,
      leader: 'FlickGod',
      isPublic: true,
      isJoined: false,
      rank: 1
    },
    {
      id: '3',
      name: 'Aim Academy',
      description: 'Learning together, growing together. Perfect for beginners and intermediate players',
      memberCount: 45,
      maxMembers: 50,
      skillLevel: 'Beginner',
      weeklyGoal: 300,
      currentProgress: 245,
      leader: 'Coach_Mike',
      isPublic: true,
      isJoined: false,
      rank: 8
    },
    {
      id: '4',
      name: 'Competitive Crusaders',
      description: 'Preparing for tournaments and competitive play. Serious training only.',
      memberCount: 12,
      maxMembers: 15,
      skillLevel: 'Expert',
      weeklyGoal: 1000,
      currentProgress: 856,
      leader: 'ProAimer',
      isPublic: false,
      isJoined: false,
      rank: 2
    }
  ]

  const mockMembers: GuildMember[] = [
    {
      id: '1',
      username: 'AimMaster2024',
      level: 67,
      weeklyContribution: 85,
      rank: 'Leader',
      isOnline: true
    },
    {
      id: '2',
      username: 'QuickShot_99',
      level: 54,
      weeklyContribution: 72,
      rank: 'Officer',
      isOnline: true
    },
    {
      id: '3',
      username: 'PrecisionPro',
      level: 48,
      weeklyContribution: 68,
      rank: 'Member',
      isOnline: false
    },
    {
      id: '4',
      username: 'SteadyAim',
      level: 42,
      weeklyContribution: 45,
      rank: 'Member',
      isOnline: true
    }
  ]

  const mockChallenges: Challenge[] = [
    {
      id: '1',
      title: 'Weekly Precision Challenge',
      description: 'Achieve 80%+ accuracy in 10 precision training sessions',
      target: 10,
      current: 7,
      reward: '50 Guild Points + Special Badge',
      endDate: '2024-12-27',
      isActive: true
    },
    {
      id: '2',
      title: 'Team Flick Marathon',
      description: 'Complete 1000 flick shots as a guild this week',
      target: 1000,
      current: 743,
      reward: 'Guild Banner Upgrade',
      endDate: '2024-12-25',
      isActive: true
    }
  ]

  useEffect(() => {
    setGuilds(mockGuilds)
    setGuildMembers(mockMembers)
    setChallenges(mockChallenges)
  }, [])

  const filteredGuilds = guilds.filter(guild => {
    const matchesSearch = guild.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guild.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSkill = skillFilter === 'all' || guild.skillLevel.toLowerCase() === skillFilter
    return matchesSearch && matchesSkill
  })

  const joinGuild = (guildId: string) => {
    setGuilds(prev => 
      prev.map(guild => 
        guild.id === guildId 
          ? { ...guild, isJoined: true, memberCount: guild.memberCount + 1 }
          : guild
      )
    )
  }

  const leaveGuild = (guildId: string) => {
    setGuilds(prev => 
      prev.map(guild => 
        guild.id === guildId 
          ? { ...guild, isJoined: false, memberCount: guild.memberCount - 1 }
          : guild
      )
    )
  }

  const getSkillColor = (skill: Guild['skillLevel']) => {
    switch (skill) {
      case 'Beginner': return 'text-green-400 bg-green-400/10 border-green-400/30'
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'Advanced': return 'text-orange-400 bg-orange-400/10 border-orange-400/30'
      case 'Expert': return 'text-red-400 bg-red-400/10 border-red-400/30'
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <FaCrown className="text-yellow-400" />
    if (rank <= 3) return <FaTrophy className="text-orange-400" />
    return <FaStar className="text-gray-400" />
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-4">
            Training Guilds
          </h1>
          <p className="text-gray-400 text-lg">Join communities of players with shared training goals</p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search guilds..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaFilter className="text-gray-400" />
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="all">All Skill Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <button 
                onClick={() => setShowCreateGuild(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2"
              >
                <FaPlus />
                <span>Create Guild</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Guilds List */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-4"
          >
            {filteredGuilds.map((guild) => (
              <motion.div
                key={guild.id}
                onClick={() => setSelectedGuild(guild)}
                className={`p-6 rounded-xl border cursor-pointer transition-all ${
                  selectedGuild?.id === guild.id 
                    ? 'border-emerald-500/50 bg-emerald-500/10' 
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{guild.name}</h3>
                      {getRankIcon(guild.rank)}
                      <span className="text-sm text-gray-400">#{guild.rank}</span>
                    </div>
                    <p className="text-gray-300 mb-3">{guild.description}</p>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getSkillColor(guild.skillLevel)}`}>
                        {guild.skillLevel}
                      </span>
                      <span className="text-sm text-gray-400">
                        <FaUsers className="inline mr-1" />
                        {guild.memberCount}/{guild.maxMembers}
                      </span>
                      <span className="text-sm text-gray-400">Leader: {guild.leader}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    {guild.isJoined ? (
                      <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full">
                        Joined
                      </span>
                    ) : (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          joinGuild(guild.id)
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1 rounded-full transition-colors"
                      >
                        Join
                      </button>
                    )}
                    
                    {!guild.isPublic && (
                      <span className="text-xs text-yellow-400">Private</span>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Weekly Goal Progress</span>
                    <span className="text-emerald-400">{guild.currentProgress}/{guild.weeklyGoal}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(guild.currentProgress / guild.weeklyGoal) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Guild Details & Challenges */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Selected Guild Details */}
            {selectedGuild && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">{selectedGuild.name}</h3>
                
                {/* Guild Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                    <FaUsers className="text-emerald-400 text-xl mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Members</p>
                    <p className="text-white font-bold">{selectedGuild.memberCount}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                    <FaChartLine className="text-blue-400 text-xl mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Weekly Goal</p>
                    <p className="text-white font-bold">{selectedGuild.weeklyGoal}</p>
                  </div>
                </div>

                {/* Top Members */}
                <div className="mb-6">
                  <h4 className="font-semibold text-white mb-3">Top Contributors</h4>
                  <div className="space-y-2">
                    {guildMembers.slice(0, 3).map((member, index) => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">#{index + 1}</span>
                          <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                          <span className="text-sm text-white">{member.username}</span>
                          {member.rank === 'Leader' && <FaCrown className="text-yellow-400 text-xs" />}
                        </div>
                        <span className="text-xs text-emerald-400">{member.weeklyContribution}pts</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {selectedGuild.isJoined ? (
                    <>
                      <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg transition-colors">
                        Guild Chat
                      </button>
                      <button 
                        onClick={() => leaveGuild(selectedGuild.id)}
                        className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition-colors"
                      >
                        Leave Guild
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => joinGuild(selectedGuild.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <FaUserPlus />
                      <span>Join Guild</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Active Challenges */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <FaFire className="mr-3 text-orange-400" />
                Guild Challenges
              </h3>
              
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <h5 className="font-semibold text-orange-400 mb-2">{challenge.title}</h5>
                    <p className="text-sm text-gray-300 mb-3">{challenge.description}</p>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-orange-400">{challenge.current}/{challenge.target}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${(challenge.current / challenge.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-green-400">{challenge.reward}</span>
                      <span className="text-gray-400">Ends {new Date(challenge.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}