import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'
import type { 
  Party, 
  PartyMember, 
  PartyGameSettings, 
  PartyGameSession,
  PartyState,
  ChatMessage 
} from '../../../shared/types'

interface PartyStore extends PartyState {
  socket: Socket | null
  // Actions
  connect: () => void
  disconnect: () => void
  createParty: (name: string, maxMembers: number, isPrivate: boolean) => void
  joinParty: (partyId: string, inviteCode?: string) => void
  leaveParty: () => void
  toggleReady: (isReady: boolean) => void
  startGame: (gameSettings: PartyGameSettings) => void
  sendChatMessage: (message: string) => void
  // Internal state setters
  setParty: (party: Party | null) => void
  setMembers: (members: PartyMember[]) => void
  setGameSession: (gameSession: PartyGameSession | null) => void
  addChatMessage: (message: ChatMessage) => void
}

export const usePartyStore = create<PartyStore>((set, get) => ({
  // Initial state
  currentParty: null,
  isInParty: false,
  partyMembers: [],
  currentGame: null,
  isGameActive: false,
  inviteCode: null,
  partyChat: [],
  isConnected: false,
  socket: null,

  // Actions
  connect: () => {
    const socket = io((import.meta as any).env.VITE_WS_URL || 'http://localhost:3001', {
      transports: ['websocket']
    })

    // Socket event listeners
    socket.on('connect', () => {
      set({ isConnected: true })
      console.log('🔌 Connected to party server')
    })

    socket.on('disconnect', () => {
      set({ isConnected: false })
      console.log('🔌 Disconnected from party server')
    })

    // Party events
    socket.on('party:updated', (party: Party) => {
      set({ 
        currentParty: party,
        isInParty: true,
        partyMembers: party.members,
        inviteCode: party.inviteCode || null
      })
    })

    socket.on('party:member-joined', (member: PartyMember) => {
      const { partyMembers } = get()
      const updatedMembers = [...partyMembers]
      const existingIndex = updatedMembers.findIndex(m => m.userId === member.userId)
      
      if (existingIndex === -1) {
        updatedMembers.push(member)
        set({ partyMembers: updatedMembers })
      }
    })

    socket.on('party:member-left', (userId: string) => {
      const { partyMembers } = get()
      const updatedMembers = partyMembers.filter(m => m.userId !== userId)
      set({ partyMembers: updatedMembers })
    })

    socket.on('party:game-started', (gameSession: PartyGameSession) => {
      set({ 
        currentGame: gameSession,
        isGameActive: true
      })
    })

    socket.on('party:game-update', (update) => {
      // Handle real-time game updates
      console.log('🎮 Game update:', update)
    })

    socket.on('party:game-ended', (results) => {
      set({ 
        currentGame: null,
        isGameActive: false
      })
      console.log('🏁 Game ended:', results)
    })

    socket.on('chat:new-message', (message: ChatMessage) => {
      const { partyChat } = get()
      set({ partyChat: [...partyChat, message] })
    })

    socket.on('error', (error) => {
      console.error('❌ Party error:', error)
      // TODO: Show toast notification
    })

    set({ socket })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ 
        socket: null,
        isConnected: false,
        currentParty: null,
        isInParty: false,
        partyMembers: [],
        currentGame: null,
        isGameActive: false,
        inviteCode: null,
        partyChat: []
      })
    }
  },

  createParty: (name: string, maxMembers: number, isPrivate: boolean) => {
    const { socket } = get()
    if (socket) {
      socket.emit('party:create', { name, maxMembers, isPrivate })
    }
  },

  joinParty: (partyId: string, inviteCode?: string) => {
    const { socket } = get()
    if (socket) {
      socket.emit('party:join', { partyId, inviteCode })
    }
  },

  leaveParty: () => {
    const { socket } = get()
    if (socket) {
      socket.emit('party:leave')
      // Reset local state
      set({
        currentParty: null,
        isInParty: false,
        partyMembers: [],
        currentGame: null,
        isGameActive: false,
        inviteCode: null,
        partyChat: []
      })
    }
  },

  toggleReady: (isReady: boolean) => {
    const { socket } = get()
    if (socket) {
      socket.emit('party:ready', { isReady })
    }
  },

  startGame: (gameSettings: PartyGameSettings) => {
    const { socket } = get()
    if (socket) {
      socket.emit('party:start-game', gameSettings)
    }
  },

  sendChatMessage: (message: string) => {
    const { socket } = get()
    if (socket && message.trim()) {
      const chatMessage: Partial<ChatMessage> = {
        message: message.trim(),
        type: 'text',
        timestamp: new Date().toISOString()
      }
      socket.emit('chat:message', chatMessage)
    }
  },

  // Internal state setters
  setParty: (party: Party | null) => {
    set({ 
      currentParty: party,
      isInParty: !!party,
      partyMembers: party?.members || [],
      inviteCode: party?.inviteCode || null
    })
  },

  setMembers: (members: PartyMember[]) => {
    set({ partyMembers: members })
  },

  setGameSession: (gameSession: PartyGameSession | null) => {
    set({ 
      currentGame: gameSession,
      isGameActive: !!gameSession && gameSession.status === 'active'
    })
  },

  addChatMessage: (message: ChatMessage) => {
    const { partyChat } = get()
    set({ partyChat: [...partyChat, message] })
  }
}))

// Auto-connect when store is created
if (typeof window !== 'undefined') {
  // Only connect in browser environment
  usePartyStore.getState().connect()
} 