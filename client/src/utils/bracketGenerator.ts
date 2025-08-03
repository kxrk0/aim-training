import type { 
  Tournament, 
  TournamentParticipant, 
  TournamentBracket, 
  BracketMatch,
  TournamentFormat 
} from '../../../shared/types'

export interface BracketNode {
  id: string
  round: number
  position: number
  participant1?: TournamentParticipant
  participant2?: TournamentParticipant
  winner?: TournamentParticipant
  match?: BracketMatch
  parent?: BracketNode
  children?: [BracketNode, BracketNode]
}

export interface GeneratedBracket {
  format: TournamentFormat
  totalRounds: number
  matches: BracketMatch[]
  tree: BracketNode[]
  schedule: MatchSchedule[]
}

export interface MatchSchedule {
  round: number
  matches: BracketMatch[]
  estimatedStartTime: string
  estimatedDuration: number // minutes
}

export class BracketGenerator {
  
  /**
   * Main bracket generation method
   */
  static generate(tournament: Tournament): GeneratedBracket {
    const { format, participants } = tournament
    
    switch (format) {
      case 'single-elimination':
        return this.generateSingleElimination(tournament)
      case 'double-elimination':
        return this.generateDoubleElimination(tournament)
      case 'round-robin':
        return this.generateRoundRobin(tournament)
      case 'swiss':
        return this.generateSwiss(tournament)
      default:
        throw new Error(`Unsupported tournament format: ${format}`)
    }
  }

  /**
   * Single Elimination Bracket
   */
  private static generateSingleElimination(tournament: Tournament): GeneratedBracket {
    const participants = this.seedParticipants(tournament.participants, tournament.bracketSettings.seedingMethod)
    const totalRounds = Math.ceil(Math.log2(participants.length))
    const matches: BracketMatch[] = []
    const tree: BracketNode[] = []
    
    // Add byes if needed
    const bracketSize = Math.pow(2, totalRounds)
    const paddedParticipants = this.addByes(participants, bracketSize)
    
    // Generate first round matches
    let currentRound = 1
    let matchId = 1
    
    for (let i = 0; i < paddedParticipants.length; i += 2) {
      const participant1 = paddedParticipants[i]
      const participant2 = paddedParticipants[i + 1]
      
      // Skip bye matches
      if (!participant1 || !participant2) {
        continue
      }
      
      const match: BracketMatch = {
        id: `match_${matchId++}`,
        tournamentId: tournament.id,
        round: currentRound,
        position: Math.floor(i / 2) + 1,
        participant1Id: participant1.userId,
        participant2Id: participant2.userId,
        status: 'pending',
        bestOf: tournament.bracketSettings.bestOf,
        scheduledTime: this.calculateMatchTime(tournament, currentRound, Math.floor(i / 2)),
        createdAt: new Date().toISOString()
      }
      
      matches.push(match)
      
      const node: BracketNode = {
        id: `node_${match.id}`,
        round: currentRound,
        position: Math.floor(i / 2) + 1,
        participant1,
        participant2,
        match
      }
      
      tree.push(node)
    }
    
    // Generate subsequent rounds
    for (let round = 2; round <= totalRounds; round++) {
      const previousRoundMatches = matches.filter(m => m.round === round - 1)
      const roundMatches = Math.ceil(previousRoundMatches.length / 2)
      
      for (let i = 0; i < roundMatches; i++) {
        const match: BracketMatch = {
          id: `match_${matchId++}`,
          tournamentId: tournament.id,
          round,
          position: i + 1,
          participant1Id: '', // Will be filled from previous round winners
          participant2Id: '', // Will be filled from previous round winners
          status: 'waiting',
          bestOf: tournament.bracketSettings.bestOf,
          scheduledTime: this.calculateMatchTime(tournament, round, i),
          createdAt: new Date().toISOString()
        }
        
        matches.push(match)
        
        const node: BracketNode = {
          id: `node_${match.id}`,
          round,
          position: i + 1,
          match
        }
        
        tree.push(node)
      }
    }
    
    const schedule = this.generateSchedule(matches, tournament)
    
    return {
      format: 'single-elimination',
      totalRounds,
      matches,
      tree,
      schedule
    }
  }

