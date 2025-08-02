import { motion } from 'framer-motion'

const gameModes = [
  {
    id: 'precision',
    name: 'Precision',
    description: 'Static targets with focus on perfect accuracy and consistency',
    icon: '🎯',
    color: 'from-blue-500 to-cyan-500',
    difficulty: 'Medium',
    duration: '60s',
    features: ['Static Targets', 'Accuracy Focus', 'Consistency Training']
  },
  {
    id: 'speed',
    name: 'Speed',
    description: 'Fast-spawning targets to enhance reaction time and reflexes',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500',
    difficulty: 'Hard',
    duration: '30s',
    features: ['Fast Targets', 'Reaction Time', 'Quick Reflexes']
  },
  {
    id: 'tracking',
    name: 'Tracking',
    description: 'Moving targets for smooth tracking and prediction skills',
    icon: '🎪',
    color: 'from-green-500 to-emerald-500',
    difficulty: 'Hard',
    duration: '45s',
    features: ['Moving Targets', 'Smooth Tracking', 'Prediction Skills']
  },
  {
    id: 'flick',
    name: 'Flick',
    description: 'Distant targets requiring quick and precise flick movements',
    icon: '💨',
    color: 'from-purple-500 to-pink-500',
    difficulty: 'Expert',
    duration: '40s',
    features: ['Distant Targets', 'Quick Flicks', 'Precision Control']
  }
]

interface GameModeSelectorProps {
  onSelectMode: (mode: string) => void
}

export function GameModeSelector({ onSelectMode }: GameModeSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-6xl mx-auto"
    >
      {/* Training Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gameModes.map((mode, index) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: index * 0.1, 
              duration: 0.6,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ 
              scale: 1.05, 
              y: -10,
              rotateY: 5,
            }}
            className="group perspective-1000 cursor-pointer"
            onClick={() => onSelectMode(mode.id)}
          >
            <div className={`
              relative p-8 h-full bg-gradient-to-br from-gray-900/90 to-black/90 
              backdrop-blur-sm rounded-2xl border border-gray-700/50 
              transition-all duration-500 group-hover:border-transparent
              shadow-xl group-hover:shadow-2xl transform-gpu
              group-hover:bg-gradient-to-br group-hover:${mode.color}/10
            `}>
              {/* Glowing border effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${mode.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur`}></div>
              
              {/* Header with Icon and Title */}
              <div className="flex items-center space-x-4 mb-6">
                <motion.div 
                  className="text-5xl group-hover:scale-110 transition-all duration-500"
                  whileHover={{ rotateY: 180 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {mode.icon}
                </motion.div>
                <div>
                  <h3 className={`text-2xl font-bold text-white mb-2 group-hover:bg-gradient-to-r group-hover:${mode.color} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500`}>
                    {mode.name}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-500 text-sm leading-relaxed">
                    {mode.description}
                  </p>
                </div>
              </div>

              {/* Features List */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Training Focus:</h4>
                <div className="space-y-2">
                  {mode.features.map((feature, featureIndex) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 + featureIndex * 0.05 }}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      <span className="text-gray-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mode Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/30">
                  <div className="text-xs text-gray-400 mb-1">Difficulty</div>
                  <div className={`font-bold text-sm ${
                    mode.difficulty === 'Medium' ? 'text-yellow-400' :
                    mode.difficulty === 'Hard' ? 'text-orange-400' :
                    'text-red-400'
                  }`}>
                    {mode.difficulty}
                  </div>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-700/30">
                  <div className="text-xs text-gray-400 mb-1">Duration</div>
                  <div className="font-bold text-sm text-orange-400">
                    {mode.duration}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-white 
                  bg-gradient-to-r ${mode.color} 
                  shadow-lg transition-all duration-300
                  group-hover:shadow-xl group-hover:scale-105
                  flex items-center justify-center space-x-3
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectMode(mode.id)
                }}
              >
                <span>🚀</span>
                <span>START {mode.name.toUpperCase()}</span>
                <span>→</span>
              </motion.button>

              {/* Hover arrow indicator */}
              <motion.div
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500"
                initial={{ x: -10 }}
                whileHover={{ x: 0 }}
              >
                <span className="text-orange-400 text-xl">→</span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="mt-12 text-center bg-gray-800/30 rounded-xl p-6 border border-gray-700/50"
      >
        <h3 className="text-lg font-bold text-white mb-4">Elite Training Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="text-white font-semibold">Real-time Analytics</h4>
            <p className="text-gray-400">Live performance tracking</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="text-white font-semibold">Precision Metrics</h4>
            <p className="text-gray-400">Accuracy and consistency scores</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="text-white font-semibold">Reaction Timing</h4>
            <p className="text-gray-400">Sub-millisecond measurement</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🚀</div>
            <h4 className="text-white font-semibold">144+ FPS</h4>
            <p className="text-gray-400">Competitive performance</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
} 