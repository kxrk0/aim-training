import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'

export function HomePage() {
  const { isAuthenticated } = useAuthStore()

  const features = [
    {
      icon: '🎯',
      title: 'FPS Training',
      description: 'Professional aim training with 3D environments and realistic physics',
      link: '/game',
      color: 'text-gaming-primary'
    },
    {
      icon: '⚔️',
      title: '1v1 Competition',
      description: 'Challenge other players in head-to-head competitive matches',
      link: '/competition',
      color: 'text-red-400'
    },
    {
      icon: '🏆',
      title: 'Tournaments',
      description: 'Join organized tournaments and compete for prizes and glory',
      link: '/tournaments',
      color: 'text-yellow-400'
    },
    {
      icon: '🎉',
      title: 'Party System',
      description: 'Train with friends in synchronized multiplayer sessions',
      link: '/party',
      color: 'text-purple-400'
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'Track your progress with detailed performance statistics',
      link: '/profile',
      color: 'text-blue-400'
    },
    {
      icon: '🏅',
      title: 'Leaderboards',
      description: 'Climb the ranks and see how you stack up against the best',
      link: '/leaderboard',
      color: 'text-green-400'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark to-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto max-w-4xl"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="text-gaming-primary">AIM</span>
            <span className="text-white"> TRAINER</span>
            <span className="text-gaming-accent"> PRO</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The ultimate web-based FPS aim trainer. Improve your accuracy, speed, and reflexes 
            with professional training tools and competitive multiplayer modes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/game"
                    className="gaming-button px-8 py-4 text-lg font-bold"
                  >
                    🎯 Start Training
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/competition"
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
                  >
                    ⚔️ Find Match
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="gaming-button px-8 py-4 text-lg font-bold"
                  >
                    🚀 Get Started
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="border border-gaming-primary text-gaming-primary hover:bg-gaming-primary hover:text-gaming-dark px-8 py-4 rounded-lg font-bold text-lg transition-colors"
                  >
                    Sign In
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 text-4xl opacity-20"
          >
            🎯
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-32 right-20 text-3xl opacity-20"
          >
            ⚔️
          </motion.div>
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-20 left-20 text-3xl opacity-20"
          >
            🏆
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gaming-primary mb-4">
              Professional Features
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to become a better FPS player
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group"
              >
                <Link to={feature.link}>
                  <div className="hud-element p-6 h-full hover:border-gaming-primary/50 transition-all duration-300">
                    <div className={`text-4xl mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gaming-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gray-800/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-gaming-primary mb-12">
              Join the Elite
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-gaming-primary mb-2">10K+</div>
                <div className="text-gray-400">Active Players</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gaming-primary mb-2">1M+</div>
                <div className="text-gray-400">Training Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gaming-primary mb-2">500+</div>
                <div className="text-gray-400">Tournaments Hosted</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Dominate?
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of players improving their aim every day.
            </p>
            
            {!isAuthenticated && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="gaming-button px-8 py-4 text-lg font-bold"
                >
                  Start Your Journey 🚀
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
} 