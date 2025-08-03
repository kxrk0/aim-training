import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from './authStore'
import type { 
  PartyTeam,
  TeamChallenge,
  TeamObjective,
  TeamChallengeResult,
  TeamFormation,
  TeamChatMessage,
  TeamUpdateEvent
} from '../../../shared/types'

interface TeamChallengeStoreState {
  // Connection state - using party socket now
  isConnected: boolean
  
  // Current team challenge
  currentChallenge: TeamChallenge | null
  userTeam: PartyTeam | null
  
  // Team management
  teams: PartyTeam[]
  teamFormation: TeamFormation | null
  
  // Chat
  teamChat: TeamChatMessage[]
  
  // Results
  challengeResults: TeamChallengeResult[]
  
  // UI state
  showTeamSelection: boolean
  showObjectives: boolean
  showResults: boolean
  
  // Actions
  connect: () => void
  disconnect: () => void
  createChallenge: (partyId: string, challengeType: TeamChallenge['type'], settings: TeamChallenge['settings']) => void
  formTeams: (partyId: string, formation: TeamFormation) => void
  startChallenge: (partyId: string) => void
  updateObjectiveProgress: (partyId: string, teamId: string, objectiveId: string, progress: number, metadata?: any) => void
  sendTeamChat: (partyId: string, teamId: string, message: string) => void
  switchTeam: (partyId: string, fromTeamId: string, toTeamId: string) => void
  
  // UI actions
  setShowTeamSelection: (show: boolean) => void
  setShowObjectives: (show: boolean) => void
  setShowResults: (show: boolean) => void
  
  // Error handling
  error: string | null
  clearError: () => void
}

export const useTeamChallengeStore = create<TeamChallengeStoreState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state - using party socket connection
    isConnected: false,
    
    currentChallenge: null,
    userTeam: null,
    
    teams: [],
    teamFormation: null,
    
    teamChat: [],
    challengeResults: [],
    
    showTeamSelection: false,
    showObjectives: false,
    showResults: false,
    
    error: null,

    // Actions
      connect: () => {
      // Team challenge system now uses party socket connection
      // No separate socket needed
      console.log('✅ Team challenge system uses party socket - no separate connection needed')
      set({ isConnected: true })
    },

    disconnect: () => {
      // No separate socket to disconnect - party handles this
      console.log('✅ Team challenge disconnected (using party socket)')
      set({ isConnected: false })
    },

    createChallenge: (partyId: string, challengeType: TeamChallenge['type'], settings: TeamChallenge['settings']) => {
      const state = get()
      if (!state.isConnected) {
        set({ error: 'Not connected to team challenge system' })
        return
      }

      console.log('🏆 Creating team challenge:', { partyId, challengeType, settings })
      
      // Get party socket to emit team challenge event
      const { socket } = require('@/stores/partyStore').usePartyStore.getState()
      if (socket && socket.connected) {
        socket.emit('team:create-challenge', {
        partyId,
        challengeType,
        settings
      })
      } else {
        console.error('❌ Party socket not available for team challenge')
      }
    },

    formTeams: (partyId: string, formation: TeamFormation) => {
      const state = get()
      if (!state.isConnected) {
        set({ error: 'Not connected to team challenge system' })
        return
      }

      console.log('👥 Forming teams:', { partyId, formation })
      // The socket.io-client is no longer used, so this event will not be emitted.
      // This part of the logic needs to be re-evaluated based on the new architecture.
      // For now, we'll just log the action.
      console.log('⚠️ Socket.io-client is no longer used for team challenge events. This action will not have an effect.')
    },

    startChallenge: (partyId: string) => {
      const state = get()
      if (!state.isConnected) {
        set({ error: 'Not connected to team challenge system' })
        return
      }

      console.log('🚀 Starting team challenge:', partyId)
      // The socket.io-client is no longer used, so this event will not be emitted.
      // This part of the logic needs to be re-evaluated based on the new architecture.
      // For now, we'll just log the action.
      console.log('⚠️ Socket.io-client is no longer used for team challenge events. This action will not have an effect.')
    },

    updateObjectiveProgress: (partyId: string, teamId: string, objectiveId: string, progress: number, metadata?: any) => {
      const state = get()
      if (!state.isConnected) return

      console.log('📊 Updating objective progress:', { partyId, teamId, objectiveId, progress })
      // The socket.io-client is no longer used, so this event will not be emitted.
      // This part of the logic needs to be re-evaluated based on the new architecture.
      // For now, we'll just log the action.
      console.log('⚠️ Socket.io-client is no longer used for team challenge events. This action will not have an effect.')
    },

    sendTeamChat: (partyId: string, teamId: string, message: string) => {
      const state = get()
      if (!state.isConnected) return

      if (message.trim().length === 0) return

      console.log('💬 Sending team chat:', { partyId, teamId, message })
      // The socket.io-client is no longer used, so this event will not be emitted.
      // This part of the logic needs to be re-evaluated based on the new architecture.
      // For now, we'll just log the action.
      console.log('⚠️ Socket.io-client is no longer used for team challenge events. This action will not have an effect.')
    },

    switchTeam: (partyId: string, fromTeamId: string, toTeamId: string) => {
      const state = get()
      if (!state.isConnected) {
        set({ error: 'Not connected to team challenge system' })
        return
      }

      console.log('🔄 Switching teams:', { partyId, fromTeamId, toTeamId })
      // The socket.io-client is no longer used, so this event will not be emitted.
      // This part of the logic needs to be re-evaluated based on the new architecture.
      // For now, we'll just log the action.
      console.log('⚠️ Socket.io-client is no longer used for team challenge events. This action will not have an effect.')
    },

    // UI actions
    setShowTeamSelection: (show: boolean) => {
      set({ showTeamSelection: show })
    },

    setShowObjectives: (show: boolean) => {
      set({ showObjectives: show })
    },

    setShowResults: (show: boolean) => {
      set({ showResults: show })
    },

    clearError: () => {
      set({ error: null })
    }
  }))
)

