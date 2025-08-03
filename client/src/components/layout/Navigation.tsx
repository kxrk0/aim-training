import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { useLevelStore } from '@/stores/levelStore'
import { LevelProgress } from '@/components/ui/LevelProgress'
import { useState, useRef, useEffect } from 'react'

  // Organized navigation categories
  const navigationCategories = {
    core: {
      name: 'Training',
      icon: '🎯',
      items: [
        { name: 'Home', path: '/', icon: '🏠', description: 'Main dashboard' },
        { name: 'Training Hub', path: '/training-hub', icon: '🎯', description: 'Practice modes' },
      ]
    },
    competitive: {
      name: 'Compete',
      icon: '⚔️',
      items: [
        { name: '1v1 Battles', path: '/competition', icon: '⚔️', description: 'Head-to-head matches' },
        { name: 'Tournaments', path: '/tournaments', icon: '🏆', description: 'Join competitions' },
        { name: 'Seasons', path: '/seasons', icon: '👑', description: 'Season rankings' },
      ]
    },
    social: {
      name: 'Social',
      icon: '👥',
      items: [
        { name: 'Party & Team Challenges', path: '/party', icon: '👥', description: 'Party lobby & team competitions' },
        { name: 'Leaderboard', path: '/leaderboard', icon: '📊', description: 'Global rankings' },
      ]
    },
    progress: {
      name: 'Progress',
      icon: '📈', 
      items: [
        { name: 'Analytics', path: '/analytics', icon: '🧠', description: 'AI-powered insights' },
        { name: 'Achievements', path: '/achievements', icon: '🏅', description: 'Unlock rewards' },
        { name: 'Profile', path: '/profile', icon: '👤', description: 'Your statistics' },
      ]
    }
  }

  // Quick access items (always visible) - removed redundant items
  const quickAccessItems: any[] = []

