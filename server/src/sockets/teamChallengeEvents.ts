import { Server, Socket } from 'socket.io'
import { logger } from '../utils/logger'
import type { 
  PartyTeam,
  TeamChallenge,
  TeamObjective,
  TeamChallengeResult,
  TeamFormation,
  TeamChatMessage,
  TeamUpdateEvent,
  Party
} from '../../../shared/types'

// In-memory team challenge storage
const teamChallenges = new Map<string, TeamChallenge>() // partyId -> TeamChallenge
const teamChats = new Map<string, TeamChatMessage[]>() // teamId -> messages

// External parties reference
let partiesRef: Map<string, Party> | null = null

export function setTeamPartiesReference(parties: Map<string, Party>) {
  partiesRef = parties
}

export function setupTeamChallengeEvents(io: Server, socket: Socket) {
  const userId = socket.data.userId
  const username = socket.data.username
  const isGuest = socket.data.isGuest || false

  if (!userId || !username) {
    socket.emit('error', { 
      message: 'User identification failed', 
      code: 'USER_ID_REQUIRED',
      details: 'Socket authentication middleware may not be working correctly'
    })
    logger.error('Team challenge events setup failed: Missing user identification', {
      socketId: socket.id,
      userId,
      username
    })
    return
  }

  logger.info(`Setting up team challenge events for user: ${username} (${userId}) | Guest: ${isGuest}`)

  // Create Team Challenge
  socket.on('team:create-challenge', async (data: {
    partyId: string
    challengeType: 'team-vs-team' | 'team-objectives' | 'team-relay' | 'team-survival'
    settings: TeamChallenge['settings']
  }) => {
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

      // Check if user is party leader
      if (party.leaderId !== userId) {
        socket.emit('error', { message: 'Only party leader can create team challenges', code: 'NOT_PARTY_LEADER' })
        return
      }

      // Check minimum players for team challenge
      if (party.members.length < data.settings.minPlayersPerTeam * 2) {
        socket.emit('error', { 
          message: `Need at least ${data.settings.minPlayersPerTeam * 2} players for team challenge`, 
          code: 'INSUFFICIENT_PLAYERS' 
        })
        return
      }

      const challengeId = generateChallengeId()
      const objectives = generateObjectives(data.challengeType, data.settings)

      const teamChallenge: TeamChallenge = {
        id: challengeId,
        partyId: data.partyId,
        type: data.challengeType,
        name: getChallengeTypeName(data.challengeType),
        description: getChallengeDescription(data.challengeType),
        teams: [],
        objectives,
        settings: data.settings,
        status: 'setup',
        createdAt: new Date().toISOString()
      }

      teamChallenges.set(data.partyId, teamChallenge)

      // Notify all party members
      io.to(`party:${data.partyId}`).emit('team:challenge-created', teamChallenge)
      
      logger.info(`Team challenge created: ${challengeId} in party: ${data.partyId}`)
      
    } catch (error) {
      logger.error('Error creating team challenge:', error)
      socket.emit('error', { message: 'Failed to create team challenge', code: 'TEAM_CHALLENGE_CREATE_FAILED' })
    }
  })

  // Form Teams
  socket.on('team:form-teams', async (data: {
    partyId: string
    formation: TeamFormation
  }) => {
    try {
      if (!partiesRef) return

      const party = partiesRef.get(data.partyId)
      const teamChallenge = teamChallenges.get(data.partyId)
      
      if (!party || !teamChallenge) {
        socket.emit('error', { message: 'Party or team challenge not found', code: 'NOT_FOUND' })
        return
      }

      // Check if user can form teams (leader or captain)
      if (party.leaderId !== userId && !data.formation.captains?.includes(userId)) {
        socket.emit('error', { message: 'Not authorized to form teams', code: 'NOT_AUTHORIZED' })
        return
      }

      const teams: PartyTeam[] = []

      switch (data.formation.method) {
        case 'random':
          teams.push(...createRandomTeams(party.members, teamChallenge.settings))
          break
        case 'skill-based':
          teams.push(...createSkillBasedTeams(party.members, teamChallenge.settings))
          break
        case 'manual':
          teams.push(...createManualTeams(data.formation.teams, teamChallenge.objectives))
          break
        case 'captain-pick':
          // For now, use random as placeholder
          teams.push(...createRandomTeams(party.members, teamChallenge.settings))
          break
      }

      // Update team challenge
      teamChallenge.teams = teams
      teamChallenges.set(data.partyId, teamChallenge)

      // Initialize team chats
      teams.forEach(team => {
        teamChats.set(team.id, [])
      })

      // Notify all party members
      io.to(`party:${data.partyId}`).emit('team:teams-formed', {
        teams,
        formation: data.formation
      })

      logger.info(`Teams formed in party: ${data.partyId}, method: ${data.formation.method}`)
      
    } catch (error) {
      logger.error('Error forming teams:', error)
      socket.emit('error', { message: 'Failed to form teams', code: 'TEAM_FORMATION_FAILED' })
    }
  })

  // Start Team Challenge
  socket.on('team:start-challenge', async (data: { partyId: string }) => {
    try {
      if (!partiesRef) return

      const party = partiesRef.get(data.partyId)
      const teamChallenge = teamChallenges.get(data.partyId)
      
      if (!party || !teamChallenge) {
        socket.emit('error', { message: 'Party or team challenge not found', code: 'NOT_FOUND' })
        return
      }

      // Check if user is party leader
      if (party.leaderId !== userId) {
        socket.emit('error', { message: 'Only party leader can start challenge', code: 'NOT_PARTY_LEADER' })
        return
      }

      // Check if teams are formed
      if (teamChallenge.teams.length < 2) {
        socket.emit('error', { message: 'Need at least 2 teams to start challenge', code: 'INSUFFICIENT_TEAMS' })
        return
      }

      // Start challenge
      teamChallenge.status = 'countdown'
      teamChallenge.startTime = new Date().toISOString()
      
      // Reset team scores and objectives
      teamChallenge.teams.forEach(team => {
        team.score = 0
        team.objectives = team.objectives.map(obj => ({
          ...obj,
          progress: 0,
          isCompleted: false,
          startedAt: undefined,
          completedAt: undefined
        }))
      })

      teamChallenges.set(data.partyId, teamChallenge)

      // Notify all party members
      io.to(`party:${data.partyId}`).emit('team:challenge-starting', teamChallenge)
      
      // Start countdown
      startChallengeCountdown(io, data.partyId, teamChallenge)
      
      logger.info(`Team challenge started: ${teamChallenge.id}`)
      
    } catch (error) {
      logger.error('Error starting team challenge:', error)
      socket.emit('error', { message: 'Failed to start challenge', code: 'TEAM_CHALLENGE_START_FAILED' })
    }
  })

  // Team Objective Progress
  socket.on('team:objective-progress', async (data: {
    partyId: string
    teamId: string
    objectiveId: string
    progress: number
    metadata?: any
  }) => {
    try {
      const teamChallenge = teamChallenges.get(data.partyId)
      if (!teamChallenge || teamChallenge.status !== 'active') return

      // Find team and objective
      const team = teamChallenge.teams.find(t => t.id === data.teamId)
      const objective = team?.objectives.find(o => o.id === data.objectiveId)
      
      if (!team || !objective) return

      // Update progress
      objective.progress = Math.min(data.progress, objective.target)
      
      // Check if objective completed
      if (objective.progress >= objective.target && !objective.isCompleted) {
        objective.isCompleted = true
        objective.completedAt = new Date().toISOString()
        
        // Award team points
        team.score += objective.reward.points
        
        // Broadcast objective completion
        const updateEvent: TeamUpdateEvent = {
          type: 'objective-completed',
          teamId: data.teamId,
          data: {
            objective,
            newScore: team.score
          },
          timestamp: new Date().toISOString()
        }
        
        io.to(`party:${data.partyId}`).emit('team:update', updateEvent)
        
        // Check if all objectives completed (team victory condition)
        const allObjectivesCompleted = team.objectives.every(o => o.isCompleted)
        if (allObjectivesCompleted) {
          await completeChallengeForTeam(io, data.partyId, teamChallenge, data.teamId)
        }
      }

      teamChallenges.set(data.partyId, teamChallenge)
      
    } catch (error) {
      logger.error('Error updating team objective progress:', error)
    }
  })

  // Team Chat
  socket.on('team:chat', async (data: {
    partyId: string
    teamId: string
    message: string
  }) => {
    try {
      const teamChallenge = teamChallenges.get(data.partyId)
      if (!teamChallenge) return

      // Check if user is in the team
      const team = teamChallenge.teams.find(t => t.id === data.teamId)
      if (!team || !team.memberIds.includes(userId)) return

      const chatMessage: TeamChatMessage = {
        id: generateChatMessageId(),
        teamId: data.teamId,
        userId,
        username,
        message: data.message,
        timestamp: new Date().toISOString(),
        type: 'team'
      }

      // Add to team chat
      const teamChatHistory = teamChats.get(data.teamId) || []
      teamChatHistory.push(chatMessage)
      teamChats.set(data.teamId, teamChatHistory.slice(-50)) // Keep last 50 messages

      // Broadcast to team members only
      team.memberIds.forEach(memberId => {
        const memberSocket = Array.from(io.sockets.sockets.values())
          .find(s => s.data.userId === memberId)
        
        if (memberSocket) {
          memberSocket.emit('team:chat-message', chatMessage)
        }
      })
      
    } catch (error) {
      logger.error('Error handling team chat:', error)
    }
  })

  // Switch Team (if allowed)
  socket.on('team:switch', async (data: {
    partyId: string
    fromTeamId: string
    toTeamId: string
  }) => {
    try {
      const teamChallenge = teamChallenges.get(data.partyId)
      if (!teamChallenge || !teamChallenge.settings.allowTeamSwitching) {
        socket.emit('error', { message: 'Team switching not allowed', code: 'TEAM_SWITCH_DISABLED' })
        return
      }

      if (teamChallenge.status !== 'setup') {
        socket.emit('error', { message: 'Cannot switch teams after challenge has started', code: 'CHALLENGE_ACTIVE' })
        return
      }

      const fromTeam = teamChallenge.teams.find(t => t.id === data.fromTeamId)
      const toTeam = teamChallenge.teams.find(t => t.id === data.toTeamId)
      
      if (!fromTeam || !toTeam) {
        socket.emit('error', { message: 'Team not found', code: 'TEAM_NOT_FOUND' })
        return
      }

      // Check if user is in fromTeam
      if (!fromTeam.memberIds.includes(userId)) {
        socket.emit('error', { message: 'Not a member of source team', code: 'NOT_TEAM_MEMBER' })
        return
      }

      // Check team size limits
      if (toTeam.memberIds.length >= teamChallenge.settings.maxPlayersPerTeam) {
        socket.emit('error', { message: 'Target team is full', code: 'TEAM_FULL' })
        return
      }

      // Perform switch
      fromTeam.memberIds = fromTeam.memberIds.filter(id => id !== userId)
      toTeam.memberIds.push(userId)

      teamChallenges.set(data.partyId, teamChallenge)

      // Notify all party members
      io.to(`party:${data.partyId}`).emit('team:member-switched', {
        userId,
        username,
        fromTeamId: data.fromTeamId,
        toTeamId: data.toTeamId,
        teams: teamChallenge.teams
      })

      logger.info(`User ${username} switched from team ${data.fromTeamId} to ${data.toTeamId}`)
      
    } catch (error) {
      logger.error('Error switching teams:', error)
      socket.emit('error', { message: 'Failed to switch teams', code: 'TEAM_SWITCH_FAILED' })
    }
  })
}

