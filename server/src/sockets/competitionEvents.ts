import { Server, Socket } from 'socket.io'
import { logger } from '../utils/logger'
import type { 
  Competition, 
  CompetitionPlayer, 
  CompetitionResults,
  CompetitionStatus,
  GameMode,
  GameSettings
} from '../../../shared/types'

// In-memory competition storage (production'da Redis kullanılacak)
const competitions = new Map<string, Competition>()
const matchmakingQueue = new Map<string, { userId: string, username: string, gameMode: GameMode, eloRating: number }>()
const userCompetitions = new Map<string, string>() // userId -> competitionId

export function setupCompetitionEvents(io: Server, socket: Socket) {
  const userId = socket.data.userId
  const username = socket.data.username

  if (!userId || !username) {
    socket.emit('error', { message: 'User not authenticated', code: 'AUTH_REQUIRED' })
    return
  }

  // Find Match
  socket.on('competition:find-match', async (gameMode: GameMode) => {
    try {
      // Check if user is already in competition or queue
      if (userCompetitions.has(userId) || matchmakingQueue.has(userId)) {
        socket.emit('error', { message: 'Already in competition or queue', code: 'ALREADY_IN_COMPETITION' })
        return
      }

      const userElo = 1000 // TODO: Get from database
      
      // Find opponent with similar ELO rating
      const opponent = findOpponent(gameMode, userElo)
      
      if (opponent) {
        // Remove opponent from queue
        matchmakingQueue.delete(opponent.userId)
        
        // Create competition
        const competition = createCompetition(
          { userId, username, eloRating: userElo },
          opponent,
          gameMode
        )
        
        competitions.set(competition.id, competition)
        userCompetitions.set(userId, competition.id)
        userCompetitions.set(opponent.userId, competition.id)
        
        // Join both players to competition room
        socket.join(`competition:${competition.id}`)
        const opponentSocket = Array.from(io.sockets.sockets.values())
          .find(s => s.data.userId === opponent.userId)
        if (opponentSocket) {
          opponentSocket.join(`competition:${competition.id}`)
        }
        
        // Notify both players
        io.to(`competition:${competition.id}`).emit('competition:match-found', competition)
        
        logger.info(`Competition created: ${competition.id} between ${username} and ${opponent.username}`)
        
      } else {
        // Add to matchmaking queue
        matchmakingQueue.set(userId, { userId, username, gameMode, eloRating: userElo })
        socket.emit('competition:searching', { gameMode, estimatedWaitTime: 30 })
        
        logger.info(`User ${username} joined matchmaking queue for ${gameMode}`)
      }
      
    } catch (error) {
      logger.error('Error finding match:', error)
      socket.emit('error', { message: 'Failed to find match', code: 'MATCHMAKING_FAILED' })
    }
  })

  // Accept Match
  socket.on('competition:accept-match', async (competitionId: string) => {
    try {
      const competition = competitions.get(competitionId)
      if (!competition) {
        socket.emit('error', { message: 'Competition not found', code: 'COMPETITION_NOT_FOUND' })
        return
      }

      // Update player acceptance status
      if (competition.player1.userId === userId) {
        competition.player1.isReady = true
      } else if (competition.player2.userId === userId) {
        competition.player2.isReady = true
      } else {
        socket.emit('error', { message: 'Not a participant', code: 'NOT_PARTICIPANT' })
        return
      }

      // Check if both players are ready
      if (competition.player1.isReady && competition.player2.isReady) {
        competition.status = 'countdown'
        competition.startTime = new Date().toISOString()
        
        // Start countdown
        startCompetitionCountdown(io, competition)
      }

      // Update competition
      competitions.set(competitionId, competition)
      
      // Notify players
      io.to(`competition:${competitionId}`).emit('competition:updated', competition)
      
    } catch (error) {
      logger.error('Error accepting match:', error)
      socket.emit('error', { message: 'Failed to accept match', code: 'ACCEPT_FAILED' })
    }
  })

  // Ready Status
  socket.on('competition:ready', async (isReady: boolean) => {
    try {
      const competitionId = userCompetitions.get(userId)
      if (!competitionId) {
        socket.emit('error', { message: 'Not in competition', code: 'NOT_IN_COMPETITION' })
        return
      }

      const competition = competitions.get(competitionId)
      if (!competition) {
        socket.emit('error', { message: 'Competition not found', code: 'COMPETITION_NOT_FOUND' })
        return
      }

      // Update ready status
      if (competition.player1.userId === userId) {
        competition.player1.isReady = isReady
      } else if (competition.player2.userId === userId) {
        competition.player2.isReady = isReady
      }

      competitions.set(competitionId, competition)
      
      // Notify opponent
      socket.to(`competition:${competitionId}`).emit('competition:opponent-ready', isReady)
      
    } catch (error) {
      logger.error('Error updating ready status:', error)
    }
  })

  // Game Update
  socket.on('competition:game-update', async (data: any) => {
    try {
      const competitionId = userCompetitions.get(userId)
      if (!competitionId) return

      const competition = competitions.get(competitionId)
      if (!competition || competition.status !== 'active') return

      // Determine which player this is
      const playerKey = competition.player1.userId === userId ? 'player1' : 'player2'
      
      // Update player stats based on game update
      if (data.type === 'target-hit') {
        const player = competition[playerKey]
        player.hits++
        player.score += 100
        player.accuracy = (player.hits / (player.hits + player.misses)) * 100
      } else if (data.type === 'target-miss') {
        const player = competition[playerKey]
        player.misses++
        player.accuracy = (player.hits / (player.hits + player.misses)) * 100
      }

      competitions.set(competitionId, competition)

      // Broadcast update to both players
      io.to(`competition:${competitionId}`).emit('competition:game-update', {
        type: data.type,
        player: playerKey,
        data,
        timestamp: Date.now(),
        competition
      })
      
    } catch (error) {
      logger.error('Error handling competition game update:', error)
    }
  })

  // Cancel matchmaking
  socket.on('competition:cancel-search', async () => {
    try {
      matchmakingQueue.delete(userId)
      socket.emit('competition:search-cancelled')
      
    } catch (error) {
      logger.error('Error cancelling search:', error)
    }
  })

  // Handle disconnection
  socket.on('disconnect', async () => {
    try {
      // Remove from matchmaking queue
      matchmakingQueue.delete(userId)
      
      // Handle competition disconnection
      const competitionId = userCompetitions.get(userId)
      if (competitionId) {
        const competition = competitions.get(competitionId)
        if (competition && competition.status === 'active') {
          // End competition due to disconnection
          const winner = competition.player1.userId === userId ? competition.player2.userId : competition.player1.userId
          endCompetition(io, competition, winner, 'disconnect')
        }
        userCompetitions.delete(userId)
      }
      
    } catch (error) {
      logger.error('Error handling competition disconnect:', error)
    }
  })
}

