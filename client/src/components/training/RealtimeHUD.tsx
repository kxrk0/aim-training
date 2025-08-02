import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaBullseye, FaClock, FaFire, FaChartLine, FaPause, FaPlay } from 'react-icons/fa'

interface HUDData {
  accuracy: number
  reactionTime: number
  streak: number
  shotsHit: number
  totalShots: number
  timeElapsed: number
  score: number
  consistency: number
  shotsPerMinute: number
}

interface RealtimeHUDProps {
  gameData: HUDData
  isGameActive: boolean
  onPause: () => void
  onResume: () => void
  isPaused: boolean
}

export function RealtimeHUD({ 
  gameData, 
  isGameActive, 
  onPause, 
  onResume, 
  isPaused 
}: RealtimeHUDProps) {
  const [currentData, setCurrentData] = useState<HUDData>(gameData)
  const [previousData, setPreviousData] = useState<HUDData>(gameData)

  useEffect(() => {
    setPreviousData(currentData)
    setCurrentData(gameData)
  }, [gameData])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-400'
    if (accuracy >= 80) return 'text-yellow-400'
    if (accuracy >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 20) return 'text-yellow-400'
    if (streak >= 10) return 'text-orange-400'
    if (streak >= 5) return 'text-blue-400'
    return 'text-gray-400'
  }

  const getTrendIndicator = (current: number, previous: number) => {
    if (current > previous) return '↗'
    if (current < previous) return '↘'
    return '→'
  }

  if (!isGameActive) return null

  return (
    <>
      {/* Main HUD */}
      <div className="fixed top-4 left-4 right-4 z-40 pointer-events-none">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50"
          >
            <div className="flex items-center justify-between">
              {/* Left Side - Core Stats */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getAccuracyColor(currentData.accuracy)}`}>
                    {currentData.accuracy.toFixed(1)}%
                    <span className="text-xs text-gray-400 ml-1">
                      {getTrendIndicator(currentData.accuracy, previousData.accuracy)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">ACCURACY</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {Math.round(currentData.reactionTime)}ms
                    <span className="text-xs text-gray-400 ml-1">
                      {getTrendIndicator(previousData.reactionTime, currentData.reactionTime)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">REACTION</div>
                </div>

                <div className="text-center">
                  <div className={`text-2xl font-bold ${getStreakColor(currentData.streak)}`}>
                    {currentData.streak}
                    <span className="text-xs text-gray-400 ml-1">
                      {getTrendIndicator(currentData.streak, previousData.streak)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">STREAK</div>
                </div>
              </div>

              {/* Center - Timer and Score */}
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  {currentData.score.toLocaleString()}
                </div>
                <div className="text-lg text-gray-300">
                  {formatTime(currentData.timeElapsed)}
                </div>
              </div>

              {/* Right Side - Performance */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {currentData.shotsHit}/{currentData.totalShots}
                  </div>
                  <div className="text-xs text-gray-400">HITS</div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {Math.round(currentData.shotsPerMinute)}
                  </div>
                  <div className="text-xs text-gray-400">SPM</div>
                </div>

                {/* Pause Button */}
                <button
                  onClick={isPaused ? onResume : onPause}
                  className="pointer-events-auto bg-gray-700/80 hover:bg-gray-600/80 text-white p-2 rounded-lg transition-colors"
                >
                  {isPaused ? <FaPlay className="text-sm" /> : <FaPause className="text-sm" />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Side Performance Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-24 right-4 z-40 pointer-events-none"
      >
        <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 w-48">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center">
            <FaChartLine className="mr-2" />
            Live Performance
          </h3>
          
          <div className="space-y-3">
            {/* Consistency Meter */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Consistency</span>
                <span>{Math.round(currentData.consistency)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentData.consistency}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Accuracy Trend */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Accuracy Trend</span>
                <span className={getAccuracyColor(currentData.accuracy)}>
                  {currentData.accuracy > previousData.accuracy ? '↗' : 
                   currentData.accuracy < previousData.accuracy ? '↘' : '→'}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full bg-gradient-to-r ${
                    currentData.accuracy >= 90 ? 'from-green-500 to-emerald-500' :
                    currentData.accuracy >= 80 ? 'from-yellow-500 to-orange-500' :
                    currentData.accuracy >= 70 ? 'from-orange-500 to-red-500' :
                    'from-red-500 to-red-700'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, currentData.accuracy)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Streak Indicator */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Current Streak</span>
                <span className={getStreakColor(currentData.streak)}>
                  {currentData.streak >= 10 ? '🔥' : currentData.streak >= 5 ? '⚡' : '•'}
                </span>
              </div>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded ${
                      i < Math.min(10, currentData.streak) 
                        ? currentData.streak >= 10 ? 'bg-yellow-400' :
                          currentData.streak >= 5 ? 'bg-orange-400' : 'bg-blue-400'
                        : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pause Overlay */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="text-center">
            <FaPause className="text-6xl text-white mb-4 mx-auto" />
            <h2 className="text-3xl font-bold text-white mb-2">Game Paused</h2>
            <p className="text-gray-400 mb-6">Click resume to continue</p>
            <button
              onClick={onResume}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
            >
              <FaPlay />
              <span>Resume</span>
            </button>
          </div>
        </motion.div>
      )}
    </>
  )
}