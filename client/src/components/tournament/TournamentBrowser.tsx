import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Tournament, TournamentFormat, GameMode } from '../../../../shared/types'

interface TournamentBrowserProps {
  onTournamentSelect?: (tournament: Tournament) => void
}

export function TournamentBrowser({ onTournamentSelect }: TournamentBrowserProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'registration' | 'active' | 'finished'>('all')
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode | 'all'>('all')

  // Mock tournaments data
  useEffect(() => {
    const mockTournaments: Tournament[] = [
      {
        id: 'tournament_1',
        name: '🎯 Weekly Precision Championship',
        description: 'Test your accuracy in this weekly precision tournament. Best players compete for glory!',
        gameMode: 'precision',
        format: 'single-elimination',
        status: 'registration',
        maxParticipants: 32,
        entryFee: 0,
        prizePool: 1000,
        registrationStart: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        registrationEnd: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
        tournamentStart: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
        gameSettings: {
          gameMode: 'precision',
          difficulty: 'medium',
          duration: 60,
          targetSize: 'medium',
          spawnRate: 1
        },
        bracketSettings: {
          bestOf: 3,
          seedingMethod: 'elo',
          allowLateRegistration: false
        },
        participants: [],
        brackets: [],
        currentRound: 0,
        totalRounds: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'tournament_2',
        name: '⚡ Speed Blitz Tournament',
        description: 'Fast-paced speed competition! Quick reflexes and rapid firing required.',
        gameMode: 'speed',
        format: 'double-elimination',
        status: 'active',
        maxParticipants: 16,
        entryFee: 50,
        prizePool: 500,
        registrationStart: new Date(Date.now() - 172800000).toISOString(),
        registrationEnd: new Date(Date.now() - 86400000).toISOString(),
        tournamentStart: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        gameSettings: {
          gameMode: 'speed',
          difficulty: 'hard',
          duration: 30,
          targetSize: 'small',
          spawnRate: 2
        },
        bracketSettings: {
          bestOf: 1,
          seedingMethod: 'elo',
          allowLateRegistration: false
        },
        participants: [],
        brackets: [],
        currentRound: 2,
        totalRounds: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'tournament_3',
        name: '💨 Flick Masters Cup',
        description: 'Ultimate flick shot tournament. Precision meets speed in epic battles.',
        gameMode: 'flick',
        format: 'round-robin',
        status: 'registration',
        maxParticipants: 8,
        entryFee: 100,
        prizePool: 750,
        registrationStart: new Date().toISOString(),
        registrationEnd: new Date(Date.now() + 259200000).toISOString(), // 3 days
        tournamentStart: new Date(Date.now() + 345600000).toISOString(), // 4 days
        gameSettings: {
          gameMode: 'flick',
          difficulty: 'expert',
          duration: 45,
          targetSize: 'small',
          spawnRate: 1.5
        },
        bracketSettings: {
          bestOf: 5,
          seedingMethod: 'elo',
          allowLateRegistration: true
        },
        participants: [],
        brackets: [],
        currentRound: 0,
        totalRounds: 7,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    setTournaments(mockTournaments)
  }, [])

  const filteredTournaments = tournaments.filter(tournament => {
    const statusMatch = selectedFilter === 'all' || tournament.status === selectedFilter
    const gameModeMatch = selectedGameMode === 'all' || tournament.gameMode === selectedGameMode
    return statusMatch && gameModeMatch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration': return 'text-blue-400 bg-blue-400/10'
      case 'active': return 'text-green-400 bg-green-400/10'
      case 'finished': return 'text-gray-400 bg-gray-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getFormatIcon = (format: TournamentFormat) => {
    switch (format) {
      case 'single-elimination': return '🏆'
      case 'double-elimination': return '⚔️'
      case 'round-robin': return '🔄'
      case 'swiss': return '🇨🇭'
      default: return '🎯'
    }
  }

  const getGameModeIcon = (gameMode: GameMode) => {
    switch (gameMode) {
      case 'precision': return '🎯'
      case 'speed': return '⚡'
      case 'tracking': return '🎪'
      case 'flick': return '💨'
      default: return '🎮'
    }
  }

  const formatTimeUntil = (dateString: string) => {
    const now = new Date()
    const target = new Date(dateString)
    const diffMs = target.getTime() - now.getTime()
    
    if (diffMs < 0) return 'Started'
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark to-gray-900 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gaming-primary mb-2">
            🏆 Tournament Hub
          </h1>
          <p className="text-gray-400">
            Compete in organized tournaments and climb the ranks
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Tournament Status
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['all', 'registration', 'active', 'finished'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedFilter === filter
                        ? 'bg-gaming-primary text-gaming-dark'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Game Mode Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Game Mode
              </label>
              <div className="grid grid-cols-5 gap-2">
                {(['all', 'precision', 'speed', 'tracking', 'flick'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedGameMode(mode)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedGameMode === mode
                        ? 'bg-gaming-primary text-gaming-dark'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {mode === 'all' ? 'All' : getGameModeIcon(mode as GameMode)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredTournaments.map((tournament, index) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gaming-primary/50 transition-colors cursor-pointer"
                onClick={() => onTournamentSelect?.(tournament)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Tournament Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getGameModeIcon(tournament.gameMode)}</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                          {tournament.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {getFormatIcon(tournament.format)} {tournament.format.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {tournament.prizePool && (
                    <div className="text-right">
                      <div className="text-gaming-primary font-bold">
                        ${tournament.prizePool}
                      </div>
                      <div className="text-xs text-gray-400">Prize Pool</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {tournament.description}
                </p>

                {/* Tournament Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-400">Participants</div>
                    <div className="text-white font-medium">
                      {tournament.participants.length}/{tournament.maxParticipants}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">
                      {tournament.status === 'registration' ? 'Starts In' : 
                       tournament.status === 'active' ? 'Round' : 'Format'}
                    </div>
                    <div className="text-white font-medium">
                      {tournament.status === 'registration' ? formatTimeUntil(tournament.tournamentStart) :
                       tournament.status === 'active' ? `${tournament.currentRound}/${tournament.totalRounds}` :
                       tournament.format}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    Entry: {tournament.entryFee ? `$${tournament.entryFee}` : 'Free'}
                  </div>
                  
                  <motion.button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      tournament.status === 'registration'
                        ? 'bg-gaming-primary text-gaming-dark hover:bg-gaming-accent'
                        : tournament.status === 'active'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tournament.status === 'registration' ? 'Register' :
                     tournament.status === 'active' ? 'Spectate' : 'View Results'}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredTournaments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">No Tournaments Found</h3>
            <p className="text-gray-400">
              Try adjusting your filters or check back later for new tournaments.
            </p>
          </motion.div>
        )}

        {/* Create Tournament Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-8 right-8"
        >
          <motion.button
            className="bg-gaming-primary text-gaming-dark px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gaming-accent transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ➕ Create Tournament
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
} 