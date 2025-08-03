import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
  )
}

export default App 