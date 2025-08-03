import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { io, Socket } from 'socket.io-client'
import type { 
  Party,
  PartySpectator, 
  SpectatorSession, 
  SpectatorGameUpdate,
  SpectatorCameraUpdate,
  PartyGameSession
} from '../../../shared/types'

interface SpectatorStoreState {
  // Connection state
  socket: Socket | null
  isConnected: boolean
  isSpectating: boolean
  
  // Current spectator session
  currentParty: Party | null
  spectatorSession: SpectatorSession | null
  spectatorInfo: PartySpectator | null
  
  // Game state
  gameSession: PartyGameSession | null
  gameUpdates: SpectatorGameUpdate[]
  
  // Camera controls
  cameraMode: 'free' | 'follow-player' | 'overview'
  followingPlayerId: string | null
  
  // Chat
  spectatorChat: Array<{
    id: string
    userId: string
    username: string
    message: string
    timestamp: string
    type: 'spectator'
  }>
  
  // Available parties to spectate
  availableParties: Array<{
    partyId: string
    partyName: string
    playerCount: number
    gameMode: string
    status: string
    spectatorCount: number
    allowSpectators: boolean
  }>
  
  // Actions
  connect: () => void
  disconnect: () => void
  joinSpectator: (partyId: string) => void
  leaveSpectator: () => void
  updateCamera: (cameraMode: 'free' | 'follow-player' | 'overview', followingPlayerId?: string) => void
  sendSpectatorChat: (message: string) => void
  requestGameState: () => void
  refreshAvailableParties: () => void
  
  // Error handling
  error: string | null
  clearError: () => void
}

