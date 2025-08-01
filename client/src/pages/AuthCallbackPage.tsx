import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { motion } from 'framer-motion'

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setToken, getProfile } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      const provider = searchParams.get('provider')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
        setTimeout(() => navigate('/login'), 3000)
        return
      }

      if (token) {
        try {
          // Set token in auth store
          setToken(token)
          
          // Get user profile
          await getProfile()
          
          setStatus('success')
          setMessage(`Successfully signed in with ${provider}!`)
          
          // Redirect to home page
          setTimeout(() => navigate('/'), 2000)
        } catch (err) {
          setStatus('error')
          setMessage('Failed to complete authentication. Please try again.')
          setTimeout(() => navigate('/login'), 3000)
        }
      } else {
        setStatus('error')
        setMessage('No authentication token received.')
        setTimeout(() => navigate('/login'), 3000)
      }
    }

    handleCallback()
  }, [searchParams, navigate, setToken, getProfile])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 w-full max-w-md text-center"
      >
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">Processing Authentication</h2>
            <p className="text-gray-300">Please wait while we complete your sign-in...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-400 text-6xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-white mb-2">Success!</h2>
            <p className="text-gray-300">{message}</p>
            <p className="text-sm text-gray-400 mt-2">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-400 text-6xl mb-4">✗</div>
            <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
            <p className="text-gray-300">{message}</p>
            <p className="text-sm text-gray-400 mt-2">Redirecting to login...</p>
          </>
        )}
      </motion.div>
    </div>
  )
} 