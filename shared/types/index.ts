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
export type BracketMatchStatus = 'pending' | 'active' | 'finished' | 'waiting'

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
  tournamentId?: string
  round: number
  position: number
  player1?: TournamentParticipant
  player2?: TournamentParticipant
  participant1Id?: string
  participant2Id?: string
  status: BracketMatchStatus
  
  // Match configuration
  bestOf?: number
  bracket?: 'winners' | 'losers' | 'grand-finals'
  
  // If active/finished
  competitionId?: string
  winner?: string
  winnerId?: string
  scores?: {
    player1Games: number
    player2Games: number
    games: MatchGame[]
  }
  
  scheduledTime?: string
  startTime?: string
  endTime?: string
  completedAt?: string
  createdAt?: string
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

// 🆕 SENSITIVITY FINDER SYSTEM TYPES
export type SensitivityTestType = 'flick' | 'tracking' | 'target-switching' | 'micro-correction'
export type SupportedGame = 'valorant' | 'cs2' | 'apex' | 'fortnite' | 'overwatch2' | 'cod' | 'rainbow6'
export type PlayStyle = 'flick-heavy' | 'tracking-heavy' | 'hybrid'

export interface SensitivityTestConfig {
  testType: SensitivityTestType
  duration: number // seconds
  targetCount: number
  targetSize: number // 0.5 - 2.0 multiplier
  targetSpeed?: number // for tracking/moving targets
  difficulty: Difficulty
  spawnPattern: 'random' | 'circular' | 'grid' | 'spiral'
}

export interface SensitivityTestResult {
  id: string
  testType: SensitivityTestType
  userId: string
  config: SensitivityTestConfig
  
  // Performance Metrics
  accuracy: number // 0-100%
  averageTimeToHit: number // milliseconds
  totalHits: number
  totalMisses: number
  
  // Advanced Metrics
  flickOvershoot: number // average overshoot distance
  flickUndershoot: number // average undershoot distance
  trackingStability: number // 0-100, lower is more stable
  correctionEfficiency: number // 0-100, higher is better
  reactionConsistency: number // standard deviation of reaction times
  
  // Raw Data
  hitPositions: Array<{x: number, y: number, time: number}>
  mouseTrajectory: Array<{x: number, y: number, timestamp: number}>
  targetSequence: Array<{
    id: string
    spawnTime: number
    hitTime?: number
    position: {x: number, y: number}
    wasHit: boolean
  }>
  
  // Test Environment
  currentSensitivity: number
  currentDPI: number
  testedAt: string
  sessionDuration: number
}

export interface SensitivityRecommendation {
  playStyle: PlayStyle
  recommendedSensitivity: number
  confidenceScore: number // 0-100%
  reasoning: string[]
  
  // Game-specific recommendations
  gameRecommendations: {
    [key in SupportedGame]?: {
      sensitivity: number
      effectiveDPI: number
      cm360: number // centimeters for 360° turn
    }
  }
  
  // Performance predictions
  expectedImprovement: {
    accuracy: number // % improvement expected
    consistency: number
    reactionTime: number
  }
}

export interface GameSensitivityConfig {
  id: SupportedGame
  name: string
  displayName: string
  
  // Sensitivity calculation parameters
  sensitivityScale: number // base sensitivity multiplier
  fovHorizontal: number // default horizontal FOV
  fovVertical: number // default vertical FOV
  
  // Conversion factors
  yawMultiplier: number // for horizontal sensitivity
  pitchMultiplier?: number // for vertical sensitivity (if different)
  
  // Game-specific settings
  hasVerticalSensitivity: boolean
  supportsDPIScaling: boolean
  minSensitivity: number
  maxSensitivity: number
  
  // Common DPI values for this game
  commonDPIValues: number[]
  commonSensitivities: number[]
}

export interface UserSensitivityProfile {
  userId: string
  
  // Current Setup
  primaryGame: SupportedGame
  currentSensitivity: number
  currentDPI: number
  mouseModel?: string
  monitorSize?: number // inches
  
  // Test History
  testResults: SensitivityTestResult[]
  recommendations: SensitivityRecommendation[]
  
  // Performance Tracking
  performanceHistory: Array<{
    date: string
    averageAccuracy: number
    averageReactionTime: number
    consistencyScore: number
    recommendedSensitivity: number
  }>
  
  // Preferences
  preferredPlayStyle: PlayStyle
  testPreferences: {
    defaultDuration: number
    preferredDifficulty: Difficulty
    autoStartTests: boolean
    showRealTimeStats: boolean
  }
  
  createdAt: string
  updatedAt: string
}

export interface SensitivityConversion {
  fromGame: SupportedGame
  toGame: SupportedGame
  fromSensitivity: number
  toSensitivity: number
  fromDPI: number
  toDPI: number
  
  // Calculation details
  fromCm360: number // cm for 360° turn
  toCm360: number
  effectiveDPIFrom: number
  effectiveDPITo: number
  
