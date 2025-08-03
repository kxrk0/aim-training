import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { usePartyStore } from '@/stores/partyStore'
import { useAuthStore } from '@/stores/authStore'
import { FaUsers, FaCrosshairs, FaTrophy, FaClock, FaArrowLeft, FaSync } from 'react-icons/fa'
import type { PartyGameSession, PartyMember } from '../../../shared/types'

export function PartyGamePage() {
  const { partyId } = useParams()
  const navigate = useNavigate()
  const { currentGame, partyMembers, isConnected, connect, disconnect } = usePartyStore()
  const { user } = useAuthStore()
  
  const [gameState, setGameState] = useState<'waiting' | 'countdown' | 'active' | 'finished'>('waiting')
  const [countdown, setCountdown] = useState(3)
  const [gameTime, setGameTime] = useState(60)
  const [targets, setTargets] = useState<Array<{id: string, x: number, y: number, player: 1 | 2}>>([])
  
  // Player stats
  const [playerStats, setPlayerStats] = useState({
    player1: { score: 0, hits: 0, misses: 0, accuracy: 0, streak: 0 },
    player2: { score: 0, hits: 0, misses: 0, accuracy: 0, streak: 0 }
  })
  
  // Game refs
  const gameContainer1Ref = useRef<HTMLDivElement>(null)
  const gameContainer2Ref = useRef<HTMLDivElement>(null)
  
  // Get player info
  const player1 = partyMembers[0]
  const player2 = partyMembers[1] 
  const currentUserId = user?.id || (user as any)?.uid
  const isPlayer1 = currentUserId === player1?.userId
  const isPlayer2 = currentUserId === player2?.userId
  const currentPlayer = isPlayer1 ? 1 : 2
  
  // Force party data reload if missing
  useEffect(() => {
    // Handle socket disconnection more aggressively
    if (partyId && !isConnected) {
      console.log('🚨 Socket disconnected! Attempting immediate reconnection...')
      connect()
    }
    
    if (partyId && isConnected && partyMembers.length === 0) {
      console.log('🔄 Party members missing, attempting to reload party data...')
      
      // Try to rejoin/reconnect to party
      const timeoutId = setTimeout(() => {
        if (partyMembers.length === 0) {
          console.log('🔌 Attempting party reconnection...')
          // Force reconnect to party system
          disconnect()
          setTimeout(() => {
            connect()
          }, 1000)
        }
      }, 3000) // Wait 3 seconds then try reconnect
      
      return () => clearTimeout(timeoutId)
    }
  }, [partyId, isConnected, partyMembers.length, connect, disconnect])

  useEffect(() => {
    console.log('🎮 PartyGamePage Debug:', {
      currentGame: !!currentGame,
      gameStatus: currentGame?.status,
      partyId,
      partyMembersCount: partyMembers.length,
      player1: player1?.username,
      player2: player2?.username,
      currentUserId
    })
    
    if (!partyId) {
      console.log('❌ No partyId, redirecting to party lobby')
      navigate('/party')
      return
    }
    
    // Don't redirect if no currentGame - wait for it to load
    if (currentGame && currentGame.status === 'countdown') {
      console.log('🔄 Starting countdown...')
      startCountdown()
    } else if (currentGame && currentGame.status === 'active') {
      console.log('🎯 Game already active, starting immediately')
      startGame()
    } else if (!currentGame) {
      console.log('⏳ Waiting for game session to load...')
      // Don't redirect immediately, wait for game session
    }
  }, [currentGame, partyId, navigate])
  
  const startCountdown = () => {
    setGameState('countdown')
    let count = 3
    setCountdown(count)
    
    const countdownInterval = setInterval(() => {
      count--
      setCountdown(count)
      
      if (count <= 0) {
        clearInterval(countdownInterval)
        startGame()
      }
    }, 1000)
  }
  
  const startGame = () => {
    setGameState('active')
    setGameTime(currentGame?.gameSettings.duration || 60)
    
    // Generate initial targets
    generateTargets()
    
    // Start game timer
    const gameTimer = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 1) {
          clearInterval(gameTimer)
          endGame()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    // Target generation interval
    const targetInterval = setInterval(() => {
      if (gameState === 'active') {
        generateTargets()
      }
    }, 2000)
    
    return () => {
      clearInterval(gameTimer)
      clearInterval(targetInterval)
    }
  }
  
  const generateTargets = () => {
    const newTargets = []
    
    // Generate target for player 1
    newTargets.push({
      id: `p1-${Date.now()}-${Math.random()}`,
      x: Math.random() * 80 + 10, // 10-90% width
      y: Math.random() * 80 + 10, // 10-90% height
      player: 1 as const
    })
    
    // Generate target for player 2
    newTargets.push({
      id: `p2-${Date.now()}-${Math.random()}`,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      player: 2 as const
    })
    
    setTargets(newTargets)
  }
  
  const handleTargetHit = (targetId: string, player: 1 | 2) => {
    if (gameState !== 'active') return
    
    // Only allow current player to hit their targets
    if (player !== currentPlayer) return
    
    setTargets(prev => prev.filter(t => t.id !== targetId))
    
    // Update stats
    setPlayerStats(prev => ({
      ...prev,
      [`player${player}`]: {
        ...prev[`player${player}` as keyof typeof prev],
        score: prev[`player${player}` as keyof typeof prev].score + 100,
        hits: prev[`player${player}` as keyof typeof prev].hits + 1,
        streak: prev[`player${player}` as keyof typeof prev].streak + 1,
        accuracy: Math.round(((prev[`player${player}` as keyof typeof prev].hits + 1) / (prev[`player${player}` as keyof typeof prev].hits + prev[`player${player}` as keyof typeof prev].misses + 1)) * 100)
      }
    }))
    
    // Generate new target immediately
    setTimeout(generateTargets, 100)
  }
  
  const handleMiss = (player: 1 | 2) => {
    if (gameState !== 'active' || player !== currentPlayer) return
    
    setPlayerStats(prev => ({
      ...prev,
      [`player${player}`]: {
        ...prev[`player${player}` as keyof typeof prev],
        misses: prev[`player${player}` as keyof typeof prev].misses + 1,
        streak: 0,
        accuracy: Math.round((prev[`player${player}` as keyof typeof prev].hits / (prev[`player${player}` as keyof typeof prev].hits + prev[`player${player}` as keyof typeof prev].misses + 1)) * 100)
      }
    }))
  }
  
  const endGame = () => {
    setGameState('finished')
    setTargets([])
  }
  
  const handleBackToLobby = () => {
    navigate('/party')
  }
  
  const getWinner = () => {
    if (playerStats.player1.score > playerStats.player2.score) return 1
    if (playerStats.player2.score > playerStats.player1.score) return 2
    return null // Tie
  }
  
  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🎮</div>
          <h2 className="text-2xl font-bold text-white mb-4">Loading Game Session...</h2>
          <p className="text-gray-400 mb-6">Setting up your 1v1 match</p>
          <div className="flex space-x-4 justify-center">
            <button 
              onClick={handleBackToLobby}
              className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Back to Lobby
            </button>
          </div>
          
          {/* Debug Info */}
          <div className="mt-8 text-left text-sm text-gray-500 bg-gray-800/30 rounded-lg p-4 max-w-md">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <div>Party ID: {partyId}</div>
            <div className={partyMembers.length === 0 ? 'text-red-400 font-bold' : ''}>
              Party Members: {partyMembers.length} {partyMembers.length === 0 && '⚠️ MISSING!'}
            </div>
            <div>Current User: {currentUserId}</div>
            <div className={!player1 ? 'text-red-400' : ''}>
              Player 1: {player1?.username || 'undefined'}
            </div>
            <div className={!player2 ? 'text-red-400' : ''}>
              Player 2: {player2?.username || 'undefined'}
            </div>
            <div>Game Session: {currentGame ? 'loaded' : 'loading...'}</div>
            <div className={!isConnected ? 'text-red-400 font-bold' : 'text-green-400'}>
              Socket Connected: {isConnected ? '✅' : '❌'}
            </div>
            
            {/* Troubleshooting */}
            {(!isConnected || partyMembers.length === 0) && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded">
                <div className="text-red-400 font-bold text-xs mb-2">🚨 TROUBLESHOOTING:</div>
                <div className="text-xs text-red-300">
                  {!isConnected && '• Socket disconnected - reconnecting...'}<br/>
                  {partyMembers.length === 0 && '• Party data missing'}<br/>
                  • Attempting auto-reconnection...<br/>
                  • If problem persists, go back to lobby
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleBackToLobby}
            className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Lobby</span>
          </button>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-white">
              <FaClock />
              <span className="font-mono text-xl">{Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</span>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Party 1v1</div>
              <div className="text-white font-semibold">{currentGame.gameSettings.gameMode.toUpperCase()}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Countdown Overlay */}
      <AnimatePresence>
        {gameState === 'countdown' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="text-9xl font-black text-white mb-4"
              >
                {countdown || 'GO!'}
              </motion.div>
              <p className="text-xl text-gray-300">Get ready to aim!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Game Finished Overlay */}
      <AnimatePresence>
        {gameState === 'finished' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="text-center max-w-2xl mx-auto p-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-6xl mb-6">
                  {getWinner() === 1 ? '🏆' : getWinner() === 2 ? '🥈' : '🤝'}
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  {getWinner() === null ? 'It\'s a Tie!' : 
                   getWinner() === 1 ? `${player1?.username} Wins!` : 
                   `${player2?.username} Wins!`}
                </h2>
                
                {/* Final Scores */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-600/20 rounded-xl p-6 border border-blue-500/30">
                    <h3 className="text-blue-400 font-bold mb-2">{player1?.username}</h3>
                    <div className="text-3xl font-bold text-white mb-2">{playerStats.player1.score}</div>
                    <div className="text-sm text-gray-300">
                      {playerStats.player1.hits} hits • {playerStats.player1.accuracy}% accuracy
                    </div>
                  </div>
                  
                  <div className="bg-purple-600/20 rounded-xl p-6 border border-purple-500/30">
                    <h3 className="text-purple-400 font-bold mb-2">{player2?.username}</h3>
                    <div className="text-3xl font-bold text-white mb-2">{playerStats.player2.score}</div>
                    <div className="text-sm text-gray-300">
                      {playerStats.player2.hits} hits • {playerStats.player2.accuracy}% accuracy
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2"
                  >
                    <FaSync />
                    <span>Play Again</span>
                  </button>
                  
                  <button
                    onClick={handleBackToLobby}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold"
                  >
                    Back to Lobby
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Game Area - Side by Side */}
      <div className="pt-20 h-screen grid grid-cols-2 gap-1">
        {/* Player 1 Area */}
        <div className="relative bg-gradient-to-br from-blue-900/30 to-blue-700/30 border-r border-gray-600">
          {/* Player 1 Header */}
          <div className="absolute top-4 left-4 z-30 bg-blue-600/80 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="text-blue-300">👤</div>
              <div>
                <div className="text-white font-bold">{player1?.username || 'Player 1'}</div>
                <div className="text-blue-200 text-sm">Player 1</div>
              </div>
            </div>
          </div>
          
          {/* Player 1 Stats */}
          <div className="absolute top-4 right-4 z-30 bg-blue-600/80 backdrop-blur-sm rounded-lg p-3 text-right">
            <div className="text-2xl font-bold text-white">{playerStats.player1.score}</div>
            <div className="text-blue-200 text-sm">{playerStats.player1.accuracy}% • {playerStats.player1.streak}x</div>
          </div>
          
          {/* Player 1 Game Area */}
          <div
            ref={gameContainer1Ref}
            className="absolute inset-0 cursor-crosshair"
            onClick={(e) => {
              if (gameState === 'active' && currentPlayer === 1) {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = ((e.clientX - rect.left) / rect.width) * 100
                const y = ((e.clientY - rect.top) / rect.height) * 100
                
                // Check if clicked on a target
                const hitTarget = targets.find(t => 
                  t.player === 1 && 
                  Math.abs(t.x - x) < 5 && 
                  Math.abs(t.y - y) < 5
                )
                
                if (hitTarget) {
                  handleTargetHit(hitTarget.id, 1)
                } else {
                  handleMiss(1)
                }
              }
            }}
          >
            {/* Player 1 Targets */}
            {targets.filter(t => t.player === 1).map(target => (
              <motion.div
                key={target.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute w-16 h-16 bg-red-500 rounded-full border-4 border-white shadow-lg cursor-pointer flex items-center justify-center"
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaCrosshairs className="text-white text-xl" />
              </motion.div>
            ))}
            
            {/* Player 1 Disabled Overlay */}
            {currentPlayer !== 1 && gameState === 'active' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-xl font-bold">Opponent's Turn</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Player 2 Area */}
        <div className="relative bg-gradient-to-br from-purple-900/30 to-purple-700/30">
          {/* Player 2 Header */}
          <div className="absolute top-4 left-4 z-30 bg-purple-600/80 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="text-purple-300">👤</div>
              <div>
                <div className="text-white font-bold">{player2?.username || 'Player 2'}</div>
                <div className="text-purple-200 text-sm">Player 2</div>
              </div>
            </div>
          </div>
          
          {/* Player 2 Stats */}
          <div className="absolute top-4 right-4 z-30 bg-purple-600/80 backdrop-blur-sm rounded-lg p-3 text-right">
            <div className="text-2xl font-bold text-white">{playerStats.player2.score}</div>
            <div className="text-purple-200 text-sm">{playerStats.player2.accuracy}% • {playerStats.player2.streak}x</div>
          </div>
          
          {/* Player 2 Game Area */}
          <div
            ref={gameContainer2Ref}
            className="absolute inset-0 cursor-crosshair"
            onClick={(e) => {
              if (gameState === 'active' && currentPlayer === 2) {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = ((e.clientX - rect.left) / rect.width) * 100
                const y = ((e.clientY - rect.top) / rect.height) * 100
                
                // Check if clicked on a target
                const hitTarget = targets.find(t => 
                  t.player === 2 && 
                  Math.abs(t.x - x) < 5 && 
                  Math.abs(t.y - y) < 5
                )
                
                if (hitTarget) {
                  handleTargetHit(hitTarget.id, 2)
                } else {
                  handleMiss(2)
                }
              }
            }}
          >
            {/* Player 2 Targets */}
            {targets.filter(t => t.player === 2).map(target => (
              <motion.div
                key={target.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute w-16 h-16 bg-red-500 rounded-full border-4 border-white shadow-lg cursor-pointer flex items-center justify-center"
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaCrosshairs className="text-white text-xl" />
              </motion.div>
            ))}
            
            {/* Player 2 Disabled Overlay */}
            {currentPlayer !== 2 && gameState === 'active' && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-xl font-bold">Opponent's Turn</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Center Divider */}
      <div className="absolute top-20 bottom-0 left-1/2 w-1 bg-gradient-to-b from-blue-500 to-purple-500 transform -translate-x-0.5 z-20"></div>
      
      {/* VS Badge */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center border-4 border-white shadow-lg">
          <span className="text-white font-bold text-lg">VS</span>
        </div>
      </div>
    </div>
  )
} 