import { motion } from 'framer-motion'
import { useState } from 'react'
import { Achievement, UserAchievement, getAchievementRarityColor, formatAchievementRequirement } from '@/stores/achievementStore'
import { FaTrophy, FaStar, FaCrown, FaLock, FaBolt, FaGem, FaFire } from 'react-icons/fa'

interface AchievementCardProps {
  achievement: Achievement
  userAchievement?: UserAchievement
  size?: 'small' | 'medium' | 'large'
  showProgress?: boolean
  onClick?: () => void
  className?: string
}

export function AchievementCard({
  achievement,
  userAchievement,
  size = 'medium',
  showProgress = true,
  onClick,
  className = ''
}: AchievementCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const isCompleted = userAchievement?.isCompleted || false
  const progress = userAchievement ? (userAchievement.currentProgress / achievement.maxProgress) * 100 : 0
  const isLocked = !userAchievement && achievement.isHidden
  
  const rarityColor = getAchievementRarityColor(achievement.difficulty)
  const requirement = formatAchievementRequirement(achievement.requirement)
  
  // Size-based styling
  const sizeClasses = {
    small: {
      container: 'p-3 min-h-[120px]',
      icon: 'text-2xl',
      title: 'text-sm font-bold',
      description: 'text-xs',
      progress: 'h-1.5'
    },
    medium: {
      container: 'p-4 min-h-[140px]',
      icon: 'text-3xl',
      title: 'text-base font-bold',
      description: 'text-sm',
      progress: 'h-2'
    },
    large: {
      container: 'p-6 min-h-[180px]',
      icon: 'text-4xl',
      title: 'text-lg font-bold',
      description: 'text-base',
      progress: 'h-3'
    }
  }
  
  const currentSize = sizeClasses[size]
  
  // Dynamic icon based on category
  const getCategoryIcon = () => {
    switch (achievement.category) {
      case 'training': return <FaTrophy />
      case 'accuracy': return <FaBolt />
      case 'streak': return <FaFire />
      case 'competition': return <FaCrown />
      case 'social': return <FaStar />
      case 'progression': return <FaGem />
      default: return <FaTrophy />
    }
  }
  
  return (
    <motion.div
      className={`
        relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 
        backdrop-blur-sm border rounded-xl cursor-pointer
        transition-all duration-300 overflow-hidden group
        ${isCompleted ? 'border-yellow-400/40 bg-gradient-to-br from-yellow-900/20 to-orange-900/20' : 
          isLocked ? 'border-gray-600/30 opacity-60' : 'border-gray-600/30 hover:border-orange-400/50'}
        ${currentSize.container} ${className}
      `}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        boxShadow: isCompleted 
          ? `0 0 20px ${rarityColor}40` 
          : isHovered 
            ? '0 10px 25px rgba(249, 115, 22, 0.15)' 
            : '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Rarity Border Glow */}
      {isCompleted && (
        <motion.div
          className="absolute inset-0 rounded-xl opacity-60"
          style={{
            background: `linear-gradient(135deg, ${rarityColor}20, transparent, ${rarityColor}20)`,
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}
      
      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <FaLock className="text-3xl text-gray-400" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <motion.div
              className={`
                flex items-center justify-center rounded-lg p-2
                ${isCompleted ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gray-700/50'}
                ${currentSize.icon}
              `}
              animate={isCompleted ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{
                duration: 2,
                repeat: isCompleted ? Infinity : 0,
                repeatDelay: 3
              }}
              style={{ color: isCompleted ? '#fff' : rarityColor }}
            >
              {getCategoryIcon()}
            </motion.div>
            
            <div className="flex-1">
              <h3 className={`${currentSize.title} text-white truncate`}>
                {achievement.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span 
                  className="text-xs font-medium px-2 py-0.5 rounded-full uppercase tracking-wide"
                  style={{ 
                    backgroundColor: `${rarityColor}20`, 
                    color: rarityColor,
                    border: `1px solid ${rarityColor}40`
                  }}
                >
                  {achievement.difficulty}
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                  {achievement.category}
                </span>
              </div>
            </div>
          </div>
          
          {/* XP Reward */}
          {achievement.xpReward > 0 && (
            <div className="flex items-center space-x-1 bg-blue-500/20 px-2 py-1 rounded-lg border border-blue-400/30">
              <FaBolt className="text-xs text-blue-400" />
              <span className="text-xs font-semibold text-blue-400">
                +{achievement.xpReward} XP
              </span>
            </div>
          )}
        </div>
        
        {/* Description */}
        <p className={`${currentSize.description} text-gray-300 mb-3 line-clamp-2`}>
          {achievement.description}
        </p>
        
        {/* Requirement */}
        <div className="mb-3">
          <p className="text-xs text-orange-400 font-medium">
            {requirement}
          </p>
        </div>
        
        {/* Progress Bar */}
        {showProgress && userAchievement && !isCompleted && (
          <div className="mt-auto">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Progress</span>
              <span className="text-xs text-gray-300 font-medium">
                {userAchievement.currentProgress} / {achievement.maxProgress}
              </span>
            </div>
            <div className={`bg-gray-700 rounded-full overflow-hidden ${currentSize.progress}`}>
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-center mt-1">
              <span className="text-xs text-gray-400">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        )}
        
        {/* Completed Badge */}
        {isCompleted && (
          <motion.div
            className="mt-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500/20 to-yellow-500/20 border border-green-400/30 rounded-lg py-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FaTrophy className="text-yellow-400" />
            <span className="text-sm font-semibold text-green-400">
              Completed!
            </span>
            {userAchievement?.completedAt && (
              <span className="text-xs text-gray-400">
                {new Date(userAchievement.completedAt).toLocaleDateString()}
              </span>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Hover Glow Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-xl opacity-0"
        animate={{ opacity: isHovered && !isLocked ? 0.3 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
} 