import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useSensitivityStore } from '../../stores/sensitivityStore'
import { useAuthStore } from '../../stores/authStore'
import { 
  FaCog, 
  FaGamepad, 
  FaMousePointer, 
  FaUser, 
  FaSlidersH,
  FaBullseye,
  FaClock,
  FaEye,
  FaSave,
  FaUndo,
  FaTrashAlt,
  FaArrowsAlt,
  FaExchangeAlt,
  FaCrosshairs
} from 'react-icons/fa'
import type { 
  SupportedGame, 
  Difficulty, 
  SensitivityTestType,
  UserSensitivityProfile 
} from '../../../../shared/types'

export const SensitivitySettings: React.FC = () => {
  const { user } = useAuthStore()
  const { 
    userProfile, 
    testSettings,
    updateUserProfile,
    updateTestSettings,
    resetState 
  } = useSensitivityStore()

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'tests' | 'advanced'>('profile')

  // Local state for form inputs
  const [formData, setFormData] = useState({
    primaryGame: userProfile?.primaryGame || 'valorant',
    currentSensitivity: userProfile?.currentSensitivity || 0.5,
    currentDPI: userProfile?.currentDPI || 800,
    mouseModel: userProfile?.mouseModel || '',
    monitorSize: userProfile?.monitorSize || 24,
    preferredPlayStyle: userProfile?.preferredPlayStyle || 'hybrid',
    testPreferences: {
      defaultDuration: userProfile?.testPreferences.defaultDuration || 60,
      preferredDifficulty: userProfile?.testPreferences.preferredDifficulty || 'medium',
      autoStartTests: userProfile?.testPreferences.autoStartTests || false,
      showRealTimeStats: userProfile?.testPreferences.showRealTimeStats || true
    }
  })

  // Game configurations
  const gameOptions: Array<{ id: SupportedGame, name: string, icon: string }> = [
    { id: 'valorant', name: 'VALORANT', icon: '🎯' },
    { id: 'cs2', name: 'Counter-Strike 2', icon: '💣' },
    { id: 'apex', name: 'Apex Legends', icon: '⚡' },
    { id: 'fortnite', name: 'Fortnite', icon: '🏗️' },
    { id: 'overwatch2', name: 'Overwatch 2', icon: '🦸' },
    { id: 'cod', name: 'Call of Duty', icon: '🔫' },
    { id: 'rainbow6', name: 'Rainbow Six Siege', icon: '🏢' }
  ]

  // Test type configurations
  const testTypeConfigs = {
    'flick': { 
      icon: FaBullseye, 
      name: 'Flick Shots',
      description: 'Rapid target acquisition',
      defaultDuration: 60
    },
    'tracking': { 
      icon: FaArrowsAlt, 
      name: 'Tracking',
      description: 'Smooth target following',
      defaultDuration: 45
    },
    'target-switching': { 
      icon: FaExchangeAlt, 
      name: 'Target Switching',
      description: 'Quick target transitions',
      defaultDuration: 30
    },
    'micro-correction': { 
      icon: FaCrosshairs, 
      name: 'Micro Correction',
      description: 'Precise fine adjustments',
      defaultDuration: 40
    }
  }

  // Handle form field changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasUnsavedChanges(true)
  }

  // Handle nested field changes
  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev] as any,
        [field]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  // Save settings
  const handleSave = async () => {
    if (!userProfile) return

    const updatedProfile: Partial<UserSensitivityProfile> = {
      primaryGame: formData.primaryGame as SupportedGame,
      currentSensitivity: formData.currentSensitivity,
      currentDPI: formData.currentDPI,
      mouseModel: formData.mouseModel,
      monitorSize: formData.monitorSize,
      preferredPlayStyle: formData.preferredPlayStyle as any,
      testPreferences: formData.testPreferences as any
    }

    await updateUserProfile(updatedProfile)
    setHasUnsavedChanges(false)
  }

  // Reset to defaults
  const handleReset = () => {
    if (!userProfile) return

    setFormData({
      primaryGame: userProfile.primaryGame,
      currentSensitivity: userProfile.currentSensitivity,
      currentDPI: userProfile.currentDPI,
      mouseModel: userProfile.mouseModel || '',
      monitorSize: userProfile.monitorSize || 24,
      preferredPlayStyle: userProfile.preferredPlayStyle,
      testPreferences: {
        ...userProfile.testPreferences,
        showRealTimeStats: Boolean(userProfile.testPreferences.showRealTimeStats) as true
      }
    })
    setHasUnsavedChanges(false)
  }

  // Clear all data
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all sensitivity test data? This cannot be undone.')) {
      resetState()
    }
  }

  if (!user || !userProfile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <FaCog className="text-6xl text-slate-500 mb-4 mx-auto" />
          <h3 className="text-xl font-bold text-white mb-2">Settings Unavailable</h3>
          <p className="text-slate-400">
            Please log in and create a profile to access sensitivity settings.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Sensitivity Settings
        </h2>
        <p className="text-slate-400 text-lg">
          Configure your testing preferences and gaming setup
        </p>
      </div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50"
      >
        <div className="flex space-x-1">
          {[
            { id: 'profile', name: 'Gaming Profile', icon: FaUser },
            { id: 'tests', name: 'Test Settings', icon: FaBullseye },
            { id: 'advanced', name: 'Advanced', icon: FaSlidersH }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <tab.icon className="text-sm" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Gaming Setup */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <FaGamepad className="text-blue-500 mr-3" />
                Gaming Setup
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Game */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Primary Game
                  </label>
                  <select
                    value={formData.primaryGame}
                    onChange={(e) => handleInputChange('primaryGame', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  >
                    {gameOptions.map(game => (
                      <option key={game.id} value={game.id}>
                        {game.icon} {game.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Play Style */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Preferred Play Style
                  </label>
                  <select
                    value={formData.preferredPlayStyle}
                    onChange={(e) => handleInputChange('preferredPlayStyle', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  >
                    <option value="flick-heavy">Flick Heavy</option>
                    <option value="tracking-heavy">Tracking Heavy</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Current Sensitivity */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Current Sensitivity
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    max="20"
                    value={formData.currentSensitivity}
                    onChange={(e) => handleInputChange('currentSensitivity', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  />
                </div>

                {/* Current DPI */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mouse DPI
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    value={formData.currentDPI}
                    onChange={(e) => handleInputChange('currentDPI', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  />
                </div>

                {/* Mouse Model */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mouse Model (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.mouseModel}
                    onChange={(e) => handleInputChange('mouseModel', e.target.value)}
                    placeholder="e.g., Logitech G Pro X Superlight"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  />
                </div>

                {/* Monitor Size */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Monitor Size (inches)
                  </label>
                  <input
                    type="number"
                    min="13"
                    max="50"
                    value={formData.monitorSize}
                    onChange={(e) => handleInputChange('monitorSize', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-6">
            {/* Test Preferences */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <FaBullseye className="text-green-500 mr-3" />
                Test Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Default Duration */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Default Test Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={formData.testPreferences.defaultDuration}
                    onChange={(e) => handleNestedChange('testPreferences', 'defaultDuration', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  />
                </div>

                {/* Preferred Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Preferred Difficulty
                  </label>
                  <select
                    value={formData.testPreferences.preferredDifficulty}
                    onChange={(e) => handleNestedChange('testPreferences', 'preferredDifficulty', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>

              {/* Boolean Options */}
              <div className="mt-6 space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.testPreferences.autoStartTests}
                    onChange={(e) => handleNestedChange('testPreferences', 'autoStartTests', e.target.checked)}
                    className="w-4 h-4 text-orange-600 bg-slate-700 border-slate-600 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  <span className="text-slate-300">Auto-start tests after setup</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.testPreferences.showRealTimeStats}
                    onChange={(e) => handleNestedChange('testPreferences', 'showRealTimeStats', e.target.checked)}
                    className="w-4 h-4 text-orange-600 bg-slate-700 border-slate-600 rounded focus:ring-orange-500 focus:ring-2"
                  />
                  <span className="text-slate-300">Show real-time performance stats</span>
                </label>
              </div>
            </div>

            {/* Test Type Customization */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <FaClock className="text-purple-500 mr-3" />
                Test Type Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(testTypeConfigs).map(([testType, config]) => {
                  const Icon = config.icon
                  
                  return (
                    <div key={testType} className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <Icon className="text-orange-500" />
                        <div>
                          <h4 className="font-semibold text-white">{config.name}</h4>
                          <p className="text-xs text-slate-400">{config.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">Default Duration:</span>
                          <span className="text-white">{config.defaultDuration}s</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-6">
            {/* Advanced Settings */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <FaSlidersH className="text-yellow-500 mr-3" />
                Advanced Options
              </h3>
              
              <div className="space-y-6">
                {/* Performance Monitoring */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Performance Monitoring</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="w-4 h-4 text-orange-600 bg-slate-700 border-slate-600 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-slate-300">Enable FPS monitoring</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="w-4 h-4 text-orange-600 bg-slate-700 border-slate-600 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-slate-300">Track mouse trajectory</span>
                    </label>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked={false}
                        className="w-4 h-4 text-orange-600 bg-slate-700 border-slate-600 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-slate-300">Export detailed analytics</span>
                    </label>
                  </div>
                </div>

                {/* Data Management */}
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Data Management</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div>
                        <span className="text-white font-medium">Test History</span>
                        <p className="text-xs text-slate-400">
                          {userProfile.testResults.length} tests recorded
                        </p>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-500 transition-colors">
                        Export
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div>
                        <span className="text-red-400 font-medium">Clear All Data</span>
                        <p className="text-xs text-red-400/70">
                          Permanently delete all test results and settings
                        </p>
                      </div>
                      <button
                        onClick={handleClearData}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-500 transition-colors"
                      >
                        <FaTrashAlt className="mr-1" />
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Save Actions */}
      {hasUnsavedChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400">You have unsaved changes</span>
            <div className="flex space-x-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-700 text-slate-300 text-sm rounded hover:bg-slate-600 transition-colors flex items-center"
              >
                <FaUndo className="mr-1" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-500 transition-colors flex items-center"
              >
                <FaSave className="mr-1" />
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}