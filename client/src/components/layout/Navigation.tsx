import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  { name: 'Home', path: '/', icon: '🏠' },
  { name: 'Train', path: '/game', icon: '🎯' },
  { name: 'Competition', path: '/competition', icon: '⚔️' },
  { name: 'Tournaments', path: '/tournaments', icon: '🏆' },
  { name: 'Leaderboard', path: '/leaderboard', icon: '📊' },
  { name: 'Profile', path: '/profile', icon: '👤' },
]

export function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-gaming-dark border-b border-gaming-accent/20">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-bold text-gaming-primary">
              AIM TRAINER PRO
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative group"
                >
                  <motion.div
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'text-gaming-primary bg-gaming-primary/10'
                        : 'text-gray-300 hover:text-gaming-primary hover:bg-gaming-primary/5'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </motion.div>
                  
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gaming-primary"
                      layoutId="activeTab"
                      initial={false}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {user.username}
                    </p>
                    <p className="text-xs text-gray-400">
                      Level {user.level}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gaming-primary rounded-full flex items-center justify-center">
                    <span className="text-gaming-dark font-bold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Party Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/party"
                    className="gaming-button text-sm px-4 py-2"
                  >
                    🎉 Party
                  </Link>
                </motion.div>

                {/* Settings Link */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/settings"
                    className="text-gray-400 hover:text-gaming-primary transition-colors"
                  >
                    ⚙️
                  </Link>
                </motion.div>

                {/* Logout Button */}
                <motion.button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🚪
                </motion.button>
              </>
            ) : (
              <>
                {/* Login/Register Buttons */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="text-gray-300 hover:text-gaming-primary transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="gaming-button text-sm px-4 py-2"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 