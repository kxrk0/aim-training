import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'


export function HomePage() {
  const { isAuthenticated } = useAuthStore()
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  
  console.log('🏠 HomePage rendering with auth:', isAuthenticated)

  const features = [
    {
      icon: '🎯',
      title: 'FPS Training',
      description: 'Professional 3D aim training with realistic physics and advanced analytics',
      link: '/training-hub',
      color: 'from-orange-500 to-red-500',
      bgGlow: 'group-hover:shadow-orange-500/20'
    },
    {
      icon: '⚔️',
      title: '1v1 Competition',
      description: 'Challenge elite players in ranked competitive matches',
      link: '/competition',
      color: 'from-red-500 to-pink-500',
      bgGlow: 'group-hover:shadow-red-500/20'
    },

    {
      icon: '🧠',
      title: 'AI Analytics',
      description: 'Advanced AI-powered performance analysis and recommendations',
      link: '/analytics',
      color: 'from-cyan-500 to-blue-500',
      bgGlow: 'group-hover:shadow-cyan-500/20'
    },

    {
      icon: '🖱️',
      title: 'Hardware Optimizer',
      description: 'Optimize your gaming setup for peak performance',
      link: '/hardware',
      color: 'from-indigo-500 to-purple-500',
      bgGlow: 'group-hover:shadow-indigo-500/20'
    },
    {
      icon: '📹',
      title: 'Session Replay',
      description: 'Record and analyze your training sessions for improvement',
      link: '/replay',
      color: 'from-pink-500 to-red-500',
      bgGlow: 'group-hover:shadow-pink-500/20'
    }
  ]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
      
      {/* Particle System */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-orange-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>



      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center min-h-screen flex items-center">
        <motion.div
          style={{ y: y1 }}
          className="container mx-auto max-w-6xl"
        >
          {/* Animated Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <motion.h1 
              className="text-7xl md:text-9xl font-black mb-6 leading-none"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #ef4444, #8b5cf6, #06b6d4)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              AIM TRAINER
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-2xl md:text-3xl font-bold text-white mb-2"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                ELITE EDITION
              </span>
            </motion.div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            The most advanced web-based FPS aim trainer featuring{' '}
            <span className="text-orange-400 font-semibold">AI-powered analytics</span>,{' '}
            <span className="text-blue-400 font-semibold">3D training environments</span>, and{' '}
            <span className="text-purple-400 font-semibold">competitive multiplayer</span>.
            <br />
            <span className="text-gray-400 text-lg">Join 10,000+ elite gamers improving their aim daily.</span>
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          >
            {isAuthenticated ? (
              <>
                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }} 
                  whileTap={{ scale: 0.95 }}
                  className="group"
                >
                  <Link
                    to="/train"
                    className="relative inline-block px-10 py-4 text-xl font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl shadow-2xl transition-all duration-300 group-hover:shadow-orange-500/40"
                  >
                    <span className="relative z-10 flex items-center space-x-3">
                      <span>🎯</span>
                      <span>Start Training</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }} 
                  whileTap={{ scale: 0.95 }}
                  className="group"
                >
                  <Link
                    to="/analytics"
                    className="relative inline-block px-10 py-4 text-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl transition-all duration-300 group-hover:shadow-blue-500/40"
                  >
                    <span className="relative z-10 flex items-center space-x-3">
                      <span>🧠</span>
                      <span>AI Analytics</span>
                    </span>
                  </Link>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }} 
                  whileTap={{ scale: 0.95 }}
                  className="group"
                >
                  <Link
                    to="/register"
                    className="relative inline-block px-10 py-4 text-xl font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl shadow-2xl transition-all duration-300 group-hover:shadow-orange-500/40"
                  >
                    <span className="relative z-10 flex items-center space-x-3">
                      <span>🚀</span>
                      <span>Join Elite</span>
                    </span>
                  </Link>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05, y: -5 }} 
                  whileTap={{ scale: 0.95 }}
                  className="group"
                >
                  <Link
                    to="/login"
                    className="relative inline-block px-10 py-4 text-xl font-bold text-orange-400 bg-transparent border-2 border-orange-400 rounded-2xl shadow-2xl transition-all duration-300 group-hover:bg-orange-400 group-hover:text-black group-hover:shadow-orange-500/40"
                  >
                    <span className="relative z-10 flex items-center space-x-3">
                      <span>⚡</span>
                      <span>Sign In</span>
                    </span>
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              { label: 'Active Players', value: '10,000+', icon: '👥' },
              { label: 'Training Sessions', value: '1M+', icon: '🎯' },
              { label: 'Tournaments Hosted', value: '500+', icon: '🏆' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1 }}
                className="text-center group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-orange-400 mb-1">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating 3D Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ 
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 text-6xl opacity-10"
          >
            🎯
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, 40, 0],
              rotate: [360, 180, 0],
              scale: [1, 0.9, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-32 right-20 text-5xl opacity-10"
          >
            ⚔️
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, -25, 0],
              rotate: [0, -180, -360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-20 left-20 text-5xl opacity-10"
          >
            🏆
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <motion.section 
        style={{ y: y2 }}
        className="py-20 px-6 relative"
      >
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-black mb-6"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Elite Features
            </motion.h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Advanced tools and AI-powered systems designed for competitive FPS players
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  rotateY: 5,
                }}
                className="group perspective-1000"
              >
                <Link to={feature.link}>
                  <div className={`
                    relative p-6 h-full bg-gradient-to-br from-gray-900/90 to-black/90 
                    backdrop-blur-sm rounded-2xl border border-gray-700/50 
                    transition-all duration-500 group-hover:border-transparent
                    shadow-xl ${feature.bgGlow} group-hover:shadow-2xl
                    transform-gpu group-hover:bg-gradient-to-br group-hover:${feature.color}/10
                  `}>
                    {/* Glowing border effect */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur`}></div>
                    
                    {/* Icon with 3D effect */}
                    <motion.div 
                      className="text-5xl mb-4 group-hover:scale-110 transition-all duration-500"
                      whileHover={{ rotateY: 180 }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {feature.icon}
                    </motion.div>
                    
                    {/* Title with gradient */}
                    <h3 className={`text-xl font-bold text-white mb-3 group-hover:bg-gradient-to-r group-hover:${feature.color} group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500`}>
                      {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-500 text-sm leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Hover arrow */}
                    <motion.div
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                    >
                      <span className="text-orange-400 text-xl">→</span>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Technology Showcase */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Powered by Advanced Technology
            </h2>
            <p className="text-xl text-gray-400">
              Built with cutting-edge web technologies for maximum performance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🧠',
                title: 'AI Analytics',
                description: 'Machine learning algorithms analyze your aim patterns and provide personalized recommendations',
                tech: 'TensorFlow.js • Neural Networks'
              },
              {
                icon: '🎮',
                title: '3D Engine',
                description: 'Advanced WebGL rendering with 144+ FPS performance and realistic physics simulation',
                tech: 'Three.js • WebGL • 60+ FPS'
              },
              {
                icon: '⚡',
                title: 'Real-time Multiplayer',
                description: 'Low-latency multiplayer system supporting synchronized training and competitions',
                tech: 'Socket.io • WebRTC • Redis'
              }
            ].map((tech, index) => (
              <motion.div
                key={tech.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 group-hover:border-orange-500/50 transition-all duration-500 h-full">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">
                    {tech.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-orange-400 transition-colors">
                    {tech.title}
                  </h3>
                  <p className="text-gray-400 mb-4 leading-relaxed">
                    {tech.description}
                  </p>
                  <div className="text-sm text-orange-400 font-mono bg-orange-400/10 px-3 py-2 rounded-lg">
                    {tech.tech}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5"></div>
        <div className="container mx-auto max-w-4xl text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-sm rounded-3xl p-12 border border-orange-500/20"
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-black mb-6"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Ready to Dominate?
            </motion.h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed">
              Join the elite gaming community and transform your aim with AI-powered training.
              <br />
              <span className="text-orange-400">Start your journey to FPS mastery today.</span>
            </p>
            
            {!isAuthenticated && (
              <motion.div 
                whileHover={{ scale: 1.05, y: -5 }} 
                whileTap={{ scale: 0.95 }}
                className="group"
              >
                <Link
                  to="/register"
                  className="relative inline-block px-12 py-5 text-2xl font-bold text-white bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl shadow-2xl transition-all duration-300 group-hover:shadow-orange-500/50"
                >
                  <span className="relative z-10 flex items-center space-x-4">
                    <span>🚀</span>
                    <span>Begin Elite Training</span>
                    <span>→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
} 