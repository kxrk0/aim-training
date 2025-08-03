import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tournament, TournamentParticipant, BracketMatch, TournamentStatus } from '../../../shared/types'
import { BracketGenerator, BracketUtils, type GeneratedBracket } from '@/utils/bracketGenerator'

interface TournamentStore {
  // State
  tournaments: Tournament[]
  userTournaments: Tournament[]
  activeTournament: Tournament | null
  registeredTournaments: Tournament[]
  
  // UI State
  isCreatingTournament: boolean
  isLoadingTournaments: boolean
  selectedTournament: Tournament | null
  error: string | null
  
  // Actions
  setCreatingTournament: (creating: boolean) => void
  setSelectedTournament: (tournament: Tournament | null) => void
  createTournament: (tournamentData: Partial<Tournament>) => Promise<void>
  updateTournament: (tournamentId: string, updates: Partial<Tournament>) => Promise<void>
  deleteTournament: (tournamentId: string) => Promise<void>
  registerForTournament: (tournamentId: string, userId: string) => Promise<void>
  unregisterFromTournament: (tournamentId: string, userId: string) => Promise<void>
  startTournament: (tournamentId: string) => Promise<void>
  
  // Data fetching
  fetchTournaments: () => Promise<void>
  fetchUserTournaments: (userId: string) => Promise<void>
  
  // Tournament management
  generateBrackets: (tournamentId: string) => Promise<void>
  updateMatchResult: (tournamentId: string, matchId: string, result: any) => Promise<void>
  advanceToNextRound: (tournamentId: string) => Promise<void>
  
  // Bracket management
  getBracketVisualization: (tournamentId: string) => GeneratedBracket | null
  advanceWinner: (tournamentId: string, matchId: string, winnerId: string) => Promise<void>
  validateBracket: (tournamentId: string) => { isValid: boolean; errors: string[] }
  
  // Match scheduling
  scheduleMatch: (tournamentId: string, matchId: string, scheduledTime: string) => Promise<void>
  rescheduleMatch: (tournamentId: string, matchId: string, newTime: string) => Promise<void>
  
  // Real-time updates
  subscribeToTournament: (tournamentId: string) => void
  unsubscribeFromTournament: (tournamentId: string) => void
  
  // Utilities
  getTournamentById: (tournamentId: string) => Tournament | null
  getUserTournamentStatus: (tournamentId: string, userId: string) => 'not-registered' | 'registered' | 'participating'
  isRegistrationOpen: (tournament: Tournament) => boolean
  getTournamentProgress: (tournament: Tournament) => { current: number; total: number; percentage: number }
}

