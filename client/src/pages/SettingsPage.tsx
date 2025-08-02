import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { 
  FaCog, 
  FaGamepad, 
  FaEye, 
  FaVolumeUp, 
  FaKeyboard, 
  FaMouse,
  FaCrosshairs,
  FaPalette,
  FaSlidersH,
  FaSave,
  FaUndo,
  FaHeartbeat,
  FaDesktop,
  FaMousePointer,
  FaVolumeDown,
  FaVolumeOff,
  FaVolumeMute,
  FaCheck,
  FaDownload,
  FaUpload,
  FaCopy
} from 'react-icons/fa'

interface CrosshairSettings {
  color: string
  size: number
  thickness: number
  gap: number
  outline: boolean
  outlineColor: string
  outlineThickness: number
  opacity: number
  style: 'cross' | 'dot' | 'circle' | 'square' | 'plus'
  centerDot: boolean
  centerDotSize: number
  animation: 'none' | 'pulse' | 'rotate' | 'scale'
}

export function SettingsPage() {
  const { scrollY } = useScroll()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState('game')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -30])

  const [sensitivity, setSensitivity] = useState(2.5)
  const [crosshair, setCrosshair] = useState<CrosshairSettings>({
    color: '#00ff88',
    size: 20,
    thickness: 2,
    gap: 3,
    outline: true,
    outlineColor: '#000000',
    outlineThickness: 1,
    opacity: 100,
    style: 'cross',
    centerDot: false,
    centerDotSize: 2,
    animation: 'none'
  })
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [difficulty, setDifficulty] = useState('medium')

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const tabs = [
    { id: 'game', label: 'Game', icon: FaGamepad },
    { id: 'crosshair', label: 'Crosshair', icon: FaCrosshairs },
    { id: 'display', label: 'Display', icon: FaDesktop },
    { id: 'audio', label: 'Audio', icon: FaVolumeUp },
    { id: 'controls', label: 'Controls', icon: FaKeyboard }
  ]

  const crosshairColors = [
    '#00ff88', '#ff0066', '#ffff00', '#00ffff', '#ff8800',
    '#8800ff', '#ff0000', '#ffffff', '#000000', '#888888'
  ]

  const crosshairStyles = [
    { id: 'cross', name: 'Cross', icon: '+' },
    { id: 'dot', name: 'Dot', icon: '•' },
    { id: 'circle', name: 'Circle', icon: '○' },
    { id: 'square', name: 'Square', icon: '□' },
    { id: 'plus', name: 'Plus', icon: '⊕' }
  ]

  const renderCrosshair = (settings: CrosshairSettings, size: 'small' | 'large' = 'large') => {
    const scale = size === 'small' ? 0.5 : 1
    const crosshairSize = settings.size * scale
    const thickness = settings.thickness * scale
    const gap = settings.gap * scale

    const baseStyle = {
      color: settings.color,
      opacity: settings.opacity / 100
    }

    const outlineStyle = settings.outline ? {
      textShadow: `
        -${settings.outlineThickness}px -${settings.outlineThickness}px 0 ${settings.outlineColor},
        ${settings.outlineThickness}px -${settings.outlineThickness}px 0 ${settings.outlineColor},
        -${settings.outlineThickness}px ${settings.outlineThickness}px 0 ${settings.outlineColor},
        ${settings.outlineThickness}px ${settings.outlineThickness}px 0 ${settings.outlineColor}
      `
    } : {}

    switch (settings.style) {
      case 'cross':
        return (
          <div className="relative" style={{ width: crosshairSize, height: crosshairSize }}>
            {/* Horizontal line */}
            <div 
              className="absolute bg-current"
              style={{
                ...baseStyle,
                ...outlineStyle,
                left: 0,
                right: 0,
                top: '50%',
                height: thickness,
                transform: 'translateY(-50%)',
                clipPath: `polygon(0 0, ${50 - (gap/crosshairSize)*50}% 0, ${50 - (gap/crosshairSize)*50}% 100%, 0 100%), polygon(${50 + (gap/crosshairSize)*50}% 0, 100% 0, 100% 100%, ${50 + (gap/crosshairSize)*50}% 100%)`
              }}
            />
            {/* Vertical line */}
            <div 
              className="absolute bg-current"
              style={{
                ...baseStyle,
                ...outlineStyle,
                top: 0,
                bottom: 0,
                left: '50%',
                width: thickness,
                transform: 'translateX(-50%)',
                clipPath: `polygon(0 0, 100% 0, 100% ${50 - (gap/crosshairSize)*50}%, 0 ${50 - (gap/crosshairSize)*50}%), polygon(0 ${50 + (gap/crosshairSize)*50}%, 100% ${50 + (gap/crosshairSize)*50}%, 100% 100%, 0 100%)`
              }}
            />
            {settings.centerDot && (
              <div 
                className="absolute bg-current rounded-full"
                style={{
                  ...baseStyle,
                  ...outlineStyle,
                  top: '50%',
                  left: '50%',
                  width: settings.centerDotSize * scale,
                  height: settings.centerDotSize * scale,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            )}
          </div>
        )
      case 'dot':
        return (
          <div 
            className="rounded-full bg-current"
            style={{
              ...baseStyle,
              ...outlineStyle,
              width: crosshairSize,
              height: crosshairSize
            }}
          />
        )
      case 'circle':
        return (
          <div 
            className="rounded-full border-current"
            style={{
              ...baseStyle,
              ...outlineStyle,
              width: crosshairSize,
              height: crosshairSize,
              borderWidth: thickness,
              borderStyle: 'solid'
            }}
          />
        )
      case 'square':
        return (
          <div 
            className="border-current"
            style={{
              ...baseStyle,
              ...outlineStyle,
              width: crosshairSize,
              height: crosshairSize,
              borderWidth: thickness,
              borderStyle: 'solid'
            }}
          />
        )
      default:
        return null
    }
  }

  const handleSaveSettings = () => {
    setHasUnsavedChanges(false)
    console.log('Settings saved:', { crosshair, sensitivity, soundEnabled, difficulty })
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      
      {/* Particle System */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: window.innerWidth < 768 ? 20 : 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -80, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Interactive Cursor Effect */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl pointer-events-none"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />

      {/* Header */}
      <motion.div 
        style={{ y: y1 }}
        className="relative border-b border-gray-700/50 bg-gray-800/30 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 gap-4">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="flex items-center space-x-4"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <FaCog className="text-4xl text-purple-500" />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    SETTINGS
                  </h1>
                  <p className="text-gray-300 font-medium">
                    Customize Your Gaming Experience
                  </p>
                </div>
              </motion.div>
            </div>
            
            {/* Save Status */}
            {hasUnsavedChanges && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <div className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm border border-yellow-500/30">
                  Unsaved Changes
                </div>
                <motion.button
                  onClick={handleSaveSettings}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaSave className="text-sm" />
                  <span className="hidden sm:inline">Save</span>
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Sidebar - Tab Navigation */}
          <motion.div 
            style={{ y: y2 }}
            className="lg:w-80 xl:w-96 flex-shrink-0"
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center" id="settings-navigation">
                <span className="mr-3" aria-hidden="true">🎛️</span>
                Settings Categories
              </h3>
              
              <nav className="space-y-3" role="navigation" aria-labelledby="settings-navigation">
                {tabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    aria-label={`${tab.label} settings`}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                    className={`group relative w-full p-3 sm:p-4 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                      activeTab === tab.id
                        ? 'border-transparent bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white shadow-lg'
                        : 'border-gray-600/50 bg-gray-700/30 text-gray-300 hover:border-gray-500/50 hover:bg-gray-600/30'
                    }`}
                    whileHover={{ scale: 1.02, x: 3 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Glowing border effect */}
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 blur"></div>
                    )}
                    
                    <div className="relative flex items-center space-x-3 sm:space-x-4">
                      <motion.div 
                        className={`text-xl sm:text-2xl flex-shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`}
                        whileHover={{ rotate: 180, scale: 1.2 }}
                        transition={{ duration: 0.3 }}
                        aria-hidden="true"
                      >
                        <tab.icon />
                      </motion.div>
                      <div className="text-left min-w-0 flex-1">
                        <h4 className="font-bold text-base sm:text-lg truncate">{tab.label}</h4>
                      </div>
                    </div>
                    
                    {/* Active indicator */}
                    {activeTab === tab.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full"
                      />
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-gray-700/50 space-y-3">
                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Quick Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setCrosshair({
                        color: '#00ff88',
                        size: 20,
                        thickness: 2,
                        gap: 3,
                        outline: true,
                        outlineColor: '#000000',
                        outlineThickness: 1,
                        opacity: 100,
                        style: 'cross',
                        centerDot: false,
                        centerDotSize: 2,
                        animation: 'none'
                      })
                      setHasUnsavedChanges(true)
                    }}
                    className="w-full py-2 px-3 text-sm bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 flex items-center space-x-2"
                  >
                    <FaUndo className="text-xs" />
                    <span>Reset to Defaults</span>
                  </button>
                  <button className="w-full py-2 px-3 text-sm bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 flex items-center space-x-2">
                    <FaDownload className="text-xs" />
                    <span>Import Settings</span>
                  </button>
                  <button className="w-full py-2 px-3 text-sm bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 flex items-center space-x-2">
                    <FaUpload className="text-xs" />
                    <span>Export Settings</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Main Content */}
          <main className="flex-1 min-w-0" role="main" aria-label="Settings content">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Game Settings */}
                {activeTab === 'game' && (
                  <div className="space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
                    >
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        <FaMouse className="mr-3 text-blue-500" />
                        Mouse Settings
                      </h3>
                      
                      {/* Mouse Sensitivity */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-300">
                          Mouse Sensitivity: {sensitivity}
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={sensitivity}
                          onChange={(e) => {
                            setSensitivity(parseFloat(e.target.value))
                            setHasUnsavedChanges(true)
                          }}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Slow (0.1)</span>
                          <span>Fast (10.0)</span>
                        </div>
                      </div>

                      {/* Difficulty */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                          Default Difficulty
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {['easy', 'medium', 'hard', 'expert'].map((level) => (
                            <button
                              key={level}
                              onClick={() => {
                                setDifficulty(level)
                                setHasUnsavedChanges(true)
                              }}
                              className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                                difficulty === level
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/30'
                              }`}
                            >
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Crosshair Settings */}
                {activeTab === 'crosshair' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Crosshair Customization */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
                      >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                          <FaCrosshairs className="mr-3 text-red-500" />
                          Crosshair Customization
                        </h3>
                        
                        <div className="space-y-6">
                          {/* Style Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              Crosshair Style
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                              {crosshairStyles.map((style) => (
                                <button
                                  key={style.id}
                                  onClick={() => {
                                    setCrosshair(prev => ({ ...prev, style: style.id as any }))
                                    setHasUnsavedChanges(true)
                                  }}
                                  className={`aspect-square flex items-center justify-center text-2xl font-bold rounded-lg transition-all duration-300 ${
                                    crosshair.style === style.id
                                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 border border-gray-600/30'
                                  }`}
                                  title={style.name}
                                >
                                  {style.icon}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Color Selection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                              Crosshair Color
                            </label>
                            <div className="flex items-center space-x-4 mb-3">
                              <input
                                type="color"
                                value={crosshair.color}
                                onChange={(e) => {
                                  setCrosshair(prev => ({ ...prev, color: e.target.value }))
                                  setHasUnsavedChanges(true)
                                }}
                                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600"
                              />
                              <span className="text-sm text-gray-400">{crosshair.color.toUpperCase()}</span>
                              <button
                                onClick={() => navigator.clipboard.writeText(crosshair.color)}
                                className="p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
                                title="Copy color code"
                              >
                                <FaCopy className="text-xs text-gray-400" />
                              </button>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                              {crosshairColors.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => {
                                    setCrosshair(prev => ({ ...prev, color }))
                                    setHasUnsavedChanges(true)
                                  }}
                                  className={`aspect-square rounded border-2 transition-all duration-300 hover:scale-110 ${
                                    crosshair.color === color ? 'border-white scale-110' : 'border-gray-600'
                                  }`}
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Size Settings */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Size: {crosshair.size}px
                              </label>
                              <input
                                type="range"
                                min="10"
                                max="50"
                                value={crosshair.size}
                                onChange={(e) => {
                                  setCrosshair(prev => ({ ...prev, size: parseInt(e.target.value) }))
                                  setHasUnsavedChanges(true)
                                }}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Thickness: {crosshair.thickness}px
                              </label>
                              <input
                                type="range"
                                min="1"
                                max="8"
                                value={crosshair.thickness}
                                onChange={(e) => {
                                  setCrosshair(prev => ({ ...prev, thickness: parseInt(e.target.value) }))
                                  setHasUnsavedChanges(true)
                                }}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Crosshair Preview */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
                      >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                          <FaEye className="mr-3 text-blue-500" />
                          Live Preview
                        </h3>
                        
                        {/* Large Preview */}
                        <div className="bg-gray-900/50 rounded-lg p-12 flex items-center justify-center mb-6 border border-gray-700/30">
                          <motion.div
                            key={`${crosshair.style}-${crosshair.color}-${crosshair.size}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {renderCrosshair(crosshair, 'large')}
                          </motion.div>
                        </div>

                        {/* Settings Summary */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-300">Current Settings</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Style:</span>
                              <span className="text-white capitalize">{crosshair.style}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Size:</span>
                              <span className="text-white">{crosshair.size}px</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Color:</span>
                              <span className="text-white">{crosshair.color}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Opacity:</span>
                              <span className="text-white">{crosshair.opacity}%</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )}

                {/* Audio Settings */}
                {activeTab === 'audio' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <FaVolumeUp className="mr-3 text-green-500" />
                      Audio Settings
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Sound Effects</span>
                      <button
                        onClick={() => {
                          setSoundEnabled(!soundEnabled)
                          setHasUnsavedChanges(true)
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          soundEnabled ? 'bg-green-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            soundEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Display Settings */}
                {activeTab === 'display' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <FaDesktop className="mr-3 text-cyan-500" />
                      Display Settings
                    </h3>
                    
                    <div className="text-center py-12">
                      <FaDesktop className="text-6xl text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Display settings coming soon...</p>
                    </div>
                  </motion.div>
                )}

                {/* Controls Settings */}
                {activeTab === 'controls' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <FaKeyboard className="mr-3 text-yellow-500" />
                      Controls
                    </h3>
                    
                    <div className="space-y-4">
                      {[
                        { action: 'Fire/Click', key: 'Left Click' },
                        { action: 'Pause', key: 'Space' },
                        { action: 'Exit to Menu', key: 'Esc' }
                      ].map((control, index) => (
                        <motion.div
                          key={control.action}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex justify-between items-center py-3 px-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
                        >
                          <span className="text-white">{control.action}</span>
                          <span className="bg-gray-600 px-3 py-1 rounded text-sm">{control.key}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 text-6xl opacity-10"
        >
          ⚙️
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 40, 0],
            rotate: [360, 180, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-32 left-20 text-5xl opacity-10"
        >
          🎛️
        </motion.div>
      </div>
    </div>
  )
} 