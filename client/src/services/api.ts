import axios, { AxiosInstance, AxiosResponse } from 'axios'
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  User,
  GameSession, 
  Score, 
  LeaderboardEntry,
  ApiResponse 
} from '../../../shared/types'

class ApiService {
  private api: AxiosInstance
  private baseURL: string

  private getApiUrl(): string {
    // Production VPS URL
    if (window.location.protocol === 'file:') {
      // Desktop app (Electron) - connect to VPS
      return 'https://aim.liorabelleleather.com/api'
    }
    
    if (window.location.hostname === 'myaimtrainer.loca.lt') {
      return 'https://myaimtrainer.loca.lt/api'  // Use tunnel URL for API too
    }
    
    // Development fallback
    return (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api'
  }

  constructor() {
    // Dynamic API URL based on current host
    this.baseURL = this.getApiUrl()
    console.log('🌐 API URL:', this.baseURL)
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Auto logout on 401 errors
        if (error.response?.status === 401) {
          this.clearToken()
          // Redirect to login page or trigger logout
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Token management
  setToken(token: string) {
    localStorage.setItem('auth_token', token)
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  clearToken() {
    localStorage.removeItem('auth_token')
  }

  // Authentication endpoints
  async register(userData: RegisterRequest): Promise<AxiosResponse<AuthResponse>> {
    return this.api.post('/auth/register', userData)
  }

  async login(credentials: LoginRequest): Promise<AxiosResponse<AuthResponse>> {
    return this.api.post('/auth/login', credentials)
  }

  async getProfile(): Promise<AxiosResponse<User>> {
    return this.api.get('/auth/profile')
  }

  async updateProfile(data: Partial<User>): Promise<AxiosResponse<User>> {
    return this.api.put('/auth/profile', data)
  }

  // Game endpoints
  async startGameSession(gameMode: string, settings: any): Promise<AxiosResponse<GameSession>> {
    return this.api.post('/games/start', { gameMode, settings })
  }

  async endGameSession(sessionId: string, results: any): Promise<AxiosResponse<any>> {
    return this.api.post(`/games/${sessionId}/end`, results)
  }

  async submitScore(scoreData: any): Promise<AxiosResponse<Score>> {
    return this.api.post('/games/score', scoreData)
  }

  async getGameHistory(userId?: string): Promise<AxiosResponse<GameSession[]>> {
    const endpoint = userId ? `/games/history/${userId}` : '/games/history'
    return this.api.get(endpoint)
  }

  // Leaderboard endpoints
  async getGlobalLeaderboard(gameMode?: string): Promise<AxiosResponse<LeaderboardEntry[]>> {
    const params = gameMode ? { gameMode } : {}
    return this.api.get('/leaderboards/global', { params })
  }

  async getDailyLeaderboard(gameMode?: string): Promise<AxiosResponse<LeaderboardEntry[]>> {
    const params = gameMode ? { gameMode } : {}
    return this.api.get('/leaderboards/daily', { params })
  }

  async getWeeklyLeaderboard(gameMode?: string): Promise<AxiosResponse<LeaderboardEntry[]>> {
    const params = gameMode ? { gameMode } : {}
    return this.api.get('/leaderboards/weekly', { params })
  }

  async getUserRank(userId: string, gameMode?: string): Promise<AxiosResponse<any>> {
    const params = gameMode ? { gameMode } : {}
    return this.api.get(`/leaderboards/rank/${userId}`, { params })
  }

  // User endpoints
  async getUserStats(userId: string): Promise<AxiosResponse<any>> {
    return this.api.get(`/users/${userId}/stats`)
  }

  // Health check
  async healthCheck(): Promise<AxiosResponse<ApiResponse>> {
    return this.api.get('/health')
  }

  // 🆕 Sensitivity endpoints
  async getSensitivityProfile(): Promise<AxiosResponse<any>> {
    return this.api.get('/sensitivity/profile')
  }

  async updateSensitivityProfile(data: any): Promise<AxiosResponse<any>> {
    return this.api.put('/sensitivity/profile', data)
  }

  async submitTestResult(testResult: any): Promise<AxiosResponse<any>> {
    return this.api.post('/sensitivity/test-result', testResult)
  }

  async getTestResults(params: {
    testType?: string
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
  } = {}): Promise<AxiosResponse<any>> {
    return this.api.get('/sensitivity/test-results', { params })
  }

  async generateRecommendation(testResultIds?: string[]): Promise<AxiosResponse<any>> {
    return this.api.post('/sensitivity/recommendation', { testResultIds })
  }

  async convertSensitivity(data: {
    fromGame: string
    toGame: string
    sensitivity: number
    dpi: number
  }): Promise<AxiosResponse<any>> {
    return this.api.post('/sensitivity/convert', data)
  }

  async getConversionHistory(limit?: number): Promise<AxiosResponse<any>> {
    return this.api.get('/sensitivity/conversions', { params: { limit } })
  }

  async getAnalytics(): Promise<AxiosResponse<any>> {
    return this.api.get('/sensitivity/analytics')
  }

  async deleteTestResult(id: string): Promise<AxiosResponse<any>> {
    return this.api.delete(`/sensitivity/test-result/${id}`)
  }

  async clearSensitivityData(): Promise<AxiosResponse<any>> {
    return this.api.delete('/sensitivity/profile/clear')
  }

  // 🏆 Generic methods for new features
  async get(url: string, config?: any): Promise<AxiosResponse<any>> {
    return this.api.get(url, config)
  }

  async post(url: string, data?: any, config?: any): Promise<AxiosResponse<any>> {
    return this.api.post(url, data, config)
  }

  async put(url: string, data?: any, config?: any): Promise<AxiosResponse<any>> {
    return this.api.put(url, data, config)
  }

  async delete(url: string, config?: any): Promise<AxiosResponse<any>> {
    return this.api.delete(url, config)
  }
}

export const apiService = new ApiService()
export default apiService 