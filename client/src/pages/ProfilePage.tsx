import { motion } from 'framer-motion'

// Mock data
const mockUserStats = {
  username: 'Player_123',
  level: 15,
  totalShots: 8420,
  totalHits: 7654,
  accuracy: 90.9,
  averageReactionTime: 245,
  gamesPlayed: 156,
  hoursPlayed: 24.5,
  bestScores: {
    precision: 9250,
    speed: 8960,
    tracking: 7840,
    flick: 8150
  }
}

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark to-gray-900 p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gaming-primary mb-4">
            👤 PLAYER PROFILE
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="hud-element text-center">
              <div className="w-24 h-24 bg-gaming-primary rounded-full mx-auto mb-4 flex items-center justify-center text-4xl text-gaming-dark font-bold">
                {mockUserStats.username.charAt(0)}
              </div>
              <h2 className="text-2xl font-bold text-gaming-primary mb-2">
                {mockUserStats.username}
              </h2>
              <div className="bg-gaming-primary/20 rounded-lg p-2 inline-block">
                <span className="text-gaming-primary font-semibold">
                  Level {mockUserStats.level}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="hud-element text-center">
                <div className="text-3xl text-gaming-primary font-bold">
                  {mockUserStats.accuracy}%
                </div>
                <div className="text-sm text-gray-400">Accuracy</div>
              </div>
              
              <div className="hud-element text-center">
                <div className="text-3xl text-gaming-primary font-bold">
                  {mockUserStats.averageReactionTime}ms
                </div>
                <div className="text-sm text-gray-400">Avg Reaction</div>
              </div>
              
              <div className="hud-element text-center">
                <div className="text-3xl text-gaming-primary font-bold">
                  {mockUserStats.gamesPlayed}
                </div>
                <div className="text-sm text-gray-400">Games Played</div>
              </div>
              
              <div className="hud-element text-center">
                <div className="text-3xl text-gaming-primary font-bold">
                  {mockUserStats.hoursPlayed}h
                </div>
                <div className="text-sm text-gray-400">Time Played</div>
              </div>
            </div>

            {/* Best Scores */}
            <div className="hud-element">
              <h3 className="text-xl font-bold text-gaming-primary mb-4">Best Scores</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(mockUserStats.bestScores).map(([mode, score]) => (
                  <div key={mode} className="bg-gray-800 rounded-lg p-4 text-center">
                    <h4 className="font-semibold text-gaming-primary capitalize">
                      {mode}
                    </h4>
                    <p className="text-2xl font-bold text-white mt-2">
                      {score.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 hud-element"
        >
          <h3 className="text-xl font-bold text-gaming-primary mb-6">Performance Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Shot Accuracy */}
            <div>
              <h4 className="font-semibold mb-4">Shot Accuracy</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Total Shots:</span>
                  <span className="font-bold">{mockUserStats.totalShots.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Hits:</span>
                  <span className="font-bold text-gaming-primary">{mockUserStats.totalHits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Misses:</span>
                  <span className="font-bold text-red-400">{(mockUserStats.totalShots - mockUserStats.totalHits).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Progress Chart Placeholder */}
            <div>
              <h4 className="font-semibold mb-4">Progress Over Time</h4>
              <div className="bg-gray-800 rounded-lg h-32 flex items-center justify-center">
                <span className="text-gray-500">Chart Coming Soon</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center space-x-4"
        >
          <button className="gaming-button">
            🎯 Continue Training
          </button>
          <button className="gaming-button-secondary">
            📊 View Detailed Stats
          </button>
        </motion.div>
      </div>
    </div>
  )
} 