  /**
   * Double Elimination Bracket
   */
  private static generateDoubleElimination(tournament: Tournament): GeneratedBracket {
    const participants = this.seedParticipants(tournament.participants, tournament.bracketSettings.seedingMethod)
    const matches: BracketMatch[] = []
    const tree: BracketNode[] = []
    
    // Generate winners bracket (same as single elimination)
    const winnersBracket = this.generateSingleElimination({
      ...tournament,
      participants
    })
    
    // Add winners bracket matches
    matches.push(...winnersBracket.matches.map(match => ({
      ...match,
      bracket: 'winners' as const,
      id: `w_${match.id}`
    })))
    
    // Generate losers bracket
    const losersBracketRounds = (winnersBracket.totalRounds - 1) * 2
    let losersMatchId = 1000 // Start from 1000 to avoid conflicts
    
    for (let round = 1; round <= losersBracketRounds; round++) {
      const isEliminationRound = round % 2 === 1
      const winnersRoundFeedIn = Math.ceil(round / 2) + 1
      
      // Calculate number of matches in this losers round
      let matchCount: number
      if (round === 1) {
        matchCount = Math.floor(participants.length / 4)
      } else if (isEliminationRound) {
        const previousRound = matches.filter(m => m.round === round - 1 && m.bracket === 'losers')
        matchCount = Math.floor(previousRound.length / 2)
      } else {
        const winnersDropdowns = matches.filter(m => m.round === winnersRoundFeedIn && m.bracket === 'winners')
        matchCount = winnersDropdowns.length
      }
      
      for (let i = 0; i < matchCount; i++) {
        const match: BracketMatch = {
          id: `l_match_${losersMatchId++}`,
          tournamentId: tournament.id,
          round,
          position: i + 1,
          participant1Id: '',
          participant2Id: '',
          status: 'waiting',
          bestOf: tournament.bracketSettings.bestOf,
          bracket: 'losers',
          scheduledTime: this.calculateMatchTime(tournament, round, i, 'losers'),
          createdAt: new Date().toISOString()
        }
        
        matches.push(match)
      }
    }
    
    // Grand finals
    const grandFinals: BracketMatch = {
      id: `grand_finals`,
      tournamentId: tournament.id,
      round: losersBracketRounds + 1,
      position: 1,
      participant1Id: '', // Winners bracket champion
      participant2Id: '', // Losers bracket champion
      status: 'waiting',
      bestOf: tournament.bracketSettings.bestOf,
      bracket: 'grand-finals',
      scheduledTime: this.calculateMatchTime(tournament, losersBracketRounds + 1, 0),
      createdAt: new Date().toISOString()
    }
    
    matches.push(grandFinals)
    
    const schedule = this.generateSchedule(matches, tournament)
    
    return {
      format: 'double-elimination',
      totalRounds: winnersBracket.totalRounds + losersBracketRounds + 1,
      matches,
      tree,
      schedule
    }
  }

