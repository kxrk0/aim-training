import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSensitivityStore } from '../../stores/sensitivityStore'
import { 
  FaExchangeAlt, 
  FaCopy, 
  FaCheck, 
  FaCalculator,
  FaGamepad,
  FaMousePointer,
  FaRuler
} from 'react-icons/fa'
import type { SupportedGame } from '../../../../shared/types'

export const SensitivityConversion: React.FC = () => {
  const { 
    conversionSettings, 
    updateConversionSettings,
    convertSensitivity,
    calculateCm360
  } = useSensitivityStore()

  const [copiedGame, setCopiedGame] = useState<string | null>(null)
  const [customSensitivity, setCustomSensitivity] = useState(conversionSettings.sourceSensitivity.toString())
  const [customDPI, setCustomDPI] = useState(conversionSettings.sourceDPI.toString())

  // Game configurations with detailed info
  const gameConfigs: Record<SupportedGame, {
    name: string
    displayName: string
    icon: string
    defaultFOV: number
    popularDPI: number[]
    sensitivityRange: { min: number, max: number }
    description: string
  }> = {
    'valorant': {
      name: 'valorant',
      displayName: 'VALORANT',
      icon: '🎯',
      defaultFOV: 103,
      popularDPI: [400, 800, 1600],
      sensitivityRange: { min: 0.1, max: 5.0 },
      description: 'Riot Games tactical shooter'
    },
    'cs2': {
      name: 'cs2',
      displayName: 'Counter-Strike 2',
      icon: '💣',
      defaultFOV: 90,
      popularDPI: [400, 800, 1600],
      sensitivityRange: { min: 0.1, max: 10.0 },
      description: 'Valve tactical FPS'
    },
    'apex': {
      name: 'apex',
      displayName: 'Apex Legends',
      icon: '⚡',
      defaultFOV: 110,
      popularDPI: [400, 800, 1600],
      sensitivityRange: { min: 0.1, max: 10.0 },
      description: 'EA battle royale'
    },
    'fortnite': {
      name: 'fortnite',
      displayName: 'Fortnite',
      icon: '🏗️',
      defaultFOV: 80,
      popularDPI: [400, 800, 1600],
      sensitivityRange: { min: 1, max: 20 },
      description: 'Epic Games battle royale'
    },
    'overwatch2': {
      name: 'overwatch2',
      displayName: 'Overwatch 2',
      icon: '🦸',
      defaultFOV: 103,
      popularDPI: [400, 800, 1600],
      sensitivityRange: { min: 0.1, max: 20.0 },
      description: 'Blizzard team shooter'
    },
    'cod': {
      name: 'cod',
      displayName: 'Call of Duty',
      icon: '🔫',
      defaultFOV: 120,
      popularDPI: [400, 800, 1600],
      sensitivityRange: { min: 0.1, max: 20.0 },
      description: 'Activision FPS series'
    },
    'rainbow6': {
      name: 'rainbow6',
      displayName: 'Rainbow Six Siege',
      icon: '🏢',
      defaultFOV: 84,
      popularDPI: [400, 800, 1600],
      sensitivityRange: { min: 1, max: 100 },
      description: 'Ubisoft tactical shooter'
    }
  }

  // Calculate conversions for target games
  const conversions = useMemo(() => {
    const sourceGame = conversionSettings.sourceGame
    const sourceSens = parseFloat(customSensitivity) || conversionSettings.sourceSensitivity
    const sourceDPI = parseInt(customDPI) || conversionSettings.sourceDPI
    
    return conversionSettings.targetGames.map(targetGame => {
      const conversion = convertSensitivity(sourceGame, targetGame, sourceSens, sourceDPI)
      const cm360 = calculateCm360(sourceSens, sourceDPI, sourceGame)
      
      return {
        game: targetGame,
        conversion,
        cm360,
        config: gameConfigs[targetGame]
      }
    })
  }, [conversionSettings, customSensitivity, customDPI, convertSensitivity, calculateCm360, gameConfigs])

  // Handle copy to clipboard
  const handleCopySensitivity = async (game: string, sensitivity: number) => {
    try {
      await navigator.clipboard.writeText(sensitivity.toString())
      setCopiedGame(game)
      setTimeout(() => setCopiedGame(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Handle source game change
  const handleSourceGameChange = (game: SupportedGame) => {
    updateConversionSettings({ sourceGame: game })
  }

  // Handle target games change
  const handleTargetGamesChange = (game: SupportedGame, isSelected: boolean) => {
    const currentTargets = conversionSettings.targetGames
    const newTargets = isSelected 
      ? [...currentTargets, game]
      : currentTargets.filter(g => g !== game)
    
    updateConversionSettings({ targetGames: newTargets })
  }

  // Handle DPI presets
  const handleDPIPreset = (dpi: number) => {
    setCustomDPI(dpi.toString())
    updateConversionSettings({ sourceDPI: dpi })
  }

  // Handle sensitivity input change
  const handleSensitivityChange = (value: string) => {
    setCustomSensitivity(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      updateConversionSettings({ sourceSensitivity: numValue })
    }
  }

  // Handle DPI input change
  const handleDPIChange = (value: string) => {
    setCustomDPI(value)
    const numValue = parseInt(value)
    if (!isNaN(numValue)) {
      updateConversionSettings({ sourceDPI: numValue })
    }
  }

  const sourceConfig = gameConfigs[conversionSettings.sourceGame]
  const sourceCm360 = calculateCm360(
    parseFloat(customSensitivity) || conversionSettings.sourceSensitivity,
    parseInt(customDPI) || conversionSettings.sourceDPI,
    conversionSettings.sourceGame
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Game Sensitivity Converter
        </h2>
        <p className="text-slate-400 text-lg">
          Convert your sensitivity between different FPS games with precision
        </p>
      </div>

      {/* Source Game Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <FaGamepad className="text-blue-500 mr-3" />
          Source Game Settings
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Your Game
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(gameConfigs).map(([gameId, config]) => (
                <button
                  key={gameId}
                  onClick={() => handleSourceGameChange(gameId as SupportedGame)}
                  className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                    conversionSettings.sourceGame === gameId
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{config.icon}</span>
                    <div>
                      <div className="text-sm font-medium">{config.displayName}</div>
                      <div className="text-xs opacity-75">{config.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sensitivity Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Current Sensitivity
            </label>
            <input
              type="number"
              step="0.001"
              min={sourceConfig.sensitivityRange.min}
              max={sourceConfig.sensitivityRange.max}
              value={customSensitivity}
              onChange={(e) => handleSensitivityChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
              placeholder="Enter sensitivity"
            />
            <p className="text-xs text-slate-500 mt-1">
              Range: {sourceConfig.sensitivityRange.min} - {sourceConfig.sensitivityRange.max}
            </p>
          </div>

          {/* DPI Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mouse DPI
            </label>
            <input
              type="number"
              step="1"
              min="100"
              max="10000"
              value={customDPI}
              onChange={(e) => handleDPIChange(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
              placeholder="Enter DPI"
            />
            <div className="flex space-x-1 mt-2">
              {sourceConfig.popularDPI.map(dpi => (
                <button
                  key={dpi}
                  onClick={() => handleDPIPreset(dpi)}
                  className="px-2 py-1 text-xs bg-slate-600 text-slate-300 rounded hover:bg-slate-500 transition-colors"
                >
                  {dpi}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Source Game Stats */}
        <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-400">{sourceCm360.toFixed(2)}cm</div>
              <div className="text-xs text-slate-400">360° Distance</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">
                {(parseFloat(customSensitivity) * parseInt(customDPI)).toFixed(0)}
              </div>
              <div className="text-xs text-slate-400">Effective DPI</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-400">{sourceConfig.defaultFOV}°</div>
              <div className="text-xs text-slate-400">Default FOV</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-400">
                {sourceConfig.displayName}
              </div>
              <div className="text-xs text-slate-400">Source Game</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Target Games Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <FaExchangeAlt className="text-green-500 mr-3" />
          Convert To Games
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(gameConfigs).map(([gameId, config]) => {
            if (gameId === conversionSettings.sourceGame) return null
            
            const isSelected = conversionSettings.targetGames.includes(gameId as SupportedGame)
            
            return (
              <button
                key={gameId}
                onClick={() => handleTargetGamesChange(gameId as SupportedGame, !isSelected)}
                className={`p-3 rounded-lg border transition-all duration-200 text-center ${
                  isSelected
                    ? 'border-green-500 bg-green-500/10 text-white'
                    : 'border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="text-2xl mb-1">{config.icon}</div>
                <div className="text-xs font-medium">{config.displayName}</div>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Conversion Results */}
      {conversions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold text-white flex items-center">
            <FaCalculator className="text-yellow-500 mr-3" />
            Conversion Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conversions.map(({ game, conversion, config }) => (
              <motion.div
                key={game}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{config.displayName}</h4>
                      <p className="text-xs text-slate-400">{config.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Main Sensitivity */}
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div>
                      <div className="text-lg font-bold text-green-400">
                        {conversion.toSensitivity}
                      </div>
                      <div className="text-xs text-slate-400">Sensitivity</div>
                    </div>
                    <button
                      onClick={() => handleCopySensitivity(game, conversion.toSensitivity)}
                      className="p-2 bg-slate-600 hover:bg-slate-500 text-slate-300 hover:text-white rounded transition-all duration-200"
                    >
                      {copiedGame === game ? <FaCheck className="text-green-400" /> : <FaCopy />}
                    </button>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-blue-400 font-medium">{conversion.toCm360.toFixed(2)}cm</div>
                      <div className="text-slate-500">360° Distance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-medium">{conversion.effectiveDPITo}</div>
                      <div className="text-slate-500">Effective DPI</div>
                    </div>
                  </div>

                  {/* Accuracy Badge */}
                  <div className="flex justify-center">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      conversion.conversionAccuracy === 'exact' 
                        ? 'bg-green-500/20 text-green-400'
                        : conversion.conversionAccuracy === 'approximate'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {conversion.conversionAccuracy}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Conversion Formula & Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <FaRuler className="text-purple-500 mr-3" />
          How Conversion Works
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">360° Distance Method</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              We calculate how many centimeters you need to move your mouse for a complete 360° turn in your source game, 
              then find the equivalent sensitivity in the target game that maintains the same physical distance.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Accuracy Levels</h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li><span className="text-green-400">Exact:</span> Perfect mathematical conversion</li>
              <li><span className="text-yellow-400">Approximate:</span> Minor FOV differences</li>
              <li><span className="text-orange-400">Estimated:</span> Different sensitivity scaling</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center text-blue-400 text-sm">
            <FaMousePointer className="mr-2" />
            <span>
              <strong>Pro Tip:</strong> Test the converted sensitivity in-game and make fine adjustments based on your preference. 
              Small variations (±5-10%) are normal and depend on your playstyle.
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}