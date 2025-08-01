import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePartyStore } from '@/stores/partyStore'
import type { PartyGameSettings, GameMode, PartyMember } from '../../../../shared/types'

export function PartyLobby() {
  const { 
    currentParty, 
    partyMembers, 
    isInParty, 
    inviteCode,
    leaveParty, 
    toggleReady, 
    startGame 
  } = usePartyStore()
  
  const [gameSettings, setGameSettings] = useState<PartyGameSettings>({
    gameMode: 'precision',
    partyMode: 'synchronized',
    difficulty: 'medium',
    duration: 60,
    maxPlayers: 4,
    allowSpectators: true,
    customRules: {
      targetSharing: false,
      scoreSharing: false,
      realTimeSync: true
    }
  })

  // TODO: Get from auth store
  const currentUserId = 'current-user-id'
  const currentUser = partyMembers.find((m: PartyMember) => m.userId === currentUserId)
  const isLeader = currentParty?.leaderId === currentUserId
  const allMembersReady = partyMembers.every((member: PartyMember) => member.isReady)

  if (!isInParty || !currentParty) {
    return null
  }

  const handleStartGame = () => {
    if (isLeader && allMembersReady) {
      startGame(gameSettings)
    }
  }

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode)
      // TODO: Show toast notification
    }
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
            🎉 {currentParty.name}
          </h1>
          <p className="text-gray-400">
            Party Lobby • {partyMembers.length}/{currentParty.maxMembers} players
          </p>
          
          {/* Invite Code */}
          {inviteCode && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-gray-800 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-400">Invite Code:</span>
              <code className="text-gaming-primary font-mono font-bold">{inviteCode}</code>
              <button
                onClick={copyInviteCode}
                className="text-xs bg-gaming-primary text-gaming-dark px-2 py-1 rounded hover:bg-gaming-accent transition-colors"
              >
                Copy
              </button>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Party Members */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="hud-element">
              <h2 className="text-xl font-bold text-gaming-primary mb-4 flex items-center">
                👥 Party Members
                <span className="ml-2 text-sm text-gray-400">
                  ({partyMembers.length}/{currentParty.maxMembers})
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partyMembers.map((member: PartyMember, index: number) => (
                  <motion.div
                    key={member.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-gray-800 rounded-lg p-4 border-2 ${
                      member.isReady ? 'border-gaming-primary' : 'border-gray-600'
                    } transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          member.isOnline ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <h3 className="font-semibold text-white flex items-center">
                            {member.username}
                            {member.role === 'leader' && (
                              <span className="ml-2 text-xs bg-gaming-primary text-gaming-dark px-2 py-1 rounded">
                                👑 Leader
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-gray-400">
                            Joined {new Date(member.joinedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {member.isReady ? (
                          <span className="text-gaming-primary font-semibold">✅ Ready</span>
                        ) : (
                          <span className="text-gray-400">⏳ Not Ready</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Ready Status */}
            <div className="hud-element">
              <h3 className="text-lg font-semibold text-gaming-primary mb-4">Ready Status</h3>
              
              <motion.button
                onClick={() => currentUser && toggleReady(!currentUser.isReady)}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  currentUser?.isReady
                    ? 'bg-gaming-primary text-gaming-dark hover:bg-gaming-accent'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {currentUser?.isReady ? '✅ Ready!' : '⏳ Click to Ready'}
              </motion.button>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">
                  {partyMembers.filter((m: PartyMember) => m.isReady).length}/{partyMembers.length} members ready
                </p>
                {allMembersReady && (
                  <p className="text-gaming-primary text-sm mt-1">
                    🎯 All members ready! Leader can start the game.
                  </p>
                )}
              </div>
            </div>

            {/* Game Settings (Leader Only) */}
            {isLeader && (
              <div className="hud-element">
                <h3 className="text-lg font-semibold text-gaming-primary mb-4">Game Settings</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Game Mode</label>
                    <select
                      value={gameSettings.gameMode}
                      onChange={(e) => setGameSettings(prev => ({ 
                        ...prev, 
                        gameMode: e.target.value as GameMode 
                      }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="precision">🎯 Precision</option>
                      <option value="speed">⚡ Speed</option>
                      <option value="tracking">🎪 Tracking</option>
                      <option value="flick">💨 Flick</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Party Mode</label>
                    <select
                      value={gameSettings.partyMode}
                      onChange={(e) => setGameSettings(prev => ({ 
                        ...prev, 
                        partyMode: e.target.value as any 
                      }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="synchronized">🔄 Synchronized</option>
                      <option value="co-op">🤝 Co-op</option>
                      <option value="competition">⚔️ Competition</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Duration: {gameSettings.duration}s
                    </label>
                    <input
                      type="range"
                      min="30"
                      max="180"
                      value={gameSettings.duration}
                      onChange={(e) => setGameSettings(prev => ({ 
                        ...prev, 
                        duration: parseInt(e.target.value) 
                      }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <motion.button
                  onClick={handleStartGame}
                  disabled={!allMembersReady}
                  className={`w-full mt-4 py-3 px-4 rounded-lg font-semibold transition-colors ${
                    allMembersReady
                      ? 'bg-gaming-primary text-gaming-dark hover:bg-gaming-accent'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  whileHover={allMembersReady ? { scale: 1.02 } : {}}
                  whileTap={allMembersReady ? { scale: 0.98 } : {}}
                >
                  🚀 Start Game
                </motion.button>
              </div>
            )}

            {/* Party Actions */}
            <div className="hud-element">
              <h3 className="text-lg font-semibold text-gaming-primary mb-4">Party Actions</h3>
              
              <div className="space-y-3">
                <motion.button
                  onClick={leaveParty}
                  className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  🚪 Leave Party
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 