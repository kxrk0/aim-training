import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTeamChallengeStore, TeamChallengeHelpers } from '@/stores/teamChallengeStore'
import { usePartyStore } from '@/stores/partyStore'
import { useAuthStore } from '@/stores/authStore'
import type { TeamChallenge, TeamFormation, PartyTeam } from '../../../../shared/types'
import {
  FaUsers, FaCog, FaPlay, FaTrophy, FaCrosshairs, FaClock,
  FaStar, FaFire, FaGamepad, FaExchangeAlt, FaComments,
  FaCheckCircle, FaTimesCircle, FaMedal, FaCrown
} from 'react-icons/fa'

interface TeamChallengeManagerProps {
  partyId: string
  isLeader: boolean
}

export function TeamChallengeManager({ partyId, isLeader }: TeamChallengeManagerProps) {
  const {
    currentChallenge,
    userTeam,
    teams,
    teamFormation,
    teamChat,
    challengeResults,
    showTeamSelection,
    showObjectives,
    showResults,
    createChallenge,
    formTeams,
    startChallenge,
    updateObjectiveProgress,
    sendTeamChat,
    switchTeam,
    setShowTeamSelection,
    setShowObjectives,
    setShowResults,
    error
  } = useTeamChallengeStore()

  const { currentParty, partyMembers, socket } = usePartyStore()
  const { user } = useAuthStore()

  // Use party socket connection instead of separate team challenge connection
  useEffect(() => {
    if (socket && socket.connected) {
      console.log('✅ Using party socket for team challenges')
      // Set team challenge connected since we're using party socket
      setShowTeamSelection(false)
      setShowObjectives(false)
      setShowResults(false)
    }
  }, [socket, setShowTeamSelection, setShowObjectives, setShowResults])

  const [challengeType, setChallengeType] = useState<TeamChallenge['type']>('team-vs-team')
  const [formationMethod, setFormationMethod] = useState<'random' | 'manual' | 'skill-based'>('random')
  const [teamSettings, setTeamSettings] = useState({
    maxTeams: 2,
    minPlayersPerTeam: 2,
    maxPlayersPerTeam: 4,
    duration: 300, // 5 minutes
    gameMode: 'precision',
    difficulty: 'medium',
    allowTeamSwitching: true,
    autoBalance: true
  })
  const [chatMessage, setChatMessage] = useState('')

  // Challenge type configurations
  const challengeTypes = [
    {
      type: 'team-vs-team' as const,
      name: 'Team vs Team',
      description: 'Direct competition between teams',
      icon: <FaFire />,
      color: 'from-red-500 to-orange-500'
    },
    {
      type: 'team-objectives' as const,
      name: 'Team Objectives',
      description: 'Complete various team-based challenges',
      icon: <FaCrosshairs />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      type: 'team-relay' as const,
      name: 'Team Relay',
      description: 'Take turns in relay-style challenges',
      icon: <FaExchangeAlt />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      type: 'team-survival' as const,
      name: 'Team Survival',
      description: 'Last team standing wins',
      icon: <FaGamepad />,
      color: 'from-purple-500 to-pink-500'
    }
  ]

  // Handle challenge creation
  const handleCreateChallenge = () => {
    if (!isLeader) return
    createChallenge(partyId, challengeType, teamSettings)
  }

  // Handle team formation
  const handleFormTeams = () => {
    if (!currentChallenge) return

    const formation: TeamFormation = {
      method: formationMethod,
      teams: formationMethod === 'manual' ? getManualTeams() : []
    }

    formTeams(partyId, formation)
  }

  // Get manual team formation
  const getManualTeams = () => {
    const teamCount = teamSettings.maxTeams
    const playersPerTeam = Math.floor(partyMembers.length / teamCount)
    const teamColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b']
    const teamNames = ['Alpha', 'Bravo', 'Charlie', 'Delta']

    const teams = []
    for (let i = 0; i < teamCount; i++) {
      teams.push({
        name: `Team ${teamNames[i] || i + 1}`,
        color: teamColors[i] || '#6b7280',
        memberIds: []
      })
    }

    return teams
  }

  // Handle start challenge
  const handleStartChallenge = () => {
    if (!isLeader) return
    startChallenge(partyId)
  }

  // Handle team chat
  const handleSendChat = () => {
    if (!userTeam || !chatMessage.trim()) return
    sendTeamChat(partyId, userTeam.id, chatMessage)
    setChatMessage('')
  }

  // Render challenge setup
  const renderChallengeSetup = () => (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FaCog />
          <span>Team Challenge Setup</span>
        </h2>
        {!isLeader && (
          <span className="text-gray-400 text-sm">Only party leader can configure</span>
        )}
      </div>

      {/* Challenge Type Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Challenge Type</h3>
        <div className="grid grid-cols-2 gap-4">
          {challengeTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => setChallengeType(type.type)}
              disabled={!isLeader}
              className={`p-4 rounded-lg border transition-all ${
                challengeType === type.type
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-gray-600 bg-gray-700/50 hover:bg-gray-600/50'
              } ${!isLeader && 'opacity-50 cursor-not-allowed'}`}
            >
              <div className={`text-2xl mb-2 bg-gradient-to-r ${type.color} bg-clip-text text-transparent`}>
                {type.icon}
              </div>
              <div className="text-white font-medium">{type.name}</div>
              <div className="text-gray-400 text-sm">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Team Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Team Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Max Teams</label>
            <select
              value={teamSettings.maxTeams}
              onChange={(e) => setTeamSettings(prev => ({ ...prev, maxTeams: parseInt(e.target.value) }))}
              disabled={!isLeader}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value={2}>2 Teams</option>
              <option value={3}>3 Teams</option>
              <option value={4}>4 Teams</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Duration (minutes)</label>
            <select
              value={teamSettings.duration}
              onChange={(e) => setTeamSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              disabled={!isLeader}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value={180}>3 minutes</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
              <option value={900}>15 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Formation Method */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Team Formation</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'random', label: 'Random', icon: <FaExchangeAlt /> },
            { value: 'skill-based', label: 'Skill-Based', icon: <FaStar /> },
            { value: 'manual', label: 'Manual', icon: <FaUsers /> }
          ].map((method) => (
            <button
              key={method.value}
              onClick={() => setFormationMethod(method.value as any)}
              disabled={!isLeader}
              className={`p-3 rounded-lg border transition-all flex flex-col items-center space-y-1 ${
                formationMethod === method.value
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-gray-600 bg-gray-700/50 hover:bg-gray-600/50'
              } ${!isLeader && 'opacity-50 cursor-not-allowed'}`}
            >
              <div className="text-blue-400">{method.icon}</div>
              <span className="text-white text-sm">{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Button */}
      {isLeader && (
        <button
          onClick={handleCreateChallenge}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
        >
          <FaPlay />
          <span>Create Team Challenge</span>
        </button>
      )}
    </div>
  )

  // Render team selection
  const renderTeamSelection = () => (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FaUsers />
          <span>Team Formation</span>
        </h2>
        {isLeader && (
          <button
            onClick={handleFormTeams}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Form Teams
          </button>
        )}
      </div>

      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              userTeam={userTeam}
              onSwitchTeam={(fromTeamId, toTeamId) => switchTeam(partyId, fromTeamId, toTeamId)}
              allowSwitching={Boolean(currentChallenge?.settings.allowTeamSwitching && currentChallenge.status === 'setup')}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-8">
          <FaUsers className="text-4xl mx-auto mb-4" />
          <p>Waiting for teams to be formed...</p>
        </div>
      )}

      {teams.length > 0 && isLeader && (
        <button
          onClick={handleStartChallenge}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center space-x-2"
        >
          <FaPlay />
          <span>Start Challenge</span>
        </button>
      )}
    </div>
  )

  // Render objectives
  const renderObjectives = () => (
    <div className="space-y-6">
      {/* Team Progress Overview */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
          <FaTrophy />
          <span>Team Progress</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div
              key={team.id}
              className={`p-4 rounded-lg border-2 ${
                userTeam?.id === team.id ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 bg-gray-700/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="text-white font-semibold">{team.name}</span>
                  {userTeam?.id === team.id && <FaCrown className="text-yellow-400" />}
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{team.score} pts</div>
                  <div className="text-sm text-gray-400">
                    #{TeamChallengeHelpers.getTeamRank(teams, team.id)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {team.objectives.map((objective) => (
                  <div key={objective.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {objective.isCompleted ? (
                        <FaCheckCircle className="text-green-400" />
                      ) : (
                        <FaClock className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-300">{objective.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {TeamChallengeHelpers.formatObjectiveProgress(objective)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Objectives */}
      {userTeam && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <FaCrosshairs />
            <span>Your Team Objectives</span>
          </h3>

          <div className="space-y-3">
            {userTeam.objectives.map((objective) => (
              <ObjectiveCard
                key={objective.id}
                objective={objective}
                teamId={userTeam.id}
                partyId={partyId}
                onProgressUpdate={(progress, metadata) =>
                  updateObjectiveProgress(partyId, userTeam.id, objective.id, progress, metadata)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Team Chat */}
      {userTeam && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <FaComments />
            <span>Team Chat</span>
          </h3>

          <div className="h-40 overflow-y-auto mb-4 space-y-2">
            {teamChat
              .filter(msg => msg.teamId === userTeam.id)
              .map((message) => (
                <div key={message.id} className="text-sm">
                  <span className="text-blue-400 font-medium">{message.username}: </span>
                  <span className="text-gray-300">{message.message}</span>
                </div>
              ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Type a message to your team..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
            />
            <button
              onClick={handleSendChat}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // Render results
  const renderResults = () => (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white text-center flex items-center justify-center space-x-2">
        <FaTrophy />
        <span>Challenge Results</span>
      </h2>

      <div className="space-y-4">
        {challengeResults
          .sort((a, b) => a.placement - b.placement)
          .map((result, index) => (
            <motion.div
              key={result.teamId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 ${
                index === 0
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : index === 1
                  ? 'border-gray-400 bg-gray-400/10'
                  : index === 2
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-gray-600 bg-gray-700/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${result.placement}`}
                  </div>
                  <div>
                    <div className="text-white font-bold">{result.teamName}</div>
                    <div className="text-sm text-gray-400">
                      {result.objectivesCompleted}/{result.totalObjectives} objectives completed
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">{result.finalScore} pts</div>
                  <div className="text-sm text-gray-400">
                    +{result.rewards.xp} XP, +{result.rewards.points} points
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-300">
                Team Members: {result.members.map(m => m.username).join(', ')}
              </div>
            </motion.div>
          ))}
      </div>

      <button
        onClick={() => setShowResults(false)}
        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
      >
        Close Results
      </button>
    </div>
  )

  // Error display
  if (error) {
    return (
      <div className="bg-red-600/20 border border-red-600 rounded-lg p-4 text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!currentChallenge && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderChallengeSetup()}
          </motion.div>
        )}

        {showTeamSelection && (
          <motion.div
            key="team-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderTeamSelection()}
          </motion.div>
        )}

        {showObjectives && (
          <motion.div
            key="objectives"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderObjectives()}
          </motion.div>
        )}

        {showResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {renderResults()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Team Card Component
function TeamCard({ 
  team, 
  userTeam, 
  onSwitchTeam, 
  allowSwitching 
}: {
  team: PartyTeam
  userTeam: PartyTeam | null
  onSwitchTeam: (fromTeamId: string, toTeamId: string) => void
  allowSwitching: boolean
}) {
  const isUserTeam = userTeam?.id === team.id

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        isUserTeam ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 bg-gray-700/30'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: team.color }}
          />
          <span className="text-white font-semibold">{team.name}</span>
          {isUserTeam && <FaCrown className="text-yellow-400" />}
        </div>
        <span className="text-gray-400 text-sm">{team.memberIds.length} members</span>
      </div>

      <div className="space-y-2 mb-3">
        {team.memberIds.map((memberId, index) => (
          <div key={memberId} className="text-sm text-gray-300">
            Player {index + 1}
          </div>
        ))}
      </div>

      {allowSwitching && !isUserTeam && userTeam && (
        <button
          onClick={() => onSwitchTeam(userTeam.id, team.id)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition-colors"
        >
          Switch to This Team
        </button>
      )}
    </div>
  )
}

// Objective Card Component
function ObjectiveCard({ 
  objective, 
  teamId, 
  partyId, 
  onProgressUpdate 
}: {
  objective: any
  teamId: string
  partyId: string
  onProgressUpdate: (progress: number, metadata?: any) => void
}) {
  const progressPercentage = Math.round((objective.progress / objective.target) * 100)

  return (
    <div className={`p-4 rounded-lg border ${
      objective.isCompleted ? 'border-green-500 bg-green-500/10' : 'border-gray-600 bg-gray-700/30'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {objective.isCompleted ? (
            <FaCheckCircle className="text-green-400" />
          ) : (
            <FaClock className="text-yellow-400" />
          )}
          <span className="text-white font-medium">{objective.name}</span>
        </div>
        <span className="text-sm text-gray-400">
          +{objective.reward.xp} XP, +{objective.reward.points} pts
        </span>
      </div>

      <p className="text-gray-300 text-sm mb-3">{objective.description}</p>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="text-white">{objective.progress}/{objective.target} ({progressPercentage}%)</span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              objective.isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {objective.timeLimit && (
        <div className="mt-2 text-xs text-gray-400 flex items-center space-x-1">
          <FaClock />
          <span>Time limit: {Math.floor(objective.timeLimit / 60)}:{(objective.timeLimit % 60).toString().padStart(2, '0')}</span>
        </div>
      )}
    </div>
  )
} 