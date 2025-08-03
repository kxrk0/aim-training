import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Tournament, BracketMatch, TournamentParticipant } from '../../../../shared/types'
import { BracketGenerator, BracketUtils, type GeneratedBracket } from '@/utils/bracketGenerator'
import {
  FaTrophy, FaClock, FaPlay, FaPause, FaUser, FaCrown,
  FaChevronLeft, FaChevronRight, FaExpandArrowsAlt,
  FaCompressArrowsAlt, FaEye, FaGamepad, FaCalendarAlt
} from 'react-icons/fa'

interface BracketVisualizationProps {
  tournament: Tournament
  onMatchClick?: (match: BracketMatch) => void
  onParticipantClick?: (participant: TournamentParticipant) => void
  isInteractive?: boolean
  showSchedule?: boolean
}

export function BracketVisualization({
  tournament,
  onMatchClick,
  onParticipantClick,
  isInteractive = true,
  showSchedule = true
}: BracketVisualizationProps) {
  const [bracket, setBracket] = useState<GeneratedBracket | null>(null)
  const [selectedRound, setSelectedRound] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'bracket' | 'schedule' | 'tree'>('bracket')
  const [error, setError] = useState<string | null>(null)

  // Generate bracket
  useEffect(() => {
    try {
      if (tournament.participants.length < 2) {
        setError('Tournament needs at least 2 participants')
        return
      }
      
      const generatedBracket = BracketGenerator.generate(tournament)
      setBracket(generatedBracket)
      setError(null)
    } catch (err) {
      setError(`Failed to generate bracket: ${err}`)
      setBracket(null)
    }
  }, [tournament])

  // Memoized bracket data
  const bracketData = useMemo(() => {
    if (!bracket) return null
    
    const rounds = Array.from({ length: bracket.totalRounds }, (_, i) => i + 1)
    const roundMatches = rounds.map(round => 
      bracket.matches.filter(match => match.round === round)
    )
    
    return {
      rounds,
      roundMatches,
      progress: BracketUtils.getBracketProgress(bracket)
    }
  }, [bracket])

  const handleMatchClick = (match: BracketMatch) => {
    if (isInteractive && onMatchClick) {
      onMatchClick(match)
    }
  }

  const handleParticipantClick = (participant: TournamentParticipant) => {
    if (isInteractive && onParticipantClick) {
      onParticipantClick(participant)
    }
  }

  if (error) {
    return (
      <div className="bg-red-600/20 border border-red-600 rounded-lg p-6 text-red-400">
        <h3 className="font-semibold mb-2">Bracket Error</h3>
        <p>{error}</p>
      </div>
    )
  }

  if (!bracket || !bracketData) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8 text-center">
        <div className="animate-spin text-4xl text-blue-400 mb-4">⚙️</div>
        <p className="text-gray-400">Generating bracket...</p>
      </div>
    )
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden ${
      isFullscreen ? 'fixed inset-4 z-50' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <FaTrophy className="text-yellow-400" />
            <span>Tournament Bracket</span>
          </h3>
          
          <div className="flex items-center space-x-2 bg-gray-700/50 rounded-lg px-3 py-1">
            <span className="text-gray-400 text-sm">{tournament.format}</span>
            <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
            <span className="text-gray-400 text-sm">{tournament.participants.length} players</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-700/50 rounded-lg p-1">
            {[
              { id: 'bracket', name: 'Bracket', icon: <FaGamepad /> },
              { id: 'schedule', name: 'Schedule', icon: <FaCalendarAlt /> },
              { id: 'tree', name: 'Tree', icon: <FaExpandArrowsAlt /> }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                  viewMode === mode.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {mode.icon}
                <span className="hidden sm:block">{mode.name}</span>
              </button>
            ))}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            {isFullscreen ? <FaCompressArrowsAlt /> : <FaExpandArrowsAlt />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-gray-700/30">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Tournament Progress</span>
          <span className="text-white font-medium">{bracketData.progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${bracketData.progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* Bracket View */}
          {viewMode === 'bracket' && (
            <motion.div
              key="bracket"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {tournament.format === 'single-elimination' && (
                <SingleEliminationBracket
                  bracket={bracket}
                  tournament={tournament}
                  onMatchClick={handleMatchClick}
                  onParticipantClick={handleParticipantClick}
                />
              )}
              
              {tournament.format === 'double-elimination' && (
                <DoubleEliminationBracket
                  bracket={bracket}
                  tournament={tournament}
                  onMatchClick={handleMatchClick}
                  onParticipantClick={handleParticipantClick}
                />
              )}
              
              {tournament.format === 'round-robin' && (
                <RoundRobinBracket
                  bracket={bracket}
                  tournament={tournament}
                  onMatchClick={handleMatchClick}
                  onParticipantClick={handleParticipantClick}
                />
              )}
              
              {tournament.format === 'swiss' && (
                <SwissBracket
                  bracket={bracket}
                  tournament={tournament}
                  selectedRound={selectedRound}
                  onRoundChange={setSelectedRound}
                  onMatchClick={handleMatchClick}
                  onParticipantClick={handleParticipantClick}
                />
              )}
            </motion.div>
          )}

          {/* Schedule View */}
          {viewMode === 'schedule' && showSchedule && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ScheduleView
                bracket={bracket}
                tournament={tournament}
                onMatchClick={handleMatchClick}
              />
            </motion.div>
          )}

          {/* Tree View */}
          {viewMode === 'tree' && (
            <motion.div
              key="tree"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TreeView
                bracket={bracket}
                tournament={tournament}
                onMatchClick={handleMatchClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fullscreen Close */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors z-10"
        >
          ✕
        </button>
      )}
    </div>
  )
}

