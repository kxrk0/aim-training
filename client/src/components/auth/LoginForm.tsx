import React, { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { motion } from 'framer-motion'
import { FaGoogle, FaSteam, FaEye, FaEyeSlash, FaFirefoxBrowser, FaServer } from 'react-icons/fa'

export const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [authMethod, setAuthMethod] = useState<'firebase' | 'backend'>('firebase')
  
  const { 
    login, 
    loginWithFirebaseEmail, 
    loginWithFirebaseGoogle, 
    isLoading, 
    error 
  } = useAuthStore()

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
      if (authMethod === 'firebase') {
        await loginWithFirebaseEmail(formData.email, formData.password)
      } else {
        await login({ email: formData.email, password: formData.password })
      }
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      if (authMethod === 'firebase') {
        await loginWithFirebaseGoogle()
      } else {
        const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api'
        window.location.href = `${apiUrl}/auth/google`
      }
    } catch (err) {
      console.error('Google login error:', err)
    }
  }

  const handleSteamLogin = () => {
    if (authMethod === 'backend') {
      const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api'
      window.location.href = `${apiUrl}/auth/steam`
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            AIM TRAINER PRO
          </h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {/* Authentication Method Selector */}
        <div className="mb-6">
          <div className="flex rounded-lg bg-slate-800/50 p-1">
            <button
              type="button"
              onClick={() => setAuthMethod('firebase')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                authMethod === 'firebase'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FaFirefoxBrowser className="mr-2" size={16} />
              Firebase
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('backend')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center ${
                authMethod === 'backend'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FaServer className="mr-2" size={16} />
              Backend
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            {authMethod === 'firebase' 
              ? 'Firebase Authentication with real-time sync' 
              : 'Traditional backend authentication with session management'
            }
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-slate-400 ${
                errors.email ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-12 bg-slate-700/50 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-slate-400 ${
                  errors.password ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                disabled={isLoading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-6 font-semibold rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
              authMethod === 'firebase'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 focus:ring-orange-500'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 focus:ring-blue-500'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              `Sign In with ${authMethod === 'firebase' ? 'Firebase' : 'Backend'}`
            )}
          </motion.button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-slate-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-6 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              <FaGoogle className="mr-2" />
              Continue with Google
            </motion.button>

            {authMethod === 'backend' && (
              <motion.button
                type="button"
                onClick={handleSteamLogin}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-6 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                <FaSteam className="mr-2" />
                Continue with Steam
              </motion.button>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <a
              href="/register"
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Sign up
            </a>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            {authMethod === 'firebase' 
              ? 'Powered by Firebase Authentication' 
              : 'Traditional server-side authentication'
            }
          </p>
        </div>
      </motion.div>
    </div>
  )
} 