// Helper Functions
async function completeChallengeForTeam(
  io: Server, 
  partyId: string, 
  teamChallenge: TeamChallenge, 
  winnerTeamId: string
) {
  teamChallenge.status = 'completed'
  teamChallenge.endTime = new Date().toISOString()
  teamChallenge.winnerId = winnerTeamId

  // Calculate results
  const results: TeamChallengeResult[] = teamChallenge.teams
    .sort((a, b) => b.score - a.score)
    .map((team, index) => ({
      teamId: team.id,
      teamName: team.name,
      finalScore: team.score,
      objectivesCompleted: team.objectives.filter(o => o.isCompleted).length,
      totalObjectives: team.objectives.length,
      members: team.memberIds.map(memberId => ({
        userId: memberId,
        username: 'Player', // Would get from party members
        individualScore: Math.floor(team.score / team.memberIds.length),
        accuracy: 85, // Mock data
        hits: 10,
        misses: 2,
        averageReactionTime: 350
      })),
      placement: index + 1,
      rewards: calculateTeamRewards(index + 1, team.score)
    }))

  teamChallenge.results = results
  teamChallenges.set(partyId, teamChallenge)

  // Broadcast completion
  io.to(`party:${partyId}`).emit('team:challenge-completed', {
    challenge: teamChallenge,
    results
  })

  logger.info(`Team challenge completed: ${teamChallenge.id}, winner: ${winnerTeamId}`)
}

