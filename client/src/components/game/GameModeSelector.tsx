import { motion } from 'framer-motion'

const gameModes = [
  {
    id: 'precision',
    name: 'Precision',
    description: 'Static targets, focus on accuracy',
    icon: '🎯',
    color: 'text-blue-400',
    difficulty: 'Medium',
    duration: '60s'
  },
  {
    id: 'speed',
    name: 'Speed',
    description: 'Fast spawning targets, test reaction time',
    icon: '⚡',
    color: 'text-yellow-400',
    difficulty: 'Hard',
    duration: '30s'
  },
  {
    id: 'tracking',
    name: 'Tracking',
    description: 'Moving targets, improve tracking skills',
    icon: '🎪',
    color: 'text-green-400',
    difficulty: 'Hard',
    duration: '45s'
  },
  {
    id: 'flick',
    name: 'Flick',
    description: 'Distant targets, quick flick movements',
    icon: '💨',
    color: 'text-purple-400',
    difficulty: 'Expert',
    duration: '40s'
  }
]

interface GameModeSelectorProps {
  onSelectMode: (mode: string) => void
}

export function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark to-gray-900 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gaming-primary mb-4">
            🎯 SELECT TRAINING MODE
          </h1>
          <p className="text-xl text-gray-300">
            Choose your training focus and start improving your aim
          </p>
        </motion.div>

        {/* Game Mode Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {gameModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="hud-element hover:border-gaming-primary/50 transition-colors cursor-pointer group"
              onClick={() => onSelectMode(mode.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-6">
                {/* Icon and Title */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{mode.icon}</div>
                  <div>
                    <h3 className={`text-2xl font-bold ${mode.color} group-hover:text-gaming-primary transition-colors`}>
                      {mode.name}
                    </h3>
                    <p className="text-gray-400">{mode.description}</p>
                  </div>
                </div>

                {/* Mode Details */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-400">Difficulty</div>
                    <div className={`font-semibold ${
                      mode.difficulty === 'Medium' ? 'text-yellow-400' :
                      mode.difficulty === 'Hard' ? 'text-orange-400' :
                      'text-red-400'
                    }`}>
                      {mode.difficulty}
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-400">Duration</div>
                    <div className="font-semibold text-gaming-primary">
                      {mode.duration}
                    </div>
                  </div>
                </div>

                {/* Play Button */}
                <motion.button
                  className="w-full mt-6 gaming-button group-hover:bg-gaming-primary group-hover:text-gaming-dark"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🎮 START {mode.name.toUpperCase()}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <button
            className="gaming-button-secondary"
            onClick={() => window.history.back()}
          >
            ← Back to Menu
          </button>
        </motion.div>
      </div>
    </div>
  )
} 