import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePartyStore } from '@/stores/partyStore'
import { useAuthStore } from '@/stores/authStore'
import type { PartyGameSettings, GameMode, PartyMember } from '../../../../shared/types'

export function PartyLobby() {
  const { 
    currentParty, 
    partyMembers, 
    isInParty, 
    inviteCode,
    isConnected,
    connect,
    disconnect,
    createParty,
    joinParty,
    leaveParty, 
    toggleReady, 
    startGame 
  } = usePartyStore()

  const { user } = useAuthStore()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [newPartyName, setNewPartyName] = useState('')
  const [joinPartyId, setJoinPartyId] = useState('')
  const [joinInviteCode, setJoinInviteCode] = useState('')
  
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

  // Connect to party system on component mount
  useEffect(() => {
    if (!isConnected) {
      connect()
    }
    
    return () => {
      // Don't disconnect on unmount - keep connection for navigation
    }
  }, [isConnected, connect])

  const currentUserId = user?.id || 'guest-user'
  const currentUser = partyMembers.find((m: PartyMember) => m.userId === currentUserId)
  const isLeader = currentParty?.leaderId === currentUserId
  const allMembersReady = partyMembers.every((member: PartyMember) => member.isReady)

  const handleCreateParty = () => {
    if (newPartyName.trim()) {
      createParty(newPartyName.trim(), 8, false)
      setNewPartyName('')
      setShowCreateForm(false)
    }
  }

  const handleJoinParty = () => {
    if (joinPartyId.trim()) {
      joinParty(joinPartyId.trim(), joinInviteCode.trim() || undefined)
      setJoinPartyId('')
      setJoinInviteCode('')
      setShowJoinForm(false)
    }
  }

  const handleStartGame = () => {
    if (isLeader && allMembersReady) {
      startGame(gameSettings)
    }
  }

  const copyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode)
    }
  }

  // Show party lobby if in party
  if (isInParty && currentParty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-emerald-400 mb-2">
              🎉 {currentParty.name}
            </h1>
            <p className="text-gray-400">
              Party Lobby • {partyMembers.length}/{currentParty.maxMembers} players
            </p>
            
            {/* Invite Code */}
            {inviteCode && (
              <div className="mt-4 inline-flex items-center space-x-2 bg-gray-800 rounded-lg px-4 py-2">
                <span className="text-sm text-gray-400">Invite Code:</span>
                <code className="text-emerald-400 font-mono font-bold">{inviteCode}</code>
                <button
                  onClick={copyInviteCode}
                  className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-500 transition-colors"
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
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center">
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
                        member.isReady ? 'border-emerald-500' : 'border-gray-600'
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
                                <span className="ml-2 text-xs bg-emerald-600 text-white px-2 py-1 rounded">
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
                            <span className="text-emerald-400 font-semibold">✅ Ready</span>
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
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4">Ready Status</h3>
                
                <motion.button
                  onClick={() => currentUser && toggleReady(!currentUser.isReady)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    currentUser?.isReady
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
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
                    <p className="text-emerald-400 text-sm mt-1">
                      🎯 All members ready! Leader can start the game.
                    </p>
                  )}
                </div>
              </div>

              {/* Game Settings (Leader Only) */}
              {isLeader && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-emerald-400 mb-4">Game Settings</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Game Mode</label>
                      <select
                        value={gameSettings.gameMode}
                        onChange={(e) => setGameSettings((prev: any) => ({ 
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
                        onChange={(e) => setGameSettings((prev: any) => ({ 
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
                        onChange={(e) => setGameSettings((prev: any) => ({ 
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
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
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
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4">Party Actions</h3>
                
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

  // Show party browser/creation UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-4">
            🎉 Party Training
          </h1>
          <p className="text-gray-400 text-lg">Train with friends in synchronized multiplayer sessions</p>
          
          {/* Connection Status */}
          <div className="mt-4 inline-flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-400">
              {isConnected ? 'Connected to party server' : 'Connecting to party server...'}
            </span>
          </div>
        </motion.div>

        {!isConnected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Connecting to party system...</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Party */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🚀</span>
                Create Party
              </h3>
              <p className="text-gray-400 mb-6">Start a new training party and invite your friends</p>
              
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Create New Party
                </button>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newPartyName}
                    onChange={(e) => setNewPartyName(e.target.value)}
                    placeholder="Enter party name..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                    maxLength={50}
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCreateParty}
                      disabled={!newPartyName.trim()}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition-all"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false)
                        setNewPartyName('')
                      }}
                      className="px-4 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Join Party */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🎯</span>
                Join Party
              </h3>
              <p className="text-gray-400 mb-6">Join an existing party with an invite code</p>
              
              {!showJoinForm ? (
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Join Existing Party
                </button>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={joinPartyId}
                    onChange={(e) => setJoinPartyId(e.target.value)}
                    placeholder="Enter party ID..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                  />
                  <input
                    type="text"
                    value={joinInviteCode}
                    onChange={(e) => setJoinInviteCode(e.target.value)}
                    placeholder="Enter invite code (optional)..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleJoinParty}
                      disabled={!joinPartyId.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition-all"
                    >
                      Join
                    </button>
                    <button
                      onClick={() => {
                        setShowJoinForm(false)
                        setJoinPartyId('')
                        setJoinInviteCode('')
                      }}
                      className="px-4 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Features Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-gray-800/30 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-lg font-bold text-white mb-4">Party Training Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">🔄</div>
              <h4 className="text-white font-semibold">Synchronized Training</h4>
              <p className="text-gray-400">Train together with perfect timing sync</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🤝</div>
              <h4 className="text-white font-semibold">Co-op Challenges</h4>
              <p className="text-gray-400">Work together to achieve team goals</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⚔️</div>
              <h4 className="text-white font-semibold">Party Competition</h4>
              <p className="text-gray-400">Compete against each other for best scores</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}