import { Server, Socket } from 'socket.io'
import { logger } from '../utils/logger'
import type { 
  PartySpectator, 
  SpectatorSession, 
  SpectatorGameUpdate,
  SpectatorCameraUpdate,
  Party 
} from '../../../shared/types'

// In-memory spectator storage (production'da Redis kullanılacak)
const spectatorSessions = new Map<string, SpectatorSession>() // partyId -> SpectatorSession
const userSpectating = new Map<string, string>() // userId -> partyId

// External parties reference (partyEvents.ts'den import edilecek)
let partiesRef: Map<string, Party> | null = null

export function setPartiesReference(parties: Map<string, Party>) {
  partiesRef = parties
}

export function setupSpectatorEvents(io: Server, socket: Socket) {
  const userId = socket.data.userId
  const username = socket.data.username
  const isGuest = socket.data.isGuest || false

  if (!userId || !username) {
    socket.emit('error', { 
      message: 'User identification failed', 
      code: 'USER_ID_REQUIRED',
      details: 'Socket authentication middleware may not be working correctly'
    })
    logger.error('Spectator events setup failed: Missing user identification', {
      socketId: socket.id,
      userId,
      username
    })
    return
  }

  logger.info(`Setting up spectator events for user: ${username} (${userId}) | Guest: ${isGuest}`)

  // Join as Spectator
  socket.on('spectator:join', async (data: { partyId: string }) => {
    try {
      if (!partiesRef) {
        socket.emit('error', { message: 'Party system not available', code: 'PARTY_SYSTEM_UNAVAILABLE' })
        return
      }

      const party = partiesRef.get(data.partyId)
      if (!party) {
        socket.emit('error', { message: 'Party not found', code: 'PARTY_NOT_FOUND' })
        return
      }

      // Check if spectators are allowed
      if (!party.gameSettings?.allowSpectators) {
        socket.emit('error', { message: 'Spectators not allowed in this party', code: 'SPECTATORS_NOT_ALLOWED' })
        return
      }

      // Check if user is already a party member
      const isMember = party.members.some(member => member.userId === userId)
      if (isMember) {
        socket.emit('error', { message: 'Cannot spectate party you are member of', code: 'ALREADY_PARTY_MEMBER' })
        return
      }

      // Check if user is already spectating another party
      if (userSpectating.has(userId)) {
        socket.emit('error', { message: 'Already spectating another party', code: 'ALREADY_SPECTATING' })
        return
      }

      // Get or create spectator session
      let spectatorSession = spectatorSessions.get(data.partyId)
      if (!spectatorSession) {
        spectatorSession = {
          id: generateSpectatorSessionId(),
          partyId: data.partyId,
          spectators: [],
          createdAt: new Date().toISOString(),
          settings: {
            allowSpectators: true,
            maxSpectators: 20,
            spectatorChat: true,
            spectatorDelay: 2 // 2 second delay for fairness
          }
        }
        spectatorSessions.set(data.partyId, spectatorSession)
      }

      // Check spectator limit
      if (spectatorSession.spectators.length >= spectatorSession.settings.maxSpectators) {
        socket.emit('error', { message: 'Spectator limit reached', code: 'SPECTATOR_LIMIT_REACHED' })
        return
      }

      // Add spectator
      const newSpectator: PartySpectator = {
        userId,
        username,
        joinedAt: new Date().toISOString(),
        isOnline: true,
        cameraMode: 'overview'
      }

      spectatorSession.spectators.push(newSpectator)
      userSpectating.set(userId, data.partyId)

      // Join spectator socket rooms
      socket.join(`spectator:${data.partyId}`)
      socket.join(`party:${data.partyId}:spectators`)

      // Update session
      spectatorSessions.set(data.partyId, spectatorSession)

      // Notify spectator
      socket.emit('spectator:joined', {
        party,
        spectatorSession,
        spectatorInfo: newSpectator
      })

      // Notify other spectators
      socket.to(`spectator:${data.partyId}`).emit('spectator:user-joined', newSpectator)

      // Notify party members (optional)
      io.to(`party:${data.partyId}`).emit('spectator:new-viewer', {
        spectatorCount: spectatorSession.spectators.length,
        newSpectator: { username: newSpectator.username }
      })

      logger.info(`${username} started spectating party: ${data.partyId}`)
      
    } catch (error) {
      logger.error('Error joining as spectator:', error)
      socket.emit('error', { message: 'Failed to join as spectator', code: 'SPECTATOR_JOIN_FAILED' })
    }
  })

  // Leave Spectator Mode
  socket.on('spectator:leave', async () => {
    try {
      const partyId = userSpectating.get(userId)
      if (!partyId) {
        socket.emit('error', { message: 'Not currently spectating', code: 'NOT_SPECTATING' })
        return
      }

      await handleSpectatorLeave(io, socket, userId, partyId)
      
    } catch (error) {
      logger.error('Error leaving spectator mode:', error)
      socket.emit('error', { message: 'Failed to leave spectator mode', code: 'SPECTATOR_LEAVE_FAILED' })
    }
  })

  // Update Camera Mode
  socket.on('spectator:camera-update', async (data: SpectatorCameraUpdate) => {
    try {
      const partyId = userSpectating.get(userId)
      if (!partyId) return

      const spectatorSession = spectatorSessions.get(partyId)
      if (!spectatorSession) return

      // Update spectator's camera mode
      const spectator = spectatorSession.spectators.find(s => s.userId === userId)
      if (spectator) {
        spectator.cameraMode = data.cameraMode
        spectator.followingPlayerId = data.followingPlayerId

        spectatorSessions.set(partyId, spectatorSession)

        // Confirm camera update to spectator
        socket.emit('spectator:camera-updated', {
          cameraMode: data.cameraMode,
          followingPlayerId: data.followingPlayerId
        })
      }
      
    } catch (error) {
      logger.error('Error updating spectator camera:', error)
    }
  })

  // Spectator Chat
  socket.on('spectator:chat', async (data: { message: string }) => {
    try {
      const partyId = userSpectating.get(userId)
      if (!partyId) return

      const spectatorSession = spectatorSessions.get(partyId)
      if (!spectatorSession || !spectatorSession.settings.spectatorChat) return

      const chatMessage = {
        id: generateChatMessageId(),
        userId,
        username,
        message: data.message,
        timestamp: new Date().toISOString(),
        type: 'spectator'
      }

      // Broadcast to all spectators
      io.to(`spectator:${partyId}`).emit('spectator:chat-message', chatMessage)
      
    } catch (error) {
      logger.error('Error handling spectator chat:', error)
    }
  })

  // Request Current Game State (for late joiners)
  socket.on('spectator:request-game-state', async () => {
    try {
      const partyId = userSpectating.get(userId)
      if (!partyId || !partiesRef) return

      const party = partiesRef.get(partyId)
      if (!party || !party.currentGame) return

      // Send current game state with delay
      setTimeout(() => {
        socket.emit('spectator:game-state', {
          gameSession: party.currentGame,
          currentTargets: party.currentGame?.currentTargets || [],
          participants: party.currentGame?.participants || [],
          leaderboard: party.currentGame?.leaderboard || []
        })
      }, 2000) // 2 second delay
      
    } catch (error) {
      logger.error('Error sending game state to spectator:', error)
    }
  })

  // Handle disconnection
  socket.on('disconnect', async () => {
    try {
      const partyId = userSpectating.get(userId)
      if (partyId) {
        await handleSpectatorLeave(io, socket, userId, partyId)
      }
    } catch (error) {
      logger.error('Error handling spectator disconnect:', error)
    }
  })
}

