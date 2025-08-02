import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPlay, FaHome, FaCog, FaVolumeUp, FaVolumeMute, FaKeyboard, FaMouse, FaArrowLeft } from 'react-icons/fa'
import { useAudioSystem } from './SoundSystem'

interface ESCMenuProps {
  isVisible: boolean
  onResume: () => void
  onRestart: () => void
  onExit: () => void
  gameMode: string
  currentStats: {
    score: number
    accuracy: number
    hits: number
    misses: number
    timeElapsed: number
  }
}

export function ESCMenu({ 
  isVisible, 
  onResume, 
  onRestart, 
  onExit, 
  gameMode, 
  currentStats 
}: ESCMenuProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'settings' | 'controls'>('main')
  const [volume, setVolume] = useState(70)
  const [sensitivity, setSensitivity] = useState(50)
  const [showConfirm, setShowConfirm] = useState<'restart' | 'exit' | null>(null)
  
  const { setMasterVolume, playMenuClickSound } = useAudioSystem()

  // Handle ESC key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        if (activeTab !== 'main') {
          setActiveTab('main')
          playMenuClickSound()
        } else if (showConfirm) {
          setShowConfirm(null)
          playMenuClickSound()
        } else {
          onResume()
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isVisible, activeTab, showConfirm, onResume, playMenuClickSound])

  // Update master volume
  useEffect(() => {
    setMasterVolume(volume / 100)
  }, [volume, setMasterVolume])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAction = (action: () => void, confirmType?: 'restart' | 'exit') => {
    playMenuClickSound()
    if (confirmType) {
      setShowConfirm(confirmType)
    } else {
      action()
    }
  }

  const confirmAction = (action: () => void) => {
    playMenuClickSound()
    setShowConfirm(null)
    action()
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-700/50 p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Game Paused</h1>
          <p className="text-gray-400">
            {gameMode.replace('-', ' ').toUpperCase()} Training Session
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-1 border border-gray-700">
            {[
              { id: 'main', label: 'Main', icon: FaPlay },
              { id: 'settings', label: 'Settings', icon: FaCog },
              { id: 'controls', label: 'Controls', icon: FaKeyboard }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any)
                  playMenuClickSound()
                }}
                className={`px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-orange-600/30 text-orange-400 border border-orange-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="text-sm" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Main Tab */}
          {activeTab === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Current Stats */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-bold text-white mb-4">Current Session</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {currentStats.score.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {currentStats.accuracy.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-400">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {currentStats.hits}/{currentStats.hits + currentStats.misses}
                    </div>
                    <div className="text-sm text-gray-400">Hits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {formatTime(currentStats.timeElapsed)}
                    </div>
                    <div className="text-sm text-gray-400">Time</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => handleAction(onResume)}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-3"
                >
                  <FaPlay />
                  <span>Resume Training</span>
                </button>

                <button
                  onClick={() => handleAction(onRestart, 'restart')}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300"
                >
                  Restart Session
                </button>

                <button
                  onClick={() => handleAction(onExit, 'exit')}
                  className="w-full py-4 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-all duration-300 flex items-center justify-center space-x-3"
                >
                  <FaHome />
                  <span>Back to Training Hub</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold text-white">Audio & Video Settings</h3>
              
              {/* Volume Control */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {volume > 0 ? <FaVolumeUp className="text-blue-400" /> : <FaVolumeMute className="text-gray-400" />}
                    <span className="text-white">Master Volume</span>
                  </div>
                  <span className="text-gray-400">{volume}%</span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Mouse Sensitivity */}
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FaMouse className="text-green-400" />
                    <span className="text-white">Mouse Sensitivity</span>
                  </div>
                  <span className="text-gray-400">{sensitivity}%</span>
                </div>
                
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </motion.div>
          )}

          {/* Controls Tab */}
          {activeTab === 'controls' && (
            <motion.div
              key="controls"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold text-white">Controls</h3>
              
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Aim</span>
                    <span className="text-orange-400 font-mono">Mouse Movement</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Shoot</span>
                    <span className="text-orange-400 font-mono">Left Click</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Pause</span>
                    <span className="text-orange-400 font-mono">ESC / Space</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Resume</span>
                    <span className="text-orange-400 font-mono">ESC / Left Click</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Exit to Menu</span>
                    <span className="text-orange-400 font-mono">Q (Hold)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Button for Settings/Controls */}
        {activeTab !== 'main' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => {
              setActiveTab('main')
              playMenuClickSound()
            }}
            className="mt-6 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <FaArrowLeft />
            <span>Back</span>
          </motion.button>
        )}
      </motion.div>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700/50 p-6 max-w-md mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {showConfirm === 'restart' ? 'Restart Session?' : 'Exit Training?'}
              </h3>
              <p className="text-gray-400 mb-6">
                {showConfirm === 'restart' 
                  ? 'Your current progress will be lost and the session will restart.'
                  : 'Your progress will be saved and you will return to the Training Hub.'
                }
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => confirmAction(showConfirm === 'restart' ? onRestart : onExit)}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all duration-300 ${
                    showConfirm === 'restart'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {showConfirm === 'restart' ? 'Restart' : 'Exit'}
                </button>
                <button
                  onClick={() => {
                    setShowConfirm(null)
                    playMenuClickSound()
                  }}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}