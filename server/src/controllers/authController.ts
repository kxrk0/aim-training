import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'
import { ApiError } from '../middleware/errorHandler'

// Extend Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        username: string
        level: number
      }
    }
  }
}

// Local types for authentication
interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  username: string
  password: string
}

const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10)

// Generate JWT token
const generateToken = (userId: string): string => {
  // Use simple JWT sign without options to avoid TypeScript issues
  return jwt.sign({ userId, iat: Math.floor(Date.now() / 1000) }, JWT_SECRET)
}

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password }: RegisterRequest = req.body

    // Validation
    if (!email || !username || !password) {
      throw new ApiError(400, 'Email, username, and password are required')
    }

    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters long')
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw new ApiError(409, 'Email already registered')
      } else {
        throw new ApiError(409, 'Username already taken')
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        level: 1,
        totalScore: 0,
        totalShots: 0,
        totalHits: 0,
        hoursPlayed: 0
      },
      select: {
        id: true,
        email: true,
        username: true,
        level: true,
        totalScore: true,
        totalShots: true,
        totalHits: true,
        hoursPlayed: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Generate token
    const token = generateToken(user.id)

    logger.info(`User registered: ${username} (${email})`)

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        },
        token
      }
    })
  } catch (error) {
    logger.error('Registration error:', error)
    throw error
  }
}

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body

    // Validation
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required')
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      throw new ApiError(401, 'Invalid email or password')
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password')
    }

    // Generate token
    const token = generateToken(user.id)

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    })

    logger.info(`User logged in: ${user.username} (${user.email})`)

    res.json({
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          level: user.level,
          totalScore: user.totalScore,
          totalShots: user.totalShots,
          totalHits: user.totalHits,
          hoursPlayed: user.hoursPlayed,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString()
        },
        token
      }
    })
  } catch (error) {
    logger.error('Login error:', error)
    throw error
  }
}

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      throw new ApiError(401, 'Authentication required')
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        level: true,
        totalScore: true,
        totalShots: true,
        totalHits: true,
        hoursPlayed: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    // Calculate additional stats
    const accuracy = user.totalShots > 0 ? (user.totalHits / user.totalShots) * 100 : 0

    // Get best scores for each game mode (mock data for now)
    const bestScores = {
      precision: 0,
      speed: 0,
      tracking: 0,
      flick: 0
    }

    // Get recent game sessions count (mock data for now)
    const gamesPlayed = 0

    res.json({
      message: 'Profile retrieved successfully',
      data: {
        ...user,
        accuracy,
        averageReactionTime: 250, // TODO: Calculate from actual data
        gamesPlayed,
        bestScores,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }
    })
  } catch (error) {
    logger.error('Get profile error:', error)
    throw error
  }
}

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    const { username } = req.body

    if (!userId) {
      throw new ApiError(401, 'Authentication required')
    }

    // Check if username is taken by another user
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: userId }
        }
      })

      if (existingUser) {
        throw new ApiError(409, 'Username already taken')
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        username: true,
        level: true,
        totalScore: true,
        totalShots: true,
        totalHits: true,
        hoursPlayed: true,
        createdAt: true,
        updatedAt: true
      }
    })

    logger.info(`Profile updated: ${updatedUser.username}`)

    res.json({
      message: 'Profile updated successfully',
      data: {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString()
      }
    })
  } catch (error) {
    logger.error('Update profile error:', error)
    throw error
  }
}

// Verify token middleware
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw new ApiError(401, 'Access token required')
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        level: true
      }
    })

    if (!user) {
      throw new ApiError(401, 'Invalid token')
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, 'Invalid token')
    }
    throw error
  }
} 