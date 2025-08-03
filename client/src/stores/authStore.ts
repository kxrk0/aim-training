import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { apiService } from '../services/api'
import { firebaseAuth } from '../services/firebase'
import type { User as FirebaseUser } from 'firebase/auth'

interface User {
  id: string
  email: string
  username: string
  displayName?: string
  level: number
  totalScore: number
  totalShots: number
  totalHits: number
  hoursPlayed: number
  avatar?: string
  photoURL?: string
  provider?: string
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  username: string
  password: string
}

interface AuthState {
  user: User | null
  token: string | null
  firebaseUser: FirebaseUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  authProvider: 'backend' | 'firebase' | 'guest' | null
}

interface AuthActions {
  // Traditional backend authentication
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  
  // Firebase authentication
  loginWithFirebaseEmail: (email: string, password: string) => Promise<void>
  registerWithFirebaseEmail: (email: string, password: string, username: string) => Promise<void>
  loginWithFirebaseGoogle: () => Promise<void>
  
  // Common actions
  logout: () => void
  getProfile: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  setToken: (token: string) => void
  clearError: () => void
  
  // Firebase specific
  syncFirebaseUser: (firebaseUser: FirebaseUser | null) => Promise<void>
  
  // Guest mode (for Electron)
  enableGuestMode: () => void
}

export type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // State
        user: null,
        token: null,
        firebaseUser: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        authProvider: null,

        // Actions
        login: async (credentials) => {
          set({ isLoading: true, error: null })
          try {
            const response = await apiService.login(credentials)
            const { user, token } = response.data
            
            // Set token in API service
            apiService.setToken(token)
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false
            })
          } catch (error: any) {
            set({
              error: error.response?.data?.error?.message || 'Login failed',
              isLoading: false
            })
            throw error
          }
        },

        register: async (userData) => {
          set({ isLoading: true, error: null })
          try {
            const response = await apiService.register(userData)
            const { user, token } = response.data
            
            // Set token in API service
            apiService.setToken(token)
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false
            })
          } catch (error: any) {
            set({
              error: error.response?.data?.error?.message || 'Registration failed',
              isLoading: false
            })
            throw error
          }
        },

        logout: async () => {
          const { authProvider } = get()
          
          try {
            // Logout from Firebase if using Firebase auth
            if (authProvider === 'firebase') {
              await firebaseAuth.logout()
            }
            
            // Always clear backend token
            apiService.clearToken()
            
            set({
              user: null,
              token: null,
              firebaseUser: null,
              isAuthenticated: false,
              authProvider: null,
              error: null
            })
          } catch (error) {
            console.error('Logout error:', error)
            // Force logout even if there's an error
            set({
              user: null,
              token: null,
              firebaseUser: null,
              isAuthenticated: false,
              authProvider: null,
              error: null
            })
          }
        },

        getProfile: async () => {
          set({ isLoading: true, error: null })
          try {
            const response = await apiService.getProfile()
            const user = response.data
            
            set({
              user,
              isLoading: false
            })
          } catch (error: any) {
            set({
              error: error.response?.data?.error?.message || 'Failed to get profile',
              isLoading: false
            })
            throw error
          }
        },

        updateProfile: async (data) => {
          set({ isLoading: true, error: null })
          try {
            const response = await apiService.updateProfile(data)
            const user = response.data
            
            set({
              user,
              isLoading: false
            })
          } catch (error: any) {
            set({
              error: error.response?.data?.error?.message || 'Failed to update profile',
              isLoading: false
            })
            throw error
          }
        },

        setToken: (token: string) => {
          apiService.setToken(token)
          set({
            token,
            isAuthenticated: true
          })
        },

        clearError: () => {
          set({ error: null })
        },

                 // Firebase specific actions
         loginWithFirebaseEmail: async (email, password) => {
           set({ isLoading: true, error: null })
           try {
             const firebaseUser = await firebaseAuth.loginWithEmail(email, password)
             set({ 
               firebaseUser, 
               isAuthenticated: true, 
               isLoading: false,
               authProvider: 'firebase'
             })
             // Sync Firebase user with backend
             await get().syncFirebaseUser(firebaseUser)
           } catch (error: any) {
             set({
               error: error.message || 'Firebase login failed',
               isLoading: false
             })
             throw error
           }
         },

         registerWithFirebaseEmail: async (email, password, username) => {
           set({ isLoading: true, error: null })
           try {
             const firebaseUser = await firebaseAuth.registerWithEmail(email, password)
             set({ 
               firebaseUser, 
               isAuthenticated: true, 
               isLoading: false,
               authProvider: 'firebase'
             })
             // Sync Firebase user with backend
             await get().syncFirebaseUser(firebaseUser)
           } catch (error: any) {
             set({
               error: error.message || 'Firebase registration failed',
               isLoading: false
             })
             throw error
           }
         },

         loginWithFirebaseGoogle: async () => {
           set({ isLoading: true, error: null })
           try {
             const firebaseUser = await firebaseAuth.loginWithGoogle()
             set({ 
               firebaseUser, 
               isAuthenticated: true, 
               isLoading: false,
               authProvider: 'firebase'
             })
             // Sync Firebase user with backend
             await get().syncFirebaseUser(firebaseUser)
           } catch (error: any) {
             set({
               error: error.message || 'Firebase Google login failed',
               isLoading: false
             })
             throw error
           }
         },

        syncFirebaseUser: async (firebaseUser) => {
          if (firebaseUser) {
            // Generate username from displayName or email
            const username = firebaseUser.displayName || 
                           (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User')

            set({ 
              authProvider: 'firebase',
              firebaseUser,
              isAuthenticated: true,
              user: { 
                id: firebaseUser.uid, 
                email: firebaseUser.email || '', 
                username: username,
                displayName: firebaseUser.displayName || username,
                level: Math.floor(Math.random() * 50) + 1, // Random level for demo
                totalScore: Math.floor(Math.random() * 10000),
                totalShots: Math.floor(Math.random() * 5000), 
                totalHits: Math.floor(Math.random() * 4000), 
                hoursPlayed: Math.floor(Math.random() * 100),
                photoURL: firebaseUser.photoURL || undefined,
                provider: 'google'
              }
            })
          } else {
            set({ 
              authProvider: null, 
              user: null, 
              firebaseUser: null,
              isAuthenticated: false 
            })
          }
        },

        // Guest mode for Electron (bypass authentication)
        enableGuestMode: () => {
          console.log('🎯 Enabling guest mode for Electron')
          const guestId = `guest_${Date.now()}`
          set({ 
            authProvider: 'guest',
            firebaseUser: null,
            isAuthenticated: true,
            user: { 
              id: guestId, 
              email: 'guest@aimtrainer.com', 
              username: `Guest_${guestId.slice(-6)}`,
              displayName: `Guest Player`,
              level: 1,
              totalScore: 0,
              totalShots: 0, 
              totalHits: 0, 
              hoursPlayed: 0,
              provider: 'guest'
            },
            token: null,
            error: null
          })
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated
        }),
        onRehydrateStorage: () => (state) => {
          if (state?.token) {
            apiService.setToken(state.token)
            // Automatically get profile if token exists
            state.getProfile().catch(() => {
              // If profile fetch fails, clear auth
              state.logout()
            })
          }
        }
      }
    )
  )
) 