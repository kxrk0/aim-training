import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { GamePage } from '@/pages/GamePage'
import { LeaderboardPage } from '@/pages/LeaderboardPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { SettingsPage } from '@/pages/SettingsPage'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { AuthSelector } from '@/components/auth/AuthSelector'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { XPDemoPage } from '@/pages/XPDemoPage'
import { TrainingHubPage } from '@/pages/TrainingHubPage'

import { CompetitionMatchmaking } from '@/components/competition/CompetitionMatchmaking'



// Phase 8 Features
import { PerformanceAnalytics } from '@/components/analytics/PerformanceAnalytics'
import { AdaptiveTraining } from '@/components/training/AdaptiveTraining'

import { HardwareOptimization } from '@/components/hardware/HardwareOptimization'
import { ReplaySystem } from '@/components/replay/ReplaySystem'
import { TrainingGuilds } from '@/components/community/TrainingGuilds'
import { CustomTraining } from '@/components/training/CustomTraining'
import { SocialFeatures } from '@/components/social/SocialFeatures'

import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'

function App() {
  // Initialize Firebase authentication state monitoring
  useFirebaseAuth()
  return (
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
                      <Route path="profile" element={<ProfilePage />} />
            <Route path="xp-demo" element={<XPDemoPage />} />
          <Route path="settings" element={<SettingsPage />} />

          <Route path="competition" element={<CompetitionMatchmaking />} />


          
          {/* Phase 8 Advanced Features */}
          <Route path="analytics" element={<PerformanceAnalytics />} />
          <Route path="adaptive-training" element={<AdaptiveTraining />} />

          <Route path="hardware" element={<HardwareOptimization />} />
          <Route path="replay" element={<ReplaySystem />} />
          <Route path="guilds" element={<TrainingGuilds />} />
          <Route path="custom-training" element={<CustomTraining />} />
          <Route path="social" element={<SocialFeatures />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App 