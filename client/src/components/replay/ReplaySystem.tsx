import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaPlay, FaPause, FaStop, FaForward, FaBackward, FaDownload, FaShare, FaEye, FaClock, FaBullseye, FaVideo } from 'react-icons/fa'

interface ReplaySession {
  id: string
  name: string
  gameMode: string
  duration: number
  score: number
  accuracy: number
  date: string
  thumbnail: string
  size: string
  isRecording?: boolean
}

interface ReplayControls {
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackSpeed: number
  volume: number
}

export const ReplaySystem: React.FC = () => {
  const [sessions, setSessions] = useState<ReplaySession[]>([])
  const [selectedSession, setSelectedSession] = useState<ReplaySession | null>(null)
  const [controls, setControls] = useState<ReplayControls>({
    isPlaying: false,
    currentTime: 0,
    duration: 300, // 5 minutes example
    playbackSpeed: 1,
    volume: 0.8
  })
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const mockSessions: ReplaySession[] = [
    {
      id: '1',
      name: 'Precision Training Session',
      gameMode: 'Precision',
      duration: 300,
      score: 1250,
      accuracy: 78.5,
      date: '2024-12-20',
      thumbnail: '/api/placeholder/300/180',
      size: '15.2 MB'
    },
    {
      id: '2',
      name: 'Flick Shot Practice',
      gameMode: 'Flick',
      duration: 240,
      score: 890,
      accuracy: 82.1,
      date: '2024-12-19',
      thumbnail: '/api/placeholder/300/180',
      size: '12.8 MB'
    },
    {
      id: '3',
      name: 'Tracking Challenge',
      gameMode: 'Tracking',
      duration: 420,
      score: 1680,
      accuracy: 76.3,
      date: '2024-12-18',
      thumbnail: '/api/placeholder/300/180',
      size: '21.4 MB'
    },
    {
      id: '4',
      name: 'Speed Run Session',
      gameMode: 'Speed',
      duration: 180,
      score: 2150,
      accuracy: 85.7,
      date: '2024-12-17',
      thumbnail: '/api/placeholder/300/180',
      size: '9.6 MB'
    }
  ]

  useEffect(() => {
    setSessions(mockSessions)
  }, [])

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
  }

  const stopRecording = () => {
    setIsRecording(false)
    
    // Create new session from recording
    const newSession: ReplaySession = {
      id: Date.now().toString(),
      name: `Training Session ${new Date().toLocaleDateString()}`,
      gameMode: 'Mixed',
      duration: recordingTime,
      score: Math.floor(Math.random() * 1000) + 500,
      accuracy: Math.floor(Math.random() * 20) + 70,
      date: new Date().toISOString().split('T')[0],
      thumbnail: '/api/placeholder/300/180',
      size: `${(recordingTime * 0.5).toFixed(1)} MB`
    }
    
    setSessions(prev => [newSession, ...prev])
    setRecordingTime(0)
  }

  const togglePlayback = () => {
    setControls(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const changePlaybackSpeed = (speed: number) => {
    setControls(prev => ({ ...prev, playbackSpeed: speed }))
  }

  const seekTo = (time: number) => {
    setControls(prev => ({ ...prev, currentTime: time }))
  }

  const downloadReplay = (session: ReplaySession) => {
    // Simulate download
    console.log(`Downloading replay: ${session.name}`)
  }

  const shareReplay = (session: ReplaySession) => {
    // Simulate sharing
    console.log(`Sharing replay: ${session.name}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent mb-4">
            Replay System
          </h1>
          <p className="text-gray-400 text-lg">Record, review, and analyze your training sessions</p>
        </motion.div>

        {/* Recording Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-white font-semibold">
                  {isRecording ? 'Recording' : 'Ready to Record'}
                </span>
              </div>
              
              {isRecording && (
                <div className="flex items-center space-x-2 text-red-400">
                  <FaClock />
                  <span className="font-mono">{formatTime(recordingTime)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {!isRecording ? (
                <button 
                  onClick={startRecording}
                  className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2"
                >
                  <FaVideo />
                  <span>Start Recording</span>
                </button>
              ) : (
                <button 
                  onClick={stopRecording}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2"
                >
                  <FaStop />
                  <span>Stop Recording</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">Recorded Sessions</h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedSession?.id === session.id 
                      ? 'border-red-500/50 bg-red-500/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-12 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                      <FaVideo className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-white truncate">{session.name}</h5>
                      <p className="text-sm text-gray-400">{session.gameMode}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{formatDate(session.date)}</span>
                        <span className="text-xs text-gray-500">{formatTime(session.duration)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600">
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-green-400">{session.accuracy}% acc</span>
                      <span className="text-blue-400">{session.score} pts</span>
                    </div>
                    <span className="text-xs text-gray-500">{session.size}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Video Player */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            {selectedSession ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{selectedSession.name}</h3>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => downloadReplay(selectedSession)}
                      className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                      title="Download"
                    >
                      <FaDownload />
                    </button>
                    <button 
                      onClick={() => shareReplay(selectedSession)}
                      className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                      title="Share"
                    >
                      <FaShare />
                    </button>
                  </div>
                </div>

                {/* Video Player Area */}
                <div className="bg-black rounded-lg aspect-video mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="text-gray-400 text-center">
                    <FaEye className="text-4xl mx-auto mb-2" />
                    <p>Replay Player</p>
                    <p className="text-sm">Session: {selectedSession.gameMode}</p>
                  </div>
                  
                  {/* Overlay UI */}
                  <div className="absolute bottom-4 left-4 right-4">
                    {/* Progress Bar */}
                    <div className="bg-black/50 rounded-lg p-4">
                      <div className="flex items-center space-x-4 mb-3">
                        <span className="text-white text-sm font-mono">
                          {formatTime(controls.currentTime)}
                        </span>
                        <div className="flex-1 bg-gray-600 rounded-full h-2 cursor-pointer">
                          <div 
                            className="bg-red-500 h-2 rounded-full transition-all"
                            style={{ width: `${(controls.currentTime / controls.duration) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-white text-sm font-mono">
                          {formatTime(controls.duration)}
                        </span>
                      </div>
                      
                      {/* Control Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => seekTo(Math.max(0, controls.currentTime - 10))}
                            className="text-white hover:text-red-400 transition-colors"
                          >
                            <FaBackward />
                          </button>
                          <button 
                            onClick={togglePlayback}
                            className="bg-red-600 hover:bg-red-500 text-white p-3 rounded-full transition-colors"
                          >
                            {controls.isPlaying ? <FaPause /> : <FaPlay />}
                          </button>
                          <button 
                            onClick={() => seekTo(Math.min(controls.duration, controls.currentTime + 10))}
                            className="text-white hover:text-red-400 transition-colors"
                          >
                            <FaForward />
                          </button>
                        </div>
                        
                        {/* Playback Speed */}
                        <div className="flex items-center space-x-2">
                          <span className="text-white text-sm">Speed:</span>
                          {[0.5, 1, 1.5, 2].map((speed) => (
                            <button
                              key={speed}
                              onClick={() => changePlaybackSpeed(speed)}
                              className={`px-2 py-1 rounded text-sm transition-colors ${
                                controls.playbackSpeed === speed 
                                  ? 'bg-red-600 text-white' 
                                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <FaBullseye className="text-orange-400 text-xl mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Accuracy</p>
                    <p className="text-white font-bold">{selectedSession.accuracy}%</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <FaClock className="text-blue-400 text-xl mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-white font-bold">{formatTime(selectedSession.duration)}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <FaBullseye className="text-green-400 text-xl mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Score</p>
                    <p className="text-white font-bold">{selectedSession.score}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <FaVideo className="text-purple-400 text-xl mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">File Size</p>
                    <p className="text-white font-bold">{selectedSession.size}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <FaVideo className="text-4xl text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Select a Replay</h3>
                <p className="text-gray-400">Choose a recorded session to watch and analyze</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}