function createRandomTeams(
  members: any[], 
  settings: TeamChallenge['settings']
): PartyTeam[] {
  const teams: PartyTeam[] = []
  const teamColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']
  const teamNames = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot']
  
  const shuffledMembers = [...members].sort(() => Math.random() - 0.5)
  const playersPerTeam = Math.floor(members.length / settings.maxTeams)
  
  for (let i = 0; i < settings.maxTeams && i * playersPerTeam < shuffledMembers.length; i++) {
    const teamMembers = shuffledMembers.slice(i * playersPerTeam, (i + 1) * playersPerTeam)
    
    if (teamMembers.length >= settings.minPlayersPerTeam) {
      teams.push({
        id: generateTeamId(),
        name: `Team ${teamNames[i] || i + 1}`,
        color: teamColors[i] || '#6b7280',
        leaderId: teamMembers[0].userId,
        memberIds: teamMembers.map(m => m.userId),
        score: 0,
        objectives: [],
        createdAt: new Date().toISOString()
      })
    }
  }
  
  return teams
}

function createSkillBasedTeams(
  members: any[], 
  settings: TeamChallenge['settings']
): PartyTeam[] {
  // Sort by level/skill and distribute evenly
  const sortedMembers = [...members].sort((a, b) => (b.level || 1) - (a.level || 1))
  return createRandomTeams(sortedMembers, settings) // Simplified for now
}

