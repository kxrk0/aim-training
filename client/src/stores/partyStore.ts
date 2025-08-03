import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from './authStore'
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
  joinPartyByCode: (inviteCode: string) => void
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
  connect: async () => {
    const state = get()
    if (state.socket?.connected) {
      console.log('🔗 Already connected to party server')
      return
    }

    console.log('🔌 Connecting to party system...')
    
    // Get auth token for Socket.io
    const { user, isAuthenticated } = useAuthStore.getState()
    console.log('🔐 Auth state for socket connection:', {
      user: !!user,
      isAuthenticated,
      userId: user?.id,
      uid: (user as any)?.uid,
      hasAccessToken: !!(user as any)?.accessToken,
      hasGetIdToken: typeof (user as any)?.getIdToken === 'function'
    })
    
    // Block connection if not authenticated
    if (!isAuthenticated || !user) {
      console.error('❌ Authentication required for party system')
      return
    }
    
    let token = null
    if (user) {
      // Try different methods to get Firebase token
      token = (user as any)?.accessToken || (user as any)?.token
      
      // Get fresh token from Firebase Auth if we have firebaseUser
      const { firebaseUser } = useAuthStore.getState()
      if (!token && firebaseUser && typeof firebaseUser.getIdToken === 'function') {
        try {
          console.log('🔄 Getting fresh Firebase ID token from Firebase user...')
          token = await firebaseUser.getIdToken()
          console.log('✅ Fresh Firebase token obtained:', !!token)
        } catch (error) {
          console.error('❌ Failed to get Firebase token:', error)
        }
      }
      
      console.log('🎫 Firebase token for socket:', !!token, token?.substring(0, 20) + '...')
    }
    
    // Check if guest mode or valid token for connection
    const { authProvider } = useAuthStore.getState()
    if (!token && authProvider !== 'guest') {
      console.error('❌ Firebase token required for party system')
      return
    }
    
    if (authProvider === 'guest') {
      console.log('👤 Guest mode detected - proceeding without Firebase token')
    }

    // Dynamic WebSocket URL based on current host
    const getWebSocketUrl = () => {
      const hostname = window.location.hostname
      const protocol = window.location.protocol
      const origin = window.location.origin
      
      console.log('🌐 Current hostname:', hostname)
      console.log('🔗 Current protocol:', protocol)
      console.log('🏠 Current origin:', origin)
      
      // Desktop app (Electron) - Çoklu kontrol
      if (protocol === 'file:' || 
          origin === 'file://' || 
          hostname === '' || 
          hostname === 'file' ||
          (typeof window !== 'undefined' && (window as any).electronAPI)) {
        console.log('🖥️ Desktop app detected - connecting to VPS')
        return 'https://aim.liorabelleleather.com'
      }
      
      if (hostname === 'myaimtrainer.loca.lt') {
        // Use separate backend localtunnel URL
        return 'https://myaimtrainer-backend.loca.lt'
      } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001'  // Direct localhost connection
      }
      return (import.meta as any).env.VITE_WS_URL || 'https://aim.liorabelleleather.com'
    }

    const wsUrl = getWebSocketUrl()
    const isLocaltunnel = window.location.hostname === 'myaimtrainer.loca.lt'
    const transports = isLocaltunnel ? ['polling'] : ['websocket']
    
    console.log('🌍 Frontend URL:', window.location.origin)
    console.log('🔙 Backend URL:', wsUrl)
    console.log('🚛 Transport:', transports)
    console.log('🎫 Auth token present:', !!token)
    
    console.log('🔌 Connecting to WebSocket:', wsUrl)
    
    // Transport selection based on environment
    // const isLocaltunnel = window.location.hostname === 'myaimtrainer.loca.lt'
    // const transports = isLocaltunnel ? ['polling'] : ['websocket']
    
    console.log('🌐 Environment:', isLocaltunnel ? 'Localtunnel' : 'Local/Other')
    console.log('🚗 Using transports:', transports)
    console.log('🔗 Frontend URL:', window.location.origin)
    console.log('🔗 Backend URL:', wsUrl)
    console.log('🔐 Auth status:', { isAuthenticated: !!user, hasToken: !!token })
    
    const socketConfig: any = {
      transports: transports,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: isLocaltunnel ? 2 : 3,
      reconnectionDelay: isLocaltunnel ? 3000 : 2000,
      timeout: isLocaltunnel ? 60000 : 30000,  // Longer timeout for localtunnel
      path: '/socket.io',
      autoConnect: true,
      upgrade: !isLocaltunnel,  // No upgrade for localtunnel
      rememberUpgrade: false,
      
      // Localtunnel specific options
      ...(isLocaltunnel && {
        forceJSONP: false,
        jsonp: false,
        forceBase64: false,
        enablesXDR: false,
        timestampRequests: true,
        timestampParam: 't',
        closeOnBeforeunload: false,
        policyPort: 843,
        withCredentials: true,
        // HTTPS for localtunnel
        secure: true,
        rejectUnauthorized: false
      }),
      
      // Websocket specific options for localhost
      ...(!isLocaltunnel && {
        perMessageDeflate: false,
        httpCompression: false,
        forceWebsockets: true
      })
    }

    // Add auth token - Only if not guest mode
    if (token) {
      socketConfig.auth = { token }
      console.log('🔐 Adding auth token to socket connection (Firebase user)')
    } else {
      console.log('👤 Guest mode - no auth token required')
    }

    const newSocket = io(wsUrl, socketConfig)

    // Enhanced connection event listeners
    newSocket.on('connect', () => {
      set({ isConnected: true })
      console.log('🔌 Connected to party server successfully', {
        socketId: newSocket.id,
        transport: newSocket.io.engine.transport.name,
        url: wsUrl,
        environment: isLocaltunnel ? 'Localtunnel' : 'Local'
      })
      
      // Log successful connection for localtunnel
      if (isLocaltunnel) {
        console.log('🎉 LOCALTUNNEL CONNECTION SUCCESS!')
        console.log('🔗 URL:', wsUrl)
        console.log('🚗 Transport:', newSocket.io.engine.transport.name)
      }
    })

    newSocket.on('connect_error', (error: any) => {
      console.error('❌ Party server connection failed:', {
        message: error.message || 'Unknown error',
        type: error.type || 'Unknown type',
        description: error.description || 'No description',
        environment: isLocaltunnel ? 'Localtunnel' : 'Local'
      })
      
      // Persistent retry mechanism
      console.log('🔄 Setting up persistent retry...')
      setTimeout(() => {
        const currentState = get()
        if (!currentState.isConnected) {
          console.log('🔄 Retrying connection after error...')
          // Try to reconnect
          currentState.connect()
        }
      }, 3000) // Wait 3 seconds before retry
      
      // Specific guidance for localtunnel
      if (isLocaltunnel) {
        console.log('🔧 LOCALTUNNEL TROUBLESHOOTING:')
        console.log('   • Using polling transport (recommended for localtunnel)')
        console.log('   • Frontend URL: https://myaimtrainer.loca.lt')
        console.log('   • Backend URL: https://myaimtrainer-backend.loca.lt')
        console.log('   • Make sure BOTH tunnels are running:')
        console.log('     - npx localtunnel --port 3000 --subdomain myaimtrainer')
        console.log('     - npx localtunnel --port 3001 --subdomain myaimtrainer-backend')
        console.log('   • Backend server must be running on localhost:3001')
        
        if (error.message && error.message.includes('timeout')) {
          console.log('⏰ TIMEOUT ERROR - Backend tunnel may not be working')
          console.log('   • Check if myaimtrainer-api.loca.lt is accessible')
          console.log('   • Verify backend tunnel is running')
        }
      } else {
        console.log('💡 LOCALHOST TROUBLESHOOTING:')
        console.log('   • Using websocket transport')
        console.log('   • Check if backend is running on port 3001')
      }
    })

    newSocket.on('disconnect', (reason) => {
      set({ isConnected: false })
      console.log('🔌 Disconnected from party server:', reason)
      
      // Enhanced auto-reconnect for ALL reasons
      console.log('🔄 Attempting automatic reconnection...')
      setTimeout(() => {
        const currentState = get()
        if (!currentState.isConnected) {
          console.log('🔄 Auto-reconnecting after disconnect...')
          currentState.connect()
        }
      }, 1000) // Quick reconnection
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected to party server after', attemptNumber, 'attempts')
      set({ isConnected: true })
    })

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Reconnection attempt', attemptNumber)
    })

    newSocket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection failed:', error)
    })

    newSocket.on('reconnect_failed', () => {
      console.error('❌ All reconnection attempts failed')
      set({ isConnected: false })
    })

    // Party events
    newSocket.on('party:updated', (party: Party) => {
      console.log('📝 Party updated:', party)
      set({ 
        currentParty: party,
        isInParty: true,
        partyMembers: party.members,
        inviteCode: party.inviteCode || null
      })
      
      // Update URL with invite code if party leader
      if (party.inviteCode && typeof window !== 'undefined') {
        const currentPath = window.location.pathname
        if (currentPath === '/party' && party.leaderId === party.members.find(m => m.isOnline)?.userId) {
          window.history.replaceState({}, '', `/party/${party.inviteCode}`)
          console.log('🔗 URL updated with invite code:', party.inviteCode)
        }
      }
    })

    newSocket.on('party:member-joined', (member: PartyMember) => {
      const { partyMembers } = get()
      const updatedMembers = [...partyMembers]
      const existingIndex = updatedMembers.findIndex(m => m.userId === member.userId)
      
      if (existingIndex === -1) {
        updatedMembers.push(member)
        set({ partyMembers: updatedMembers })
      }
    })

    newSocket.on('party:member-left', (userId: string) => {
      const { partyMembers } = get()
      const updatedMembers = partyMembers.filter(m => m.userId !== userId)
      set({ partyMembers: updatedMembers })
    })

    newSocket.on('party:game-started', (gameSession: PartyGameSession) => {
      console.log('🎮 Game started! Navigating to party game...', gameSession)
      console.log('👥 Current party members before navigation:', get().partyMembers.length)
      
      set({ 
        currentGame: gameSession,
        isGameActive: true
      })
      
      // Ensure we have party members data
      if (get().partyMembers.length === 0) {
        console.warn('⚠️ Party members missing during game start! Will attempt to rejoin...')
      }
      
      // Navigate to party game page
      if (typeof window !== 'undefined') {
        window.location.href = `/party-game/${gameSession.partyId}`
      }
    })

    newSocket.on('party:game-update', (update) => {
      // Handle real-time game updates
      console.log('🎮 Game update:', update)
    })

    newSocket.on('party:game-ended', (results) => {
      set({ 
        currentGame: null,
        isGameActive: false
      })
      console.log('🏁 Game ended:', results)
    })

    newSocket.on('party:ready', (response) => {
      console.log('🎉 Party system ready event received:', response)
    })

    newSocket.on('chat:new-message', (message: ChatMessage) => {
      const { partyChat } = get()
      set({ partyChat: [...partyChat, message] })
    })

    newSocket.on('error', (error) => {
      console.error('❌ Party error:', error)
      console.error('❌ Error details:', JSON.stringify(error, null, 2))
      
      // Show specific error messages based on error code
      if (error.code === 'USER_ID_REQUIRED') {
        console.error('🔐 Authentication issue detected. Please refresh the page.')
      } else if (error.code === 'PARTY_NOT_FOUND') {
        console.error('🎯 Party not found. It may have been deleted.')
      } else if (error.code === 'ALREADY_IN_PARTY') {
        console.error('👥 You are already in a party.')
      }
      
      // TODO: Show toast notification
    })

    // Test connection after setup
    newSocket.on('connect', () => {
      console.log('🧪 Testing party system connection...')
      newSocket.emit('test', { message: 'Connection test' })
    })

    newSocket.on('test-response', (response) => {
      console.log('✅ Party system test successful:', response)
      console.log(`✅ Connected as: ${response.username} (${response.userId})`)
      console.log('🔍 Server-side user data:', {
        userId: response.userId,
        username: response.username,
        userIdType: typeof response.userId,
        userIdLength: response.userId?.length,
        isGuest: response.isGuest,
        fullResponse: response
      })
    })

    set({ socket: newSocket })
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

  joinPartyByCode: (inviteCode: string) => {
    const { socket } = get()
    if (socket) {
      console.log('🎫 Joining party by code:', inviteCode)
      socket.emit('party:join-by-code', { inviteCode: inviteCode.toUpperCase() })
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
    console.log('🔄 toggleReady called with:', isReady)
    console.log('🔌 Socket status:', !!socket)
    
    if (socket) {
      console.log('📡 Emitting party:ready event')
      socket.emit('party:ready', { isReady })
    } else {
      console.error('❌ No socket connection for toggleReady')
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
  // Wait a bit to ensure auth store is initialized
  setTimeout(() => {
    const store = usePartyStore.getState()
    if (!store.isConnected && !store.socket) {
      console.log('�� Auto-connecting to party system...')
      store.connect()
    }
  }, 1000)
} 