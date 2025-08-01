import { useState } from 'react'
import { motion } from 'framer-motion'

export function SettingsPage() {
  const [sensitivity, setSensitivity] = useState(2.5)
  const [crosshairColor, setCrosshairColor] = useState('#00ff88')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [difficulty, setDifficulty] = useState('medium')

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
            ⚙️ SETTINGS
          </h1>
          <p className="text-gray-400">
            Customize your training experience
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Game Settings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hud-element"
          >
            <h2 className="text-2xl font-bold text-gaming-primary mb-6">Game Settings</h2>
            
            <div className="space-y-6">
              {/* Mouse Sensitivity */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Mouse Sensitivity: {sensitivity}
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Slow (0.1)</span>
                  <span>Fast (10.0)</span>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Default Difficulty
                </label>
                <div className="flex space-x-4">
                  {['easy', 'medium', 'hard', 'expert'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        difficulty === level
                          ? 'bg-gaming-primary text-gaming-dark'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Display Settings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hud-element"
          >
            <h2 className="text-2xl font-bold text-gaming-primary mb-6">Display Settings</h2>
            
            <div className="space-y-6">
              {/* Crosshair Color */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Crosshair Color
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={crosshairColor}
                    onChange={(e) => setCrosshairColor(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600"
                  />
                  <span className="text-sm text-gray-400">{crosshairColor}</span>
                </div>
                <div className="mt-4 flex space-x-2">
                  {['#00ff88', '#ff0066', '#ffff00', '#00ffff', '#ff8800'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setCrosshairColor(color)}
                      className="w-8 h-8 rounded border-2 border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Crosshair Preview */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Crosshair Preview
                </label>
                <div className="bg-gray-800 rounded-lg p-8 flex items-center justify-center">
                  <div 
                    className="relative w-6 h-6"
                    style={{ color: crosshairColor }}
                  >
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-current transform -translate-y-1/2"></div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-current transform -translate-x-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Audio Settings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="hud-element"
          >
            <h2 className="text-2xl font-bold text-gaming-primary mb-6">Audio Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Sound Effects
                </label>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundEnabled ? 'bg-gaming-primary' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Control Settings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="hud-element"
          >
            <h2 className="text-2xl font-bold text-gaming-primary mb-6">Controls</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span>Fire/Click</span>
                <span className="bg-gray-700 px-3 py-1 rounded text-sm">Left Click</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span>Pause</span>
                <span className="bg-gray-700 px-3 py-1 rounded text-sm">Space</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span>Exit to Menu</span>
                <span className="bg-gray-700 px-3 py-1 rounded text-sm">Esc</span>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <button className="gaming-button text-lg px-8 py-3">
              💾 Save Settings
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 