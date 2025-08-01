import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaGraduationCap, FaRoute, FaChartBar, FaTrophy, FaPlay, FaCheckCircle, FaLock, FaStar, FaBullseye } from 'react-icons/fa'

interface TrainingPlan {
  id: string
  name: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  duration: number // weeks
  lessons: Lesson[]
  userLevel: number
  isRecommended: boolean
}

interface Lesson {
  id: string
  title: string
  description: string
  duration: number // minutes
  exercises: Exercise[]
  isCompleted: boolean
  isUnlocked: boolean
  prerequisites?: string[]
}

interface Exercise {
  id: string
  name: string
  type: 'aim_training' | 'technique' | 'theory'
  description: string
  targetMetrics: { [key: string]: number }
  isCompleted: boolean
}

interface CoachingTip {
  id: string
  category: 'technique' | 'mindset' | 'setup' | 'practice'
  title: string
  content: string
  priority: 'high' | 'medium' | 'low'
  isPersonalized: boolean
}

export const CoachingSystem: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [tips, setTips] = useState<CoachingTip[]>([])
  const [userProgress, setUserProgress] = useState({
    currentPlan: null as string | null,
    completedLessons: [] as string[],
    skillLevel: 65,
    weeklyGoal: 10,
    completedThisWeek: 7
  })

  const mockPlans: TrainingPlan[] = [
    {
      id: 'beginner-fundamentals',
      name: 'Aim Fundamentals',
      description: 'Master the basics of crosshair placement, mouse sensitivity, and fundamental aiming techniques',
      difficulty: 'Beginner',
      duration: 4,
      userLevel: 1,
      isRecommended: true,
      lessons: [
        {
          id: 'lesson-1',
          title: 'Crosshair Placement Basics',
          description: 'Learn proper crosshair positioning and pre-aiming techniques',
          duration: 15,
          isCompleted: true,
          isUnlocked: true,
          exercises: [
            {
              id: 'ex-1',
              name: 'Static Crosshair Drill',
              type: 'aim_training',
              description: 'Practice keeping crosshair at head level',
              targetMetrics: { accuracy: 70, consistency: 60 },
              isCompleted: true
            }
          ]
        },
        {
          id: 'lesson-2',
          title: 'Sensitivity Optimization',
          description: 'Find your optimal mouse sensitivity and DPI settings',
          duration: 20,
          isCompleted: false,
          isUnlocked: true,
          exercises: [
            {
              id: 'ex-2',
              name: 'Sensitivity Test Battery',
              type: 'aim_training',
              description: 'Complete sensitivity finder tests',
              targetMetrics: { accuracy: 75, reaction_time: 300 },
              isCompleted: false
            }
          ]
        },
        {
          id: 'lesson-3',
          title: 'Flick Shot Mastery',
          description: 'Develop consistent flick shooting technique',
          duration: 25,
          isCompleted: false,
          isUnlocked: false,
          prerequisites: ['lesson-2'],
          exercises: [
            {
              id: 'ex-3',
              name: 'Flick Precision Drill',
              type: 'aim_training',
              description: 'Practice consistent flick shots',
              targetMetrics: { accuracy: 80, speed: 250 },
              isCompleted: false
            }
          ]
        }
      ]
    },
    {
      id: 'intermediate-precision',
      name: 'Precision Mastery',
      description: 'Advanced precision techniques and micro-adjustment training',
      difficulty: 'Intermediate',
      duration: 6,
      userLevel: 3,
      isRecommended: false,
      lessons: []
    },
    {
      id: 'expert-competitive',
      name: 'Competitive Edge',
      description: 'Elite-level training for competitive play',
      difficulty: 'Expert',
      duration: 8,
      userLevel: 5,
      isRecommended: false,
      lessons: []
    }
  ]

  const mockTips: CoachingTip[] = [
    {
      id: 'tip-1',
      category: 'technique',
      title: 'Improve Your Arm Movement',
      content: 'Use your entire arm for large movements and wrist for fine adjustments. This hybrid approach gives you both speed and precision.',
      priority: 'high',
      isPersonalized: true
    },
    {
      id: 'tip-2',
      category: 'mindset',
      title: 'Focus on Improvement, Not Perfection',
      content: 'Track your progress over time rather than obsessing over individual scores. Consistency beats peak performance.',
      priority: 'medium',
      isPersonalized: false
    },
    {
      id: 'tip-3',
      category: 'setup',
      title: 'Monitor Position Matters',
      content: 'Position your monitor at eye level and arm\'s length away. Your eyes should be level with the top third of the screen.',
      priority: 'medium',
      isPersonalized: false
    }
  ]

  useEffect(() => {
    setTips(mockTips)
    if (mockPlans.length > 0) {
      const recommendedPlan = mockPlans.find(plan => plan.isRecommended) || mockPlans[0]
      setSelectedPlan(recommendedPlan)
    }
  }, [])

  const getDifficultyColor = (difficulty: TrainingPlan['difficulty']) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/10 border-green-400/30'
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'Advanced': return 'text-orange-400 bg-orange-400/10 border-orange-400/30'
      case 'Expert': return 'text-red-400 bg-red-400/10 border-red-400/30'
    }
  }

  const getCategoryIcon = (category: CoachingTip['category']) => {
    switch (category) {
      case 'technique': return <FaBullseye className="text-blue-400" />
      case 'mindset': return <FaBullseye className="text-purple-400" />
      case 'setup': return <FaRoute className="text-green-400" />
      case 'practice': return <FaTrophy className="text-yellow-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-4">
            AI Coaching System
          </h1>
          <p className="text-gray-400 text-lg">Personalized training plans and expert guidance for aim improvement</p>
        </motion.div>

        {/* Progress Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <FaChartBar className="text-2xl text-green-500" />
              <span className="text-sm text-gray-400">Overall</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Skill Level</h3>
            <p className="text-3xl font-bold text-green-400">{userProgress.skillLevel}</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${userProgress.skillLevel}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <FaTrophy className="text-2xl text-yellow-500" />
              <span className="text-sm text-gray-400">This Week</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Lessons</h3>
            <p className="text-3xl font-bold text-yellow-400">{userProgress.completedThisWeek}/{userProgress.weeklyGoal}</p>
            <p className="text-sm text-gray-400 mt-2">Weekly goal</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <FaGraduationCap className="text-2xl text-blue-500" />
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Completed</h3>
            <p className="text-3xl font-bold text-blue-400">{userProgress.completedLessons.length}</p>
            <p className="text-sm text-gray-400 mt-2">Lessons finished</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <FaStar className="text-2xl text-purple-500" />
              <span className="text-sm text-gray-400">Next</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Level Up</h3>
            <p className="text-3xl font-bold text-purple-400">35%</p>
            <p className="text-sm text-gray-400 mt-2">Progress to next</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Training Plans */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4">Training Plans</h3>
            
            <div className="space-y-4 mb-6">
              {mockPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPlan?.id === plan.id 
                      ? 'border-green-500/50 bg-green-500/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-white mb-1">{plan.name}</h4>
                      <p className="text-sm text-gray-300">{plan.description}</p>
                    </div>
                    {plan.isRecommended && (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(plan.difficulty)}`}>
                        {plan.difficulty}
                      </span>
                      <span className="text-sm text-gray-400">{plan.duration} weeks</span>
                      <span className="text-sm text-gray-400">{plan.lessons.length} lessons</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: plan.userLevel }).map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-xs" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Selected Plan Details */}
            {selectedPlan && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-700/50 rounded-lg p-4"
              >
                <h4 className="font-semibold text-white mb-3">
                  {selectedPlan.name} - Lessons
                </h4>
                <div className="space-y-3">
                  {selectedPlan.lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        lesson.isCompleted 
                          ? 'bg-green-500/10 border border-green-500/30' 
                          : lesson.isUnlocked 
                            ? 'bg-blue-500/10 border border-blue-500/30' 
                            : 'bg-gray-600/30 border border-gray-600'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {lesson.isCompleted ? (
                            <FaCheckCircle className="text-green-400" />
                          ) : lesson.isUnlocked ? (
                            <FaPlay className="text-blue-400" />
                          ) : (
                            <FaLock className="text-gray-500" />
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium text-white">{lesson.title}</h5>
                          <p className="text-sm text-gray-400">{lesson.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-400">{lesson.duration} min</span>
                        {lesson.isUnlocked && !lesson.isCompleted && (
                          <button 
                            onClick={() => setCurrentLesson(lesson)}
                            className="block mt-1 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded transition-colors"
                          >
                            Start
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Coaching Tips */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <FaGraduationCap className="mr-3 text-green-500" />
              Coaching Tips
            </h3>
            
            <div className="space-y-4">
              {tips.map((tip) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                >
                  <div className="flex items-start space-x-3 mb-2">
                    {getCategoryIcon(tip.category)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-white text-sm">{tip.title}</h5>
                        {tip.isPersonalized && (
                          <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                            Personal
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300">{tip.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Daily Challenge */}
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg">
              <h4 className="font-semibold text-orange-400 mb-2 flex items-center">
                <FaTrophy className="mr-2" />
                Daily Challenge
              </h4>
              <p className="text-gray-300 text-sm mb-3">
                Complete 20 consecutive flick shots with 80%+ accuracy
              </p>
              <button className="w-full bg-orange-600 hover:bg-orange-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors">
                Accept Challenge
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}