  // Conversion accuracy
  conversionAccuracy: 'exact' | 'approximate' | 'estimated'
  notes?: string[]
}

export interface SensitivityFinderState {
  // Current Test State
  isTestActive: boolean
  currentTest: SensitivityTestConfig | null
  testProgress: {
    completedTests: number
    totalTests: number
    currentTestProgress: number // 0-100%
  }
  
  // Test Results
  currentSession: {
    results: SensitivityTestResult[]
    startTime: string
    recommendation?: SensitivityRecommendation
  }
  
  // User Profile
  userProfile: UserSensitivityProfile | null
  
  // Settings
  testSettings: {
    selectedTests: SensitivityTestType[]
    difficulty: Difficulty
    customConfig: Partial<SensitivityTestConfig>
  }
  
  // Game Conversion
  conversionSettings: {
    sourceGame: SupportedGame
    targetGames: SupportedGame[]
    sourceSensitivity: number
    sourceDPI: number
  }
  
  // UI State
  activePanel: 'tests' | 'results' | 'conversion' | 'history' | 'settings'
  isLoading: boolean
  error: string | null
}

// Analytics & Visualization Types
export interface MouseHeatmapData {
  points: Array<{
    x: number
    y: number
    intensity: number // 0-1, how much time spent at this point
    accuracy: number // hit accuracy at this position
  }>
  bounds: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  }
}

export interface PerformanceChart {
  type: 'accuracy' | 'reaction-time' | 'consistency' | 'improvement'
  data: Array<{
    x: number | string
    y: number
    label?: string
    color?: string
  }>
  title: string
  xAxisLabel: string
  yAxisLabel: string
}

export interface SensitivityAnalytics {
  userId: string
  
  // Overall Performance
  overallStats: {
    totalTests: number
    averageAccuracy: number
    averageReactionTime: number
    mostImprovedMetric: string
    weakestArea: SensitivityTestType
    strongestArea: SensitivityTestType
  }
  
  // Per-test Analytics
  testAnalytics: {
    [key in SensitivityTestType]: {
      averageAccuracy: number
      averageReactionTime: number
      improvementTrend: number // -1 to 1, negative is declining
      lastTested: string
      bestScore: number
    }
  }
  
  // Visualization Data
  heatmapData: MouseHeatmapData
  performanceCharts: PerformanceChart[]
  
  // Recommendations
  improvementSuggestions: string[]
  nextRecommendedTest: SensitivityTestType
  
  generatedAt: string
} 

export interface PartySpectator {
  userId: string
  username: string
  joinedAt: string
  isOnline: boolean
  cameraMode: 'free' | 'follow-player' | 'overview'
  followingPlayerId?: string
}

export interface SpectatorSession {
  id: string
  partyId: string
  spectators: PartySpectator[]
  createdAt: string
  settings: {
    allowSpectators: boolean
    maxSpectators: number
    spectatorChat: boolean
    spectatorDelay: number // in seconds
  }
}

export interface SpectatorGameUpdate {
  type: 'player-hit' | 'player-miss' | 'target-spawn' | 'target-destroy' | 'score-update' | 'player-position'
  playerId: string
  data: any
  timestamp: number
}

export interface SpectatorCameraUpdate {
  spectatorId: string
  cameraMode: 'free' | 'follow-player' | 'overview'
  followingPlayerId?: string
  position?: [number, number, number]
  rotation?: [number, number, number]
} 

export interface PartyTeam {
  id: string
  name: string
  color: string
  leaderId: string
  memberIds: string[]
  score: number
  objectives: TeamObjective[]
  createdAt: string
}

export interface TeamObjective {
  id: string
  type: 'elimination' | 'accuracy' | 'time-trial' | 'survival' | 'capture-targets' | 'relay'
  name: string
  description: string
  target: number
  progress: number
  isCompleted: boolean
  reward: {
    xp: number
    points: number
  }
  timeLimit?: number // in seconds
  startedAt?: string
  completedAt?: string
}

export interface TeamChallenge {
  id: string
  partyId: string
  type: 'team-vs-team' | 'team-objectives' | 'team-relay' | 'team-survival'
  name: string
  description: string
  teams: PartyTeam[]
  objectives: TeamObjective[]
  settings: {
    maxTeams: number
    minPlayersPerTeam: number
    maxPlayersPerTeam: number
    duration: number // in seconds
    gameMode: string
    difficulty: string
    allowTeamSwitching: boolean
    autoBalance: boolean
  }
  status: 'setup' | 'countdown' | 'active' | 'completed' | 'cancelled'
  startTime?: string
  endTime?: string
  winnerId?: string // team id
  results?: TeamChallengeResult[]
  createdAt: string
}

export interface TeamChallengeResult {
  teamId: string
  teamName: string
  finalScore: number
  objectivesCompleted: number
  totalObjectives: number
  members: Array<{
    userId: string
    username: string
    individualScore: number
    accuracy: number
    hits: number
    misses: number
    averageReactionTime: number
  }>
  placement: number // 1st, 2nd, 3rd place
  rewards: {
    xp: number
    points: number
    achievements?: string[]
  }
}