// Helper functions for team challenge operations
export const TeamChallengeHelpers = {
  // Get team by user ID
  getUserTeam: (teams: PartyTeam[], userId: string): PartyTeam | null => {
    return teams.find(team => team.memberIds.includes(userId)) || null
  },

  // Calculate team completion percentage
  getTeamProgress: (team: PartyTeam): number => {
    if (team.objectives.length === 0) return 0
    const completed = team.objectives.filter(obj => obj.isCompleted).length
    return Math.round((completed / team.objectives.length) * 100)
  },

  // Get team rank by score
  getTeamRank: (teams: PartyTeam[], teamId: string): number => {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score)
    return sortedTeams.findIndex(team => team.id === teamId) + 1
  },

  // Format objective progress
  formatObjectiveProgress: (objective: TeamObjective): string => {
    const percentage = Math.round((objective.progress / objective.target) * 100)
    return `${objective.progress}/${objective.target} (${percentage}%)`
  },

  // Get next incomplete objective
  getNextObjective: (team: PartyTeam): TeamObjective | null => {
    return team.objectives.find(obj => !obj.isCompleted) || null
  },

  // Calculate estimated completion time
  getEstimatedCompletion: (team: PartyTeam, challenge: TeamChallenge): number => {
    if (!challenge.startTime) return 0
    
    const elapsed = Date.now() - new Date(challenge.startTime).getTime()
    const progress = TeamChallengeHelpers.getTeamProgress(team)
    
    if (progress === 0) return challenge.settings.duration * 1000
    
    return Math.round((elapsed / progress) * 100)
  }
}

// Auto-connect when token is available
const token = localStorage.getItem('token')
if (token) {
  setTimeout(() => {
    const store = useTeamChallengeStore.getState()
    if (!store.isConnected) {
      store.connect()
    }
  }, 1500) // Delay to avoid conflicts with other connections
} 