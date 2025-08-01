import { Server, Socket } from 'socket.io'
import { logger } from '../utils/logger'
import type { 
  Party, 
  PartyMember, 
  PartyGameSettings, 
  PartyGameSession,
  PartyGameUpdate 
} from '../../../shared/types'

// In-memory party storage (production'da Redis kullanılacak)
const parties = new Map<string, Party>()
const userParties = new Map<string, string>() // userId -> partyId

export function setupPartyEvents(io: Server, socket: Socket) {
  const userId = socket.data.userId
  const username = socket.data.username

  if (!userId || !username) {
    socket.emit('error', { message: 'User not authenticated', code: 'AUTH_REQUIRED' })
    return
  }

  // Party Creation
  socket.on('party:create', async (data: { name: string; maxMembers: number; isPrivate: boolean }) => {
    try {
      // Check if user is already in a party
      if (userParties.has(userId)) {
        socket.emit('error', { message: 'Already in a party', code: 'ALREADY_IN_PARTY' })
        return
      }

      const partyId = generatePartyId()
      const inviteCode = data.isPrivate ? generateInviteCode() : undefined

      const party: Party = {
        id: partyId,
        name: data.name,
        leaderId: userId,
        members: [{
          userId,
          username,
          role: 'leader',
          joinedAt: new Date().toISOString(),
          isReady: false,
          isOnline: true
        }],
        maxMembers: Math.min(data.maxMembers, 8), // Max 8 players
        isPrivate: data.isPrivate,
        status: 'waiting',
        createdAt: new Date().toISOString(),
        ...(inviteCode && { inviteCode })
      }

      parties.set(partyId, party)
      userParties.set(userId, partyId)
      
      // Join socket room
      socket.join(`party:${partyId}`)
      
      socket.emit('party:updated', party)
      logger.info(`Party created: ${partyId} by ${username}`)
      
    } catch (error) {
      logger.error('Error creating party:', error)
      socket.emit('error', { message: 'Failed to create party', code: 'PARTY_CREATE_FAILED' })
    }
  })

  // Party Join
  socket.on('party:join', async (data: { partyId: string; inviteCode?: string }) => {
    try {
      // Check if user is already in a party
      if (userParties.has(userId)) {
        socket.emit('error', { message: 'Already in a party', code: 'ALREADY_IN_PARTY' })
        return
      }

      const party = parties.get(data.partyId)
      if (!party) {
        socket.emit('error', { message: 'Party not found', code: 'PARTY_NOT_FOUND' })
        return
      }

      // Check party capacity
      if (party.members.length >= party.maxMembers) {
        socket.emit('error', { message: 'Party is full', code: 'PARTY_FULL' })
        return
      }

      // Check invite code for private parties
      if (party.isPrivate && party.inviteCode !== data.inviteCode) {
        socket.emit('error', { message: 'Invalid invite code', code: 'INVALID_INVITE_CODE' })
        return
      }

      // Check if party is in game
      if (party.status === 'in-game') {
        socket.emit('error', { message: 'Party is currently in game', code: 'PARTY_IN_GAME' })
        return
      }

      // Add member to party
      const newMember: PartyMember = {
        userId,
        username,
        role: 'member',
        joinedAt: new Date().toISOString(),
        isReady: false,
        isOnline: true
      }

      party.members.push(newMember)
      userParties.set(userId, data.partyId)

      // Join socket room
      socket.join(`party:${data.partyId}`)

      // Notify all party members
      io.to(`party:${data.partyId}`).emit('party:updated', party)
      io.to(`party:${data.partyId}`).emit('party:member-joined', newMember)

      logger.info(`${username} joined party: ${data.partyId}`)
      
    } catch (error) {
      logger.error('Error joining party:', error)
      socket.emit('error', { message: 'Failed to join party', code: 'PARTY_JOIN_FAILED' })
    }
  })

  // Party Leave
  socket.on('party:leave', async () => {
    try {
      const partyId = userParties.get(userId)
      if (!partyId) {
        socket.emit('error', { message: 'Not in a party', code: 'NOT_IN_PARTY' })
        return
      }

      await handlePartyLeave(io, socket, userId, partyId)
      
    } catch (error) {
      logger.error('Error leaving party:', error)
      socket.emit('error', { message: 'Failed to leave party', code: 'PARTY_LEAVE_FAILED' })
    }
  })

  // Ready Status
  socket.on('party:ready', async (data: { isReady: boolean }) => {
    try {
      const partyId = userParties.get(userId)
      if (!partyId) {
        socket.emit('error', { message: 'Not in a party', code: 'NOT_IN_PARTY' })
        return
      }

      const party = parties.get(partyId)
      if (!party) {
        socket.emit('error', { message: 'Party not found', code: 'PARTY_NOT_FOUND' })
        return
      }

      // Update member ready status
      const member = party.members.find(m => m.userId === userId)
      if (member) {
        member.isReady = data.isReady
        
        // Update party
        parties.set(partyId, party)
        
        // Notify all party members
        io.to(`party:${partyId}`).emit('party:updated', party)
        
        logger.info(`${username} ready status: ${data.isReady} in party ${partyId}`)
      }
      
    } catch (error) {
      logger.error('Error updating ready status:', error)
      socket.emit('error', { message: 'Failed to update ready status', code: 'READY_UPDATE_FAILED' })
    }
  })

  // Start Game (Leader only)
  socket.on('party:start-game', async (gameSettings: PartyGameSettings) => {
    try {
      const partyId = userParties.get(userId)
      if (!partyId) {
        socket.emit('error', { message: 'Not in a party', code: 'NOT_IN_PARTY' })
        return
      }

      const party = parties.get(partyId)
      if (!party) {
        socket.emit('error', { message: 'Party not found', code: 'PARTY_NOT_FOUND' })
        return
      }

      // Check if user is party leader
      if (party.leaderId !== userId) {
        socket.emit('error', { message: 'Only party leader can start game', code: 'NOT_PARTY_LEADER' })
        return
      }

      // Check if all members are ready
      const allReady = party.members.every(member => member.isReady)
      if (!allReady) {
        socket.emit('error', { message: 'Not all members are ready', code: 'MEMBERS_NOT_READY' })
        return
      }

      // Create game session
      const gameSession: PartyGameSession = {
        id: generateGameSessionId(),
        partyId,
        gameSettings,
        startTime: new Date().toISOString(),
        participants: party.members.map(member => ({
          userId: member.userId,
          username: member.username,
          score: 0,
          hits: 0,
          misses: 0,
          accuracy: 0,
          averageReactionTime: 0,
          currentStreak: 0,
          position: 1,
          isReady: true
        })),
        currentTargets: [],
        leaderboard: [],
        status: 'countdown'
      }

      // Update party status
      party.status = 'in-game'
      party.currentGame = gameSession
      party.gameSettings = gameSettings
      parties.set(partyId, party)

      // Notify all party members
      io.to(`party:${partyId}`).emit('party:game-started', gameSession)
      
      // Start countdown
      startGameCountdown(io, partyId, gameSession)
      
      logger.info(`Game started in party: ${partyId} by ${username}`)
      
    } catch (error) {
      logger.error('Error starting game:', error)
      socket.emit('error', { message: 'Failed to start game', code: 'GAME_START_FAILED' })
    }
  })

  // Game Update
  socket.on('party:game-update', async (data: PartyGameUpdate) => {
    try {
      const partyId = userParties.get(userId)
      if (!partyId) return

      // Broadcast game update to all party members
      socket.to(`party:${partyId}`).emit('party:game-update', {
        ...data,
        userId,
        username,
        timestamp: Date.now()
      })
      
    } catch (error) {
      logger.error('Error handling game update:', error)
    }
  })

  // Handle disconnection
  socket.on('disconnect', async () => {
    try {
      const partyId = userParties.get(userId)
      if (partyId) {
        const party = parties.get(partyId)
        if (party) {
          // Mark member as offline
          const member = party.members.find(m => m.userId === userId)
          if (member) {
            member.isOnline = false
            parties.set(partyId, party)
            
            // Notify party members
            io.to(`party:${partyId}`).emit('party:updated', party)
            
            // Auto-leave after 30 seconds if still offline
            setTimeout(async () => {
              const currentParty = parties.get(partyId)
              const currentMember = currentParty?.members.find(m => m.userId === userId)
              if (currentMember && !currentMember.isOnline) {
                await handlePartyLeave(io, socket, userId, partyId)
              }
            }, 30000)
          }
        }
      }
    } catch (error) {
      logger.error('Error handling disconnect:', error)
    }
  })
}

