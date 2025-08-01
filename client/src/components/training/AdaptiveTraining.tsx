import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaBrain, FaBullseye, FaChartLine, FaRocket, FaCog, FaPlay, FaPause } from 'react-icons/fa'

interface TrainingScenario {
  id: string
  name: string
  description: string
  difficulty: number
  targetAreas: string[]
  estimatedTime: number
  aiReasoning: string
}

interface AdaptiveSession {
  currentScenario: TrainingScenario | null
  progress: number
  totalScenarios: number
  completedScenarios: number
  adaptations: string[]
  isActive: boolean
}

export const AdaptiveTraining: React.FC = () => {
  const [session, setSession] = useState<AdaptiveSession>({
    currentScenario: null,
    progress: 0,
    totalScenarios: 5,
    completedScenarios: 0,
    adaptations: [],
    isActive: false
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [userPreferences, setUserPreferences] = useState({
    focusArea: 'overall',
    difficulty: 'adaptive',
    sessionLength: 30
  })

  const mockScenarios: TrainingScenario[] = [
    {
      id: '1',
      name: 'Precision Micro-Adjustments',
      description: 'Small targets with emphasis on precise crosshair placement',
      difficulty: 7,
      targetAreas: ['Precision', 'Fine Motor Control'],
      estimatedTime: 8,
      aiReasoning: 'Your analysis shows 23% inconsistency in small target acquisition. This scenario will improve your micro-corrections.'
    },
    {
      id: '2',
      name: 'Dynamic Flick Training',
      description: 'Adaptive flick distances based on your overshoot patterns',
      difficulty: 8,
      targetAreas: ['Flick Accuracy', 'Muscle Memory'],
      estimatedTime: 10,
      aiReasoning: 'Detected overshoot tendencies in 180° flicks. Distance and timing will adapt to your performance.'
    },
    {
      id: '3',
      name: 'Cognitive Load Tracking',
      description: 'Multi-target tracking while processing visual distractors',
      difficulty: 9,
      targetAreas: ['Tracking', 'Focus', 'Multitasking'],
      estimatedTime: 12,
      aiReasoning: 'Your tracking accuracy drops 15% under pressure. This builds mental resilience during intense scenarios.'
    }
  ]

  const generateAdaptiveSession = async () => {
    setIsGenerating(true)
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    setSession(prev => ({
      ...prev,
      currentScenario: mockScenarios[0],
      totalScenarios: mockScenarios.length,
      adaptations: [
        'Reduced target size by 15% based on recent accuracy improvements',
        'Increased spawn rate by 20% to challenge reaction time',
        'Added crosshair displacement to simulate real-game scenarios'
      ]
    }))
    
    setIsGenerating(false)
  }

  const startScenario = () => {
    setSession(prev => ({ ...prev, isActive: true }))
  }

  const pauseScenario = () => {
    setSession(prev => ({ ...prev, isActive: false }))
  }

  const completeScenario = () => {
    setSession(prev => ({
      ...prev,
      completedScenarios: prev.completedScenarios + 1,
      progress: ((prev.completedScenarios + 1) / prev.totalScenarios) * 100,
      currentScenario: prev.completedScenarios + 1 < mockScenarios.length 
        ? mockScenarios[prev.completedScenarios + 1] 
        : null,
      isActive: false
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent mb-4">
            Adaptive AI Training
          </h1>
          <p className="text-gray-400 text-lg">Personalized training scenarios that evolve with your performance</p>
        </motion.div>

        {/* Training Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Preferences Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <FaCog className="mr-3 text-purple-500" />
              Preferences
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Focus Area</label>
                <select 
                  value={userPreferences.focusArea}
                  onChange={(e) => setUserPreferences(prev => ({ ...prev, focusArea: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="overall">Overall Improvement</option>
                  <option value="flick">Flick Shots</option>
                  <option value="tracking">Tracking</option>
                  <option value="precision">Precision</option>
                  <option value="speed">Reaction Speed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                <select 
                  value={userPreferences.difficulty}
                  onChange={(e) => setUserPreferences(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="adaptive">AI Adaptive</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="extreme">Extreme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Session Length (minutes)</label>
                <input 
                  type="range"
                  min="15"
                  max="60"
                  value={userPreferences.sessionLength}
                  onChange={(e) => setUserPreferences(prev => ({ ...prev, sessionLength: Number(e.target.value) }))}
                  className="w-full"
                />
                <span className="text-purple-400 font-semibold">{userPreferences.sessionLength} min</span>
              </div>
            </div>

            <button 
              onClick={generateAdaptiveSession}
              disabled={isGenerating}
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {isGenerating ? 'AI Generating...' : 'Generate Session'}
            </button>
          </motion.div>

          {/* Current Scenario */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            {isGenerating ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block text-4xl text-purple-500 mb-4"
                >
                  <FaBrain />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">AI Analyzing Your Performance</h3>
                <p className="text-gray-400">Creating personalized training scenarios...</p>
              </div>
            ) : session.currentScenario ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Current Scenario</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">
                      {session.completedScenarios + 1}/{session.totalScenarios}
                    </span>
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${session.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">
                    {session.currentScenario.name}
                  </h4>
                  <p className="text-gray-300 mb-3">{session.currentScenario.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-400">Difficulty:</span>
                      <div className="flex items-center mt-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div 
                            key={i}
                            className={`w-2 h-2 rounded-full mr-1 ${
                              i < session.currentScenario!.difficulty ? 'bg-orange-500' : 'bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Est. Time:</span>
                      <p className="text-white font-semibold">{session.currentScenario.estimatedTime} min</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-sm text-gray-400">Target Areas:</span>
                    <div className="flex flex-wrap mt-1">
                      {session.currentScenario.targetAreas.map((area) => (
                        <span 
                          key={area}
                          className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full mr-2 mb-1"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <FaBrain className="text-purple-400 mt-1 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-purple-400 font-semibold">AI Reasoning:</span>
                        <p className="text-sm text-gray-300">{session.currentScenario.aiReasoning}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={session.isActive ? pauseScenario : startScenario}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center"
                  >
                    {session.isActive ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
                    {session.isActive ? 'Pause' : 'Start'} Scenario
                  </button>
                  <button 
                    onClick={completeScenario}
                    className="px-6 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-semibold transition-all"
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FaRocket className="text-4xl text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Ready to Start</h3>
                <p className="text-gray-400">Generate an adaptive training session to begin</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Adaptations Made */}
        {session.adaptations.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <FaChartLine className="mr-3 text-green-500" />
              AI Adaptations Made
            </h3>
            <div className="space-y-2">
              {session.adaptations.map((adaptation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                >
                                        <FaBullseye className="text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{adaptation}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}