  /**
   * Round Robin Bracket
   */
  private static generateRoundRobin(tournament: Tournament): GeneratedBracket {
    const participants = tournament.participants
    const matches: BracketMatch[] = []
    const totalRounds = participants.length - 1
    let matchId = 1
    
    // Generate all possible pairings
    for (let round = 0; round < totalRounds; round++) {
      const roundMatches: BracketMatch[] = []
      
      for (let i = 0; i < participants.length / 2; i++) {
        const participant1Index = i
        const participant2Index = participants.length - 1 - i
        
        if (participant1Index !== participant2Index) {
          const participant1 = participants[participant1Index]
          const participant2 = participants[participant2Index]
          
          const match: BracketMatch = {
            id: `rr_match_${matchId++}`,
            tournamentId: tournament.id,
            round: round + 1,
            position: i + 1,
            participant1Id: participant1.userId,
            participant2Id: participant2.userId,
            status: round === 0 ? 'pending' : 'waiting',
            bestOf: tournament.bracketSettings.bestOf,
            scheduledTime: this.calculateMatchTime(tournament, round + 1, i),
            createdAt: new Date().toISOString()
          }
          
          matches.push(match)
          roundMatches.push(match)
        }
      }
      
      // Rotate participants for next round (except first one)
      if (round < totalRounds - 1) {
        const lastParticipant = participants.pop()!
        participants.splice(1, 0, lastParticipant)
      }
    }
    
    const schedule = this.generateSchedule(matches, tournament)
    
    return {
      format: 'round-robin',
      totalRounds,
      matches,
      tree: [],
      schedule
    }
  }

  /**
   * Swiss System Bracket
   */
  private static generateSwiss(tournament: Tournament): GeneratedBracket {
    const participants = this.seedParticipants(tournament.participants, tournament.bracketSettings.seedingMethod)
    const totalRounds = Math.ceil(Math.log2(participants.length))
    const matches: BracketMatch[] = []
    
    // Generate first round pairings (by ranking)
    this.generateSwissRound(tournament, participants, 1, matches)
    
    const schedule = this.generateSchedule(matches, tournament)
    
    return {
      format: 'swiss',
      totalRounds,
      matches,
      tree: [],
      schedule
    }
  }

  /**
   * Generate a single Swiss round
   */
  private static generateSwissRound(
    tournament: Tournament,
    participants: TournamentParticipant[],
    round: number,
    matches: BracketMatch[]
  ): void {
    // Sort participants by current score/rating
    const sortedParticipants = [...participants].sort((a, b) => {
      // In first round, sort by seed
      if (round === 1) {
        return a.seed - b.seed
      }
      
      // Calculate current score from previous matches
      const aScore = this.calculateSwissScore(a.userId, matches)
      const bScore = this.calculateSwissScore(b.userId, matches)
      
      return bScore - aScore // Higher score first
    })
    
    const used = new Set<string>()
    let matchId = round * 1000 // Ensure unique IDs per round
    
    for (let i = 0; i < sortedParticipants.length; i++) {
      const participant1 = sortedParticipants[i]
      
      if (used.has(participant1.userId)) continue
      
      // Find best pairing that hasn't played before
      let participant2: TournamentParticipant | null = null
      
      for (let j = i + 1; j < sortedParticipants.length; j++) {
        const candidate = sortedParticipants[j]
        
        if (used.has(candidate.userId)) continue
        
        // Check if they've played before
        const hasPlayedBefore = matches.some(match =>
          (match.participant1Id === participant1.userId && match.participant2Id === candidate.userId) ||
          (match.participant1Id === candidate.userId && match.participant2Id === participant1.userId)
        )
        
        if (!hasPlayedBefore) {
          participant2 = candidate
          break
        }
      }
      
      if (participant2) {
        const match: BracketMatch = {
          id: `swiss_${round}_${matchId++}`,
          tournamentId: tournament.id,
          round,
          position: Math.floor(used.size / 2) + 1,
          participant1Id: participant1.userId,
          participant2Id: participant2.userId,
          status: 'pending',
          bestOf: tournament.bracketSettings.bestOf,
          scheduledTime: this.calculateMatchTime(tournament, round, Math.floor(used.size / 2)),
          createdAt: new Date().toISOString()
        }
        
        matches.push(match)
        used.add(participant1.userId)
        used.add(participant2.userId)
      }
    }
  }

  /**
   * Calculate Swiss score for a participant
   */
  private static calculateSwissScore(participantId: string, matches: BracketMatch[]): number {
    return matches.reduce((score, match) => {
      if (match.status !== 'finished') return score
      
      if (match.winnerId === participantId) {
        return score + 1
      } else if (match.participant1Id === participantId || match.participant2Id === participantId) {
        return score + 0.5 // Draw
      }
      
      return score
    }, 0)
  }

