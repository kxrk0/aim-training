import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaGoogle, FaEye, FaEyeSlash, FaGooglePlay, FaRocket, FaBullseye } from 'react-icons/fa'

export const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  
  const { 
    loginWithFirebaseEmail, 
    loginWithFirebaseGoogle, 
    isAuthenticated,
    isLoading, 
    error 
  } = useAuthStore()

  // Navigate to home page if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await loginWithFirebaseEmail(formData.email, formData.password)
      // Navigation handled by useEffect when isAuthenticated changes
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithFirebaseGoogle()
      // Navigation handled by useEffect when isAuthenticated changes
    } catch (err) {
      console.error('Google login error:', err)
    }
  }



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900/20 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
        
        {/* Floating Targets */}
        <motion.div
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 text-orange-500/20 text-4xl"
        >
          <FaBullseye />
        </motion.div>
        <motion.div
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 80, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-16 text-orange-400/20 text-6xl"
        >
          <FaBullseye />
        </motion.div>
        <motion.div
          animate={{ 
            x: [0, 120, 0], 
            y: [0, -100, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 right-10 text-orange-600/15 text-3xl"
        >
          <FaRocket />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-2xl border border-orange-500/20 rounded-3xl p-8 w-full max-w-md relative z-10 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4 shadow-lg"
          >
            <FaBullseye className="text-white text-2xl" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent mb-2 tracking-tight"
          >
            AIM TRAINER
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 text-sm"
          >
            Welcome back, elite gamer
          </motion.p>
        </div>

        {/* Quick Google Login First */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-lg group"
          >
            <FaGoogle className="mr-3 text-lg group-hover:scale-110 transition-transform" />
            Continue with Google
          </motion.button>
        </motion.div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-r from-gray-900 to-black text-gray-400">Or sign in with email</span>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm backdrop-blur-sm"
          >
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              {error}
            </div>
          </motion.div>
        )}

        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <motion.input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              whileFocus={{ scale: 1.02 }}
              className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200 ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-600'
              }`}
              placeholder="your@email.com"
              disabled={isLoading}
            />
            {errors.email && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-400"
              >
                {errors.email}
              </motion.p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <motion.input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                whileFocus={{ scale: 1.02 }}
                className={`w-full px-4 py-3 pr-12 bg-gray-800/50 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-200 ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </motion.button>
            </div>
            {errors.password && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-400"
              >
                {errors.password}
              </motion.p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 font-semibold rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                ></motion.div>
                Signing you in...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <FaRocket className="mr-2" />
                Launch Training
              </div>
            )}
          </motion.button>
        </motion.form>

        {/* Sign Up Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-400">
            New to the arena?{' '}
            <motion.a
              href="/register"
              whileHover={{ scale: 1.05 }}
              className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              Create account
            </motion.a>
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 text-center"
        >
          <p className="text-xs text-gray-500">
            Secure authentication powered by Firebase
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
} 