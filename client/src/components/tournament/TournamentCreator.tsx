import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { 
  Tournament, 
  TournamentFormat, 
  GameMode, 
  Difficulty,
  TargetSize,
  GameSettings 
} from '../../../../shared/types'
import { BracketVisualization } from './BracketVisualization'
import {
  FaTrophy, FaCog, FaUsers, FaClock, FaGamepad, FaPlay,
  FaGem, FaCalendarAlt, FaChevronDown, FaSave, FaRandom,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaPlus, FaMinus, FaCrosshairs, FaBolt, FaEye, FaAdjust
} from 'react-icons/fa'

interface TournamentCreatorProps {
  onTournamentCreate?: (tournament: Partial<Tournament>) => void
  onCancel?: () => void
  existingTournament?: Tournament // For editing existing tournaments
}

export function TournamentCreator({ 
  onTournamentCreate, 
  onCancel, 
  existingTournament 
}: TournamentCreatorProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<Tournament>>({
    name: '',
    description: '',
    gameMode: 'precision',
    format: 'single-elimination',
    maxParticipants: 16,
    entryFee: 0,
    prizePool: 0,
    registrationStart: new Date().toISOString(),
    registrationEnd: new Date(Date.now() + 86400000).toISOString(), // 1 day
    tournamentStart: new Date(Date.now() + 172800000).toISOString(), // 2 days
    gameSettings: {
      gameMode: 'precision',
      difficulty: 'medium',
      duration: 60,
      targetSize: 'medium',
      spawnRate: 1
    },
    bracketSettings: {
      bestOf: 3,
      seedingMethod: 'elo',
      allowLateRegistration: false
    }
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)

  // Initialize with existing tournament data if editing
  useEffect(() => {
    if (existingTournament) {
      setFormData(existingTournament)
    }
  }, [existingTournament])

  // Tournament format configurations
  const formatConfigs = {
    'single-elimination': {
      name: 'Single Elimination',
      description: 'Lose once and you\'re out. Fast and competitive.',
      icon: '🏆',
      minParticipants: 4,
      maxParticipants: 128,
      estimatedDuration: '2-4 hours'
    },
    'double-elimination': {
      name: 'Double Elimination',
      description: 'Second chance bracket. More forgiving format.',
      icon: '🥇',
      minParticipants: 4,
      maxParticipants: 64,
      estimatedDuration: '3-6 hours'
    },
    'round-robin': {
      name: 'Round Robin',
      description: 'Everyone plays everyone. Fair and comprehensive.',
      icon: '🔄',
      minParticipants: 3,
      maxParticipants: 16,
      estimatedDuration: '4-8 hours'
    },
    'swiss': {
      name: 'Swiss System',
      description: 'Balanced pairings. Good for large groups.',
      icon: '⚖️',
      minParticipants: 8,
      maxParticipants: 256,
      estimatedDuration: '3-5 hours'
    }
  }

  // Game mode configurations
  const gameModeConfigs = {
    precision: { name: 'Precision', icon: <FaCrosshairs />, color: 'text-blue-400' },
    speed: { name: 'Speed', icon: <FaBolt />, color: 'text-yellow-400' },
    tracking: { name: 'Tracking', icon: <FaEye />, color: 'text-green-400' },
    flick: { name: 'Flick', icon: <FaAdjust />, color: 'text-purple-400' }
  }

  // Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name?.trim()) newErrors.name = 'Tournament name is required'
      if (!formData.description?.trim()) newErrors.description = 'Description is required'
      if (formData.name && formData.name.length < 3) newErrors.name = 'Name must be at least 3 characters'
      if (formData.name && formData.name.length > 50) newErrors.name = 'Name must be less than 50 characters'
    }

    if (step === 2) {
      const format = formatConfigs[formData.format!]
      if (formData.maxParticipants! < format.minParticipants) {
        newErrors.maxParticipants = `Minimum ${format.minParticipants} participants for ${format.name}`
      }
      if (formData.maxParticipants! > format.maxParticipants) {
        newErrors.maxParticipants = `Maximum ${format.maxParticipants} participants for ${format.name}`
      }
    }

    if (step === 3) {
      const now = new Date()
      const regStart = new Date(formData.registrationStart!)
      const regEnd = new Date(formData.registrationEnd!)
      const tournStart = new Date(formData.tournamentStart!)

      if (regStart <= now) newErrors.registrationStart = 'Registration must start in the future'
      if (regEnd <= regStart) newErrors.registrationEnd = 'Registration end must be after start'
      if (tournStart <= regEnd) newErrors.tournamentStart = 'Tournament must start after registration ends'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      // Generate tournament ID and timestamps
      const tournament: Partial<Tournament> = {
        ...formData,
        id: existingTournament?.id || `tournament_${Date.now()}`,
        status: 'registration' as any,
        participants: existingTournament?.participants || [],
        brackets: existingTournament?.brackets || [],
        currentRound: existingTournament?.currentRound || 0,
        totalRounds: calculateTotalRounds(formData.format!, formData.maxParticipants!),
        createdAt: existingTournament?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      onTournamentCreate?.(tournament)
    }
  }

  const calculateTotalRounds = (format: TournamentFormat, participants: number): number => {
    switch (format) {
      case 'single-elimination':
        return Math.ceil(Math.log2(participants))
      case 'double-elimination':
        return Math.ceil(Math.log2(participants)) + Math.ceil(Math.log2(participants)) - 1
      case 'round-robin':
        return participants - 1
      case 'swiss':
        return Math.ceil(Math.log2(participants))
      default:
        return 1
    }
  }

  // Steps configuration
  const steps = [
    { id: 1, name: 'Basic Info', icon: <FaTrophy /> },
    { id: 2, name: 'Format & Game', icon: <FaGamepad /> },
    { id: 3, name: 'Schedule', icon: <FaCalendarAlt /> },
    { id: 4, name: 'Preview', icon: <FaEye /> },
    { id: 5, name: 'Review', icon: <FaCheckCircle /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center space-x-3">
            <FaTrophy className="text-yellow-400" />
            <span>{existingTournament ? 'Edit Tournament' : 'Create Tournament'}</span>
          </h1>
          <p className="text-gray-400">Build competitive tournaments for the community</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    currentStep >= step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-600 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 mx-2 transition-all ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <span className="text-gray-400">Step {currentStep} of {steps.length}: </span>
            <span className="text-white font-medium">{steps[currentStep - 1].name}</span>
          </div>
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700"
          >
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
                
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Tournament Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Weekly Precision Championship"
                    className={`w-full bg-gray-700 border rounded-lg px-4 py-3 text-white placeholder-gray-400 transition-colors ${
                      errors.name ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                    }`}
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your tournament, rules, and what makes it special..."
                    rows={4}
                    className={`w-full bg-gray-700 border rounded-lg px-4 py-3 text-white placeholder-gray-400 transition-colors resize-none ${
                      errors.description ? 'border-red-500' : 'border-gray-600 focus:border-blue-500'
                    }`}
                  />
                  {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Entry Fee (optional)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={formData.entryFee || 0}
                        onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 transition-colors"
                      />
                      <span className="absolute right-3 top-3 text-gray-400">points</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Prize Pool (optional)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={formData.prizePool || 0}
                        onChange={(e) => setFormData({ ...formData, prizePool: Number(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-500 transition-colors"
                      />
                      <span className="absolute right-3 top-3 text-gray-400">points</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Format & Game Mode */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Format & Game Settings</h2>
                
                {/* Tournament Format */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-3">
                    Tournament Format
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(formatConfigs).map(([format, config]) => (
                      <button
                        key={format}
                        onClick={() => setFormData({ 
                          ...formData, 
                          format: format as TournamentFormat,
                          maxParticipants: Math.min(formData.maxParticipants || 16, config.maxParticipants)
                        })}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.format === format
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{config.icon}</span>
                          <span className="text-white font-semibold">{config.name}</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{config.description}</p>
                        <div className="text-xs text-gray-500">
                          {config.minParticipants}-{config.maxParticipants} players • {config.estimatedDuration}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Game Mode */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-3">
                    Game Mode
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(gameModeConfigs).map(([mode, config]) => (
                      <button
                        key={mode}
                        onClick={() => setFormData({ 
                          ...formData, 
                          gameMode: mode as GameMode,
                          gameSettings: {
                            ...formData.gameSettings!,
                            gameMode: mode as GameMode
                          }
                        })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.gameMode === mode
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        }`}
                      >
                        <div className={`text-2xl mb-2 ${config.color}`}>
                          {config.icon}
                        </div>
                        <div className="text-white font-medium text-sm">{config.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Maximum Participants
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min={formatConfigs[formData.format!].minParticipants}
                      max={formatConfigs[formData.format!].maxParticipants}
                      value={formData.maxParticipants || 16}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-white font-bold text-lg min-w-[3rem] text-center">
                      {formData.maxParticipants}
                    </span>
                  </div>
                  {errors.maxParticipants && <p className="text-red-400 text-sm mt-1">{errors.maxParticipants}</p>}
                  <p className="text-gray-400 text-sm mt-1">
                    {formatConfigs[formData.format!].minParticipants} - {formatConfigs[formData.format!].maxParticipants} participants allowed for {formatConfigs[formData.format!].name}
                  </p>
                </div>

                {/* Game Settings */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Game Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Difficulty</label>
                      <select
                        value={formData.gameSettings?.difficulty || 'medium'}
                        onChange={(e) => setFormData({
                          ...formData,
                          gameSettings: {
                            ...formData.gameSettings!,
                            difficulty: e.target.value as Difficulty
                          }
                        })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Duration (seconds)</label>
                      <input
                        type="number"
                        min="30"
                        max="300"
                        value={formData.gameSettings?.duration || 60}
                        onChange={(e) => setFormData({
                          ...formData,
                          gameSettings: {
                            ...formData.gameSettings!,
                            duration: Number(e.target.value)
                          }
                        })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Target Size</label>
                      <select
                        value={formData.gameSettings?.targetSize || 'medium'}
                        onChange={(e) => setFormData({
                          ...formData,
                          gameSettings: {
                            ...formData.gameSettings!,
                            targetSize: e.target.value as TargetSize
                          }
                        })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Schedule */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Schedule & Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Registration Start
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.registrationStart?.slice(0, -1) || ''}
                      onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value + 'Z' })}
                      className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white ${
                        errors.registrationStart ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                    {errors.registrationStart && <p className="text-red-400 text-sm mt-1">{errors.registrationStart}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Registration End
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.registrationEnd?.slice(0, -1) || ''}
                      onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value + 'Z' })}
                      className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white ${
                        errors.registrationEnd ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                    {errors.registrationEnd && <p className="text-red-400 text-sm mt-1">{errors.registrationEnd}</p>}
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Tournament Start
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.tournamentStart?.slice(0, -1) || ''}
                      onChange={(e) => setFormData({ ...formData, tournamentStart: e.target.value + 'Z' })}
                      className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white ${
                        errors.tournamentStart ? 'border-red-500' : 'border-gray-600'
                      }`}
                    />
                    {errors.tournamentStart && <p className="text-red-400 text-sm mt-1">{errors.tournamentStart}</p>}
                  </div>
                </div>

                {/* Bracket Settings */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Bracket Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Best Of</label>
                      <select
                        value={formData.bracketSettings?.bestOf || 3}
                        onChange={(e) => setFormData({
                          ...formData,
                          bracketSettings: {
                            ...formData.bracketSettings!,
                            bestOf: Number(e.target.value)
                          }
                        })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      >
                        <option value={1}>Best of 1</option>
                        <option value={3}>Best of 3</option>
                        <option value={5}>Best of 5</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Seeding Method</label>
                      <select
                        value={formData.bracketSettings?.seedingMethod || 'elo'}
                        onChange={(e) => setFormData({
                          ...formData,
                          bracketSettings: {
                            ...formData.bracketSettings!,
                            seedingMethod: e.target.value as any
                          }
                        })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="elo">ELO Rating</option>
                        <option value="random">Random</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="lateRegistration"
                        checked={formData.bracketSettings?.allowLateRegistration || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          bracketSettings: {
                            ...formData.bracketSettings!,
                            allowLateRegistration: e.target.checked
                          }
                        })}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      />
                      <label htmlFor="lateRegistration" className="text-gray-300 text-sm font-medium">
                        Allow Late Registration
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Preview */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Tournament Preview</h2>
                
                <div className="bg-gray-700/50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Bracket Preview</h3>
                  
                  {/* Mock tournament for preview */}
                  {(() => {
                    const mockParticipants = Array.from({ length: Math.min(formData.maxParticipants || 8, 8) }, (_, i) => ({
                      userId: `mock_${i + 1}`,
                      username: `Player ${i + 1}`,
                      eloRating: 1000 + Math.random() * 1000,
                      seed: i + 1,
                      registeredAt: new Date().toISOString(),
                      isActive: true,
                      wins: 0,
                      losses: 0,
                      isEliminated: false
                    }))

                    const mockTournament: Tournament = {
                      id: 'preview_tournament',
                      name: formData.name || 'Preview Tournament',
                      description: formData.description || '',
                      gameMode: formData.gameMode!,
                      format: formData.format!,
                      status: 'registration' as any,
                      maxParticipants: formData.maxParticipants!,
                      entryFee: formData.entryFee,
                      prizePool: formData.prizePool,
                      registrationStart: formData.registrationStart!,
                      registrationEnd: formData.registrationEnd!,
                      tournamentStart: formData.tournamentStart!,
                      gameSettings: formData.gameSettings!,
                      bracketSettings: formData.bracketSettings!,
                      participants: mockParticipants,
                      brackets: [],
                      currentRound: 0,
                      totalRounds: calculateTotalRounds(formData.format!, formData.maxParticipants!),
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString()
                    }

                    return (
                      <BracketVisualization
                        tournament={mockTournament}
                        isInteractive={false}
                        showSchedule={false}
                      />
                    )
                  })()}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FaEye className="text-blue-400 mt-1" />
                    <div>
                      <h4 className="text-blue-400 font-medium mb-1">Bracket Preview</h4>
                      <p className="text-gray-300 text-sm">
                        This is how your tournament bracket will look with {formData.maxParticipants} participants. 
                        The actual bracket will be generated when the tournament starts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6">Review Tournament</h2>
                
                <div className="bg-gray-700/50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Basic Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-400">Name:</span> <span className="text-white">{formData.name}</span></div>
                        <div><span className="text-gray-400">Description:</span> <span className="text-white">{formData.description}</span></div>
                        <div><span className="text-gray-400">Entry Fee:</span> <span className="text-white">{formData.entryFee || 0} points</span></div>
                        <div><span className="text-gray-400">Prize Pool:</span> <span className="text-white">{formData.prizePool || 0} points</span></div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Format & Game</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-400">Format:</span> <span className="text-white">{formatConfigs[formData.format!].name}</span></div>
                        <div><span className="text-gray-400">Game Mode:</span> <span className="text-white">{gameModeConfigs[formData.gameMode!].name}</span></div>
                        <div><span className="text-gray-400">Participants:</span> <span className="text-white">{formData.maxParticipants} max</span></div>
                        <div><span className="text-gray-400">Estimated Rounds:</span> <span className="text-white">{calculateTotalRounds(formData.format!, formData.maxParticipants!)}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-600 pt-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Registration:</span>
                        <div className="text-white">
                          {new Date(formData.registrationStart!).toLocaleDateString()} - {new Date(formData.registrationEnd!).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Tournament Start:</span>
                        <div className="text-white">{new Date(formData.tournamentStart!).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Estimated Duration:</span>
                        <div className="text-white">{formatConfigs[formData.format!].estimatedDuration}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <FaCheckCircle className="text-blue-400 mt-1" />
                    <div>
                      <h4 className="text-blue-400 font-medium mb-1">Ready to Create</h4>
                      <p className="text-gray-300 text-sm">
                        Your tournament is configured and ready to be created. Players will be able to register 
                        starting {new Date(formData.registrationStart!).toLocaleDateString()}.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Previous
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex space-x-3">
            {currentStep < 5 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <span>Next</span>
                <FaPlay className="text-sm" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <FaSave />
                <span>{existingTournament ? 'Update Tournament' : 'Create Tournament'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 