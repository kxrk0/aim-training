import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { GamePage } from '@/pages/GamePage'
import { LeaderboardPage } from '@/pages/LeaderboardPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { AchievementsPage } from '@/pages/AchievementsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AdvancedFlickTraining } from '@/components/training/AdvancedFlickTraining'
import { AIPredictionTraining } from '@/components/training/AIPredictionTraining'
import { SpectatorViewer } from '@/components/spectator/SpectatorViewer'
import { PartyLobby } from '@/components/party/PartyLobby'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { AuthSelector } from '@/components/auth/AuthSelector'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { XPDemoPage } from '@/pages/XPDemoPage'
import { TrainingHubPage } from '@/pages/TrainingHubPage'
import TournamentPage from '@/pages/TournamentPage'
import SeasonPage from '@/pages/SeasonPage'
import { PartyGamePage } from '@/pages/PartyGamePage'

import { CompetitionMatchmaking } from '@/components/competition/CompetitionMatchmaking'



// Phase 8 Features
import AnalyticsPage from '@/pages/AnalyticsPage'
import { AdaptiveTraining } from '@/components/training/AdaptiveTraining'

import { HardwareOptimization } from '@/components/hardware/HardwareOptimization'
import { ReplaySystem } from '@/components/replay/ReplaySystem'
import { TrainingGuilds } from '@/components/community/TrainingGuilds'
import { CustomTraining } from '@/components/training/CustomTraining'
import { SocialFeatures } from '@/components/social/SocialFeatures'

import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { useAuthStore } from '@/stores/authStore'
import { useEffect, useState } from 'react'

// Loading stages for progressive initialization
const loadingStages = [
  'Starting up...',
  'Loading core systems...',
  'Initializing graphics engine...',
  'Connecting to servers...',
  'Setting up authentication...',
  'Preparing training environment...',
  'Loading complete!'
]

function App() {
  // Initialize Firebase authentication state monitoring
  useFirebaseAuth()
  
  const { enableGuestMode, isAuthenticated } = useAuthStore()
  const [loadingStage, setLoadingStage] = useState(0)
  const [isAppReady, setIsAppReady] = useState(false)

  // Progressive loading simulation
  useEffect(() => {
    const loadingInterval = setInterval(() => {
      setLoadingStage(prev => {
        const next = prev + 1
        if (next < loadingStages.length) {
          const statusElement = document.getElementById('loading-status')
          if (statusElement) {
            statusElement.textContent = loadingStages[next]
          }
          return next
        } else {
          clearInterval(loadingInterval)
          return prev
        }
      })
    }, 600)

    return () => clearInterval(loadingInterval)
  }, [])
  
  // Auto-enable guest mode for Electron
  useEffect(() => {
    const isElectron = window.location.protocol === 'file:' || 
                     window.location.origin === 'file://' || 
                     window.location.hostname === '' || 
                     (typeof window !== 'undefined' && (window as any).electronAPI)
    
    if (isElectron && !isAuthenticated) {
      console.log('🖥️ Electron detected - enabling guest mode')
      
      // Delay guest mode activation for loading animation
      setTimeout(() => {
        enableGuestMode()
      }, 2000)
    }
  }, [enableGuestMode, isAuthenticated])
  
  // Handle loading screen removal with smooth transition
  useEffect(() => {
    if (isAuthenticated && loadingStage >= loadingStages.length - 1) {
      console.log('✅ Authentication complete - preparing app transition')
      
      const statusElement = document.getElementById('loading-status')
      if (statusElement) {
        statusElement.textContent = 'Launching application...'
      }
      
      // Smooth transition sequence
      setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen')
        const rootElement = document.getElementById('root')
        
        if (loadingScreen && rootElement) {
          // First make root element visible
          rootElement.style.opacity = '1'
          rootElement.style.display = 'block'
          rootElement.style.visibility = 'visible'
          rootElement.style.position = 'relative'
          rootElement.style.zIndex = '1'
          rootElement.style.width = '100%'
          rootElement.style.height = '100vh'
          
          console.log('📦 Root element visibility updated:', {
            opacity: rootElement.style.opacity,
            display: rootElement.style.display,
            visibility: rootElement.style.visibility,
            position: rootElement.style.position,
            zIndex: rootElement.style.zIndex
          })
          
          // Then fade out loading screen
          loadingScreen.classList.add('fade-out')
          
          setTimeout(() => {
            loadingScreen.style.display = 'none'
            loadingScreen.style.visibility = 'hidden'
            setIsAppReady(true)
            console.log('🎉 App is ready and visible!')
            
            // Force a repaint to ensure visibility
            rootElement.style.transform = 'translateZ(0)'
            requestAnimationFrame(() => {
              rootElement.style.transform = ''
            })
            
            console.log('🔍 Final root styles:', {
              opacity: rootElement.style.opacity,
              display: rootElement.style.display,
              visibility: rootElement.style.visibility,
              clientHeight: rootElement.clientHeight,
              scrollHeight: rootElement.scrollHeight,
              children: rootElement.children.length
            })
          }, 500)
        }
      }, 800)
    }
  }, [isAuthenticated, loadingStage])
  
  // Conditional rendering to ensure proper visibility
  console.log('🚀 App render state:', { isAuthenticated, isAppReady, loadingStage })
  
  // Don't render anything until app is ready
  if (!isAuthenticated) {
    return null
  }
  
  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'block',
      opacity: 1,
      position: 'relative',
      zIndex: 1
    }}>
      <Router>
        <Routes>
          {/* Authentication Routes - Without Layout */}
          <Route path="/auth" element={<AuthSelector />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          
          {/* Main App Routes - With Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="train" element={<GamePage />} />
            <Route path="training-hub" element={<TrainingHubPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="advanced-flick-training" element={<AdvancedFlickTraining />} />
            <Route path="ai-prediction-training" element={<AIPredictionTraining />} />
            <Route path="party" element={<PartyLobby />} />
            <Route path="party/:inviteCode" element={<PartyLobby />} />
            <Route path="party-game/:partyId" element={<PartyGamePage />} />
            <Route path="spectate/:partyId" element={<SpectatorViewer partyId="" onExit={() => {}} />} />
            <Route path="profile" element={<ProfilePage />} />
              <Route path="xp-demo" element={<XPDemoPage />} />
            <Route path="settings" element={<SettingsPage />} />

            <Route path="competition" element={<CompetitionMatchmaking />} />
            <Route path="tournaments" element={<TournamentPage />} />
            <Route path="seasons" element={<SeasonPage />} />

            
            {/* Phase 8 Advanced Features */}
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="adaptive-training" element={<AdaptiveTraining />} />

            <Route path="hardware" element={<HardwareOptimization />} />
            <Route path="replay" element={<ReplaySystem />} />
            <Route path="guilds" element={<TrainingGuilds />} />
            <Route path="custom-training" element={<CustomTraining />} />
            <Route path="social" element={<SocialFeatures />} />
          </Route>
        </Routes>
      </Router>
    </div>
  )
}

export default App 