export const useTournamentStore = create<TournamentStore>()(
  persist(
    (set, get) => ({
      // Initial State
      tournaments: [],
      userTournaments: [],
      activeTournament: null,
      registeredTournaments: [],
      isCreatingTournament: false,
      isLoadingTournaments: false,
      selectedTournament: null,
      error: null,

      // UI Actions
      setCreatingTournament: (creating) => set({ isCreatingTournament: creating }),
      
      setSelectedTournament: (tournament) => set({ selectedTournament: tournament }),

      // Tournament CRUD
      createTournament: async (tournamentData) => {
        try {
          set({ error: null })
          
          // Generate ID and complete tournament data
          const tournament: Tournament = {
            id: `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: tournamentData.name || '',
            description: tournamentData.description || '',
            gameMode: tournamentData.gameMode || 'precision',
            format: tournamentData.format || 'single-elimination',
            status: 'registration' as TournamentStatus,
            maxParticipants: tournamentData.maxParticipants || 16,
            entryFee: tournamentData.entryFee,
            prizePool: tournamentData.prizePool,
            registrationStart: tournamentData.registrationStart || new Date().toISOString(),
            registrationEnd: tournamentData.registrationEnd || new Date(Date.now() + 86400000).toISOString(),
            tournamentStart: tournamentData.tournamentStart || new Date(Date.now() + 172800000).toISOString(),
            gameSettings: tournamentData.gameSettings || {
              gameMode: tournamentData.gameMode || 'precision',
              difficulty: 'medium',
              duration: 60,
              targetSize: 'medium',
              spawnRate: 1
            },
            bracketSettings: tournamentData.bracketSettings || {
              bestOf: 3,
              seedingMethod: 'elo',
              allowLateRegistration: false
            },
            participants: [],
            brackets: [],
            currentRound: 0,
            totalRounds: calculateTotalRounds(tournamentData.format || 'single-elimination', tournamentData.maxParticipants || 16),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          // TODO: Replace with actual API call
          // await api.createTournament(tournament)
          
          // For now, just add to local state
          set(state => ({
            tournaments: [...state.tournaments, tournament],
            userTournaments: [...state.userTournaments, tournament],
            isCreatingTournament: false
          }))

          console.log('Tournament created:', tournament)
        } catch (error) {
          set({ error: `Failed to create tournament: ${error}` })
          throw error
        }
      },

      updateTournament: async (tournamentId, updates) => {
        try {
          set({ error: null })
          
          const updatedTournament = {
            ...get().getTournamentById(tournamentId),
            ...updates,
            updatedAt: new Date().toISOString()
          } as Tournament

          // TODO: Replace with actual API call
          // await api.updateTournament(tournamentId, updates)
          
          set(state => ({
            tournaments: state.tournaments.map(t => 
              t.id === tournamentId ? updatedTournament : t
            ),
            userTournaments: state.userTournaments.map(t => 
              t.id === tournamentId ? updatedTournament : t
            )
          }))
        } catch (error) {
          set({ error: `Failed to update tournament: ${error}` })
          throw error
        }
      },

      deleteTournament: async (tournamentId) => {
        try {
          set({ error: null })
          
          // TODO: Replace with actual API call
          // await api.deleteTournament(tournamentId)
          
          set(state => ({
            tournaments: state.tournaments.filter(t => t.id !== tournamentId),
            userTournaments: state.userTournaments.filter(t => t.id !== tournamentId),
            selectedTournament: state.selectedTournament?.id === tournamentId ? null : state.selectedTournament
          }))
        } catch (error) {
          set({ error: `Failed to delete tournament: ${error}` })
          throw error
        }
      },

      // Registration
      registerForTournament: async (tournamentId, userId) => {
        try {
          set({ error: null })
          
          const tournament = get().getTournamentById(tournamentId)
          if (!tournament) throw new Error('Tournament not found')
          
          if (!get().isRegistrationOpen(tournament)) {
            throw new Error('Registration is closed for this tournament')
          }

          if (tournament.participants.length >= tournament.maxParticipants) {
            throw new Error('Tournament is full')
          }

          if (tournament.participants.some(p => p.userId === userId)) {
            throw new Error('Already registered for this tournament')
          }

          const participant: TournamentParticipant = {
            userId,
            username: `Player_${userId.slice(-6)}`, // TODO: Get actual username
            eloRating: 1000, // TODO: Get actual ELO rating
            seed: tournament.participants.length + 1,
            registeredAt: new Date().toISOString(),
            isActive: true,
            wins: 0,
            losses: 0,
            isEliminated: false
          }

          const updatedTournament = {
            ...tournament,
            participants: [...tournament.participants, participant],
            updatedAt: new Date().toISOString()
          }

          // TODO: Replace with actual API call
          // await api.registerForTournament(tournamentId, userId)
          
          set(state => ({
            tournaments: state.tournaments.map(t => 
              t.id === tournamentId ? updatedTournament : t
            ),
            registeredTournaments: [...state.registeredTournaments.filter(t => t.id !== tournamentId), updatedTournament]
          }))
        } catch (error) {
          set({ error: `Failed to register: ${error}` })
          throw error
        }
      },

      unregisterFromTournament: async (tournamentId, userId) => {
        try {
          set({ error: null })
          
          const tournament = get().getTournamentById(tournamentId)
          if (!tournament) throw new Error('Tournament not found')

          const updatedTournament = {
            ...tournament,
            participants: tournament.participants.filter(p => p.userId !== userId),
            updatedAt: new Date().toISOString()
          }

          // TODO: Replace with actual API call
          // await api.unregisterFromTournament(tournamentId, userId)
          
          set(state => ({
            tournaments: state.tournaments.map(t => 
              t.id === tournamentId ? updatedTournament : t
            ),
            registeredTournaments: state.registeredTournaments.filter(t => t.id !== tournamentId)
          }))
        } catch (error) {
          set({ error: `Failed to unregister: ${error}` })
          throw error
        }
      },

      startTournament: async (tournamentId) => {
        try {
          set({ error: null })
          
          const tournament = get().getTournamentById(tournamentId)
          if (!tournament) throw new Error('Tournament not found')

          if (tournament.status !== 'registration') {
            throw new Error('Tournament cannot be started')
          }

          if (tournament.participants.length < 2) {
            throw new Error('Need at least 2 participants to start tournament')
          }

          // Generate brackets first
          await get().generateBrackets(tournamentId)

          const updatedTournament = {
            ...tournament,
            status: 'active' as TournamentStatus,
            updatedAt: new Date().toISOString()
          }

          // TODO: Replace with actual API call
          // await api.startTournament(tournamentId)
          
          set(state => ({
            tournaments: state.tournaments.map(t => 
              t.id === tournamentId ? updatedTournament : t
            ),
            activeTournament: updatedTournament
          }))
        } catch (error) {
          set({ error: `Failed to start tournament: ${error}` })
          throw error
        }
      },

      // Data fetching
      fetchTournaments: async () => {
        try {
          set({ isLoadingTournaments: true, error: null })
          
          // TODO: Replace with actual API call
          // const tournaments = await api.getTournaments()
          
          // For now, use mock data
          set({ 
            tournaments: [], // Will be populated with real data
            isLoadingTournaments: false 
          })
        } catch (error) {
          set({ 
            error: `Failed to fetch tournaments: ${error}`,
            isLoadingTournaments: false 
          })
        }
      },

      fetchUserTournaments: async (userId) => {
        try {
          set({ error: null })
          
          // TODO: Replace with actual API call
          // const userTournaments = await api.getUserTournaments(userId)
          
          set({ userTournaments: [] })
        } catch (error) {
          set({ error: `Failed to fetch user tournaments: ${error}` })
        }
      },

      // Tournament management
      generateBrackets: async (tournamentId) => {
        try {
          const tournament = get().getTournamentById(tournamentId)
          if (!tournament) throw new Error('Tournament not found')

          // Generate brackets using the new bracket generator
          const generatedBracket = BracketGenerator.generate(tournament)
          
          // Convert BracketMatch[] to TournamentBracket[]
          const tournamentBrackets = generatedBracket.matches.map(match => ({
            id: match.id,
            tournamentId: tournamentId,
            round: match.round,
            position: match.position,
            match: match
          }))

          // Update tournament with generated brackets
          await get().updateTournament(tournamentId, { 
            brackets: tournamentBrackets,
            totalRounds: generatedBracket.totalRounds
          })
          
          console.log('Brackets generated successfully:', generatedBracket)
        } catch (error) {
          set({ error: `Failed to generate brackets: ${error}` })
          throw error
        }
      },

      updateMatchResult: async (tournamentId, matchId, result) => {
        try {
          set({ error: null })
          
          // TODO: Implement match result updating
          console.log('Updating match result:', { tournamentId, matchId, result })
        } catch (error) {
          set({ error: `Failed to update match result: ${error}` })
          throw error
        }
      },

      advanceToNextRound: async (tournamentId) => {
        try {
          set({ error: null })
          
          // TODO: Implement round advancement logic
          console.log('Advancing to next round:', tournamentId)
        } catch (error) {
          set({ error: `Failed to advance round: ${error}` })
          throw error
        }
      },

      // Bracket management
      getBracketVisualization: (tournamentId) => {
        try {
          const tournament = get().getTournamentById(tournamentId)
          if (!tournament) return null

          return BracketGenerator.generate(tournament)
        } catch (error) {
          console.error('Failed to generate bracket visualization:', error)
          return null
        }
      },

      advanceWinner: async (tournamentId, matchId, winnerId) => {
        try {
          set({ error: null })
          
          const tournament = get().getTournamentById(tournamentId)
          if (!tournament) throw new Error('Tournament not found')

          const bracket = BracketGenerator.generate(tournament)
          const updatedMatches = BracketGenerator.advanceWinner(bracket, matchId, winnerId)
          
          // Convert BracketMatch[] to TournamentBracket[]
          const tournamentBrackets = updatedMatches.map(match => ({
            id: match.id,
            tournamentId: tournamentId,
            round: match.round,
            position: match.position,
            match: match
          }))
          
          await get().updateTournament(tournamentId, { brackets: tournamentBrackets })
          
          console.log('Winner advanced:', winnerId)
        } catch (error) {
          set({ error: `Failed to advance winner: ${error}` })
          throw error
        }
      },

      validateBracket: (tournamentId) => {
        try {
          const tournament = get().getTournamentById(tournamentId)
          if (!tournament) return { isValid: false, errors: ['Tournament not found'] }

          const bracket = BracketGenerator.generate(tournament)
          return BracketUtils.validateBracket(bracket)
        } catch (error) {
          return { isValid: false, errors: [`Validation error: ${error}`] }
        }
      },

      // Match scheduling
      scheduleMatch: async (tournamentId, matchId, scheduledTime) => {
        try {
          set({ error: null })
          
          const tournament = get().getTournamentById(tournamentId)
          if (!tournament) throw new Error('Tournament not found')

          // Find and update the specific match
          const updatedBrackets = tournament.brackets?.map(match => 
            match.id === matchId 
              ? { ...match, scheduledTime }
              : match
          ) || []

          await get().updateTournament(tournamentId, { brackets: updatedBrackets })
          
          console.log('Match scheduled:', matchId, scheduledTime)
        } catch (error) {
          set({ error: `Failed to schedule match: ${error}` })
          throw error
        }
      },

      rescheduleMatch: async (tournamentId, matchId, newTime) => {
        await get().scheduleMatch(tournamentId, matchId, newTime)
      },

      // Real-time updates
      subscribeToTournament: (tournamentId) => {
        // TODO: Implement WebSocket subscription
        console.log('Subscribing to tournament updates:', tournamentId)
      },

      unsubscribeFromTournament: (tournamentId) => {
        // TODO: Implement WebSocket unsubscription
        console.log('Unsubscribing from tournament updates:', tournamentId)
      },

      // Utilities
      getTournamentById: (tournamentId) => {
        return get().tournaments.find(t => t.id === tournamentId) || null
      },

      getUserTournamentStatus: (tournamentId, userId) => {
        const tournament = get().getTournamentById(tournamentId)
        if (!tournament) return 'not-registered'
        
        const isRegistered = tournament.participants.some(p => p.userId === userId)
        return isRegistered ? 'registered' : 'not-registered'
      },

      isRegistrationOpen: (tournament) => {
        const now = new Date()
        const regStart = new Date(tournament.registrationStart)
        const regEnd = new Date(tournament.registrationEnd)
        
        return tournament.status === 'registration' && 
               now >= regStart && 
               now <= regEnd &&
               tournament.participants.length < tournament.maxParticipants
      },

      getTournamentProgress: (tournament) => {
        const total = tournament.totalRounds
        const current = tournament.currentRound
        const percentage = total > 0 ? (current / total) * 100 : 0
        
        return { current, total, percentage }
      }
    }),
    {
      name: 'tournament-store',
      partialize: (state) => ({
        tournaments: state.tournaments,
        userTournaments: state.userTournaments,
        registeredTournaments: state.registeredTournaments
      })
    }
  )
)

// Helper functions
function calculateTotalRounds(format: any, participants: number): number {
  switch (format) {
    case 'single-elimination':
      return Math.ceil(Math.log2(participants))
    case 'double-elimination':
      return Math.ceil(Math.log2(participants)) + Math.ceil(Math.log2(participants)) - 1
    case 'round-robin':
      return participants - 1
    case 'swiss':
      return Math.ceil(Math.log2(participants))
    default:
      return 1
  }
}

function generateBracketsForFormat(format: any, participants: any[]): any[] {
  // TODO: Implement proper bracket generation
  // This is a placeholder that returns empty brackets
  return []
}

// Export helper functions for use in components
export const TournamentHelpers = {
  calculateTotalRounds,
  generateBracketsForFormat,
  
  formatDuration: (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  },
  
  formatDateTime: (isoString: string): string => {
    return new Date(isoString).toLocaleString()
  },
  
  getTournamentStatusColor: (status: TournamentStatus): string => {
    switch (status) {
      case 'registration': return 'text-blue-400'
      case 'active': return 'text-green-400'
      case 'finished': return 'text-gray-400'
      case 'cancelled': return 'text-red-400'
      default: return 'text-gray-400'
    }
  },
  
  getTournamentStatusIcon: (status: TournamentStatus): string => {
    switch (status) {
      case 'registration': return '📝'
      case 'active': return '🎮'
      case 'finished': return '🏆'
      case 'cancelled': return '❌'
      default: return '❓'
    }
  }
} 