  /**
   * Seed participants based on method
   */
  private static seedParticipants(
    participants: TournamentParticipant[],
    method: 'random' | 'elo' | 'manual'
  ): TournamentParticipant[] {
    switch (method) {
      case 'random':
        return this.shuffleArray([...participants])
      
      case 'elo':
        return [...participants].sort((a, b) => b.eloRating - a.eloRating)
      
      case 'manual':
        return [...participants].sort((a, b) => a.seed - b.seed)
      
      default:
        return participants
    }
  }

  /**
   * Add bye participants for bracket balance
   */
  private static addByes(participants: TournamentParticipant[], targetSize: number): (TournamentParticipant | null)[] {
    const result: (TournamentParticipant | null)[] = [...participants]
    
    while (result.length < targetSize) {
      result.push(null) // Bye
    }
    
    return result
  }

  /**
   * Calculate match scheduling time
   */
  private static calculateMatchTime(
    tournament: Tournament,
    round: number,
    position: number,
    bracket: 'winners' | 'losers' = 'winners'
  ): string {
    const tournamentStart = new Date(tournament.tournamentStart)
    const matchDuration = 30 // minutes per match
    const roundGap = 60 // minutes between rounds
    
    let totalMinutes = 0
    
    // Add time for previous rounds
    if (bracket === 'losers') {
      totalMinutes += round * matchDuration + round * roundGap
    } else {
      totalMinutes += (round - 1) * matchDuration + (round - 1) * roundGap
    }
    
    // Add time for match position within round
    totalMinutes += position * 5 // 5 minute gap between matches in same round
    
    const matchTime = new Date(tournamentStart.getTime() + totalMinutes * 60 * 1000)
    return matchTime.toISOString()
  }

  /**
   * Generate match schedule
   */
  private static generateSchedule(matches: BracketMatch[], tournament: Tournament): MatchSchedule[] {
    const schedule: MatchSchedule[] = []
    const rounds = Math.max(...matches.map(m => m.round))
    
    for (let round = 1; round <= rounds; round++) {
      const roundMatches = matches.filter(m => m.round === round)
      
      if (roundMatches.length > 0) {
        const estimatedStartTime = roundMatches[0].scheduledTime || new Date().toISOString()
        const estimatedDuration = roundMatches.length * 30 // 30 minutes per match
        
        schedule.push({
          round,
          matches: roundMatches,
          estimatedStartTime,
          estimatedDuration
        })
      }
    }
    
    return schedule
  }

  /**
   * Advance winner to next round
   */
  static advanceWinner(
    bracket: GeneratedBracket,
    matchId: string,
    winnerId: string
  ): BracketMatch[] {
    const match = bracket.matches.find(m => m.id === matchId)
    if (!match) return bracket.matches
    
    // Update current match
    match.status = 'finished'
    match.winnerId = winnerId
    match.completedAt = new Date().toISOString()
    
    // Find next match for winner
    if (bracket.format === 'single-elimination') {
      return this.advanceSingleElimination(bracket, match, winnerId)
    } else if (bracket.format === 'double-elimination') {
      return this.advanceDoubleElimination(bracket, match, winnerId)
    }
    
    return bracket.matches
  }

  /**
   * Advance in single elimination
   */
  private static advanceSingleElimination(
    bracket: GeneratedBracket,
    completedMatch: BracketMatch,
    winnerId: string
  ): BracketMatch[] {
    const nextRound = completedMatch.round + 1
    const nextPosition = Math.ceil(completedMatch.position / 2)
    
    const nextMatch = bracket.matches.find(
      m => m.round === nextRound && m.position === nextPosition
    )
    
    if (nextMatch) {
      // Determine if winner goes to participant1 or participant2 slot
      const isFirstSlot = completedMatch.position % 2 === 1
      
      if (isFirstSlot) {
        nextMatch.participant1Id = winnerId
      } else {
        nextMatch.participant2Id = winnerId
      }
      
      // If both participants are set, mark as ready
      if (nextMatch.participant1Id && nextMatch.participant2Id) {
        nextMatch.status = 'pending'
      }
    }
    
    return bracket.matches
  }

