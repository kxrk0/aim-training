// User types
export interface User {
  id: string
  email: string
  username: string
  level: number
  totalScore: number
  totalShots: number
  totalHits: number
  hoursPlayed: number
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  accuracy: number
  averageReactionTime: number
  gamesPlayed: number
  bestScores: {
    precision: number
    speed: number
    tracking: number
    flick: number
  }
}

// Game types
export type GameMode = 'precision' | 'speed' | 'tracking' | 'flick'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'
export type TargetSize = 'small' | 'medium' | 'large'

export interface GameSettings {
  gameMode: GameMode
  difficulty: Difficulty
  duration: number // seconds
  targetSize: TargetSize
  spawnRate: number // targets per second
}

export interface GameSession {
  id: string
  userId: string
  gameMode: GameMode
  startTime: string
  endTime?: string
  duration?: number
  settings: GameSettings
  
  // Results
  finalScore?: number
  accuracy?: number
  averageReactionTime?: number
  totalHits: number
  totalMisses: number
  bestStreak: number
}

export interface Target {
  id: string
  position: [number, number, number]
  size: number
  spawnTime: number
  lifetime: number
  isHit: boolean
}

// Score and performance types
export interface Score {
  id: string
  userId: string
  gameSessionId: string
  gameMode: GameMode
  score: number
  accuracy: number
  reactionTime: number
  hits: number
  misses: number
  streak: number
  difficulty: Difficulty
  createdAt: string
}

export interface PerformanceMetrics {
  accuracy: number
  averageReactionTime: number
  shotsPerMinute: number
  consistencyScore: number
  improvementTrend: number
}

export interface HitResult {
  targetId: string
  position: [number, number, number]
  reactionTime: number
  accuracy: number // distance from center (0 = perfect, 1 = edge)
  timestamp: number
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  score: number
  accuracy: number
  gameMode: GameMode
  createdAt: string
}

export interface Leaderboard {
  gameMode: GameMode
  period: 'daily' | 'weekly' | 'monthly' | 'all-time'
  entries: LeaderboardEntry[]
  total: number
  page: number
  limit: number
}

// Achievement types
export interface Achievement {
  id: string
  name: string
  description: string
  category: 'accuracy' | 'speed' | 'consistency' | 'milestone'
  icon?: string
  points: number
  requiredValue?: number
  requiredCount?: number
  gameMode?: GameMode
}

export interface UserAchievement {
  id: string
  userId: string
  achievementId: string
  achievement: Achievement
  unlockedAt: string
  progress: number // 0.0 to 1.0
}

// 🆕 PARTY SYSTEM TYPES
export type PartyRole = 'leader' | 'member'
export type PartyStatus = 'waiting' | 'in-game' | 'finished'
export type PartyGameMode = 'co-op' | 'synchronized' | 'relay' | 'competition'

export interface PartyMember {
  userId: string
  username: string
  role: PartyRole
  joinedAt: string
  isReady: boolean
  isOnline: boolean
  currentScore?: number
  performance?: {
    hits: number
    misses: number
    accuracy: number
    reactionTime: number
  }
}

export interface Party {
  id: string
  name: string
  leaderId: string
  members: PartyMember[]
  maxMembers: number
  isPrivate: boolean
  inviteCode?: string
  status: PartyStatus
  gameSettings?: PartyGameSettings
  createdAt: string
  currentGame?: PartyGameSession
}

export interface PartyGameSettings {
  gameMode: GameMode
  partyMode: PartyGameMode
  difficulty: Difficulty
  duration: number
  maxPlayers: number
  allowSpectators: boolean
  customRules?: {
    targetSharing: boolean // Shared targets vs individual
    scoreSharing: boolean // Team score vs individual
    realTimeSync: boolean // Synchronized timing
  }
}

export interface PartyGameSession {
  id: string
  partyId: string
  gameSettings: PartyGameSettings
  startTime: string
  endTime?: string
  participants: PartyParticipant[]
  currentTargets: PartyTarget[]
  leaderboard: PartyLeaderboard[]
  status: 'countdown' | 'active' | 'paused' | 'finished'
}

export interface PartyParticipant {
  userId: string
  username: string
  score: number
  hits: number
  misses: number
  accuracy: number
  averageReactionTime: number
  currentStreak: number
  position: number // Current leaderboard position
  isReady: boolean
}

export interface PartyTarget {
  id: string
  position: [number, number, number]
  size: number
  spawnTime: number
  assignedTo?: string // For individual targets
  hitBy?: string // Who hit this target
  isActive: boolean
}

