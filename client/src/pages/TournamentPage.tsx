import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTournamentStore, TournamentHelpers } from '@/stores/tournamentStore'
import { useAuthStore } from '@/stores/authStore'
import { TournamentBrowser } from '@/components/tournament/TournamentBrowser'
import { TournamentCreator } from '@/components/tournament/TournamentCreator'
import type { Tournament } from '../../../shared/types'
import {
  FaTrophy, FaPlus, FaCog, FaUsers, FaCalendarAlt, FaEye,
  FaChartLine, FaMedal, FaFire, FaClock, FaStar, FaFilter,
  FaSearch, FaArrowLeft, FaBroadcastTower, FaGamepad
} from 'react-icons/fa'

export default function TournamentPage() {
  const {
    tournaments,
    userTournaments,
    activeTournament,
    registeredTournaments,
    isCreatingTournament,
    isLoadingTournaments,
    selectedTournament,
    error,
    setCreatingTournament,
    setSelectedTournament,
    createTournament,
    registerForTournament,
    unregisterFromTournament,
    fetchTournaments
  } = useTournamentStore()

  const { user } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState<'browse' | 'my-tournaments' | 'create' | 'management'>('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'registration' | 'active' | 'finished'>('all')
  const [gameModeFilter, setGameModeFilter] = useState<'all' | 'precision' | 'speed' | 'tracking' | 'flick'>('all')

  // Fetch tournaments on mount
  useEffect(() => {
    fetchTournaments()
  }, [fetchTournaments])

  // Filter tournaments
  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tournament.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter
    const matchesGameMode = gameModeFilter === 'all' || tournament.gameMode === gameModeFilter
    
    return matchesSearch && matchesStatus && matchesGameMode
  })

  const handleCreateTournament = async (tournamentData: Partial<Tournament>) => {
    try {
      await createTournament(tournamentData)
      setActiveTab('my-tournaments')
    } catch (error) {
      console.error('Failed to create tournament:', error)
    }
  }

  const handleRegisterForTournament = async (tournamentId: string) => {
    if (!user) return
    try {
      await registerForTournament(tournamentId, user.id)
    } catch (error) {
      console.error('Failed to register for tournament:', error)
    }
  }

  const handleUnregisterFromTournament = async (tournamentId: string) => {
    if (!user) return
    try {
      await unregisterFromTournament(tournamentId, user.id)
    } catch (error) {
      console.error('Failed to unregister from tournament:', error)
    }
  }

  // Tab configurations
  const tabs = [
    { id: 'browse', name: 'Browse Tournaments', icon: <FaEye />, description: 'Discover and join tournaments' },
    { id: 'my-tournaments', name: 'My Tournaments', icon: <FaMedal />, description: 'Tournaments you created or joined' },
    { id: 'create', name: 'Create Tournament', icon: <FaPlus />, description: 'Host your own tournament' },
    { id: 'management', name: 'Management', icon: <FaCog />, description: 'Manage your tournaments' }
  ]

  // Quick stats
  const stats = {
    totalTournaments: tournaments.length,
    activeTournaments: tournaments.filter(t => t.status === 'active').length,
    registrationOpen: tournaments.filter(t => t.status === 'registration').length,
    userRegistered: registeredTournaments.length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center space-x-4">
            <FaTrophy className="text-yellow-400" />
            <span>Tournaments</span>
          </h1>
          <p className="text-xl text-gray-400 mb-6">Compete, Win, and Become a Legend</p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">{stats.totalTournaments}</div>
              <div className="text-gray-400 text-sm">Total Tournaments</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-green-400">{stats.activeTournaments}</div>
              <div className="text-gray-400 text-sm">Active Now</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-yellow-400">{stats.registrationOpen}</div>
              <div className="text-gray-400 text-sm">Open Registration</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-purple-400">{stats.userRegistered}</div>
              <div className="text-gray-400 text-sm">You're Registered</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group flex items-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700'
                }`}
              >
                <div className={`text-xl ${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                  {tab.icon}
                </div>
                <div className="text-left">
                  <div className="font-semibold">{tab.name}</div>
                  <div className="text-xs opacity-75">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-600/20 border border-red-600/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* Browse Tournaments */}
          {activeTab === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Filters */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <FaFilter />
                  <span>Filters</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Search</label>
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tournaments..."
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 transition-colors"
                    >
                      <option value="all">All Status</option>
                      <option value="registration">Registration Open</option>
                      <option value="active">Active</option>
                      <option value="finished">Finished</option>
                    </select>
                  </div>

                  {/* Game Mode Filter */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Game Mode</label>
                    <select
                      value={gameModeFilter}
                      onChange={(e) => setGameModeFilter(e.target.value as any)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 transition-colors"
                    >
                      <option value="all">All Modes</option>
                      <option value="precision">Precision</option>
                      <option value="speed">Speed</option>
                      <option value="tracking">Tracking</option>
                      <option value="flick">Flick</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tournament Grid */}
              {isLoadingTournaments ? (
                <div className="text-center py-12">
                  <div className="animate-spin text-4xl text-blue-400 mb-4">⚙️</div>
                  <p className="text-gray-400">Loading tournaments...</p>
                </div>
              ) : filteredTournaments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTournaments.map((tournament) => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      onRegister={() => handleRegisterForTournament(tournament.id)}
                      onUnregister={() => handleUnregisterFromTournament(tournament.id)}
                      onView={() => setSelectedTournament(tournament)}
                      userId={user?.id}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaTrophy className="text-6xl text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Tournaments Found</h3>
                  <p className="text-gray-400 mb-6">No tournaments match your current filters.</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Create First Tournament
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* My Tournaments */}
          {activeTab === 'my-tournaments' && (
            <motion.div
              key="my-tournaments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Created Tournaments */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <FaCog />
                    <span>Tournaments You Created</span>
                  </h3>
                  
                  {userTournaments.length > 0 ? (
                    <div className="space-y-3">
                      {userTournaments.map((tournament) => (
                        <div key={tournament.id} className="bg-gray-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">{tournament.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${
                              TournamentHelpers.getTournamentStatusColor(tournament.status)
                            }`}>
                              {TournamentHelpers.getTournamentStatusIcon(tournament.status)} {tournament.status}
                            </span>
                          </div>
                          <div className="text-gray-400 text-sm">
                            {tournament.participants.length}/{tournament.maxParticipants} participants
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaGamepad className="text-3xl text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">You haven't created any tournaments yet</p>
                    </div>
                  )}
                </div>

                {/* Registered Tournaments */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <FaMedal />
                    <span>Tournaments You Joined</span>
                  </h3>
                  
                  {registeredTournaments.length > 0 ? (
                    <div className="space-y-3">
                      {registeredTournaments.map((tournament) => (
                        <div key={tournament.id} className="bg-gray-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">{tournament.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${
                              TournamentHelpers.getTournamentStatusColor(tournament.status)
                            }`}>
                              {TournamentHelpers.getTournamentStatusIcon(tournament.status)} {tournament.status}
                            </span>
                          </div>
                          <div className="text-gray-400 text-sm">
                            Round {tournament.currentRound}/{tournament.totalRounds}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaTrophy className="text-3xl text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">You haven't joined any tournaments yet</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Create Tournament */}
          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TournamentCreator
                onTournamentCreate={handleCreateTournament}
                onCancel={() => setActiveTab('browse')}
              />
            </motion.div>
          )}

          {/* Management */}
          {activeTab === 'management' && (
            <motion.div
              key="management"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <FaCog className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Tournament Management</h3>
              <p className="text-gray-400 mb-6">Advanced tournament management features coming soon!</p>
              <div className="bg-gray-800/50 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-gray-300 text-sm">
                  Features in development:
                </p>
                <ul className="text-gray-400 text-sm mt-2 space-y-1">
                  <li>• Bracket visualization</li>
                  <li>• Match scheduling</li>
                  <li>• Participant management</li>
                  <li>• Live tournament streaming</li>
                  <li>• Automated result processing</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Tournament Card Component
function TournamentCard({ 
  tournament, 
  onRegister, 
  onUnregister, 
  onView, 
  userId 
}: {
  tournament: Tournament
  onRegister: () => void
  onUnregister: () => void
  onView: () => void
  userId?: string
}) {
  const isRegistered = userId && tournament.participants.some(p => p.userId === userId)
  const isRegistrationOpen = tournament.status === 'registration' && 
                           new Date() <= new Date(tournament.registrationEnd) &&
                           tournament.participants.length < tournament.maxParticipants

  const formatTimeLeft = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now()
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors">
            {tournament.name}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded ${
              TournamentHelpers.getTournamentStatusColor(tournament.status)
            }`}>
              {TournamentHelpers.getTournamentStatusIcon(tournament.status)} {tournament.status}
            </span>
            <span className="text-xs text-gray-400 capitalize">
              {tournament.gameMode} • {tournament.format}
            </span>
          </div>
        </div>
        
        {tournament.prizePool && tournament.prizePool > 0 && (
          <div className="text-right">
            <div className="text-yellow-400 font-bold">{tournament.prizePool}</div>
            <div className="text-xs text-gray-400">Prize Pool</div>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {tournament.description}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white">
            {tournament.participants.length}/{tournament.maxParticipants}
          </div>
          <div className="text-xs text-gray-400">Participants</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">
            {tournament.status === 'registration' 
              ? formatTimeLeft(tournament.registrationEnd)
              : tournament.status === 'active'
              ? `Round ${tournament.currentRound}/${tournament.totalRounds}`
              : 'Finished'
            }
          </div>
          <div className="text-xs text-gray-400">
            {tournament.status === 'registration' ? 'Registration Ends' : 'Progress'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={onView}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <FaEye />
          <span>View</span>
        </button>
        
        {isRegistrationOpen && (
          <button
            onClick={isRegistered ? onUnregister : onRegister}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              isRegistered
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRegistered ? (
              <>
                <FaArrowLeft />
                <span>Leave</span>
              </>
            ) : (
              <>
                <FaPlus />
                <span>Join</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  )
} 