export interface TeamFormation {
  method: 'manual' | 'random' | 'skill-based' | 'captain-pick'
  captains?: string[] // user ids
  teams: Array<{
    name: string
    color: string
    memberIds: string[]
  }>
}

export interface TeamChatMessage {
  id: string
  teamId: string
  userId: string
  username: string
  message: string
  timestamp: string
  type: 'team' | 'system'
}

export interface TeamUpdateEvent {
  type: 'team-formed' | 'member-added' | 'member-removed' | 'objective-completed' | 'score-updated' | 'challenge-completed'
  teamId: string
  data: any
  timestamp: string
}

// 🆕 SKILL DIVISION SYSTEM TYPES
export type DivisionTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master'

export interface Division {
  tier: DivisionTier
  name: string
  description: string
  icon: string
  color: string
  gradientColor: string
  minMMR: number
  maxMMR: number
  promotionRequirement: {
    winsRequired: number
    streakRequired?: number
    minAccuracy?: number
  }
  demotionThreshold: {
    maxLosses: number
    streak?: number
  }
  rewards: {
    seasonEndRewards: {
      xp: number
      points: number
      cosmetics?: string[]
      titles?: string[]
    }
    monthlyRewards: {
      xp: number
      points: number
    }
  }
  privileges: {
    exclusiveTournaments: boolean
    priorityMatchmaking: boolean
    customCosmetics: boolean
    advancedAnalytics: boolean
  }
}

export interface UserDivisionStatus {
  userId: string
  currentDivision: DivisionTier
  currentMMR: number
  divisionMMR: number // MMR within current division (0-100)
  promotionProgress: {
    winsNeeded: number
    currentWins: number
    currentStreak: number
    isInPromotion: boolean
  }
  demotionShield: {
    isActive: boolean
    gamesRemaining: number
  }
  seasonStats: {
    highestDivision: DivisionTier
    gamesPlayed: number
    winRate: number
    averageAccuracy: number
    averageReactionTime: number
    currentStreak: number
    longestWinStreak: number
    longestLossStreak: number
  }
  history: DivisionHistoryEntry[]
  lastUpdated: string
}

export interface DivisionHistoryEntry {
  id: string
  fromDivision: DivisionTier
  toDivision: DivisionTier
  type: 'promotion' | 'demotion' | 'season-reset'
  reason: string
  mmrChange: number
  timestamp: string
  gameMode: GameMode
}

export interface DivisionMatchmaking {
  divisionTier: DivisionTier
  gameMode: GameMode
  mmrRange: {
    min: number
    max: number
  }
  searchPreferences: {
    allowCrossDivision: boolean
    maxMMRDifference: number
    prioritizeSimilarSkill: boolean
  }
}

export interface DivisionLeaderboard {
  divisionTier: DivisionTier
  gameMode: GameMode
  season: string
  entries: DivisionLeaderboardEntry[]
  lastUpdated: string
}

export interface DivisionLeaderboardEntry {
  rank: number
  userId: string
  username: string
  mmr: number
  gamesPlayed: number
  winRate: number
  averageAccuracy: number
  averageReactionTime: number
  currentStreak: number
  isPromotion: boolean
  isDemotion: boolean
}

export interface SkillAssessment {
  userId: string
  gameMode: GameMode
  overallSkillRating: number
  skillBreakdown: {
    accuracy: number
    speed: number
    consistency: number
    clutchPerformance: number
    improvement: number
  }
  performanceFactors: {
    recentWinRate: number
    averageScore: number
    averageAccuracy: number
    averageReactionTime: number
    streakBonus: number
    opponentQuality: number
  }
  recommendedDivision: DivisionTier
  confidence: number // 0-100, how confident the system is
  lastAssessed: string
}

export interface DivisionTournament extends Tournament {
  divisionRestriction: DivisionTier[]
  minMMRRequirement?: number
  maxMMRRequirement?: number
  isRanked: boolean
  mmrRewards: {
    winner: number
    runnerUp: number
    semifinalist: number
    quarterfinalist: number
  }
}

export interface SeasonReset {
  seasonId: string
  resetDate: string
  resetType: 'soft' | 'hard'
  mmrAdjustment: {
    reductionPercentage: number
    minimumMMR: number
    divisionCap: DivisionTier
  }
  compensationRewards: {
    xp: number
    points: number
    placementMatches: number
  }
}

// Division Store State
export interface DivisionState {
  currentDivision: UserDivisionStatus | null
  allDivisions: Division[]
  divisionLeaderboards: Record<DivisionTier, DivisionLeaderboard>
  skillAssessment: SkillAssessment | null
  isInPlacementMatches: boolean
  placementMatchesRemaining: number
  seasonInfo: {
    currentSeason: string
    seasonEndDate: string
    nextResetDate: string
  }
} 