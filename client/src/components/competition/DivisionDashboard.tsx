import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDivisionStore, DivisionHelpers } from '@/stores/divisionStore'
import { useAuthStore } from '@/stores/authStore'
import type { DivisionTier, UserDivisionStatus } from '../../../../shared/types'
import {
  FaCrown, FaTrophy, FaMedal, FaChartLine, FaFire, FaGamepad,
  FaArrowUp, FaArrowDown, FaUsers, FaStar, FaBolt, FaCrosshairs,
  FaCog, FaPlay, FaEye, FaHistory, FaCalendarAlt, FaGem
} from 'react-icons/fa'

export function DivisionDashboard() {
  const {
    currentDivision,
    allDivisions,
    divisionLeaderboards,
    skillAssessment,
    isInPlacementMatches,
    placementMatchesRemaining,
    seasonInfo,
    isLoading,
    error,
    selectedDivision,
    assessUserSkill,
    startPlacementMatches,
    fetchDivisionLeaderboards,
    fetchUserDivisionStatus,
    setSelectedDivision
  } = useDivisionStore()

  const { user } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'history' | 'placement'>('overview')
  const [selectedGameMode, setSelectedGameMode] = useState<'precision' | 'speed' | 'tracking' | 'flick'>('precision')

  // Fetch user data on mount
  useEffect(() => {
    if (user) {
      fetchUserDivisionStatus(user.id)
      if (!isInPlacementMatches && currentDivision) {
        fetchDivisionLeaderboards()
      }
    }
  }, [user])

  const handleStartPlacement = async () => {
    if (!user) return
    await startPlacementMatches(user.id)
  }

  const handleSkillAssessment = async () => {
    if (!user) return
    await assessUserSkill(user.id, selectedGameMode)
  }

  // Division progress calculation
  const getDivisionProgress = (status: UserDivisionStatus) => {
    const currentDiv = allDivisions.find(d => d.tier === status.currentDivision)
    if (!currentDiv) return { percentage: 0, mmrInDivision: 0, totalMMR: 1000 }
    
    const mmrRange = currentDiv.maxMMR - currentDiv.minMMR
    const mmrInDivision = status.currentMMR - currentDiv.minMMR
    const percentage = Math.max(0, Math.min(100, (mmrInDivision / mmrRange) * 100))
    
    return { percentage, mmrInDivision, totalMMR: mmrRange }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <FaChartLine /> },
    { id: 'leaderboard', name: 'Leaderboard', icon: <FaTrophy /> },
    { id: 'history', name: 'History', icon: <FaHistory /> },
    { id: 'placement', name: 'Placement', icon: <FaPlay /> }
  ]

  if (error) {
    return (
      <div className="bg-red-600/20 border border-red-600 rounded-lg p-6 text-red-400">
        <h3 className="font-semibold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center space-x-3">
          <FaCrown className="text-yellow-400" />
          <span>Competitive Divisions</span>
        </h1>
        <p className="text-gray-400">Climb the ranks and prove your skill</p>
      </div>

      {/* Current Division Status */}
      {currentDivision && !isInPlacementMatches && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Division Info */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${
                allDivisions.find(d => d.tier === currentDivision.currentDivision)?.gradientColor || 'from-gray-500 to-gray-600'
              } mb-4`}>
                <span className="text-3xl">
                  {DivisionHelpers.getDivisionIcon(currentDivision.currentDivision)}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {DivisionHelpers.formatDivisionName(currentDivision.currentDivision)}
              </h2>
              <p className="text-gray-400 text-sm">
                {allDivisions.find(d => d.tier === currentDivision.currentDivision)?.description}
              </p>
            </div>

            {/* MMR Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">MMR Progress</span>
                <span className="text-white font-bold">{currentDivision.currentMMR}</span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                <div
                  className={`h-4 rounded-full bg-gradient-to-r ${
                    allDivisions.find(d => d.tier === currentDivision.currentDivision)?.gradientColor || 'from-gray-500 to-gray-600'
                  } transition-all duration-500`}
                  style={{ width: `${getDivisionProgress(currentDivision).percentage}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{currentDivision.seasonStats.winRate.toFixed(1)}%</div>
                  <div className="text-gray-400">Win Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{currentDivision.seasonStats.gamesPlayed}</div>
                  <div className="text-gray-400">Games Played</div>
                </div>
              </div>
            </div>

            {/* Season Stats */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Season Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Highest Division:</span>
                  <span className="text-white font-medium">
                    {DivisionHelpers.formatDivisionName(currentDivision.seasonStats.highestDivision)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Streak:</span>
                  <span className={`font-bold ${currentDivision.seasonStats.currentStreak >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {currentDivision.seasonStats.currentStreak >= 0 ? '+' : ''}{currentDivision.seasonStats.currentStreak}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Best Streak:</span>
                  <span className="text-green-400 font-bold">+{currentDivision.seasonStats.longestWinStreak}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Accuracy:</span>
                  <span className="text-white font-medium">{currentDivision.seasonStats.averageAccuracy.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Promotion/Demotion Indicators */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Promotion Progress */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FaArrowUp className="text-green-400" />
                <span className="text-green-400 font-medium">Promotion Progress</span>
              </div>
              <div className="text-sm text-gray-300">
                Wins: {currentDivision.promotionProgress.currentWins}/{allDivisions.find(d => d.tier === currentDivision.currentDivision)?.promotionRequirement.winsRequired || 0}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, (currentDivision.promotionProgress.currentWins / (allDivisions.find(d => d.tier === currentDivision.currentDivision)?.promotionRequirement.winsRequired || 1)) * 100)}%` 
                  }}
                />
              </div>
            </div>

            {/* Demotion Shield */}
            <div className={`border rounded-lg p-4 ${
              currentDivision.demotionShield.isActive 
                ? 'bg-blue-500/10 border-blue-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <FaGamepad className={currentDivision.demotionShield.isActive ? 'text-blue-400' : 'text-red-400'} />
                <span className={`font-medium ${currentDivision.demotionShield.isActive ? 'text-blue-400' : 'text-red-400'}`}>
                  Demotion {currentDivision.demotionShield.isActive ? 'Shield' : 'Risk'}
                </span>
              </div>
              <div className="text-sm text-gray-300">
                {currentDivision.demotionShield.isActive 
                  ? `Protected for ${currentDivision.demotionShield.gamesRemaining} games`
                  : 'At risk of demotion'
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placement Matches */}
      {isInPlacementMatches && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="text-center">
            <FaPlay className="text-yellow-400 text-4xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Placement Matches</h2>
            <p className="text-gray-400 mb-4">
              Complete {placementMatchesRemaining} more matches to determine your starting division
            </p>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-4 max-w-md mx-auto">
              <div
                className="bg-yellow-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((10 - placementMatchesRemaining) / 10) * 100}%` }}
              />
            </div>
            <div className="text-yellow-400 font-bold">
              {10 - placementMatchesRemaining}/10 Completed
            </div>
          </div>
        </div>
      )}

      {/* No Division Status */}
      {!currentDivision && !isInPlacementMatches && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center">
          <FaCrosshairs className="text-6xl text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Start Your Competitive Journey</h2>
          <p className="text-gray-400 mb-6">
            Complete placement matches to determine your skill level and get placed in a division
          </p>
          <div className="space-y-4">
            <button
              onClick={handleStartPlacement}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Starting...' : 'Start Placement Matches'}
            </button>
            <div className="text-sm text-gray-500">
              10 matches required for initial placement
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Division Overview */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">All Divisions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {allDivisions.map((division) => (
                      <DivisionCard
                        key={division.tier}
                        division={division}
                        isCurrentDivision={currentDivision?.currentDivision === division.tier}
                        onClick={() => setSelectedDivision(division.tier)}
                      />
                    ))}
                  </div>
                </div>

                {/* Season Information */}
                <div className="bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                    <FaCalendarAlt />
                    <span>Season Information</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{seasonInfo.currentSeason}</div>
                      <div className="text-gray-400">Current Season</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">
                        {Math.ceil((new Date(seasonInfo.seasonEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                      </div>
                      <div className="text-gray-400">Season Ends</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">
                        {Math.ceil((new Date(seasonInfo.nextResetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                      </div>
                      <div className="text-gray-400">Next Reset</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center py-12">
                  <FaTrophy className="text-6xl text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Leaderboards Coming Soon</h3>
                  <p className="text-gray-400">Division leaderboards and rankings will be available soon!</p>
                </div>
              </motion.div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {currentDivision?.history.length ? (
                  <div className="space-y-3">
                    {currentDivision.history.map((entry) => (
                      <div key={entry.id} className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            entry.type === 'promotion' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {entry.type === 'promotion' ? <FaArrowUp /> : <FaArrowDown />}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {entry.type === 'promotion' ? 'Promoted to' : 'Demoted to'} {DivisionHelpers.formatDivisionName(entry.toDivision)}
                            </div>
                            <div className="text-gray-400 text-sm">{entry.reason}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-400 text-sm">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </div>
                          <div className={`text-sm font-medium ${entry.mmrChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {entry.mmrChange >= 0 ? '+' : ''}{entry.mmrChange} MMR
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FaHistory className="text-6xl text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No History Yet</h3>
                    <p className="text-gray-400">Your division history will appear here as you play</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Placement Tab */}
            {activeTab === 'placement' && (
              <motion.div
                key="placement"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-4">Skill Assessment</h3>
                  <p className="text-gray-400 mb-6">
                    Get a detailed analysis of your skills and recommended division placement
                  </p>
                  
                  <div className="mb-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Game Mode</label>
                    <select
                      value={selectedGameMode}
                      onChange={(e) => setSelectedGameMode(e.target.value as any)}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="precision">Precision</option>
                      <option value="speed">Speed</option>
                      <option value="tracking">Tracking</option>
                      <option value="flick">Flick</option>
                    </select>
                  </div>

                  <button
                    onClick={handleSkillAssessment}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? 'Assessing...' : 'Start Skill Assessment'}
                  </button>
                </div>

                {/* Skill Assessment Results */}
                {skillAssessment && (
                  <div className="bg-gray-700/50 rounded-lg p-6">
                    <h4 className="text-lg font-bold text-white mb-4">Assessment Results</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-purple-400">{skillAssessment.overallSkillRating}</div>
                          <div className="text-gray-400">Overall Skill Rating</div>
                        </div>
                        
                        <div className="space-y-2">
                          {Object.entries(skillAssessment.skillBreakdown).map(([skill, value]) => (
                            <div key={skill} className="flex justify-between">
                              <span className="text-gray-400 capitalize">{skill}:</span>
                              <span className="text-white font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-center mb-4">
                          <div className="text-2xl font-bold text-white">
                            {DivisionHelpers.formatDivisionName(skillAssessment.recommendedDivision)}
                          </div>
                          <div className="text-gray-400">Recommended Division</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">{skillAssessment.confidence}%</div>
                          <div className="text-gray-400">Confidence</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// Division Card Component
function DivisionCard({ 
  division, 
  isCurrentDivision, 
  onClick 
}: { 
  division: any
  isCurrentDivision: boolean
  onClick: () => void 
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all text-center ${
        isCurrentDivision
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`text-4xl mb-2 ${isCurrentDivision ? 'animate-pulse' : ''}`}>
        {division.icon}
      </div>
      <div className="text-white font-semibold text-sm">{division.name}</div>
      <div className="text-gray-400 text-xs">{division.minMMR}-{division.maxMMR} MMR</div>
      {isCurrentDivision && (
        <div className="text-blue-400 text-xs mt-1 font-medium">CURRENT</div>
      )}
    </motion.button>
  )
} 