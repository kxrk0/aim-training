export interface User {
    id: string;
    email: string;
    username: string;
    level: number;
    totalScore: number;
    totalShots: number;
    totalHits: number;
    hoursPlayed: number;
    createdAt: string;
    updatedAt: string;
}
export interface UserProfile extends User {
    accuracy: number;
    averageReactionTime: number;
    gamesPlayed: number;
    bestScores: {
        precision: number;
        speed: number;
        tracking: number;
        flick: number;
    };
}
export type GameMode = 'precision' | 'speed' | 'tracking' | 'flick';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type TargetSize = 'small' | 'medium' | 'large';
export interface GameSettings {
    gameMode: GameMode;
    difficulty: Difficulty;
    duration: number;
    targetSize: TargetSize;
    spawnRate: number;
}
export interface GameSession {
    id: string;
    userId: string;
    gameMode: GameMode;
    startTime: string;
    endTime?: string;
    duration?: number;
    settings: GameSettings;
    finalScore?: number;
    accuracy?: number;
    averageReactionTime?: number;
    totalHits: number;
    totalMisses: number;
    bestStreak: number;
}
export interface Target {
    id: string;
    position: [number, number, number];
    size: number;
    spawnTime: number;
    lifetime: number;
    isHit: boolean;
}
export interface Score {
    id: string;
    userId: string;
    gameSessionId: string;
    gameMode: GameMode;
    score: number;
    accuracy: number;
    reactionTime: number;
    hits: number;
    misses: number;
    streak: number;
    difficulty: Difficulty;
    createdAt: string;
}
export interface PerformanceMetrics {
    accuracy: number;
    averageReactionTime: number;
    shotsPerMinute: number;
    consistencyScore: number;
    improvementTrend: number;
}
export interface HitResult {
    targetId: string;
    position: [number, number, number];
    reactionTime: number;
    accuracy: number;
    timestamp: number;
}
export interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    score: number;
    accuracy: number;
    gameMode: GameMode;
    createdAt: string;
}
export interface Leaderboard {
    gameMode: GameMode;
    period: 'daily' | 'weekly' | 'monthly' | 'all-time';
    entries: LeaderboardEntry[];
    total: number;
    page: number;
    limit: number;
}
export interface Achievement {
    id: string;
    name: string;
    description: string;
    category: 'accuracy' | 'speed' | 'consistency' | 'milestone';
    icon?: string;
    points: number;
    requiredValue?: number;
    requiredCount?: number;
    gameMode?: GameMode;
}
export interface UserAchievement {
    id: string;
    userId: string;
    achievementId: string;
    achievement: Achievement;
    unlockedAt: string;
    progress: number;
}
export type PartyRole = 'leader' | 'member';
export type PartyStatus = 'waiting' | 'in-game' | 'finished';
export type PartyGameMode = 'co-op' | 'synchronized' | 'relay' | 'competition';
export interface PartyMember {
    userId: string;
    username: string;
    role: PartyRole;
    joinedAt: string;
    isReady: boolean;
    isOnline: boolean;
    currentScore?: number;
    performance?: {
        hits: number;
        misses: number;
        accuracy: number;
        reactionTime: number;
    };
}
export interface Party {
    id: string;
    name: string;
    leaderId: string;
    members: PartyMember[];
    maxMembers: number;
    isPrivate: boolean;
    inviteCode?: string;
    status: PartyStatus;
    gameSettings?: PartyGameSettings;
    createdAt: string;
    currentGame?: PartyGameSession;
}
export interface PartyGameSettings {
    gameMode: GameMode;
    partyMode: PartyGameMode;
    difficulty: Difficulty;
    duration: number;
    maxPlayers: number;
    allowSpectators: boolean;
    customRules?: {
        targetSharing: boolean;
        scoreSharing: boolean;
        realTimeSync: boolean;
    };
}
export interface PartyGameSession {
    id: string;
    partyId: string;
    gameSettings: PartyGameSettings;
    startTime: string;
    endTime?: string;
    participants: PartyParticipant[];
    currentTargets: PartyTarget[];
    leaderboard: PartyLeaderboard[];
    status: 'countdown' | 'active' | 'paused' | 'finished';
}
export interface PartyParticipant {
    userId: string;
    username: string;
    score: number;
    hits: number;
    misses: number;
    accuracy: number;
    averageReactionTime: number;
    currentStreak: number;
    position: number;
    isReady: boolean;
}
export interface PartyTarget {
    id: string;
    position: [number, number, number];
    size: number;
    spawnTime: number;
    assignedTo?: string;
    hitBy?: string;
    isActive: boolean;
}
export interface PartyLeaderboard {
    userId: string;
    username: string;
    score: number;
    accuracy: number;
    hits: number;
    misses: number;
    position: number;
}
export type CompetitionStatus = 'waiting' | 'countdown' | 'active' | 'finished';
export type CompetitionResult = 'victory' | 'defeat' | 'draw';
export interface Competition {
    id: string;
    player1: CompetitionPlayer;
    player2: CompetitionPlayer;
    gameSettings: GameSettings;
    status: CompetitionStatus;
    startTime?: string;
    endTime?: string;
    winner?: string;
    result?: CompetitionResults;
}
export interface CompetitionPlayer {
    userId: string;
    username: string;
    eloRating: number;
    score: number;
    hits: number;
    misses: number;
    accuracy: number;
    averageReactionTime: number;
    isReady: boolean;
}
export interface CompetitionResults {
    winner: string;
    player1Result: CompetitionPlayerResult;
    player2Result: CompetitionPlayerResult;
    eloChanges: {
        player1Delta: number;
        player2Delta: number;
    };
}
export interface CompetitionPlayerResult {
    userId: string;
    finalScore: number;
    accuracy: number;
    hits: number;
    misses: number;
    averageReactionTime: number;
    result: CompetitionResult;
}
export type TournamentFormat = 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss';
export type TournamentStatus = 'registration' | 'starting' | 'active' | 'finished' | 'cancelled';
export type BracketMatchStatus = 'pending' | 'active' | 'finished' | 'waiting';
export interface Tournament {
    id: string;
    name: string;
    description: string;
    gameMode: GameMode;
    format: TournamentFormat;
    status: TournamentStatus;
    maxParticipants: number;
    entryFee?: number;
    prizePool?: number;
    registrationStart: string;
    registrationEnd: string;
    tournamentStart: string;
    estimatedEnd?: string;
    gameSettings: GameSettings;
    bracketSettings: {
        bestOf: number;
        seedingMethod: 'random' | 'elo' | 'manual';
        allowLateRegistration: boolean;
    };
    participants: TournamentParticipant[];
    brackets: TournamentBracket[];
    currentRound: number;
    totalRounds: number;
    winner?: string;
    finalStandings?: TournamentStanding[];
    createdAt: string;
    updatedAt: string;
}
export interface TournamentParticipant {
    userId: string;
    username: string;
    eloRating: number;
    seed: number;
    registeredAt: string;
    isActive: boolean;
    currentMatch?: string;
    wins: number;
    losses: number;
    isEliminated: boolean;
}
export interface TournamentBracket {
    id: string;
    tournamentId: string;
    round: number;
    position: number;
    match: BracketMatch;
}
export interface BracketMatch {
    id: string;
    tournamentId?: string;
    round: number;
    position: number;
    player1?: TournamentParticipant;
    player2?: TournamentParticipant;
    participant1Id?: string;
    participant2Id?: string;
    status: BracketMatchStatus;
    bestOf?: number;
    bracket?: 'winners' | 'losers' | 'grand-finals';
    competitionId?: string;
    winner?: string;
    winnerId?: string;
    scores?: {
        player1Games: number;
        player2Games: number;
        games: MatchGame[];
    };
    scheduledTime?: string;
    startTime?: string;
    endTime?: string;
    completedAt?: string;
    createdAt?: string;
}
export interface MatchGame {
    gameNumber: number;
    player1Score: number;
    player2Score: number;
    winner: string;
    duration: number;
    competitionId: string;
}
export interface TournamentStanding {
    position: number;
    userId: string;
    username: string;
    wins: number;
    losses: number;
    totalScore: number;
    averageAccuracy: number;
    prize?: number;
}
export interface TournamentUpdate {
    type: 'registration' | 'match-start' | 'match-end' | 'elimination' | 'round-advance' | 'tournament-end';
    tournamentId: string;
    data: any;
    timestamp: number;
}
export interface ApiResponse<T = any> {
    message: string;
    data?: T;
    error?: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T> {
    total: number;
    page: number;
    limit: number;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
}
export interface AuthResponse {
    user: User;
    token: string;
    refreshToken?: string;
}
export interface SocketEvents {
    'party:create': (data: {
        name: string;
        maxMembers: number;
        isPrivate: boolean;
    }) => void;
    'party:join': (data: {
        partyId: string;
        inviteCode?: string;
    }) => void;
    'party:leave': () => void;
    'party:kick': (data: {
        userId: string;
    }) => void;
    'party:promote': (data: {
        userId: string;
    }) => void;
    'party:ready': (data: {
        isReady: boolean;
    }) => void;
    'party:start-game': (gameSettings: PartyGameSettings) => void;
    'party:game-update': (data: PartyGameUpdate) => void;
    'competition:find-match': (gameMode: GameMode) => void;
    'competition:accept-match': (competitionId: string) => void;
    'competition:ready': (isReady: boolean) => void;
    'competition:game-update': (data: CompetitionGameUpdate) => void;
    'tournament:register': (tournamentId: string) => void;
    'tournament:unregister': (tournamentId: string) => void;
    'tournament:spectate': (tournamentId: string) => void;
    'tournament:ready': (tournamentId: string, isReady: boolean) => void;
    'user:online': () => void;
    'user:offline': () => void;
    'chat:message': (data: ChatMessage) => void;
}
export interface SocketListeners {
    'party:updated': (party: Party) => void;
    'party:member-joined': (member: PartyMember) => void;
    'party:member-left': (userId: string) => void;
    'party:game-started': (gameSession: PartyGameSession) => void;
    'party:game-update': (update: PartyGameUpdate) => void;
    'party:game-ended': (results: PartyGameResults) => void;
    'competition:match-found': (competition: Competition) => void;
    'competition:opponent-ready': (isReady: boolean) => void;
    'competition:game-started': (competition: Competition) => void;
    'competition:game-update': (update: CompetitionGameUpdate) => void;
    'competition:game-ended': (results: CompetitionResults) => void;
    'tournament:updated': (tournament: Tournament) => void;
    'tournament:registered': (tournamentId: string) => void;
    'tournament:match-ready': (match: BracketMatch) => void;
    'tournament:match-started': (match: BracketMatch) => void;
    'tournament:match-ended': (results: any) => void;
    'tournament:eliminated': (tournamentId: string) => void;
    'tournament:winner': (tournament: Tournament) => void;
    'user:status-changed': (data: {
        userId: string;
        isOnline: boolean;
    }) => void;
    'chat:new-message': (message: ChatMessage) => void;
    'error': (error: SocketError) => void;
}
export interface PartyGameUpdate {
    type: 'target-spawn' | 'target-hit' | 'score-update' | 'player-update';
    data: any;
    timestamp: number;
}
export interface CompetitionGameUpdate {
    type: 'target-spawn' | 'target-hit' | 'score-update' | 'countdown';
    player: 'player1' | 'player2';
    data: any;
    timestamp: number;
}
export interface PartyGameResults {
    partyId: string;
    gameSessionId: string;
    finalLeaderboard: PartyLeaderboard[];
    mvp: string;
    statistics: {
        totalTargets: number;
        totalHits: number;
        averageAccuracy: number;
        bestPlayer: string;
    };
}
export interface ChatMessage {
    id: string;
    userId: string;
    username: string;
    message: string;
    timestamp: string;
    type: 'text' | 'system' | 'achievement';
}
export interface GameUpdateData {
    gameId: string;
    type: 'targetSpawn' | 'targetHit' | 'targetMiss' | 'gameEnd';
    payload: any;
    timestamp: number;
}
export interface SocketError {
    message: string;
    code?: string;
}
export interface GameState {
    isActive: boolean;
    isPaused: boolean;
    gameMode: GameMode | null;
    settings: GameSettings | null;
    currentScore: number;
    targets: Target[];
    timeLeft: number;
    stats: {
        hits: number;
        misses: number;
        accuracy: number;
        averageReactionTime: number;
        currentStreak: number;
        bestStreak: number;
    };
}
export interface PartyState {
    currentParty: Party | null;
    isInParty: boolean;
    partyMembers: PartyMember[];
    currentGame: PartyGameSession | null;
    isGameActive: boolean;
    inviteCode: string | null;
    partyChat: ChatMessage[];
    isConnected: boolean;
}
export interface CompetitionState {
    currentMatch: Competition | null;
    isInCompetition: boolean;
    isSearching: boolean;
    searchStartTime: number | null;
    estimatedWaitTime: number;
    opponentFound: boolean;
}
export interface TournamentState {
    availableTournaments: Tournament[];
    registeredTournaments: Tournament[];
    activeTournament: Tournament | null;
    currentMatch: BracketMatch | null;
    isInTournament: boolean;
    isSpectating: boolean;
    spectatingTournament: Tournament | null;
}
export interface AppSettings {
    mouseSensitivity: number;
    crosshairColor: string;
    soundEnabled: boolean;
    defaultDifficulty: Difficulty;
    enablePerformanceMonitoring: boolean;
    partySettings: {
        autoReady: boolean;
        showPartyChat: boolean;
        allowInvites: boolean;
        preferredGameMode: GameMode;
    };
    tournamentSettings: {
        autoRegister: boolean;
        preferredFormat: TournamentFormat;
        notifications: boolean;
    };
}
export type SensitivityTestType = 'flick' | 'tracking' | 'target-switching' | 'micro-correction';
export type SupportedGame = 'valorant' | 'cs2' | 'apex' | 'fortnite' | 'overwatch2' | 'cod' | 'rainbow6';
export type PlayStyle = 'flick-heavy' | 'tracking-heavy' | 'hybrid';
export interface SensitivityTestConfig {
    testType: SensitivityTestType;
    duration: number;
    targetCount: number;
    targetSize: number;
    targetSpeed?: number;
    difficulty: Difficulty;
    spawnPattern: 'random' | 'circular' | 'grid' | 'spiral';
}
export interface SensitivityTestResult {
    id: string;
    testType: SensitivityTestType;
    userId: string;
    config: SensitivityTestConfig;
    accuracy: number;
    averageTimeToHit: number;
    totalHits: number;
    totalMisses: number;
    flickOvershoot: number;
    flickUndershoot: number;
    trackingStability: number;
    correctionEfficiency: number;
    reactionConsistency: number;
    hitPositions: Array<{
        x: number;
        y: number;
        time: number;
    }>;
    mouseTrajectory: Array<{
        x: number;
        y: number;
        timestamp: number;
    }>;
    targetSequence: Array<{
        id: string;
        spawnTime: number;
        hitTime?: number;
        position: {
            x: number;
            y: number;
        };
        wasHit: boolean;
    }>;
    currentSensitivity: number;
    currentDPI: number;
    testedAt: string;
    sessionDuration: number;
}
export interface SensitivityRecommendation {
    playStyle: PlayStyle;
    recommendedSensitivity: number;
    confidenceScore: number;
    reasoning: string[];
    gameRecommendations: {
        [key in SupportedGame]?: {
            sensitivity: number;
            effectiveDPI: number;
            cm360: number;
        };
    };
    expectedImprovement: {
        accuracy: number;
        consistency: number;
        reactionTime: number;
    };
}
export interface GameSensitivityConfig {
    id: SupportedGame;
    name: string;
    displayName: string;
    sensitivityScale: number;
    fovHorizontal: number;
    fovVertical: number;
    yawMultiplier: number;
    pitchMultiplier?: number;
    hasVerticalSensitivity: boolean;
    supportsDPIScaling: boolean;
    minSensitivity: number;
    maxSensitivity: number;
    commonDPIValues: number[];
    commonSensitivities: number[];
}
export interface UserSensitivityProfile {
    userId: string;
    primaryGame: SupportedGame;
    currentSensitivity: number;
    currentDPI: number;
    mouseModel?: string;
    monitorSize?: number;
    testResults: SensitivityTestResult[];
    recommendations: SensitivityRecommendation[];
    performanceHistory: Array<{
        date: string;
        averageAccuracy: number;
        averageReactionTime: number;
        consistencyScore: number;
        recommendedSensitivity: number;
    }>;
    preferredPlayStyle: PlayStyle;
    testPreferences: {
        defaultDuration: number;
        preferredDifficulty: Difficulty;
        autoStartTests: boolean;
        showRealTimeStats: boolean;
    };
    createdAt: string;
    updatedAt: string;
}
export interface SensitivityConversion {
    fromGame: SupportedGame;
    toGame: SupportedGame;
    fromSensitivity: number;
    toSensitivity: number;
    fromDPI: number;
    toDPI: number;
    fromCm360: number;
    toCm360: number;
    effectiveDPIFrom: number;
    effectiveDPITo: number;
    conversionAccuracy: 'exact' | 'approximate' | 'estimated';
    notes?: string[];
}
export interface SensitivityFinderState {
    isTestActive: boolean;
    currentTest: SensitivityTestConfig | null;
    testProgress: {
        completedTests: number;
        totalTests: number;
        currentTestProgress: number;
    };
    currentSession: {
        results: SensitivityTestResult[];
        startTime: string;
        recommendation?: SensitivityRecommendation;
    };
    userProfile: UserSensitivityProfile | null;
    testSettings: {
        selectedTests: SensitivityTestType[];
        difficulty: Difficulty;
        customConfig: Partial<SensitivityTestConfig>;
    };
    conversionSettings: {
        sourceGame: SupportedGame;
        targetGames: SupportedGame[];
        sourceSensitivity: number;
        sourceDPI: number;
    };
    activePanel: 'tests' | 'results' | 'conversion' | 'history' | 'settings';
    isLoading: boolean;
    error: string | null;
}
export interface MouseHeatmapData {
    points: Array<{
        x: number;
        y: number;
        intensity: number;
        accuracy: number;
    }>;
    bounds: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
}
export interface PerformanceChart {
    type: 'accuracy' | 'reaction-time' | 'consistency' | 'improvement';
    data: Array<{
        x: number | string;
        y: number;
        label?: string;
        color?: string;
    }>;
    title: string;
    xAxisLabel: string;
    yAxisLabel: string;
}
export interface SensitivityAnalytics {
    userId: string;
    overallStats: {
        totalTests: number;
        averageAccuracy: number;
        averageReactionTime: number;
        mostImprovedMetric: string;
        weakestArea: SensitivityTestType;
        strongestArea: SensitivityTestType;
    };
    testAnalytics: {
        [key in SensitivityTestType]: {
            averageAccuracy: number;
            averageReactionTime: number;
            improvementTrend: number;
            lastTested: string;
            bestScore: number;
        };
    };
    heatmapData: MouseHeatmapData;
    performanceCharts: PerformanceChart[];
    improvementSuggestions: string[];
    nextRecommendedTest: SensitivityTestType;
    generatedAt: string;
}
export interface PartySpectator {
    userId: string;
    username: string;
    joinedAt: string;
    isOnline: boolean;
    cameraMode: 'free' | 'follow-player' | 'overview';
    followingPlayerId?: string;
}
export interface SpectatorSession {
    id: string;
    partyId: string;
    spectators: PartySpectator[];
    createdAt: string;
    settings: {
        allowSpectators: boolean;
        maxSpectators: number;
        spectatorChat: boolean;
        spectatorDelay: number;
    };
}
export interface SpectatorGameUpdate {
    type: 'player-hit' | 'player-miss' | 'target-spawn' | 'target-destroy' | 'score-update' | 'player-position';
    playerId: string;
    data: any;
    timestamp: number;
}
export interface SpectatorCameraUpdate {
    spectatorId: string;
    cameraMode: 'free' | 'follow-player' | 'overview';
    followingPlayerId?: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
}
export interface PartyTeam {
    id: string;
    name: string;
    color: string;
    leaderId: string;
    memberIds: string[];
    score: number;
    objectives: TeamObjective[];
    createdAt: string;
}
export interface TeamObjective {
    id: string;
    type: 'elimination' | 'accuracy' | 'time-trial' | 'survival' | 'capture-targets' | 'relay';
    name: string;
    description: string;
    target: number;
    progress: number;
    isCompleted: boolean;
    reward: {
        xp: number;
        points: number;
    };
    timeLimit?: number;
    startedAt?: string;
    completedAt?: string;
}
export interface TeamChallenge {
    id: string;
    partyId: string;
    type: 'team-vs-team' | 'team-objectives' | 'team-relay' | 'team-survival';
    name: string;
    description: string;
    teams: PartyTeam[];
    objectives: TeamObjective[];
    settings: {
        maxTeams: number;
        minPlayersPerTeam: number;
        maxPlayersPerTeam: number;
        duration: number;
        gameMode: string;
        difficulty: string;
        allowTeamSwitching: boolean;
        autoBalance: boolean;
    };
    status: 'setup' | 'countdown' | 'active' | 'completed' | 'cancelled';
    startTime?: string;
    endTime?: string;
    winnerId?: string;
    results?: TeamChallengeResult[];
    createdAt: string;
}
export interface TeamChallengeResult {
    teamId: string;
    teamName: string;
    finalScore: number;
    objectivesCompleted: number;
    totalObjectives: number;
    members: Array<{
        userId: string;
        username: string;
        individualScore: number;
        accuracy: number;
        hits: number;
        misses: number;
        averageReactionTime: number;
    }>;
    placement: number;
    rewards: {
        xp: number;
        points: number;
        achievements?: string[];
    };
}
export interface TeamFormation {
    method: 'manual' | 'random' | 'skill-based' | 'captain-pick';
    captains?: string[];
    teams: Array<{
        name: string;
        color: string;
        memberIds: string[];
    }>;
}
export interface TeamChatMessage {
    id: string;
    teamId: string;
    userId: string;
    username: string;
    message: string;
    timestamp: string;
    type: 'team' | 'system';
}
export interface TeamUpdateEvent {
    type: 'team-formed' | 'member-added' | 'member-removed' | 'objective-completed' | 'score-updated' | 'challenge-completed';
    teamId: string;
    data: any;
    timestamp: string;
}
export type DivisionTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';
export interface Division {
    tier: DivisionTier;
    name: string;
    description: string;
    icon: string;
    color: string;
    gradientColor: string;
    minMMR: number;
    maxMMR: number;
    promotionRequirement: {
        winsRequired: number;
        streakRequired?: number;
        minAccuracy?: number;
    };
    demotionThreshold: {
        maxLosses: number;
        streak?: number;
    };
    rewards: {
        seasonEndRewards: {
            xp: number;
            points: number;
            cosmetics?: string[];
            titles?: string[];
        };
        monthlyRewards: {
            xp: number;
            points: number;
        };
    };
    privileges: {
        exclusiveTournaments: boolean;
        priorityMatchmaking: boolean;
        customCosmetics: boolean;
        advancedAnalytics: boolean;
    };
}
export interface UserDivisionStatus {
    userId: string;
    currentDivision: DivisionTier;
    currentMMR: number;
    divisionMMR: number;
    promotionProgress: {
        winsNeeded: number;
        currentWins: number;
        currentStreak: number;
        isInPromotion: boolean;
    };
    demotionShield: {
        isActive: boolean;
        gamesRemaining: number;
    };
    seasonStats: {
        highestDivision: DivisionTier;
        gamesPlayed: number;
        winRate: number;
        averageAccuracy: number;
        averageReactionTime: number;
        currentStreak: number;
        longestWinStreak: number;
        longestLossStreak: number;
    };
    history: DivisionHistoryEntry[];
    lastUpdated: string;
}
export interface DivisionHistoryEntry {
    id: string;
    fromDivision: DivisionTier;
    toDivision: DivisionTier;
    type: 'promotion' | 'demotion' | 'season-reset';
    reason: string;
    mmrChange: number;
    timestamp: string;
    gameMode: GameMode;
}
export interface DivisionMatchmaking {
    divisionTier: DivisionTier;
    gameMode: GameMode;
    mmrRange: {
        min: number;
        max: number;
    };
    searchPreferences: {
        allowCrossDivision: boolean;
        maxMMRDifference: number;
        prioritizeSimilarSkill: boolean;
    };
}
export interface DivisionLeaderboard {
    divisionTier: DivisionTier;
    gameMode: GameMode;
    season: string;
    entries: DivisionLeaderboardEntry[];
    lastUpdated: string;
}
export interface DivisionLeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    mmr: number;
    gamesPlayed: number;
    winRate: number;
    averageAccuracy: number;
    averageReactionTime: number;
    currentStreak: number;
    isPromotion: boolean;
    isDemotion: boolean;
}
export interface SkillAssessment {
    userId: string;
    gameMode: GameMode;
    overallSkillRating: number;
    skillBreakdown: {
        accuracy: number;
        speed: number;
        consistency: number;
        clutchPerformance: number;
        improvement: number;
    };
    performanceFactors: {
        recentWinRate: number;
        averageScore: number;
        averageAccuracy: number;
        averageReactionTime: number;
        streakBonus: number;
        opponentQuality: number;
    };
    recommendedDivision: DivisionTier;
    confidence: number;
    lastAssessed: string;
}
export interface DivisionTournament extends Tournament {
    divisionRestriction: DivisionTier[];
    minMMRRequirement?: number;
    maxMMRRequirement?: number;
    isRanked: boolean;
    mmrRewards: {
        winner: number;
        runnerUp: number;
        semifinalist: number;
        quarterfinalist: number;
    };
}
export interface SeasonReset {
    seasonId: string;
    resetDate: string;
    resetType: 'soft' | 'hard';
    mmrAdjustment: {
        reductionPercentage: number;
        minimumMMR: number;
        divisionCap: DivisionTier;
    };
    compensationRewards: {
        xp: number;
        points: number;
        placementMatches: number;
    };
}
export interface DivisionState {
    currentDivision: UserDivisionStatus | null;
    allDivisions: Division[];
    divisionLeaderboards: Record<DivisionTier, DivisionLeaderboard>;
    skillAssessment: SkillAssessment | null;
    isInPlacementMatches: boolean;
    placementMatchesRemaining: number;
    seasonInfo: {
        currentSeason: string;
        seasonEndDate: string;
        nextResetDate: string;
    };
}
//# sourceMappingURL=index.d.ts.map