// Single Elimination Bracket Component
function SingleEliminationBracket({
  bracket,
  tournament,
  onMatchClick,
  onParticipantClick
}: {
  bracket: GeneratedBracket
  tournament: Tournament
  onMatchClick: (match: BracketMatch) => void
  onParticipantClick: (participant: TournamentParticipant) => void
}) {
  const rounds = Array.from({ length: bracket.totalRounds }, (_, i) => i + 1)
  
  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-8 min-w-max p-4">
        {rounds.map((round) => {
          const roundMatches = bracket.matches.filter(m => m.round === round)
          
          return (
            <div key={round} className="flex flex-col space-y-4 min-w-[200px]">
              <div className="text-center">
                <h4 className="text-lg font-bold text-white mb-2">
                  {round === bracket.totalRounds ? 'Finals' : `Round ${round}`}
                </h4>
                <div className="text-gray-400 text-sm">
                  {roundMatches.length} match{roundMatches.length !== 1 ? 'es' : ''}
                </div>
              </div>
              
              <div className="space-y-4">
                {roundMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    tournament={tournament}
                    onClick={() => onMatchClick(match)}
                    onParticipantClick={onParticipantClick}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Double Elimination Bracket Component
function DoubleEliminationBracket({
  bracket,
  tournament,
  onMatchClick,
  onParticipantClick
}: {
  bracket: GeneratedBracket
  tournament: Tournament
  onMatchClick: (match: BracketMatch) => void
  onParticipantClick: (participant: TournamentParticipant) => void
}) {
  const winnersMatches = bracket.matches.filter(m => m.bracket === 'winners')
  const losersMatches = bracket.matches.filter(m => m.bracket === 'losers')
  const grandFinals = bracket.matches.find(m => m.bracket === 'grand-finals')
  
  return (
    <div className="space-y-8">
      {/* Winners Bracket */}
      <div>
        <h4 className="text-xl font-bold text-green-400 mb-4">Winners Bracket</h4>
        <div className="overflow-x-auto">
          <div className="flex space-x-6 min-w-max">
            {Array.from({ length: Math.max(...winnersMatches.map(m => m.round)) }, (_, i) => i + 1).map((round) => {
              const roundMatches = winnersMatches.filter(m => m.round === round)
              
              return (
                <div key={round} className="flex flex-col space-y-3">
                  <div className="text-center text-sm text-gray-400 mb-2">WR{round}</div>
                  {roundMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      tournament={tournament}
                      onClick={() => onMatchClick(match)}
                      onParticipantClick={onParticipantClick}
                      size="compact"
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Losers Bracket */}
      <div>
        <h4 className="text-xl font-bold text-red-400 mb-4">Losers Bracket</h4>
        <div className="overflow-x-auto">
          <div className="flex space-x-6 min-w-max">
            {Array.from({ length: Math.max(...losersMatches.map(m => m.round)) }, (_, i) => i + 1).map((round) => {
              const roundMatches = losersMatches.filter(m => m.round === round)
              
              return (
                <div key={round} className="flex flex-col space-y-3">
                  <div className="text-center text-sm text-gray-400 mb-2">LR{round}</div>
                  {roundMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      tournament={tournament}
                      onClick={() => onMatchClick(match)}
                      onParticipantClick={onParticipantClick}
                      size="compact"
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Grand Finals */}
      {grandFinals && (
        <div>
          <h4 className="text-xl font-bold text-yellow-400 mb-4">Grand Finals</h4>
          <div className="flex justify-center">
            <MatchCard
              match={grandFinals}
              tournament={tournament}
              onClick={() => onMatchClick(grandFinals)}
              onParticipantClick={onParticipantClick}
              size="large"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Round Robin Bracket Component
function RoundRobinBracket({
  bracket,
  tournament,
  onMatchClick,
  onParticipantClick
}: {
  bracket: GeneratedBracket
  tournament: Tournament
  onMatchClick: (match: BracketMatch) => void
  onParticipantClick: (participant: TournamentParticipant) => void
}) {
  const rounds = Array.from({ length: bracket.totalRounds }, (_, i) => i + 1)
  
  return (
    <div className="space-y-6">
      {rounds.map((round) => {
        const roundMatches = bracket.matches.filter(m => m.round === round)
        
        return (
          <div key={round} className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-lg font-bold text-white mb-4">Round {round}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roundMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  tournament={tournament}
                  onClick={() => onMatchClick(match)}
                  onParticipantClick={onParticipantClick}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Swiss Bracket Component
function SwissBracket({
  bracket,
  tournament,
  selectedRound,
  onRoundChange,
  onMatchClick,
  onParticipantClick
}: {
  bracket: GeneratedBracket
  tournament: Tournament
  selectedRound: number
  onRoundChange: (round: number) => void
  onMatchClick: (match: BracketMatch) => void
  onParticipantClick: (participant: TournamentParticipant) => void
}) {
  const rounds = Array.from({ length: bracket.totalRounds }, (_, i) => i + 1)
  const roundMatches = bracket.matches.filter(m => m.round === selectedRound)
  
  return (
    <div className="space-y-6">
      {/* Round Navigation */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={() => onRoundChange(Math.max(1, selectedRound - 1))}
          disabled={selectedRound <= 1}
          className="p-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
        >
          <FaChevronLeft />
        </button>
        
        <div className="flex space-x-2">
          {rounds.map((round) => (
            <button
              key={round}
              onClick={() => onRoundChange(round)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedRound === round
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Round {round}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onRoundChange(Math.min(bracket.totalRounds, selectedRound + 1))}
          disabled={selectedRound >= bracket.totalRounds}
          className="p-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Round Matches */}
      <div className="bg-gray-700/30 rounded-lg p-6">
        <h4 className="text-xl font-bold text-white mb-4">Round {selectedRound}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roundMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              tournament={tournament}
              onClick={() => onMatchClick(match)}
              onParticipantClick={onParticipantClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Match Card Component
function MatchCard({
  match,
  tournament,
  onClick,
  onParticipantClick,
  size = 'normal'
}: {
  match: BracketMatch
  tournament: Tournament
  onClick: () => void
  onParticipantClick: (participant: TournamentParticipant) => void
  size?: 'compact' | 'normal' | 'large'
}) {
  const participant1 = tournament.participants.find(p => p.userId === match.participant1Id)
  const participant2 = tournament.participants.find(p => p.userId === match.participant2Id)
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-blue-500 bg-blue-500/10'
      case 'active': return 'border-green-500 bg-green-500/10'
      case 'finished': return 'border-gray-500 bg-gray-500/10'
      default: return 'border-gray-600 bg-gray-700/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <FaClock className="text-blue-400" />
      case 'active': return <FaPlay className="text-green-400" />
      case 'finished': return <FaTrophy className="text-yellow-400" />
      default: return <FaPause className="text-gray-400" />
    }
  }

  const sizeClasses = {
    compact: 'p-3 text-sm',
    normal: 'p-4',
    large: 'p-6 text-lg'
  }

  return (
    <motion.button
      onClick={onClick}
      className={`w-full border-2 rounded-lg transition-all hover:scale-105 ${getStatusColor(match.status)} ${sizeClasses[size]}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Match Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(match.status)}
          <span className="text-gray-400 text-xs">
            {BracketUtils.getMatchDisplayName(match)}
          </span>
        </div>
        {match.bestOf > 1 && (
          <span className="text-gray-400 text-xs">Bo{match.bestOf}</span>
        )}
      </div>

      {/* Participants */}
      <div className="space-y-2">
        <ParticipantRow
          participant={participant1}
          isWinner={match.winnerId === participant1?.userId}
          onClick={(e) => {
            e.stopPropagation()
            if (participant1) onParticipantClick(participant1)
          }}
        />
        
        <div className="text-gray-500 text-center text-xs">VS</div>
        
        <ParticipantRow
          participant={participant2}
          isWinner={match.winnerId === participant2?.userId}
          onClick={(e) => {
            e.stopPropagation()
            if (participant2) onParticipantClick(participant2)
          }}
        />
      </div>

      {/* Match Time */}
      {match.scheduledTime && (
        <div className="mt-3 text-gray-400 text-xs">
          {new Date(match.scheduledTime).toLocaleTimeString()}
        </div>
      )}
    </motion.button>
  )
}

// Participant Row Component
function ParticipantRow({
  participant,
  isWinner,
  onClick
}: {
  participant?: TournamentParticipant
  isWinner: boolean
  onClick: (e: React.MouseEvent) => void
}) {
  if (!participant) {
    return (
      <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded border-2 border-dashed border-gray-600">
        <span className="text-gray-500">TBD</span>
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-2 rounded transition-colors ${
        isWinner
          ? 'bg-yellow-500/20 border-2 border-yellow-500/50'
          : 'bg-gray-700/50 border-2 border-transparent hover:border-gray-500/50'
      }`}
    >
      <div className="flex items-center space-x-2">
        <FaUser className={isWinner ? 'text-yellow-400' : 'text-gray-400'} />
        <span className={`font-medium truncate ${isWinner ? 'text-yellow-200' : 'text-white'}`}>
          {participant.username}
        </span>
      </div>
      
      {isWinner && <FaCrown className="text-yellow-400" />}
      
      <div className="text-right text-xs text-gray-400">
        <div>Seed #{participant.seed}</div>
        <div>{participant.eloRating} ELO</div>
      </div>
    </button>
  )
}

// Schedule View Component
function ScheduleView({
  bracket,
  tournament,
  onMatchClick
}: {
  bracket: GeneratedBracket
  tournament: Tournament
  onMatchClick: (match: BracketMatch) => void
}) {
  return (
    <div className="space-y-6">
      {bracket.schedule.map((roundSchedule) => (
        <div key={roundSchedule.round} className="bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-white">Round {roundSchedule.round}</h4>
            <div className="text-sm text-gray-400">
              {new Date(roundSchedule.estimatedStartTime).toLocaleString()} 
              • {roundSchedule.estimatedDuration}min
            </div>
          </div>
          
          <div className="space-y-3">
            {roundSchedule.matches.map((match) => (
              <button
                key={match.id}
                onClick={() => onMatchClick(match)}
                className="w-full p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-medium">
                      {BracketUtils.getMatchDisplayName(match)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {tournament.participants.find(p => p.userId === match.participant1Id)?.username || 'TBD'}
                      {' vs '}
                      {tournament.participants.find(p => p.userId === match.participant2Id)?.username || 'TBD'}
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(match.scheduledTime).toLocaleTimeString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Tree View Component (placeholder)
function TreeView({
  bracket,
  tournament,
  onMatchClick
}: {
  bracket: GeneratedBracket
  tournament: Tournament
  onMatchClick: (match: BracketMatch) => void
}) {
  return (
    <div className="text-center py-12">
      <FaExpandArrowsAlt className="text-6xl text-gray-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">Tree View</h3>
      <p className="text-gray-400">Advanced tree visualization coming soon!</p>
    </div>
  )
} 