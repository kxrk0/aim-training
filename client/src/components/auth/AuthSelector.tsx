import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export const AuthSelector: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect immediately to the unified login page
    navigate('/login', { replace: true })
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-300">Redirecting to unified login page...</p>
      </motion.div>
    </div>
  )
} 