function createManualTeams(
  formationTeams: TeamFormation['teams'], 
  objectives: TeamObjective[]
): PartyTeam[] {
  return formationTeams.map(team => ({
    id: generateTeamId(),
    name: team.name,
    color: team.color,
    leaderId: team.memberIds[0] || '',
    memberIds: team.memberIds,
    score: 0,
    objectives: [...objectives],
    createdAt: new Date().toISOString()
  }))
}

function generateObjectives(
  challengeType: TeamChallenge['type'], 
  settings: TeamChallenge['settings']
): TeamObjective[] {
  const objectives: TeamObjective[] = []

  switch (challengeType) {
    case 'team-vs-team':
      objectives.push({
        id: generateObjectiveId(),
        type: 'elimination',
        name: 'Target Elimination',
        description: 'Eliminate more targets than the opposing team',
        target: 50,
        progress: 0,
        isCompleted: false,
        reward: { xp: 100, points: 50 },
        timeLimit: settings.duration
      })
      break

    case 'team-objectives':
      objectives.push(
        {
          id: generateObjectiveId(),
          type: 'accuracy',
          name: 'Team Accuracy',
          description: 'Achieve 85% team accuracy',
          target: 85,
          progress: 0,
          isCompleted: false,
          reward: { xp: 75, points: 30 }
        },
        {
          id: generateObjectiveId(),
          type: 'capture-targets',
          name: 'Capture Zones',
          description: 'Capture 5 target zones',
          target: 5,
          progress: 0,
          isCompleted: false,
          reward: { xp: 50, points: 25 }
        }
      )
      break

    case 'team-relay':
      objectives.push({
        id: generateObjectiveId(),
        type: 'relay',
        name: 'Relay Challenge',
        description: 'Complete relay rounds faster than other teams',
        target: 1,
        progress: 0,
        isCompleted: false,
        reward: { xp: 125, points: 60 }
      })
      break

    case 'team-survival':
      objectives.push({
        id: generateObjectiveId(),
        type: 'survival',
        name: 'Team Survival',
        description: 'Last team standing wins',
        target: 1,
        progress: 0,
        isCompleted: false,
        reward: { xp: 150, points: 75 }
      })
      break
  }

  return objectives
}