export interface PartyLeaderboard {
  userId: string
  username: string
  score: number
  accuracy: number
  hits: number
  misses: number
  position: number
}

// 🆕 1v1 COMPETITION TYPES
export type CompetitionStatus = 'waiting' | 'countdown' | 'active' | 'finished'
export type CompetitionResult = 'victory' | 'defeat' | 'draw'

export interface Competition {
  id: string
  player1: CompetitionPlayer
  player2: CompetitionPlayer
  gameSettings: GameSettings
  status: CompetitionStatus
  startTime?: string
  endTime?: string
  winner?: string
  result?: CompetitionResults
}

export interface CompetitionPlayer {
  userId: string
  username: string
  eloRating: number
  score: number
  hits: number
  misses: number
  accuracy: number
  averageReactionTime: number
  isReady: boolean
}

export interface CompetitionResults {
  winner: string
  player1Result: CompetitionPlayerResult
  player2Result: CompetitionPlayerResult
  eloChanges: {
    player1Delta: number
    player2Delta: number
  }
}

export interface CompetitionPlayerResult {
  userId: string
  finalScore: number
  accuracy: number
  hits: number
  misses: number
  averageReactionTime: number
  result: CompetitionResult
}

// 🆕 TOURNAMENT SYSTEM TYPES
export type TournamentFormat = 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss'
export type TournamentStatus = 'registration' | 'starting' | 'active' | 'finished' | 'cancelled'
export type BracketMatchStatus = 'pending' | 'active' | 'finished'

export interface Tournament {
  id: string
  name: string
  description: string
  gameMode: GameMode
  format: TournamentFormat
  status: TournamentStatus
  maxParticipants: number
  entryFee?: number
  prizePool?: number
  
  // Timing
  registrationStart: string
  registrationEnd: string
  tournamentStart: string
  estimatedEnd?: string
  
  // Settings
  gameSettings: GameSettings
  bracketSettings: {
    bestOf: number // Best of 1, 3, 5, etc.
    seedingMethod: 'random' | 'elo' | 'manual'
    allowLateRegistration: boolean
  }
  
  // Current state
  participants: TournamentParticipant[]
  brackets: TournamentBracket[]
  currentRound: number
  totalRounds: number
  
  // Results
  winner?: string
  finalStandings?: TournamentStanding[]
  
  createdAt: string
  updatedAt: string
}

export interface TournamentParticipant {
  userId: string
  username: string
  eloRating: number
  seed: number
  registeredAt: string
  isActive: boolean
  currentMatch?: string // Current match ID
  wins: number
  losses: number
  isEliminated: boolean
}

export interface TournamentBracket {
  id: string
  tournamentId: string
  round: number
  position: number
  match: BracketMatch
}

export interface BracketMatch {
  id: string
  round: number
  position: number
  player1?: TournamentParticipant
  player2?: TournamentParticipant
  status: BracketMatchStatus
  
  // If active/finished
  competitionId?: string
  winner?: string
  scores?: {
    player1Games: number
    player2Games: number
    games: MatchGame[]
  }
  
  scheduledTime?: string
  startTime?: string
  endTime?: string
}

export interface MatchGame {
  gameNumber: number
  player1Score: number
  player2Score: number
  winner: string
  duration: number
  competitionId: string
}

export interface TournamentStanding {
  position: number
  userId: string
  username: string
  wins: number
  losses: number
  totalScore: number
  averageAccuracy: number
  prize?: number
}

// 🆕 TOURNAMENT EVENTS
export interface TournamentUpdate {
  type: 'registration' | 'match-start' | 'match-end' | 'elimination' | 'round-advance' | 'tournament-end'
  tournamentId: string
  data: any
  timestamp: number
}

// API Response types
export interface ApiResponse<T = any> {
  message: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  total: number
  page: number
  limit: number
}

// Authentication types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

// 🆕 SOCKET.IO EVENT TYPES
export interface SocketEvents {
  // Party Events
  'party:create': (data: { name: string; maxMembers: number; isPrivate: boolean }) => void
  'party:join': (data: { partyId: string; inviteCode?: string }) => void
  'party:leave': () => void
  'party:kick': (data: { userId: string }) => void
  'party:promote': (data: { userId: string }) => void
  'party:ready': (data: { isReady: boolean }) => void
  'party:start-game': (gameSettings: PartyGameSettings) => void
  'party:game-update': (data: PartyGameUpdate) => void
  
  // Competition Events
  'competition:find-match': (gameMode: GameMode) => void
  'competition:accept-match': (competitionId: string) => void
  'competition:ready': (isReady: boolean) => void
  'competition:game-update': (data: CompetitionGameUpdate) => void
  