// Helper Functions
async function handlePartyLeave(io: Server, socket: Socket, userId: string, partyId: string) {
  const party = parties.get(partyId)
  if (!party) return

  // Remove member from party
  party.members = party.members.filter(m => m.userId !== userId)
  userParties.delete(userId)

  // Leave socket room
  socket.leave(`party:${partyId}`)

  if (party.members.length === 0) {
    // Delete empty party
    parties.delete(partyId)
    logger.info(`Party deleted: ${partyId}`)
  } else {
    // If leader left, promote first member
    if (party.leaderId === userId && party.members.length > 0) {
      const newLeader = party.members[0]
      if (newLeader) {
        party.leaderId = newLeader.userId
        newLeader.role = 'leader'
        logger.info(`New party leader: ${newLeader.username} in party ${partyId}`)
      }
    }

    parties.set(partyId, party)
    
    // Notify remaining members
    io.to(`party:${partyId}`).emit('party:updated', party)
    io.to(`party:${partyId}`).emit('party:member-left', userId)
  }
}

function startGameCountdown(io: Server, partyId: string, gameSession: PartyGameSession) {
  let countdown = 3
  
  const countdownInterval = setInterval(() => {
    io.to(`party:${partyId}`).emit('party:game-update', {
      type: 'countdown',
      data: { countdown },
      timestamp: Date.now()
    })
    
    countdown--
    
    if (countdown < 0) {
      clearInterval(countdownInterval)
      
      // Start actual game
      gameSession.status = 'active'
      io.to(`party:${partyId}`).emit('party:game-update', {
        type: 'game-start',
        data: { gameSession },
        timestamp: Date.now()
      })
      
      logger.info(`Game countdown finished for party: ${partyId}`)
    }
  }, 1000)
}

function generatePartyId(): string {
  return 'party_' + Math.random().toString(36).substr(2, 9)
}

function generateInviteCode(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase()
}

function generateGameSessionId(): string {
  return 'game_' + Math.random().toString(36).substr(2, 9)
} 