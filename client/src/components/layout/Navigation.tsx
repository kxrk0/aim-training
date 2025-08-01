import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { useState } from 'react'

const navItems = [
  { name: 'Home', path: '/', icon: '🏠' },
  { name: 'Train', path: '/game', icon: '🎯' },
  { name: 'Competition', path: '/competition', icon: '⚔️' },
  { name: 'Tournaments', path: '/tournaments', icon: '🏆' },
  { name: 'Leaderboard', path: '/leaderboard', icon: '📊' },
]

export function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-orange-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
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
          <div className="flex items-center space-x-2 flex-shrink-0">
            {isAuthenticated && user ? (
              <>
                {/* Quick Actions - Compact */}
                <div className="hidden sm:flex items-center space-x-1">
                  <Link
                    to="/party"
                    className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors text-sm"
                    title="Party"
                  >
                    🎉
                  </Link>
                  <Link
                    to="/sensitivity"
                    className="p-2 text-orange-400 hover:bg-orange-400/10 rounded-lg transition-colors text-sm"
                    title="Sensitivity"
                  >
                    🎯
                  </Link>
                  <Link
                    to="/analytics"
                    className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors text-sm"
                    title="AI Analytics"
                  >
                    🧠
                  </Link>
                  <Link
                    to="/coaching"
                    className="p-2 text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors text-sm"
                    title="AI Coaching"
                  >
                    🎓
                  </Link>
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <motion.button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 px-2 py-1 rounded-lg hover:bg-gray-800/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="hidden sm:block text-right">
                      <p className="text-xs font-medium text-white truncate max-w-20">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-400">
                        Lvl {user.level}
                      </p>
                    </div>
                    <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </motion.button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-600/50 z-[100]"
                    >
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">👤</span>
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">⚙️</span>
                          Settings
                        </Link>
                        <div className="border-t border-gray-700 my-1"></div>
                        
                        {/* Phase 8 Features */}
                        <div className="px-4 py-2">
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Advanced Features</p>
                        </div>
                        <Link
                          to="/analytics"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">🧠</span>
                          AI Analytics
                        </Link>
                        <Link
                          to="/adaptive-training"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">🎯</span>
                          Adaptive Training
                        </Link>
                        <Link
                          to="/coaching"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">🎓</span>
                          AI Coaching
                        </Link>
                        <Link
                          to="/hardware"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">🖱️</span>
                          Hardware Optimizer
                        </Link>
                        <Link
                          to="/replay"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">📹</span>
                          Replay System
                        </Link>
                        <Link
                          to="/guilds"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">👥</span>
                          Training Guilds
                        </Link>
                        <Link
                          to="/custom-training"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">🛠️</span>
                          Custom Training
                        </Link>
                        <Link
                          to="/social"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <span className="mr-2">👨‍👩‍👧‍👦</span>
                          Social Hub
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

        {/* Mobile Navigation Menu */}
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden border-t border-gray-700 py-2"
          >
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-sm ${
                    isActive
                      ? 'text-orange-400 bg-orange-400/10'
                      : 'text-gray-300 hover:text-orange-400 hover:bg-gray-800'
                  }`}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </motion.div>
        )}
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