  // Tournament Events
  'tournament:register': (tournamentId: string) => void
  'tournament:unregister': (tournamentId: string) => void
  'tournament:spectate': (tournamentId: string) => void
  'tournament:ready': (tournamentId: string, isReady: boolean) => void
  
  // General Events
  'user:online': () => void
  'user:offline': () => void
  'chat:message': (data: ChatMessage) => void
}

export interface SocketListeners {
  // Party Listeners
  'party:updated': (party: Party) => void
  'party:member-joined': (member: PartyMember) => void
  'party:member-left': (userId: string) => void
  'party:game-started': (gameSession: PartyGameSession) => void
  'party:game-update': (update: PartyGameUpdate) => void
  'party:game-ended': (results: PartyGameResults) => void
  
  // Competition Listeners
  'competition:match-found': (competition: Competition) => void
  'competition:opponent-ready': (isReady: boolean) => void
  'competition:game-started': (competition: Competition) => void
  'competition:game-update': (update: CompetitionGameUpdate) => void
  'competition:game-ended': (results: CompetitionResults) => void
  
  // Tournament Listeners
  'tournament:updated': (tournament: Tournament) => void
  'tournament:registered': (tournamentId: string) => void
  'tournament:match-ready': (match: BracketMatch) => void
  'tournament:match-started': (match: BracketMatch) => void
  'tournament:match-ended': (results: any) => void
  'tournament:eliminated': (tournamentId: string) => void
  'tournament:winner': (tournament: Tournament) => void
  
  // General Listeners
  'user:status-changed': (data: { userId: string; isOnline: boolean }) => void
  'chat:new-message': (message: ChatMessage) => void
  'error': (error: SocketError) => void
}

export interface PartyGameUpdate {
  type: 'target-spawn' | 'target-hit' | 'score-update' | 'player-update'
  data: any
  timestamp: number
}

export interface CompetitionGameUpdate {
  type: 'target-spawn' | 'target-hit' | 'score-update' | 'countdown'
  player: 'player1' | 'player2'
  data: any
  timestamp: number
}

export interface PartyGameResults {
  partyId: string
  gameSessionId: string
  finalLeaderboard: PartyLeaderboard[]
  mvp: string // Most Valuable Player
  statistics: {
    totalTargets: number
    totalHits: number
    averageAccuracy: number
    bestPlayer: string
  }
}

export interface ChatMessage {
  id: string
  userId: string
  username: string
  message: string
  timestamp: string
  type: 'text' | 'system' | 'achievement'
}

// Real-time/Socket.IO types
export interface GameUpdateData {
  gameId: string
  type: 'targetSpawn' | 'targetHit' | 'targetMiss' | 'gameEnd'
  payload: any
  timestamp: number
}

export interface SocketError {
  message: string
  code?: string
}

// Client state types
export interface GameState {
  isActive: boolean
  isPaused: boolean
  gameMode: GameMode | null
  settings: GameSettings | null
  currentScore: number
  targets: Target[]
  timeLeft: number
  stats: {
    hits: number
    misses: number
    accuracy: number
    averageReactionTime: number
    currentStreak: number
    bestStreak: number
  }
}

// 🆕 PARTY STATE TYPES
export interface PartyState {
  currentParty: Party | null
  isInParty: boolean
  partyMembers: PartyMember[]
  currentGame: PartyGameSession | null
  isGameActive: boolean
  inviteCode: string | null
  partyChat: ChatMessage[]
  isConnected: boolean
}

export interface CompetitionState {
  currentMatch: Competition | null
  isInCompetition: boolean
  isSearching: boolean
  searchStartTime: number | null
  estimatedWaitTime: number
  opponentFound: boolean
}

// 🆕 TOURNAMENT STATE TYPES
export interface TournamentState {
  availableTournaments: Tournament[]
  registeredTournaments: Tournament[]
  activeTournament: Tournament | null
  currentMatch: BracketMatch | null
  isInTournament: boolean
  isSpectating: boolean
  spectatingTournament: Tournament | null
}

export interface AppSettings {
  mouseSensitivity: number
  crosshairColor: string
  soundEnabled: boolean
  defaultDifficulty: Difficulty
  enablePerformanceMonitoring: boolean
  partySettings: {
    autoReady: boolean
    showPartyChat: boolean
    allowInvites: boolean
    preferredGameMode: GameMode
  }
  tournamentSettings: {
    autoRegister: boolean
    preferredFormat: TournamentFormat
    notifications: boolean
  }
} 