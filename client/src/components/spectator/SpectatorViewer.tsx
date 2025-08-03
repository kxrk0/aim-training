import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

import { useSpectatorStore } from '@/stores/spectatorStore'
import { useAuthStore } from '@/stores/authStore'
import { 
  FaEye, FaEyeSlash, FaVideo, FaUsers, FaComments, FaCog,
  FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand,
  FaCompress, FaArrowLeft, FaCircle, FaSyncAlt
} from 'react-icons/fa'

interface SpectatorViewerProps {
  partyId: string
  onExit: () => void
}

export function SpectatorViewer({ partyId, onExit }: SpectatorViewerProps) {
  // Store state
  const {
    isSpectating,
    currentParty,
    spectatorSession,
    gameSession,
    gameUpdates,
    cameraMode,
    followingPlayerId,
    spectatorChat,
    updateCamera,
    sendSpectatorChat,
    leaveSpectator,
    error
  } = useSpectatorStore()

  const { user } = useAuthStore()

  // UI state
  const [showChat, setShowChat] = useState(true)
  const [showSpectatorList, setShowSpectatorList] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)

  // Refs
  const chatRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [spectatorChat])

  // Handle exit
  const handleExit = () => {
    leaveSpectator()
    onExit()
  }

  // Send chat message
  const handleSendChat = () => {
    if (chatMessage.trim()) {
      sendSpectatorChat(chatMessage)
      setChatMessage('')
    }
  }

  // Camera mode handlers
  const handleCameraModeChange = (mode: 'free' | 'follow-player' | 'overview') => {
    updateCamera(mode)
  }

  const handleFollowPlayer = (playerId: string) => {
    updateCamera('follow-player', playerId)
  }

  // Fullscreen handlers
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Get camera icon
  const getCameraIcon = () => {
    switch (cameraMode) {
      case 'free': return <FaVideo />
      case 'follow-player': return <FaEye />
      case 'overview': return <FaExpand />
      default: return <FaVideo />
    }
  }

  if (!isSpectating || !currentParty) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">👁️</div>
          <h2 className="text-2xl font-bold mb-2">Connecting to Spectator Mode...</h2>
          <p className="text-gray-400">Loading party session</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={viewerRef} className="w-full h-screen bg-gray-900 relative overflow-hidden">
      {/* 3D Game View */}
      <div className="absolute inset-0">
        <Canvas>
          <PerspectiveCamera 
            makeDefault 
            position={[0, 5, 10]}
            fov={75}
          />
          
          <SpectatorCamera 
            mode={cameraMode}
            followingPlayerId={followingPlayerId}
            gameSession={gameSession}
          />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          {/* Game Objects */}
          {gameSession && <GameStateRenderer gameSession={gameSession} />}
          
          {/* Environment */}
          <gridHelper args={[50, 50, '#333333', '#333333']} position={[0, 0, 0]} />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
          {/* Party Info */}
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-4">
            <button
              onClick={handleExit}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaArrowLeft />
            </button>
            
            <div>
              <h2 className="text-white font-bold">{currentParty.name}</h2>
              <div className="text-sm text-gray-400 flex items-center space-x-3">
                <span>👥 {currentParty.members.length} players</span>
                <span>👁️ {spectatorSession?.spectators.length || 0} spectators</span>
                {gameSession && <span>🎮 {gameSession.status}</span>}
              </div>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 flex items-center space-x-2">
            <div className="text-white text-sm font-medium flex items-center space-x-2">
              {getCameraIcon()}
              <span className="capitalize">{cameraMode.replace('-', ' ')}</span>
            </div>
            
            <div className="border-l border-gray-600 pl-3 ml-3 flex space-x-2">
              <button
                onClick={() => handleCameraModeChange('overview')}
                className={`p-2 rounded transition-colors ${
                  cameraMode === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaExpand />
              </button>
              
              <button
                onClick={() => handleCameraModeChange('free')}
                className={`p-2 rounded transition-colors ${
                  cameraMode === 'free' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaVideo />
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="bg-black/70 backdrop-blur-sm p-3 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
            
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="bg-black/70 backdrop-blur-sm p-3 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              {audioEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
            </button>
          </div>
        </div>

        {/* Left Panel - Player List */}
        <div className="absolute left-4 top-24 bottom-4 w-64 pointer-events-auto">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 h-full flex flex-col">
            <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
              <FaUsers />
              <span>Players</span>
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-2">
              {currentParty.members.map(member => (
                <div
                  key={member.userId}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    followingPlayerId === member.userId
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-600 bg-gray-700/50 hover:bg-gray-600/50'
                  }`}
                  onClick={() => handleFollowPlayer(member.userId)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{member.username}</div>
                      {gameSession && (
                        <div className="text-sm text-gray-400">
                          Score: {gameSession.participants.find(p => p.userId === member.userId)?.score || 0}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <FaCircle className={`text-xs ${member.isOnline ? 'text-green-400' : 'text-gray-500'}`} />
                      {followingPlayerId === member.userId && (
                        <FaEye className="text-blue-400 text-sm" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Chat */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute right-4 top-24 bottom-4 w-80 pointer-events-auto"
            >
              <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 h-full flex flex-col">
                {/* Chat Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold flex items-center space-x-2">
                    <FaComments />
                    <span>Spectator Chat</span>
                  </h3>
                  
                  <button
                    onClick={() => setShowChat(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FaEyeSlash />
                  </button>
                </div>

                {/* Chat Messages */}
                <div 
                  ref={chatRef}
                  className="flex-1 overflow-y-auto space-y-2 mb-3"
                >
                  {spectatorChat.map(message => (
                    <div key={message.id} className="text-sm">
                      <div className="text-gray-400">
                        <span className="text-blue-400 font-medium">{message.username}</span>
                        <span className="ml-2 text-xs">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-gray-200">{message.message}</div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-700/50 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendChat}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Bar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 flex items-center space-x-4">
            {/* Chat Toggle */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded transition-colors ${
                showChat ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <FaComments />
            </button>

            {/* Live Indicator */}
            <div className="flex items-center space-x-2 text-red-400">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">LIVE</span>
            </div>

            {/* Game Status */}
            {gameSession && (
              <div className="text-white text-sm">
                Status: <span className="text-green-400 capitalize">{gameSession.status}</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Spectator Camera Component
function SpectatorCamera({ 
  mode, 
  followingPlayerId, 
  gameSession 
}: { 
  mode: string
  followingPlayerId: string | null
  gameSession: any
}) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)

  useFrame(() => {
    if (!cameraRef.current) return

    switch (mode) {
      case 'overview':
        // Fixed overview position
        cameraRef.current.position.set(0, 15, 15)
        cameraRef.current.lookAt(0, 0, 0)
        break
        
      case 'follow-player':
        if (followingPlayerId && gameSession) {
          // Follow specific player (simplified)
          const player = gameSession.participants?.find((p: any) => p.userId === followingPlayerId)
          if (player) {
            cameraRef.current.position.set(0, 5, 10)
            cameraRef.current.lookAt(0, 2, 0)
          }
        }
        break
        
      case 'free':
        // Allow free camera movement (could be controlled by mouse/keyboard)
        break
    }
  })

  return <PerspectiveCamera ref={cameraRef} makeDefault />
}

// Game State Renderer
function GameStateRenderer({ gameSession }: { gameSession: any }) {
  // Render current game state including targets, players, etc.
  return (
    <group>
      {/* Render targets */}
      {gameSession.currentTargets?.map((target: any, index: number) => (
        <mesh key={target.id || index} position={[target.x || 0, target.y || 2, target.z || 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.2} />
        </mesh>
      ))}
      
      {/* Render player positions (if available) */}
      {gameSession.participants?.map((participant: any, index: number) => (
        <group key={participant.userId} position={[index * 2 - 5, 1, 0]}>
          <mesh>
            <cylinderGeometry args={[0.5, 0.5, 2]} />
            <meshStandardMaterial color="#4ecdc4" />
          </mesh>
          {/* Player name */}
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  )
} 