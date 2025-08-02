import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { useLevelStore } from '@/stores/levelStore'
import { LevelProgress } from '@/components/ui/LevelProgress'
import { useState } from 'react'

const navItems = [
  { name: 'Home', path: '/', icon: '🏠' },
  { name: 'Train', path: '/training-hub', icon: '🎯' },
  { name: 'Competition', path: '/competition', icon: '⚔️' },
  { name: 'Leaderboard', path: '/leaderboard', icon: '📊' },
  { name: 'Profile', path: '/profile', icon: '👤' },
]

export function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { currentLevel, getTitleForLevel, totalXP } = useLevelStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // Calculate XP progress to next level
  const currentLevelXP = totalXP % 1000
  const xpProgress = (currentLevelXP / 1000) * 100

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-orange-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Compact */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-xl">🎯</span>
            <span className="hidden sm:block text-lg font-bold text-orange-400">
              AIM TRAINER
            </span>
            <span className="sm:hidden text-lg font-bold text-orange-400">
              AIM
            </span>
          </Link>

          {/* Navigation Links - Responsive */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative group"
                >
                  <motion.div
                    className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-colors text-sm ${
                      isActive
                        ? 'text-orange-400 bg-orange-400/10'
                        : 'text-gray-300 hover:text-orange-400 hover:bg-orange-400/5'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span className="font-medium hidden lg:block">{item.name}</span>
                  </motion.div>
                  
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400"
                      layoutId="activeTab"
                      initial={false}
                    />
                  )}
                </Link>
              )
            })}
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
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-gray-800/50 transition-all duration-300 border border-gray-600/30 hover:border-gray-500/50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Profile Photo - Sol taraf */}
                    <div className="relative flex-shrink-0">
                      {user.photoURL ? (
                        <div className="relative w-10 h-10">
                          <img 
                            src={user.photoURL} 
                            alt={user.username}
                            className={`w-10 h-10 rounded-full shadow-lg object-cover border-2 ${
                              currentLevel >= 20 ? 'border-yellow-400' : // Altın
                              currentLevel >= 10 ? 'border-gray-300' :   // Gümüş  
                              'border-orange-500'                        // Bronz
                            }`}
                            onError={(e) => {
                              const fallback = document.createElement('div')
                              fallback.className = `w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg border-2 ${currentLevel >= 20 ? 'border-yellow-400' : currentLevel >= 10 ? 'border-gray-300' : 'border-orange-500'}`
                              fallback.innerHTML = `<span class="text-white font-bold text-sm">${user.username.charAt(0).toUpperCase()}</span>`
                              e.currentTarget.parentNode?.replaceChild(fallback, e.currentTarget)
                            }}
                          />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg border-2 ${
                          currentLevel >= 20 ? 'border-yellow-400' : 
                          currentLevel >= 10 ? 'border-gray-300' : 
                          'border-orange-500'
                        }`}>
                          <span className="text-white font-bold text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* User Info - Sağ taraf */}
                    <div className="hidden sm:block text-left min-w-[140px]">
                      {/* Line 1: Username with Online Status */}
                      <div className="flex items-center justify-start space-x-1.5 mb-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <h3 className="text-xs font-bold text-white truncate">
                          {user.username}
                        </h3>
                      </div>
                      
                      {/* Line 2: Level Badge and NameTag */}
                      <div className="flex items-center justify-between space-x-1 mb-0">
                        <span className="text-xs text-cyan-400 truncate">
                          ⚡ {getTitleForLevel(currentLevel)}
                        </span>
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-1.5 py-0 rounded-full border border-blue-400/30 shadow-lg flex-shrink-0">
                          LVL {currentLevel}
                        </div>
                      </div>
                      
                      {/* Line 3: XP Progress Bar - Bigger */}
                      <div className="flex items-center space-x-1">
                        <div className="flex-1 bg-gray-700 rounded-full h-1.5 overflow-hidden min-w-[90px]">
                          <motion.div
                            className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(10, xpProgress)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 font-medium flex-shrink-0">
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
                      className="absolute right-0 top-full mt-2 w-72 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-600/50 z-[100]"
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