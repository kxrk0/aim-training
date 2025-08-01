import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { 
  SensitivityFinderState,
  SensitivityTestType,
  SensitivityTestConfig,
  SensitivityTestResult,
  SensitivityRecommendation,
  UserSensitivityProfile,
  SupportedGame,
  PlayStyle,
  Difficulty,
  SensitivityConversion,
  MouseHeatmapData,
  SensitivityAnalytics
} from '../../../shared/types'

interface SensitivityActions {
  // Test Management
  startTest: (config: SensitivityTestConfig) => void
  completeTest: (result: SensitivityTestResult) => void
  pauseTest: () => void
  resumeTest: () => void
  stopTest: () => void
  
  // Session Management
  startNewSession: (selectedTests: SensitivityTestType[]) => void
  completeSession: () => Promise<SensitivityRecommendation>
  saveSession: () => Promise<void>
  
  // Profile Management
  loadUserProfile: (userId: string) => Promise<void>
  updateUserProfile: (updates: Partial<UserSensitivityProfile>) => Promise<void>
  createUserProfile: (userId: string, initialData: Partial<UserSensitivityProfile>) => Promise<void>
  
  // Settings
  updateTestSettings: (settings: Partial<SensitivityFinderState['testSettings']>) => void
  updateConversionSettings: (settings: Partial<SensitivityFinderState['conversionSettings']>) => void
  
  // Game Conversion
  convertSensitivity: (fromGame: SupportedGame, toGame: SupportedGame, sensitivity: number, dpi: number) => SensitivityConversion
  calculateCm360: (sensitivity: number, dpi: number, game: SupportedGame) => number
  
  // Analytics
  generateAnalytics: (userId: string) => Promise<SensitivityAnalytics>
  generateHeatmap: (results: SensitivityTestResult[]) => MouseHeatmapData
  
  // UI Management
  setActivePanel: (panel: SensitivityFinderState['activePanel']) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Utility
  resetState: () => void
  clearError: () => void
}

export type SensitivityStore = SensitivityFinderState & SensitivityActions

const DEFAULT_TEST_CONFIGS: Record<SensitivityTestType, SensitivityTestConfig> = {
  'flick': {
    testType: 'flick',
    duration: 60,
    targetCount: 30,
    targetSize: 1.0,
    difficulty: 'medium',
    spawnPattern: 'random'
  },
  'tracking': {
    testType: 'tracking',
    duration: 45,
    targetCount: 5,
    targetSize: 1.2,
    targetSpeed: 150,
    difficulty: 'medium',
    spawnPattern: 'circular'
  },
  'target-switching': {
    testType: 'target-switching',
    duration: 30,
    targetCount: 20,
    targetSize: 0.8,
    difficulty: 'medium',
    spawnPattern: 'random'
  },
  'micro-correction': {
    testType: 'micro-correction',
    duration: 40,
    targetCount: 25,
    targetSize: 0.6,
    difficulty: 'hard',
    spawnPattern: 'grid'
  }
}

// Game sensitivity configurations
const GAME_CONFIGS: Record<SupportedGame, {
  sensitivityScale: number
  fovHorizontal: number
  yawMultiplier: number
  cm360Formula: (sens: number, dpi: number) => number
}> = {
  'valorant': {
    sensitivityScale: 1.0,
    fovHorizontal: 103,
    yawMultiplier: 0.07,
    cm360Formula: (sens, dpi) => (360 / (sens * dpi * 0.07)) * 2.54
  },
  'cs2': {
    sensitivityScale: 1.0,
    fovHorizontal: 90,
    yawMultiplier: 0.022,
    cm360Formula: (sens, dpi) => (360 / (sens * dpi * 0.022)) * 2.54
  },
  'apex': {
    sensitivityScale: 1.0,
    fovHorizontal: 110,
    yawMultiplier: 0.022,
    cm360Formula: (sens, dpi) => (360 / (sens * dpi * 0.022)) * 2.54
  },
  'fortnite': {
    sensitivityScale: 1.0,
    fovHorizontal: 80,
    yawMultiplier: 0.0066,
    cm360Formula: (sens, dpi) => (360 / (sens * dpi * 0.0066)) * 2.54
  },
  'overwatch2': {
    sensitivityScale: 1.0,
    fovHorizontal: 103,
    yawMultiplier: 0.0066,
    cm360Formula: (sens, dpi) => (360 / (sens * dpi * 0.0066)) * 2.54
  },
  'cod': {
    sensitivityScale: 1.0,
    fovHorizontal: 120,
    yawMultiplier: 0.0066,
    cm360Formula: (sens, dpi) => (360 / (sens * dpi * 0.0066)) * 2.54
  },
  'rainbow6': {
    sensitivityScale: 1.0,
    fovHorizontal: 84,
    yawMultiplier: 0.00223,
    cm360Formula: (sens, dpi) => (360 / (sens * dpi * 0.00223)) * 2.54
  }
}