function calculateTeamRewards(placement: number, score: number) {
  const baseXP = score * 2
  const basePoints = score

  switch (placement) {
    case 1: return { xp: baseXP * 1.5, points: basePoints * 1.5 }
    case 2: return { xp: baseXP * 1.2, points: basePoints * 1.2 }
    case 3: return { xp: baseXP * 1.1, points: basePoints * 1.1 }
    default: return { xp: baseXP, points: basePoints }
  }
}

function startChallengeCountdown(io: Server, partyId: string, teamChallenge: TeamChallenge) {
  let countdown = 5

  const countdownInterval = setInterval(() => {
    io.to(`party:${partyId}`).emit('team:countdown', countdown)
    countdown--

    if (countdown < 0) {
      clearInterval(countdownInterval)
      
      // Start the actual challenge
      teamChallenge.status = 'active'
      teamChallenges.set(partyId, teamChallenge)
      
      io.to(`party:${partyId}`).emit('team:challenge-started', teamChallenge)
      
      // Set auto-completion timer
      setTimeout(() => {
        if (teamChallenge.status === 'active') {
          // Time's up - determine winner by score
          const sortedTeams = teamChallenge.teams.sort((a, b) => b.score - a.score)
          if (sortedTeams.length > 0) {
            completeChallengeForTeam(io, partyId, teamChallenge, sortedTeams[0].id)
          }
        }
      }, teamChallenge.settings.duration * 1000)
    }
  }, 1000)
}

function getChallengeTypeName(type: TeamChallenge['type']): string {
  switch (type) {
    case 'team-vs-team': return 'Team vs Team Battle'
    case 'team-objectives': return 'Team Objectives Challenge'
    case 'team-relay': return 'Team Relay Race'
    case 'team-survival': return 'Team Survival Challenge'
    default: return 'Team Challenge'
  }
}

function getChallengeDescription(type: TeamChallenge['type']): string {
  switch (type) {
    case 'team-vs-team': return 'Compete directly against other teams in head-to-head battles'
    case 'team-objectives': return 'Work together to complete various team objectives'
    case 'team-relay': return 'Take turns in a relay-style challenge format'
    case 'team-survival': return 'Last team standing wins in this survival challenge'
    default: return 'Work together as a team to achieve victory'
  }
}

function generateChallengeId(): string {
  return `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateTeamId(): string {
  return `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateObjectiveId(): string {
  return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateChatMessageId(): string {
  return `tmsg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Export for use in other modules
export { teamChallenges, teamChats } 