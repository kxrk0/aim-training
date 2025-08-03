import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { usePartyStore } from '@/stores/partyStore'
import { useAuthStore } from '@/stores/authStore'
import { useTeamChallengeStore } from '@/stores/teamChallengeStore'
import { TeamChallengeManager } from '@/components/team/TeamChallengeManager'
import { FaUsers, FaCrown, FaFistRaised, FaGamepad } from 'react-icons/fa'
import type { PartyMember, PartyGameSettings, GameMode } from '../../../../shared/types'

export function PartyLobby() {
  const { inviteCode: urlInviteCode } = useParams()
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
    joinPartyByCode,
    leaveParty, 
    toggleReady, 
    startGame 
  } = usePartyStore()

  const { user, isAuthenticated } = useAuthStore()
  const { connect: connectTeamChallenge } = useTeamChallengeStore()
  
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [showJoinByCodeForm, setShowJoinByCodeForm] = useState(false)
  const [newPartyName, setNewPartyName] = useState('')
  const [joinPartyId, setJoinPartyId] = useState('')
  const [joinInviteCode, setJoinInviteCode] = useState('')
  const [partyCodeInput, setPartyCodeInput] = useState('')
  const [activeTab, setActiveTab] = useState<'lobby' | 'team-challenges'>('lobby')
  
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

  // Auto-join if invite code in URL
  useEffect(() => {
    if (urlInviteCode && !isInParty && isConnected && isAuthenticated) {
      console.log('🎫 Auto-joining party with URL code:', urlInviteCode)
      joinPartyByCode(urlInviteCode.toUpperCase())
    }
  }, [urlInviteCode, isInParty, isConnected, isAuthenticated, joinPartyByCode])

  // Connect to party system on component mount
  useEffect(() => {
    console.log('🔍 PartyLobby: Checking connection status', { isConnected })
    
    if (!isConnected) {
      console.log('🔌 PartyLobby: Attempting to connect...')
      connect()
    }
    
    return () => {
      // Don't disconnect on unmount - keep connection for navigation
    }
  }, [isConnected, connect])

  // Connect to team challenge store if authenticated and in party
  useEffect(() => {
    // Don't connect to team challenge store separately
    // Team challenges will use party socket connection
    console.log('✅ Team challenges will use party socket connection')
  }, [isAuthenticated, isInParty])

  // Debug info
  useEffect(() => {
    console.log('🏠 PartyLobby Debug Info:', {
      isConnected,
      isInParty,
      currentParty: !!currentParty,
      partyMembersCount: partyMembers.length,
      user: !!user,
      activeTab
    })
  }, [isConnected, isInParty, currentParty, partyMembers, user, activeTab])
  
  // Extract user ID from Firebase auth or fallback to guest
  const getUserId = () => {
    if (isAuthenticated && user) {
      // Firebase user might have uid property
      const firebaseUid = (user as any).uid || user.id || 'guest-user'
      
      // TEMPORARY FIX: If no matching party member found with Firebase UID,
      // try to find a guest user that might belong to this session
      const firebaseMember = partyMembers.find(m => m.userId === firebaseUid)
      if (firebaseMember) {
        return firebaseUid
      }
      
      // If Firebase UID doesn't match, find a guest member (temporary fallback)
      const guestMember = partyMembers.find(m => m.userId.startsWith('guest_'))
      if (guestMember && partyMembers.length === 1) {
        console.warn('🔄 TEMP FIX: Using guest member ID for Firebase user')
        return guestMember.userId
      }
      
      return firebaseUid
    }
    return 'guest-user'
  }
  
  const currentUserId = getUserId()
  console.log('🔍 Debug user info:', {
    user,
    isAuthenticated,
    calculatedUserId: currentUserId,
    partyMembersCount: partyMembers.length
  })
  
  const currentUser = partyMembers.find((m: PartyMember) => m.userId === currentUserId)
  console.log('🔍 Current user in party:', currentUser)
  console.log('🔍 Party members DETAILED:', partyMembers.map(m => ({ 
    userId: m.userId, 
    username: m.username,
    userIdType: typeof m.userId,
    userIdLength: m.userId?.length,
    rawMember: m
  })))
  console.log('🔍 User ID comparison:')
  partyMembers.forEach((member, index) => {
    console.log(`  Member ${index}: "${member.userId}" === "${currentUserId}" ? ${member.userId === currentUserId}`)
    console.log(`  Member ${index} types: ${typeof member.userId} vs ${typeof currentUserId}`)
    console.log(`  Member ${index} lengths: ${member.userId.length} vs ${currentUserId.length}`)
  })
  console.log('🔍 Exact comparison test:')
  console.log('  Frontend userID:', JSON.stringify(currentUserId))
  console.log('  Backend userIDs:', partyMembers.map(m => JSON.stringify(m.userId)))
  
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

  const handleJoinByCode = () => {
    if (partyCodeInput.trim()) {
      joinPartyByCode(partyCodeInput.trim())
      setPartyCodeInput('')
      setShowJoinByCodeForm(false)
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

  // Render functions
  const renderPartyLobbyContent = () => (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Party Members */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center">
            <FaUsers className="mr-2" />
            Party Members
                  <span className="ml-2 text-sm text-gray-400">
              ({partyMembers.length}/{currentParty?.maxMembers})
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
                          <FaCrown className="ml-2 text-yellow-400" />
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
            onClick={() => {
              console.log('🔴 Ready button clicked!')
              console.log('Current user:', currentUser)
              console.log('Current ready status:', currentUser?.isReady)
              
              if (currentUser) {
                const newReadyStatus = !currentUser.isReady
                console.log('🔄 Toggling ready status to:', newReadyStatus)
                toggleReady(newReadyStatus)
              } else {
                console.error('❌ currentUser is null!')
                console.error('❌ Available party members:', partyMembers.map(m => ({userId: m.userId, username: m.username})))
                console.error('❌ Calculated currentUserId:', currentUserId)
              }
            }}
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
                  onChange={(e) => setGameSettings((prev) => ({ 
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
                  onChange={(e) => setGameSettings((prev) => ({ 
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
                  onChange={(e) => setGameSettings((prev) => ({ 
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
  )

  const renderTeamChallengesContent = () => {
    // Team challenges now use party socket - no separate connection needed
    return (
      <div className="space-y-6">
        {/* Team Challenge Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            ⚔️ Team Challenges
          </h2>
          <p className="text-gray-400 text-lg mb-6">
            Organize your party into teams and compete in strategic challenges
          </p>

          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-800/30 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">⚔️</div>
              <h4 className="text-white font-semibold">Team vs Team</h4>
              <p className="text-gray-400">Direct competition between teams</p>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="text-white font-semibold">Team Objectives</h4>
              <p className="text-gray-400">Complete challenges together</p>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🔄</div>
              <h4 className="text-white font-semibold">Team Relay</h4>
              <p className="text-gray-400">Take turns in relay challenges</p>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🛡️</div>
              <h4 className="text-white font-semibold">Team Survival</h4>
              <p className="text-gray-400">Last team standing wins</p>
            </div>
          </div>
        </div>

        {/* Team Challenge Manager */}
        <TeamChallengeManager 
          partyId={currentParty?.id || ''} 
          isLeader={isLeader}
        />
      </div>
    )
  }

  // Show party lobby if in party
  if (isInParty && currentParty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header with Tabs */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Party Info Header */}
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent mb-2">
                🎯 {currentParty.name}
              </h1>
              <p className="text-gray-400 text-lg">
                Party Lobby • {partyMembers.length}/{currentParty.maxMembers} players
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-800/50 rounded-lg p-1 flex space-x-1">
                <button
                  onClick={() => setActiveTab('lobby')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'lobby'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <FaGamepad className="inline mr-2" />
                  Party Lobby
                </button>
                <button
                  onClick={() => setActiveTab('team-challenges')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeTab === 'team-challenges'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <FaFistRaised className="inline mr-2" />
                  Team Challenges
                </button>
              </div>
            </div>

            {/* Party Invite Code - Always visible */}
            {inviteCode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center mb-6"
              >
                <h3 className="text-lg font-semibold text-emerald-400 mb-4">Party Invite Code</h3>
                <div className="flex items-center justify-center space-x-4">
                  <code className="text-3xl font-bold text-white bg-gray-700 px-6 py-3 rounded-lg tracking-wider">
                    {inviteCode}
                  </code>
                  <motion.button
                    onClick={copyInviteCode}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    📋 Copy
                  </motion.button>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  Share this code with your friends to join your party!
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'lobby' && (
              <motion.div
                key="lobby"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {renderPartyLobbyContent()}
              </motion.div>
            )}

            {activeTab === 'team-challenges' && (
              <motion.div
                key="team-challenges"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderTeamChallengesContent()}
              </motion.div>
            )}
          </AnimatePresence>
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
          
          {/* Authentication Required Notice */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-xl p-6"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="text-xl font-bold text-blue-400 mb-2">Guest Mode</h3>
                <p className="text-gray-300 mb-4">
                  You can test the party system as a guest. For full features, sign in with Google.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    🔑 Sign In with Google
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Connection Status */}
          <div className="mt-4 inline-flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-400">
              {isConnected ? 
                `Connected to party server (${window.location.hostname === 'myaimtrainer.loca.lt' ? 'Localtunnel' : 'Localhost'})` : 
                'Connecting to party server...'
              }
            </span>
          </div>
          
          {/* Connection Info */}
          <div className="mt-2 text-xs text-gray-500">
            {window.location.hostname === 'myaimtrainer.loca.lt' ? (
              <span>🌐 Using Localtunnel (Polling Transport)</span>
            ) : (
              <span>🏠 Using Localhost (WebSocket Transport)</span>
            )}
          </div>
          
          {/* Localhost Test Button */}
          {!isConnected && window.location.hostname === 'myaimtrainer.loca.lt' && (
            <div className="mt-4">
              <a 
                href="http://localhost:3000" 
                target="_blank" 
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors"
              >
                🏠 Test on Localhost
              </a>
              <p className="text-xs text-gray-500 mt-1">
                If localtunnel doesn't work, try localhost for testing.
              </p>
            </div>
          )}
          
          {/* Debug Info (Development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-xs text-gray-500 bg-gray-900 rounded px-2 py-1 font-mono">
              Debug: Connected={isConnected.toString()}, InParty={isInParty.toString()}, User={!!user}, Authenticated={isAuthenticated.toString()}
            </div>
          )}
        </motion.div>

        {!isConnected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400 mb-2">Connecting to party system...</p>
            <p className="text-xs text-gray-500">
              If this takes too long, please check your internet connection and refresh the page.
            </p>
            
            {/* Retry button */}
            <button
              onClick={() => {
                console.log('🔄 Manual reconnect attempt')
                connect()
              }}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-colors"
            >
              Retry Connection
            </button>
          </motion.div>
        ) : isAuthenticated ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Join by Code */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🎫</span>
                Join by Code
              </h3>
              <p className="text-gray-400 mb-6">Enter a party invite code to join instantly</p>
              
              {!showJoinByCodeForm ? (
                <button
                  onClick={() => setShowJoinByCodeForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Enter Party Code
                </button>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={partyCodeInput}
                    onChange={(e) => setPartyCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character code..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 text-center text-lg font-mono tracking-wider"
                    maxLength={6}
                    style={{ letterSpacing: '0.2em' }}
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleJoinByCode}
                      disabled={!partyCodeInput.trim() || partyCodeInput.length !== 6}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition-all"
                    >
                      Join Party
                    </button>
                    <button
                      onClick={() => {
                        setShowJoinByCodeForm(false)
                        setPartyCodeInput('')
                      }}
                      className="px-4 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Join Party (Legacy) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🎯</span>
                Join by ID
              </h3>
              <p className="text-gray-400 mb-6">Join an existing party with party ID</p>
              
              {!showJoinForm ? (
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Join by Party ID
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
                      className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition-all"
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Join by Code */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🎫</span>
                Join by Code
              </h3>
              <p className="text-gray-400 mb-6">Enter a party invite code to join instantly</p>
              
              {!showJoinByCodeForm ? (
                <button
                  onClick={() => setShowJoinByCodeForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Enter Party Code
                </button>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={partyCodeInput}
                    onChange={(e) => setPartyCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character code..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 text-center text-lg font-mono tracking-wider"
                    maxLength={6}
                    style={{ letterSpacing: '0.2em' }}
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleJoinByCode}
                      disabled={!partyCodeInput.trim() || partyCodeInput.length !== 6}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition-all"
                    >
                      Join Party
                    </button>
                    <button
                      onClick={() => {
                        setShowJoinByCodeForm(false)
                        setPartyCodeInput('')
                      }}
                      className="px-4 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Join Party (Legacy) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-2xl mr-3">🎯</span>
                Join by ID
              </h3>
              <p className="text-gray-400 mb-6">Join an existing party with party ID</p>
              
              {!showJoinForm ? (
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Join by Party ID
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
                      className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg font-semibold transition-all"
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