export const useSensitivityStore = create<SensitivityStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    isTestActive: false,
    currentTest: null,
    testProgress: {
      completedTests: 0,
      totalTests: 0,
      currentTestProgress: 0
    },
    currentSession: {
      results: [],
      startTime: new Date().toISOString()
    },
    userProfile: null,
    testSettings: {
      selectedTests: ['flick', 'tracking'],
      difficulty: 'medium',
      customConfig: {}
    },
    conversionSettings: {
      sourceGame: 'valorant',
      targetGames: ['cs2', 'apex'],
      sourceSensitivity: 0.5,
      sourceDPI: 800
    },
    activePanel: 'tests',
    isLoading: false,
    error: null,

    // Test Management Actions
    startTest: (config: SensitivityTestConfig) => {
      set({
        isTestActive: true,
        currentTest: config,
        testProgress: {
          ...get().testProgress,
          currentTestProgress: 0
        },
        error: null
      })
    },

    completeTest: (result: SensitivityTestResult) => {
      const state = get()
      const newResults = [...state.currentSession.results, result]
      
      // Update user profile with new test result
      if (state.userProfile) {
        const updatedProfile = {
          ...state.userProfile,
          testResults: [...state.userProfile.testResults, result],
          updatedAt: new Date().toISOString()
        }
        
        set({
          isTestActive: false,
          currentTest: null,
          currentSession: {
            ...state.currentSession,
            results: newResults
          },
          testProgress: {
            ...state.testProgress,
            completedTests: state.testProgress.completedTests + 1,
            currentTestProgress: 100
          },
          userProfile: updatedProfile
        })
      } else {
        set({
          isTestActive: false,
          currentTest: null,
          currentSession: {
            ...state.currentSession,
            results: newResults
          },
          testProgress: {
            ...state.testProgress,
            completedTests: state.testProgress.completedTests + 1,
            currentTestProgress: 100
          }
        })
      }
      
      // TODO: Send to API
      console.log('Test result saved:', result)
    },

    pauseTest: () => {
      // Implementation depends on the test component state
      console.log('Test paused')
    },

    resumeTest: () => {
      // Implementation depends on the test component state
      console.log('Test resumed')
    },

    stopTest: () => {
      set({
        isTestActive: false,
        currentTest: null,
        testProgress: {
          ...get().testProgress,
          currentTestProgress: 0
        }
      })
    },

    // Session Management
    startNewSession: (selectedTests: SensitivityTestType[]) => {
      set({
        currentSession: {
          results: [],
          startTime: new Date().toISOString()
        },
        testProgress: {
          completedTests: 0,
          totalTests: selectedTests.length,
          currentTestProgress: 0
        },
        testSettings: {
          ...get().testSettings,
          selectedTests
        },
        activePanel: 'tests'
      })
    },

    completeSession: async (): Promise<SensitivityRecommendation> => {
      const state = get()
      const results = state.currentSession.results
      
      // Generate recommendation based on test results
      const recommendation = await generateRecommendation(results, state.userProfile)
      
      set({
        currentSession: {
          ...state.currentSession,
          recommendation
        },
        activePanel: 'results'
      })
      
      return recommendation
    },

    saveSession: async () => {
      const state = get()
      // Save session to backend API
      try {
        set({ isLoading: true })
        // API call would go here
        console.log('Session saved:', state.currentSession)
        set({ isLoading: false })
      } catch (error) {
        set({ 
          error: 'Failed to save session',
          isLoading: false 
        })
      }
    },

    // Profile Management
    loadUserProfile: async (userId: string) => {
      try {
        set({ isLoading: true })
        // API call to load user profile
        // const profile = await apiService.getSensitivityProfile(userId)
        // For now, create a mock profile
        const mockProfile: UserSensitivityProfile = {
          userId,
          primaryGame: 'valorant',
          currentSensitivity: 0.5,
          currentDPI: 800,
          testResults: [],
          recommendations: [],
          performanceHistory: [],
          preferredPlayStyle: 'hybrid',
          testPreferences: {
            defaultDuration: 60,
            preferredDifficulty: 'medium',
            autoStartTests: false,
            showRealTimeStats: true
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        set({ 
          userProfile: mockProfile,
          isLoading: false 
        })
      } catch (error) {
        set({ 
          error: 'Failed to load user profile',
          isLoading: false 
        })
      }
    },

    updateUserProfile: async (updates: Partial<UserSensitivityProfile>) => {
      const state = get()
      if (!state.userProfile) return
      
      const updatedProfile = {
        ...state.userProfile,
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      set({ userProfile: updatedProfile })
    },

    createUserProfile: async (userId: string, initialData: Partial<UserSensitivityProfile>) => {
      // Create new user profile
      const newProfile: UserSensitivityProfile = {
        userId,
        primaryGame: 'valorant',
        currentSensitivity: 0.5,
        currentDPI: 800,
        testResults: [],
        recommendations: [],
        performanceHistory: [],
        preferredPlayStyle: 'hybrid',
        testPreferences: {
          defaultDuration: 60,
          preferredDifficulty: 'medium',
          autoStartTests: false,
          showRealTimeStats: true
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...initialData
      }
      
      set({ userProfile: newProfile })
    },

    // Settings Management
    updateTestSettings: (settings) => {
      set({
        testSettings: {
          ...get().testSettings,
          ...settings
        }
      })
    },

    updateConversionSettings: (settings) => {
      set({
        conversionSettings: {
          ...get().conversionSettings,
          ...settings
        }
      })
    },

    // Game Conversion
    convertSensitivity: (fromGame, toGame, sensitivity, dpi) => {
      const fromConfig = GAME_CONFIGS[fromGame]
      const toConfig = GAME_CONFIGS[toGame]
      
      // Calculate cm/360 for source
      const fromCm360 = fromConfig.cm360Formula(sensitivity, dpi)
      
      // Calculate target sensitivity for same cm/360
      const targetSensitivity = (360 / (fromCm360 / 2.54)) / (dpi * toConfig.yawMultiplier)
      
      return {
        fromGame,
        toGame,
        fromSensitivity: sensitivity,
        toSensitivity: Number(targetSensitivity.toFixed(4)),
        fromDPI: dpi,
        toDPI: dpi,
        fromCm360,
        toCm360: fromCm360, // Should be the same
        effectiveDPIFrom: sensitivity * dpi,
        effectiveDPITo: targetSensitivity * dpi,
        conversionAccuracy: 'exact',
        notes: [`Converted from ${fromGame} to ${toGame} maintaining ${fromCm360.toFixed(2)}cm/360`]
      }
    },

    calculateCm360: (sensitivity, dpi, game) => {
      const config = GAME_CONFIGS[game]
      return config.cm360Formula(sensitivity, dpi)
    },

    // Analytics
    generateAnalytics: async (userId: string): Promise<SensitivityAnalytics> => {
      const state = get()
      const results = state.userProfile?.testResults || []
      
      // Generate analytics from test results
      const analytics: SensitivityAnalytics = {
        userId,
        overallStats: {
          totalTests: results.length,
          averageAccuracy: results.reduce((acc, r) => acc + r.accuracy, 0) / results.length || 0,
          averageReactionTime: results.reduce((acc, r) => acc + r.averageTimeToHit, 0) / results.length || 0,
          mostImprovedMetric: 'accuracy',
          weakestArea: 'micro-correction',
          strongestArea: 'flick'
        },
        testAnalytics: {
          'flick': { averageAccuracy: 85, averageReactionTime: 250, improvementTrend: 0.1, lastTested: new Date().toISOString(), bestScore: 95 },
          'tracking': { averageAccuracy: 78, averageReactionTime: 280, improvementTrend: 0.05, lastTested: new Date().toISOString(), bestScore: 88 },
          'target-switching': { averageAccuracy: 82, averageReactionTime: 260, improvementTrend: 0.15, lastTested: new Date().toISOString(), bestScore: 91 },
          'micro-correction': { averageAccuracy: 71, averageReactionTime: 320, improvementTrend: -0.02, lastTested: new Date().toISOString(), bestScore: 79 }
        },
        heatmapData: get().generateHeatmap(results),
        performanceCharts: [],
        improvementSuggestions: [
          'Focus on micro-correction training to improve precision',
          'Practice smooth tracking movements',
          'Work on reaction time consistency'
        ],
        nextRecommendedTest: 'micro-correction',
        generatedAt: new Date().toISOString()
      }
      
      return analytics
    },

    generateHeatmap: (results: SensitivityTestResult[]): MouseHeatmapData => {
      if (results.length === 0) {
        return {
          points: [],
          bounds: { minX: 0, maxX: 1920, minY: 0, maxY: 1080 }
        }
      }
      
      // Aggregate hit positions from all results
      const allHitPositions = results.flatMap(r => r.hitPositions)
      
      // Create heatmap points
      const points = allHitPositions.map(pos => ({
        x: pos.x,
        y: pos.y,
        intensity: Math.random() * 0.8 + 0.2, // Mock intensity
        accuracy: Math.random() * 0.4 + 0.6   // Mock accuracy
      }))
      
      return {
        points,
        bounds: {
          minX: Math.min(...allHitPositions.map(p => p.x)) || 0,
          maxX: Math.max(...allHitPositions.map(p => p.x)) || 1920,
          minY: Math.min(...allHitPositions.map(p => p.y)) || 0,
          maxY: Math.max(...allHitPositions.map(p => p.y)) || 1080
        }
      }
    },

    // UI Management
    setActivePanel: (panel) => set({ activePanel: panel }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    
    // Utility
    resetState: () => {
      set({
        isTestActive: false,
        currentTest: null,
        testProgress: { completedTests: 0, totalTests: 0, currentTestProgress: 0 },
        currentSession: { results: [], startTime: new Date().toISOString() },
        activePanel: 'tests',
        error: null
      })
    },
    
    clearError: () => set({ error: null })
  }))
)

// Helper function to generate sensitivity recommendations
async function generateRecommendation(
  results: SensitivityTestResult[], 
  userProfile: UserSensitivityProfile | null
): Promise<SensitivityRecommendation> {
  if (results.length === 0) {
    throw new Error('No test results to analyze')
  }
  
  // Analyze performance across different test types
  const avgAccuracy = results.reduce((acc, r) => acc + r.accuracy, 0) / results.length
  const avgReactionTime = results.reduce((acc, r) => acc + r.averageTimeToHit, 0) / results.length
  
  // Determine optimal sensitivity based on performance patterns
  let recommendedSensitivity = userProfile?.currentSensitivity || 0.5
  let confidenceScore = 75
  const reasoning: string[] = []
  
  // Analyze flick vs tracking performance
  const flickResults = results.filter(r => r.testType === 'flick')
  const trackingResults = results.filter(r => r.testType === 'tracking')
  
  if (flickResults.length > 0 && trackingResults.length > 0) {
    const flickAccuracy = flickResults.reduce((acc, r) => acc + r.accuracy, 0) / flickResults.length
    const trackingAccuracy = trackingResults.reduce((acc, r) => acc + r.accuracy, 0) / trackingResults.length
    
    if (flickAccuracy > trackingAccuracy + 10) {
      // Better at flicking, might benefit from slightly higher sensitivity
      recommendedSensitivity *= 1.1
      reasoning.push('Excellent flick performance suggests you can handle higher sensitivity')
    } else if (trackingAccuracy > flickAccuracy + 10) {
      // Better at tracking, might benefit from slightly lower sensitivity
      recommendedSensitivity *= 0.9
      reasoning.push('Strong tracking performance suggests lower sensitivity for precision')
    }
  }
  
  // Determine play style
  let playStyle: PlayStyle = 'hybrid'
  if (flickResults.length > 0 && trackingResults.length > 0) {
    const flickAccuracy = flickResults[0]?.accuracy || 0
    const trackingAccuracy = trackingResults[0]?.accuracy || 0
    
    if (flickAccuracy > trackingAccuracy + 15) {
      playStyle = 'flick-heavy'
    } else if (trackingAccuracy > flickAccuracy + 15) {
      playStyle = 'tracking-heavy'
    }
  }
  
  return {
    playStyle,
    recommendedSensitivity: Number(recommendedSensitivity.toFixed(3)),
    confidenceScore,
    reasoning,
    gameRecommendations: {},
    expectedImprovement: {
      accuracy: 5,
      consistency: 8,
      reactionTime: 3
    }
  }
}