  /**
   * Advance in double elimination
   */
  private static advanceDoubleElimination(
    bracket: GeneratedBracket,
    completedMatch: BracketMatch,
    winnerId: string
  ): BracketMatch[] {
    const loserId = completedMatch.participant1Id === winnerId 
      ? completedMatch.participant2Id 
      : completedMatch.participant1Id
    
    if (completedMatch.bracket === 'winners') {
      // Winner advances in winners bracket
      this.advanceSingleElimination(bracket, completedMatch, winnerId)
      
      // Loser drops to losers bracket
      if (loserId) {
        this.dropToLosersBracket(bracket, completedMatch, loserId)
      }
    } else if (completedMatch.bracket === 'losers') {
      // Winner advances in losers bracket
      this.advanceInLosersBracket(bracket, completedMatch, winnerId)
      
      // Loser is eliminated (no further action needed)
    }
    
    return bracket.matches
  }

  /**
   * Drop participant to losers bracket
   */
  private static dropToLosersBracket(
    bracket: GeneratedBracket,
    completedMatch: BracketMatch,
    loserId: string
  ): void {
    // Find appropriate losers bracket match
    const losersRound = (completedMatch.round - 1) * 2 + 1
    const losersMatch = bracket.matches.find(
      m => m.bracket === 'losers' && m.round === losersRound && !m.participant1Id
    )
    
    if (losersMatch) {
      if (!losersMatch.participant1Id) {
        losersMatch.participant1Id = loserId
      } else if (!losersMatch.participant2Id) {
        losersMatch.participant2Id = loserId
        losersMatch.status = 'pending'
      }
    }
  }

  /**
   * Advance in losers bracket
   */
  private static advanceInLosersBracket(
    bracket: GeneratedBracket,
    completedMatch: BracketMatch,
    winnerId: string
  ): void {
    // Similar logic to single elimination but for losers bracket
    // Implementation would follow losers bracket advancement rules
  }

  /**
   * Utility: Shuffle array
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}

// Export utility functions
export const BracketUtils = {
  /**
   * Get match display name
   */
  getMatchDisplayName: (match: BracketMatch): string => {
    if (match.bracket === 'grand-finals') return 'Grand Finals'
    if (match.bracket === 'losers') return `LB R${match.round} M${match.position}`
    if (match.bracket === 'winners') return `WB R${match.round} M${match.position}`
    return `R${match.round} M${match.position}`
  },

  /**
   * Get bracket progress percentage
   */
  getBracketProgress: (bracket: GeneratedBracket): number => {
    const finishedMatches = bracket.matches.filter(m => m.status === 'finished').length
    return (finishedMatches / bracket.matches.length) * 100
  },

  /**
   * Get next matches for participant
   */
  getParticipantNextMatches: (bracket: GeneratedBracket, participantId: string): BracketMatch[] => {
    return bracket.matches.filter(match => 
      (match.participant1Id === participantId || match.participant2Id === participantId) &&
      match.status === 'pending'
    )
  },

  /**
   * Validate bracket consistency
   */
  validateBracket: (bracket: GeneratedBracket): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    // Check for duplicate match IDs
    const matchIds = bracket.matches.map(m => m.id)
    const uniqueIds = new Set(matchIds)
    if (matchIds.length !== uniqueIds.size) {
      errors.push('Duplicate match IDs found')
    }
    
    // Check round progression
    const rounds = [...new Set(bracket.matches.map(m => m.round))].sort((a, b) => a - b)
    for (let i = 0; i < rounds.length - 1; i++) {
      if (rounds[i + 1] !== rounds[i] + 1) {
        errors.push(`Missing round between ${rounds[i]} and ${rounds[i + 1]}`)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
} 