// Broadcast game updates to spectators (called from partyEvents.ts)
export function broadcastToSpectators(io: Server, partyId: string, update: SpectatorGameUpdate) {
  const spectatorSession = spectatorSessions.get(partyId)
  if (!spectatorSession || spectatorSession.spectators.length === 0) return

  // Add delay for fairness
  setTimeout(() => {
    io.to(`spectator:${partyId}`).emit('spectator:game-update', update)
  }, spectatorSession.settings.spectatorDelay * 1000)
}

// Get spectator count for a party
export function getSpectatorCount(partyId: string): number {
  const session = spectatorSessions.get(partyId)
  return session?.spectators.filter(s => s.isOnline).length || 0
}

// Helper Functions
async function handleSpectatorLeave(io: Server, socket: Socket, userId: string, partyId: string) {
  const spectatorSession = spectatorSessions.get(partyId)
  if (!spectatorSession) return

  // Remove spectator
  spectatorSession.spectators = spectatorSession.spectators.filter(s => s.userId !== userId)
  userSpectating.delete(userId)

  // Leave socket rooms
  socket.leave(`spectator:${partyId}`)
  socket.leave(`party:${partyId}:spectators`)

  // Update session
  if (spectatorSession.spectators.length === 0) {
    spectatorSessions.delete(partyId)
  } else {
    spectatorSessions.set(partyId, spectatorSession)
  }

  // Notify remaining spectators
  socket.to(`spectator:${partyId}`).emit('spectator:user-left', { userId })

  // Notify party members
  io.to(`party:${partyId}`).emit('spectator:viewer-left', {
    spectatorCount: spectatorSession.spectators.length
  })

  // Confirm to leaving spectator
  socket.emit('spectator:left')

  logger.info(`User ${userId} stopped spectating party: ${partyId}`)
}

function generateSpectatorSessionId(): string {
  return `spec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateChatMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Export functions for use in partyEvents.ts
export { spectatorSessions, userSpectating } 