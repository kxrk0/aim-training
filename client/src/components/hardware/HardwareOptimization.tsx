import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaMouse, FaDesktop, FaCog, FaWifi, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa'

interface HardwareSettings {
  mouse: {
    dpi: number
    sensitivity: number
    pollingRate: number
    acceleration: boolean
    smoothing: boolean
  }
  monitor: {
    refreshRate: number
    resolution: string
    brightness: number
    contrast: number
  }
  system: {
    fps: number
    latency: number
    cpuUsage: number
    ramUsage: number
  }
}

interface OptimizationSuggestion {
  id: string
  category: 'mouse' | 'monitor' | 'system' | 'network'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  difficulty: 'easy' | 'medium' | 'hard'
  implemented: boolean
}

export const HardwareOptimization: React.FC = () => {
  const [settings, setSettings] = useState<HardwareSettings>({
    mouse: {
      dpi: 800,
      sensitivity: 1.2,
      pollingRate: 1000,
      acceleration: false,
      smoothing: false
    },
    monitor: {
      refreshRate: 144,
      resolution: '1920x1080',
      brightness: 75,
      contrast: 80
    },
    system: {
      fps: 142,
      latency: 12,
      cpuUsage: 45,
      ramUsage: 62
    }
  })

  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [isScanning, setIsScanning] = useState(false)

  const mockSuggestions: OptimizationSuggestion[] = [
    {
      id: '1',
      category: 'mouse',
      title: 'Disable Mouse Acceleration',
      description: 'Windows mouse acceleration is enabled, which can cause inconsistent aim',
      impact: 'high',
      difficulty: 'easy',
      implemented: false
    },
    {
      id: '2',
      category: 'monitor',
      title: 'Enable G-Sync/FreeSync',
      description: 'Variable refresh rate will reduce screen tearing and input lag',
      impact: 'medium',
      difficulty: 'easy',
      implemented: false
    },
    {
      id: '3',
      category: 'system',
      title: 'Optimize Power Plan',
      description: 'Switch to High Performance mode for consistent frame times',
      impact: 'medium',
      difficulty: 'easy',
      implemented: true
    },
    {
      id: '4',
      category: 'network',
      title: 'Lower Network Latency',
      description: 'Close bandwidth-heavy applications to reduce ping',
      impact: 'low',
      difficulty: 'easy',
      implemented: false
    }
  ]

  useEffect(() => {
    setSuggestions(mockSuggestions)
  }, [])

  const scanHardware = async () => {
    setIsScanning(true)
    
    // Simulate hardware scan
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Update with "scanned" values
    setSettings(prev => ({
      ...prev,
      system: {
        ...prev.system,
        fps: Math.floor(Math.random() * 20) + 140,
        latency: Math.floor(Math.random() * 5) + 10,
        cpuUsage: Math.floor(Math.random() * 20) + 40,
        ramUsage: Math.floor(Math.random() * 15) + 55
      }
    }))
    
    setIsScanning(false)
  }

  const implementSuggestion = (id: string) => {
    setSuggestions(prev => 
      prev.map(suggestion => 
        suggestion.id === id 
          ? { ...suggestion, implemented: true }
          : suggestion
      )
    )
  }

  const getImpactColor = (impact: OptimizationSuggestion['impact']) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/30'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
    }
  }

  const getCategoryIcon = (category: OptimizationSuggestion['category']) => {
    switch (category) {
      case 'mouse': return <FaMouse className="text-orange-400" />
      case 'monitor': return <FaDesktop className="text-blue-400" />
      case 'system': return <FaCog className="text-green-400" />
      case 'network': return <FaWifi className="text-purple-400" />
    }
  }

  const getPerformanceColor = (value: number, type: 'fps' | 'latency' | 'usage') => {
    switch (type) {
      case 'fps':
        return value >= 144 ? 'text-green-400' : value >= 60 ? 'text-yellow-400' : 'text-red-400'
      case 'latency':
        return value <= 15 ? 'text-green-400' : value <= 25 ? 'text-yellow-400' : 'text-red-400'
      case 'usage':
        return value <= 60 ? 'text-green-400' : value <= 80 ? 'text-yellow-400' : 'text-red-400'
    }
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Hardware Optimization
          </h1>
          <p className="text-gray-400 text-lg">Optimize your gaming setup for peak aim training performance</p>
        </motion.div>

        {/* System Monitoring */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <FaDesktop className="text-2xl text-blue-500" />
              <span className="text-sm text-gray-400">Current</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">FPS</h3>
            <p className={`text-3xl font-bold ${getPerformanceColor(settings.system.fps, 'fps')}`}>
              {settings.system.fps}
            </p>
            <p className="text-sm text-gray-400 mt-2">{settings.monitor.refreshRate}Hz monitor</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <FaWifi className="text-2xl text-purple-500" />
              <span className="text-sm text-gray-400">Network</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Latency</h3>
            <p className={`text-3xl font-bold ${getPerformanceColor(settings.system.latency, 'latency')}`}>
              {settings.system.latency}ms
            </p>
            <p className="text-sm text-gray-400 mt-2">Input lag</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <FaCog className="text-2xl text-green-500" />
              <span className="text-sm text-gray-400">System</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">CPU</h3>
            <p className={`text-3xl font-bold ${getPerformanceColor(settings.system.cpuUsage, 'usage')}`}>
              {settings.system.cpuUsage}%
            </p>
            <p className="text-sm text-gray-400 mt-2">Usage</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <FaCog className="text-2xl text-orange-500" />
              <span className="text-sm text-gray-400">Memory</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">RAM</h3>
            <p className={`text-3xl font-bold ${getPerformanceColor(settings.system.ramUsage, 'usage')}`}>
              {settings.system.ramUsage}%
            </p>
            <p className="text-sm text-gray-400 mt-2">Usage</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hardware Settings */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-6">Current Settings</h3>
            
            {/* Mouse Settings */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaMouse className="mr-3 text-orange-400" />
                Mouse Configuration
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">DPI</label>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <span className="text-white font-semibold">{settings.mouse.dpi}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Sensitivity</label>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <span className="text-white font-semibold">{settings.mouse.sensitivity}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Polling Rate</label>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <span className="text-white font-semibold">{settings.mouse.pollingRate}Hz</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Acceleration</label>
                    <div className="bg-gray-700 rounded-lg p-3">
                      <span className={`font-semibold ${settings.mouse.acceleration ? 'text-red-400' : 'text-green-400'}`}>
                        {settings.mouse.acceleration ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Monitor Settings */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                <FaDesktop className="mr-3 text-blue-400" />
                Monitor Configuration
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Refresh Rate</label>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <span className="text-white font-semibold">{settings.monitor.refreshRate}Hz</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Resolution</label>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <span className="text-white font-semibold">{settings.monitor.resolution}</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={scanHardware}
              disabled={isScanning}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {isScanning ? 'Scanning Hardware...' : 'Scan Hardware'}
            </button>
          </motion.div>

          {/* Optimization Suggestions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-6">Optimization Suggestions</h3>
            
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border ${
                    suggestion.implemented 
                      ? 'border-green-500/30 bg-green-500/10' 
                      : 'border-gray-600 bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {getCategoryIcon(suggestion.category)}
                      <div className="flex-1">
                        <h5 className="font-semibold text-white mb-1">{suggestion.title}</h5>
                        <p className="text-sm text-gray-300">{suggestion.description}</p>
                      </div>
                    </div>
                    {suggestion.implemented ? (
                      <FaCheckCircle className="text-green-400" />
                    ) : (
                      <FaExclamationTriangle className="text-yellow-400" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getImpactColor(suggestion.impact)}`}>
                        {suggestion.impact} impact
                      </span>
                      <span className="text-xs text-gray-400">{suggestion.difficulty} difficulty</span>
                    </div>
                    
                    {!suggestion.implemented && (
                      <button 
                        onClick={() => implementSuggestion(suggestion.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded transition-colors"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Performance Score */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-blue-400">Optimization Score</h4>
                <span className="text-2xl font-bold text-blue-400">85/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                Excellent setup! Apply remaining suggestions for peak performance.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}