export const useSpectatorStore = create<SpectatorStoreState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    socket: null,
    isConnected: false,
    isSpectating: false,
    
    currentParty: null,
    spectatorSession: null,
    spectatorInfo: null,
    
    gameSession: null,
    gameUpdates: [],
    
    cameraMode: 'overview',
    followingPlayerId: null,
    
    spectatorChat: [],
    availableParties: [],
    
    error: null,

    // Actions
    connect: () => {
      const state = get()
      if (state.isConnected || state.socket) return

      // Dynamic WebSocket URL based on environment
      const getSocketUrl = () => {
        const protocol = window.location.protocol
        const origin = window.location.origin
        const hostname = window.location.hostname
        
        console.log('🔗 Spectator URL Detection - Protocol:', protocol, 'Origin:', origin, 'Hostname:', hostname)
        
        // Desktop app (Electron) - Robust detection
        if (protocol === 'file:' || 
            origin === 'file://' || 
            hostname === '' || 
            hostname === 'file' ||
            (typeof window !== 'undefined' && (window as any).electronAPI)) {
          console.log('🖥️ Spectator: Desktop app detected - connecting to VPS')
          return 'https://aim.liorabelleleather.com'
        }
        return 'https://aim.liorabelleleather.com' // Default to VPS
      }

      const newSocket = io(getSocketUrl(), {
        auth: {
          token: localStorage.getItem('token')
        }
      })

      // Connection events
      newSocket.on('connect', () => {
        console.log('🔗 Connected to spectator system')
        set({ isConnected: true, error: null })
      })

      newSocket.on('disconnect', () => {
        console.log('❌ Disconnected from spectator system')
        set({ 
          isConnected: false, 
          isSpectating: false,
          currentParty: null,
          spectatorSession: null,
          spectatorInfo: null,
          gameSession: null
        })
      })

      // Spectator events
      newSocket.on('spectator:joined', (data: { 
        party: Party, 
        spectatorSession: SpectatorSession, 
        spectatorInfo: PartySpectator 
      }) => {
        console.log('👁️ Joined as spectator:', data)
        set({
          isSpectating: true,
          currentParty: data.party,
          spectatorSession: data.spectatorSession,
          spectatorInfo: data.spectatorInfo,
          error: null
        })
        
        // Request current game state
        get().requestGameState()
      })

      newSocket.on('spectator:left', () => {
        console.log('👋 Left spectator mode')
        set({
          isSpectating: false,
          currentParty: null,
          spectatorSession: null,
          spectatorInfo: null,
          gameSession: null,
          gameUpdates: [],
          spectatorChat: [],
          cameraMode: 'overview',
          followingPlayerId: null
        })
      })

      newSocket.on('spectator:user-joined', (spectator: PartySpectator) => {
        const state = get()
        if (state.spectatorSession) {
          const updatedSession = {
            ...state.spectatorSession,
            spectators: [...state.spectatorSession.spectators, spectator]
          }
          set({ spectatorSession: updatedSession })
        }
      })

      newSocket.on('spectator:user-left', (data: { userId: string }) => {
        const state = get()
        if (state.spectatorSession) {
          const updatedSession = {
            ...state.spectatorSession,
            spectators: state.spectatorSession.spectators.filter(s => s.userId !== data.userId)
          }
          set({ spectatorSession: updatedSession })
        }
      })

      // Game state events
      newSocket.on('spectator:game-state', (data: {
        gameSession: PartyGameSession
        currentTargets: any[]
        participants: any[]
        leaderboard: any[]
      }) => {
        console.log('🎮 Received game state:', data)
        set({ gameSession: data.gameSession })
      })

      newSocket.on('spectator:game-update', (update: SpectatorGameUpdate) => {
        const state = get()
        const newUpdates = [...state.gameUpdates, update].slice(-100) // Keep last 100 updates
        set({ gameUpdates: newUpdates })
      })

      // Camera events
      newSocket.on('spectator:camera-updated', (data: {
        cameraMode: 'free' | 'follow-player' | 'overview'
        followingPlayerId?: string
      }) => {
        set({ 
          cameraMode: data.cameraMode,
          followingPlayerId: data.followingPlayerId || null
        })
      })

      // Chat events
      newSocket.on('spectator:chat-message', (message: {
        id: string
        userId: string
        username: string
        message: string
        timestamp: string
        type: 'spectator'
      }) => {
        const state = get()
        const newChat = [...state.spectatorChat, message].slice(-50) // Keep last 50 messages
        set({ spectatorChat: newChat })
      })

      // Error handling
      newSocket.on('error', (error: { message: string, code: string }) => {
        console.error('❌ Spectator error:', error)
        set({ error: error.message })
      })

      set({ socket: newSocket })
    },

    disconnect: () => {
      const state = get()
      if (state.socket) {
        state.socket.disconnect()
        set({ 
          socket: null, 
          isConnected: false,
          isSpectating: false,
          currentParty: null,
          spectatorSession: null,
          spectatorInfo: null,
          gameSession: null,
          gameUpdates: [],
          spectatorChat: [],
          error: null
        })
      }
    },

    joinSpectator: (partyId: string) => {
      const state = get()
      if (!state.socket || !state.isConnected) {
        set({ error: 'Not connected to spectator system' })
        return
      }

      if (state.isSpectating) {
        set({ error: 'Already spectating a party' })
        return
      }

      console.log('👁️ Joining as spectator:', partyId)
      state.socket.emit('spectator:join', { partyId })
    },

    leaveSpectator: () => {
      const state = get()
      if (!state.socket || !state.isSpectating) return

      console.log('👋 Leaving spectator mode')
      state.socket.emit('spectator:leave')
    },

    updateCamera: (cameraMode: 'free' | 'follow-player' | 'overview', followingPlayerId?: string) => {
      const state = get()
      if (!state.socket || !state.isSpectating) return

      const cameraUpdate: SpectatorCameraUpdate = {
        spectatorId: state.spectatorInfo?.userId || '',
        cameraMode,
        followingPlayerId
      }

      console.log('📹 Updating camera mode:', cameraUpdate)
      state.socket.emit('spectator:camera-update', cameraUpdate)
    },

    sendSpectatorChat: (message: string) => {
      const state = get()
      if (!state.socket || !state.isSpectating) return

      if (message.trim().length === 0) return

      console.log('💬 Sending spectator chat:', message)
      state.socket.emit('spectator:chat', { message: message.trim() })
    },

    requestGameState: () => {
      const state = get()
      if (!state.socket || !state.isSpectating) return

      console.log('🔄 Requesting current game state')
      state.socket.emit('spectator:request-game-state')
    },

    refreshAvailableParties: () => {
      const state = get()
      if (!state.socket || !state.isConnected) return

      // This would typically fetch from an API endpoint
      // For now, we'll use socket events to get available parties
      state.socket.emit('spectator:get-available-parties')
    },

    clearError: () => {
      set({ error: null })
    }
  }))
)

// Auto-connect when token is available
const token = localStorage.getItem('token')
if (token) {
  // Auto-connect with a small delay to ensure other systems are ready
  setTimeout(() => {
    const store = useSpectatorStore.getState()
    if (!store.isConnected) {
      store.connect()
    }
  }, 1000)
} 