export function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { currentLevel, getTitleForLevel, totalXP } = useLevelStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Calculate XP progress to next level
  const currentLevelXP = totalXP % 1000
  const xpProgress = (currentLevelXP / 1000) * 100

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-black/90 backdrop-blur-md border-b border-orange-500/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - More Left Aligned */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 mr-8">
            <span className="text-2xl">🎯</span>
            <span className="hidden sm:block text-xl font-bold text-orange-400 tracking-wide">
              AIM TRAINER
            </span>
            <span className="sm:hidden text-xl font-bold text-orange-400">
              AIM
            </span>
          </Link>

          {/* Modern Navigation - Categories with Dropdowns */}
          <div className="hidden lg:flex items-center space-x-2" ref={dropdownRef}>
            {/* Quick Access Items */}
            {quickAccessItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative"
                >
                  <motion.div
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'text-orange-400 bg-orange-400/10 shadow-lg shadow-orange-400/20'
                        : 'text-gray-300 hover:text-orange-400 hover:bg-orange-400/5'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </motion.div>
                </Link>
              )
            })}

            {/* Category Dropdowns */}
            {Object.entries(navigationCategories).map(([key, category]) => (
              <div key={key} className="relative">
                <motion.button
                  onClick={() => setActiveDropdown(activeDropdown === key ? null : key)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all ${
                    activeDropdown === key
                      ? 'text-blue-400 bg-blue-400/10'
                      : 'text-gray-300 hover:text-blue-400 hover:bg-blue-400/5'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-base">{category.icon}</span>
                  <span className="font-medium text-sm">{category.name}</span>
                  <motion.span
                    animate={{ rotate: activeDropdown === key ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs"
                  >
                    ▼
                  </motion.span>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {activeDropdown === key && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-black/95 backdrop-blur-md border border-gray-800/50 rounded-xl shadow-2xl shadow-orange-500/10 z-50"
                    >
                      <div className="p-2">
                        {category.items.map((item) => {
                          const isActive = location.pathname === item.path
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setActiveDropdown(null)}
                              className="block"
                            >
                              <motion.div
                                className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                                  isActive
                                    ? 'bg-orange-400/10 text-orange-400'
                                    : 'hover:bg-gray-900/70 text-gray-300 hover:text-white'
                                }`}
                                whileHover={{ x: 4 }}
                              >
                                <span className="text-lg">{item.icon}</span>
                                <div className="flex-1">
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-xs text-gray-400">{item.description}</div>
                                </div>
                                {isActive && (
                                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                )}
                              </motion.div>
                            </Link>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Mobile Navigation - More Options */}
          <div className="flex lg:hidden items-center space-x-2">
            {quickAccessItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'text-orange-400 bg-orange-400/10'
                      : 'text-gray-300 hover:text-orange-400'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="text-sm font-medium hidden md:block">{item.name}</span>
                </Link>
              )
            })}
            
            {/* Mobile More Menu */}
            <div className="relative">
              <motion.button
                onClick={() => setActiveDropdown(activeDropdown === 'mobile' ? null : 'mobile')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                  activeDropdown === 'mobile'
                    ? 'text-blue-400 bg-blue-400/10'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-base">📱</span>
                <span className="text-sm font-medium hidden md:block">More</span>
              </motion.button>

              {/* Mobile Dropdown */}
              <AnimatePresence>
                {activeDropdown === 'mobile' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                                         className="absolute top-full right-0 mt-2 w-64 bg-black/95 backdrop-blur-md border border-gray-800/50 rounded-xl shadow-2xl shadow-orange-500/10 z-50"
                  >
                    <div className="p-2">
                      {Object.entries(navigationCategories).map(([key, category]) => (
                        <div key={key} className="mb-3">
                          <div className="px-3 py-1 text-xs font-medium text-gray-400 uppercase tracking-wider">
                            {category.name}
                          </div>
                          {category.items.map((item) => {
                            const isActive = location.pathname === item.path
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setActiveDropdown(null)}
                                className="block"
                              >
                                <motion.div
                                  className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                                    isActive
                                      ? 'bg-orange-400/10 text-orange-400'
                                      : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                                  }`}
                                  whileHover={{ x: 2 }}
                                >
                                  <span className="text-sm">{item.icon}</span>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">{item.name}</div>
                                    <div className="text-xs text-gray-400">{item.description}</div>
                                  </div>
                                  {isActive && (
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                                  )}
                                </motion.div>
                              </Link>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Side - User Actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {isAuthenticated && user ? (
              <>
                {/* Quick Analytics Access */}
                <div className="hidden lg:flex items-center">
                  <Link
                    to="/analytics"
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl border ${
                      location.pathname === '/analytics'
                        ? 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30 shadow-lg shadow-cyan-400/20'
                        : 'text-gray-300 hover:text-cyan-400 hover:bg-cyan-400/5 border-gray-600/30 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-400/10'
                    }`}
                    title="AI Analytics"
                  >
                    <span className="text-base">🧠</span>
                    <span>Analytics</span>
                  </Link>
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <motion.button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2.5 px-2.5 py-1.5"
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Profile Photo - Sol taraf */}
                    <div className="relative flex-shrink-0">
                      {user.photoURL ? (
                                                <div className="relative w-8 h-8">
                          <img 
                            src={user.photoURL} 
                            alt={user.username}
                            className={`w-8 h-8 rounded-full shadow-md object-cover border-2 transition-all duration-300 ${
                              currentLevel >= 20 ? 'border-yellow-400 shadow-yellow-400/20' : // Altın
                              currentLevel >= 10 ? 'border-gray-300 shadow-gray-300/20' :   // Gümüş  
                              'border-orange-500 shadow-orange-500/20'                        // Bronz
                            }`}
                            onError={(e) => {
                              const fallback = document.createElement('div')
                                                                                            fallback.className = `w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-md border-2 ${currentLevel >= 20 ? 'border-yellow-400 shadow-yellow-400/20' : currentLevel >= 10 ? 'border-gray-300 shadow-gray-300/20' : 'border-orange-500 shadow-orange-500/20'}`
                               fallback.innerHTML = `<span class="text-white font-bold text-xs">${user.username.charAt(0).toUpperCase()}</span>`
                              e.currentTarget.parentNode?.replaceChild(fallback, e.currentTarget)
                            }}
                          />
                        </div>
                      ) : (
                                                                          <div className={`w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-md border-2 transition-all duration-300 ${
                           currentLevel >= 20 ? 'border-yellow-400 shadow-yellow-400/20' : 
                           currentLevel >= 10 ? 'border-gray-300 shadow-gray-300/20' : 
                           'border-orange-500 shadow-orange-500/20'
                         }`}>
                           <span className="text-white font-bold text-xs">
                             {user.username.charAt(0).toUpperCase()}
                           </span>
                        </div>
                      )}
                                             <motion.div 
                         className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-gray-900 flex items-center justify-center shadow-sm"
                         animate={{ scale: [1, 1.1, 1] }}
                         transition={{ duration: 2, repeat: Infinity }}
                       >
                         <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
                       </motion.div>
                    </div>

                    {/* User Info - Sağ taraf */}
                    <div className="hidden sm:block text-left min-w-[120px] space-y-0">
                      {/* Line 1: Username with Online Status */}
                      <div className="flex items-center justify-start space-x-1 mb-0">
                        <motion.div 
                          className="w-1.5 h-1.5 bg-green-400 rounded-full"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <h3 className="text-[11px] font-bold text-white truncate tracking-wide">
                          {user.username}
                        </h3>
                      </div>
                      
                      {/* Line 2: Level Badge and NameTag */}
                      <div className="flex items-center justify-between space-x-1 mb-0">
                        <span className="text-[10px] text-cyan-300 truncate font-medium">
                          ⚡ {getTitleForLevel(currentLevel)}
                        </span>
                        <motion.div 
                          className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-[10px] font-bold px-1.5 py-0 rounded-full border border-blue-400/40 shadow-sm flex-shrink-0"
                          whileHover={{ scale: 1.05 }}
                          animate={{ 
                            boxShadow: ["0 0 6px rgba(59, 130, 246, 0.2)", "0 0 12px rgba(147, 51, 234, 0.3)", "0 0 6px rgba(59, 130, 246, 0.2)"]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          LVL {currentLevel}
                        </motion.div>
                      </div>
                      
                      {/* Line 3: XP Progress Bar */}
                      <div className="flex items-center space-x-1">
                        <div className="flex-1 bg-gray-700/60 rounded-full h-1.5 overflow-hidden min-w-[75px] shadow-inner">
                          <motion.div
                            className="h-full bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-600 rounded-full shadow-sm"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(10, xpProgress)}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            style={{
                              filter: 'drop-shadow(0 0 3px rgba(251, 191, 36, 0.3))'
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-300 font-semibold flex-shrink-0 min-w-[25px]">
                          {Math.round(xpProgress)}%
                        </span>
                      </div>
                    </div>

                  </motion.button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-black/95 backdrop-blur-md rounded-xl shadow-2xl shadow-orange-500/10 border border-gray-800/50 z-[100]"
                    >
                      <div className="py-1">
                        {/* Main Actions */}
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-3 text-base">👤</span>
                          <div>
                            <div className="font-medium">Profile</div>
                            <div className="text-xs text-gray-500">View your stats & achievements</div>
                          </div>
                        </Link>
                        
                        <Link
                          to="/analytics"
                          className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-cyan-400 transition-colors lg:hidden"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-3 text-base">🧠</span>
                          <div>
                            <div className="font-medium">AI Analytics</div>
                            <div className="text-xs text-gray-500">Advanced performance insights</div>
                          </div>
                        </Link>
                        
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-3 text-base">⚙️</span>
                          <div>
                            <div className="font-medium">Settings</div>
                            <div className="text-xs text-gray-500">Game preferences & config</div>
                          </div>
                        </Link>
                        
                        <div className="border-t border-gray-700 my-2"></div>
                        
                        {/* Advanced Features */}
                        <div className="px-4 py-2">
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Training Tools</p>
                        </div>
                        <Link
                          to="/adaptive-training"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">🎯</span>
                          Adaptive Training
                        </Link>
                        <Link
                          to="/custom-training"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">🛠️</span>
                          Custom Training
                        </Link>
                        <Link
                          to="/replay"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">📹</span>
                          Replay System
                        </Link>
                        
                        <div className="border-t border-gray-700 my-2"></div>
                        
                        {/* Social & Community */}
                        <div className="px-4 py-2">
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Community</p>
                        </div>
                        <Link
                          to="/guilds"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">👥</span>
                          Training Guilds
                        </Link>
                        <Link
                          to="/social"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">🌐</span>
                          Social Hub
                        </Link>
                        <Link
                          to="/hardware"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">🖱️</span>
                          Hardware Optimizer
                        </Link>
                        
                        <div className="border-t border-gray-700 my-1"></div>
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsDropdownOpen(false)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                        >
                          <span className="mr-2">🚪</span>
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Login/Register - Compact */}
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-orange-400 transition-colors font-medium text-sm px-2 py-1"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-orange-600 hover:bg-orange-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 text-gray-400 hover:text-orange-400 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          </div>
        </div>


      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-[90]"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  )
} 