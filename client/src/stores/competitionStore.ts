import { create } from 'zustand'
import { io } from 'socket.io-client'
import type { 
  Competition, 
  CompetitionState,
  CompetitionResults,
  GameMode 
} from '../../../shared/types'

interface CompetitionStore extends CompetitionState {
  // Actions
  findMatch: (gameMode: GameMode) => void
  acceptMatch: (competitionId: string) => void
  cancelSearch: () => void
  setReady: (isReady: boolean) => void
  sendGameUpdate: (data: any) => void
  // Internal setters
  setMatch: (competition: Competition | null) => void
  setSearching: (searching: boolean) => void
  setSearchStartTime: (time: number | null) => void
  setEstimatedWaitTime: (time: number) => void
  setOpponentFound: (found: boolean) => void
}

export const useCompetitionStore = create<CompetitionStore>((set, get) => ({
  // Initial state
  currentMatch: null,
  isInCompetition: false,
  isSearching: false,
  searchStartTime: null,
  estimatedWaitTime: 30,
  opponentFound: false,

  // Actions
  findMatch: (gameMode: GameMode) => {
    const socket = io()
    socket.emit('competition:find-match', gameMode)
    set({ 
      isSearching: true, 
      searchStartTime: Date.now(),
      estimatedWaitTime: 30
    })
  },

  acceptMatch: (competitionId: string) => {
    const socket = io()
    socket.emit('competition:accept-match', competitionId)
  },

  cancelSearch: () => {
    const socket = io()
    socket.emit('competition:cancel-search')
    set({ 
      isSearching: false, 
      searchStartTime: null,
      opponentFound: false
    })
  },

  setReady: (isReady: boolean) => {
    const socket = io()
    socket.emit('competition:ready', isReady)
  },

  sendGameUpdate: (data: any) => {
    const socket = io()
    socket.emit('competition:game-update', data)
  },

  // Internal setters
  setMatch: (competition: Competition | null) => {
    set({ 
      currentMatch: competition,
      isInCompetition: !!competition,
      isSearching: false,
      searchStartTime: null,
      opponentFound: !!competition
    })
  },

  setSearching: (searching: boolean) => {
    set({ isSearching: searching })
  },

  setSearchStartTime: (time: number | null) => {
    set({ searchStartTime: time })
  },

  setEstimatedWaitTime: (time: number) => {
    set({ estimatedWaitTime: time })
  },

  setOpponentFound: (found: boolean) => {
    set({ opponentFound: found })
  }
}))

// Socket event listeners
if (typeof window !== 'undefined') {
  const socket = io()
  
  socket.on('competition:match-found', (competition: Competition) => {
    useCompetitionStore.getState().setMatch(competition)
    console.log('🎯 Match found:', competition)
  })
  
  socket.on('competition:searching', (data: { gameMode: GameMode, estimatedWaitTime: number }) => {
    useCompetitionStore.getState().setEstimatedWaitTime(data.estimatedWaitTime)
    console.log('🔍 Searching for match:', data)
  })
  
  socket.on('competition:search-cancelled', () => {
    useCompetitionStore.getState().setSearching(false)
    useCompetitionStore.getState().setSearchStartTime(null)
    console.log('❌ Search cancelled')
  })
  
  socket.on('competition:game-started', (competition: Competition) => {
    useCompetitionStore.getState().setMatch(competition)
    console.log('🚀 Competition started:', competition)
  })
  
  socket.on('competition:game-update', (update: any) => {
    console.log('📊 Competition update:', update)
  })
  
  socket.on('competition:game-ended', (results: CompetitionResults) => {
    useCompetitionStore.getState().setMatch(null)
    console.log('🏁 Competition ended:', results)
  })
  
  socket.on('competition:opponent-ready', (isReady: boolean) => {
    console.log('👥 Opponent ready status:', isReady)
  })
} 