// Helper Functions
function findOpponent(gameMode: GameMode, userElo: number) {
  // Find opponent with similar ELO rating (±100 points)
  for (const [userId, player] of matchmakingQueue) {
    if (player.gameMode === gameMode && Math.abs(player.eloRating - userElo) <= 100) {
      return player
    }
  }
  
  // If no close match found, find any opponent in the same game mode
  for (const [userId, player] of matchmakingQueue) {
    if (player.gameMode === gameMode) {
      return player
    }
  }
  
  return null
}

function createCompetition(
  player1: { userId: string, username: string, eloRating: number },
  player2: { userId: string, username: string, eloRating: number },
  gameMode: GameMode
): Competition {
  const gameSettings: GameSettings = {
    gameMode,
    difficulty: 'medium',
    duration: 60,
    targetSize: 'medium',
    spawnRate: 1
  }

  return {
    id: generateCompetitionId(),
    player1: {
      userId: player1.userId,
      username: player1.username,
      eloRating: player1.eloRating,
      score: 0,
      hits: 0,
      misses: 0,
      accuracy: 0,
      averageReactionTime: 0,
      isReady: false
    },
    player2: {
      userId: player2.userId,
      username: player2.username,
      eloRating: player2.eloRating,
      score: 0,
      hits: 0,
      misses: 0,
      accuracy: 0,
      averageReactionTime: 0,
      isReady: false
    },
    gameSettings,
    status: 'waiting'
  }
}

function startCompetitionCountdown(io: Server, competition: Competition) {
  let countdown = 3
  
  const countdownInterval = setInterval(() => {
    io.to(`competition:${competition.id}`).emit('competition:game-update', {
      type: 'countdown',
      data: { countdown },
      timestamp: Date.now()
    })
    
    countdown--
    
    if (countdown < 0) {
      clearInterval(countdownInterval)
      
      // Start actual competition
      competition.status = 'active'
      competitions.set(competition.id, competition)
      
      io.to(`competition:${competition.id}`).emit('competition:game-started', competition)
      
      // Auto-end competition after duration
      setTimeout(() => {
        if (competition.status === 'active') {
          endCompetition(io, competition)
        }
      }, competition.gameSettings.duration * 1000)
      
      logger.info(`Competition started: ${competition.id}`)
    }
  }, 1000)
}

function endCompetition(io: Server, competition: Competition, forcedWinner?: string, reason?: string) {
  competition.status = 'finished'
  competition.endTime = new Date().toISOString()
  
  // Determine winner
  let winner: string
  if (forcedWinner) {
    winner = forcedWinner
  } else {
    winner = competition.player1.score > competition.player2.score 
      ? competition.player1.userId 
      : competition.player2.userId
  }
  
  // Calculate ELO changes (simplified)
  const eloChange = 25 // Simplified ELO calculation
  
  const results: CompetitionResults = {
    winner,
    player1Result: {
      userId: competition.player1.userId,
      finalScore: competition.player1.score,
      accuracy: competition.player1.accuracy,
      hits: competition.player1.hits,
      misses: competition.player1.misses,
      averageReactionTime: competition.player1.averageReactionTime,
      result: winner === competition.player1.userId ? 'victory' : 'defeat'
    },
    player2Result: {
      userId: competition.player2.userId,
      finalScore: competition.player2.score,
      accuracy: competition.player2.accuracy,
      hits: competition.player2.hits,
      misses: competition.player2.misses,
      averageReactionTime: competition.player2.averageReactionTime,
      result: winner === competition.player2.userId ? 'victory' : 'defeat'
    },
    eloChanges: {
      player1Delta: winner === competition.player1.userId ? eloChange : -eloChange,
      player2Delta: winner === competition.player2.userId ? eloChange : -eloChange
    }
  }
  
  competition.result = results
  competition.winner = winner
  
  competitions.set(competition.id, competition)
  
  // Notify players
  io.to(`competition:${competition.id}`).emit('competition:game-ended', results)
  
  // Clean up
  userCompetitions.delete(competition.player1.userId)
  userCompetitions.delete(competition.player2.userId)
  
  // Remove competition after 30 seconds
  setTimeout(() => {
    competitions.delete(competition.id)
  }, 30000)
  
  logger.info(`Competition ended: ${competition.id}, winner: ${winner}${reason ? `, reason: ${reason}` : ''}`)
}

function generateCompetitionId(): string {
  return 'comp_' + Math.random().toString(36).substr(2, 9)
} 