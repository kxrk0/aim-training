import { motion } from 'framer-motion'

// Mock data - bu daha sonra API'den gelecek
const mockLeaderboard = [
  { rank: 1, username: 'ProGamer_2024', score: 9850, accuracy: 98.5, mode: 'Precision' },
  { rank: 2, username: 'AimMaster', score: 9720, accuracy: 97.2, mode: 'Precision' },
  { rank: 3, username: 'Headshot_King', score: 9680, accuracy: 96.8, mode: 'Precision' },
  { rank: 4, username: 'FlickGod', score: 9500, accuracy: 95.0, mode: 'Precision' },
  { rank: 5, username: 'Crosshair_Pro', score: 9350, accuracy: 93.5, mode: 'Precision' },
]

export function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark to-gray-900 p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gaming-primary mb-4">
            🏆 GLOBAL LEADERBOARD
          </h1>
          <p className="text-gray-400">
            Top performers in aim training challenges
          </p>
        </motion.div>

        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center space-x-4 mb-8"
        >
          {['Precision', 'Speed', 'Tracking', 'Flick'].map((mode) => (
            <button
              key={mode}
              className="gaming-button-secondary text-sm"
            >
              {mode}
            </button>
          ))}
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hud-element"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gaming-primary/30">
                  <th className="text-left py-4 px-6 text-gaming-primary">Rank</th>
                  <th className="text-left py-4 px-6 text-gaming-primary">Player</th>
                  <th className="text-left py-4 px-6 text-gaming-primary">Score</th>
                  <th className="text-left py-4 px-6 text-gaming-primary">Accuracy</th>
                  <th className="text-left py-4 px-6 text-gaming-primary">Mode</th>
                </tr>
              </thead>
              <tbody>
                {mockLeaderboard.map((player, index) => (
                  <motion.tr
                    key={player.username}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="border-b border-gray-700 hover:bg-gaming-primary/5 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className={`
                          ${player.rank === 1 ? 'text-yellow-400' : ''}
                          ${player.rank === 2 ? 'text-gray-300' : ''}
                          ${player.rank === 3 ? 'text-orange-400' : ''}
                          font-bold
                        `}>
                          #{player.rank}
                        </span>
                        {player.rank <= 3 && (
                          <span className="text-xl">
                            {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium">{player.username}</td>
                    <td className="py-4 px-6 text-gaming-primary font-bold">
                      {player.score.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">{player.accuracy}%</td>
                    <td className="py-4 px-6">
                      <span className="bg-gaming-primary/20 text-gaming-primary px-2 py-1 rounded text-sm">
                        {player.mode}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Personal Best */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 hud-element"
        >
          <h3 className="text-xl font-bold text-gaming-primary mb-4">Your Best Scores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['Precision', 'Speed', 'Tracking', 'Flick'].map((mode) => (
              <div key={mode} className="bg-gray-800 rounded-lg p-4 text-center">
                <h4 className="font-semibold text-gaming-primary">{mode}</h4>
                <p className="text-2xl font-bold text-white mt-2">-</p>
                <p className="text-sm text-gray-400">No attempts yet</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
} 