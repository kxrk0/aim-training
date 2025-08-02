import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTrophy, FaBullseye, FaClock, FaFire, FaStar, FaArrowUp, FaArrowDown, FaShare, FaRedo } from 'react-icons/fa'
import { useLevelStore } from '@/stores/levelStore'

interface SessionResult {
  mode: string
  duration: number
  score: number
  accuracy: number
  avgReactionTime: number
  shots: number
  hits: number
  streak: number
  consistency: number
  xpGained: number
  levelGained: boolean
  newBests: string[]
  grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D'
  improvements: {
    category: string
    improvement: number
    suggestion: string
  }[]
  nextSession: {
    mode: string
    reason: string
  }
}

interface SessionSummaryProps {
  isVisible: boolean
  sessionData: SessionResult | null
  onClose: () => void
  onPlayAgain: () => void
  onNextMode: (mode: string) => void
}

export function SessionSummary({ 
  isVisible, 
  sessionData, 
  onClose, 
  onPlayAgain, 
  onNextMode 
}: SessionSummaryProps) {
  const { gainXP } = useLevelStore()
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (isVisible && sessionData) {
      // Award XP when summary shows
      gainXP(sessionData.xpGained, sessionData.mode, 'training_complete')
    }
  }, [isVisible, sessionData, gainXP])

  if (!isVisible || !sessionData) return null

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S+': return 'from-yellow-400 to-orange-500'
      case 'S': return 'from-orange-400 to-red-500'
      case 'A': return 'from-green-400 to-emerald-500'
      case 'B': return 'from-blue-400 to-cyan-500'
      case 'C': return 'from-purple-400 to-pink-500'
      case 'D': return 'from-gray-400 to-gray-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", damping: 15 }}
              className={`w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r ${getGradeColor(sessionData.grade)} flex items-center justify-center text-6xl font-black text-white shadow-2xl`}
            >
              {sessionData.grade}
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Session Complete!
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-gray-400"
            >
              {sessionData.mode.replace(/-/g, ' ').toUpperCase()} Training
            </motion.p>

            {sessionData.levelGained && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-black font-bold inline-block"
              >
                🎉 LEVEL UP! 🎉
              </motion.div>
            )}
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-blue-600/20 rounded-xl p-4 text-center border border-blue-500/30"
            >
              <FaBullseye className="text-blue-400 text-2xl mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{sessionData.accuracy.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Accuracy</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-green-600/20 rounded-xl p-4 text-center border border-green-500/30"
            >
              <FaClock className="text-green-400 text-2xl mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{Math.round(sessionData.avgReactionTime)}ms</div>
              <div className="text-sm text-gray-400">Avg Reaction</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-orange-600/20 rounded-xl p-4 text-center border border-orange-500/30"
            >
              <FaFire className="text-orange-400 text-2xl mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{sessionData.streak}</div>
              <div className="text-sm text-gray-400">Best Streak</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-purple-600/20 rounded-xl p-4 text-center border border-purple-500/30"
            >
              <FaTrophy className="text-purple-400 text-2xl mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{sessionData.score.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Final Score</div>
            </motion.div>
          </div>

          {/* XP Gained */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 }}
            className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl p-6 mb-6 border border-orange-500/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Experience Gained</h3>
                <p className="text-gray-400">Performance-based XP calculation</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-orange-400">+{sessionData.xpGained}</div>
                <div className="text-sm text-gray-400">XP</div>
              </div>
            </div>
          </motion.div>

          {/* Personal Bests */}
          {sessionData.newBests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-yellow-600/20 rounded-xl p-4 mb-6 border border-yellow-500/30"
            >
              <h3 className="text-lg font-bold text-white mb-3 flex items-center">
                <FaStar className="mr-2 text-yellow-500" />
                New Personal Bests! 🎉
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sessionData.newBests.map((best, index) => (
                  <div key={index} className="text-yellow-300 text-sm">
                    • {best}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Performance Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700/50"
          >
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-white font-bold text-lg mb-4"
            >
              <span>Performance Analysis</span>
              <motion.div
                animate={{ rotate: showDetails ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                ⌄
              </motion.div>
            </button>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {sessionData.improvements.map((improvement, index) => (
                    <div key={index} className="border-l-4 border-cyan-500 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-white">{improvement.category}</h4>
                        <span className={`flex items-center text-sm ${
                          improvement.improvement >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {improvement.improvement >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                          {Math.abs(improvement.improvement).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{improvement.suggestion}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Recommended Next Session */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="bg-cyan-600/20 rounded-xl p-4 mb-8 border border-cyan-500/30"
          >
            <h3 className="text-lg font-bold text-white mb-2">Recommended Next Training</h3>
            <p className="text-gray-400 mb-3">{sessionData.nextSession.reason}</p>
            <button
              onClick={() => onNextMode(sessionData.nextSession.mode)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-300"
            >
              Start {sessionData.nextSession.mode.replace(/-/g, ' ')} Training
            </button>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <button
              onClick={onPlayAgain}
              className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300"
            >
              <FaRedo />
              <span>Play Again</span>
            </button>

            <button
              onClick={() => navigator.share?.({ 
                title: 'Training Session Result', 
                text: `Just scored ${sessionData.score} with ${sessionData.accuracy.toFixed(1)}% accuracy!` 
              })}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
            >
              <FaShare />
              <span>Share</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center space-x-2 bg-gray-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-600 transition-all duration-300"
            >
              <span>Back to Hub</span>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}