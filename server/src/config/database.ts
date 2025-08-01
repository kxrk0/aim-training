import { PrismaClient } from '@prisma/client'
import { createClient } from 'redis'
import { logger } from '../utils/logger'

// Database configuration
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Redis configuration
export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD
})

// Configuration object
export const config = {
  database: {
    url: process.env.DATABASE_URL || 'postgresql://aimtrainer_user:aimtrainer_password@localhost:5432/aimtrainer'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || 'aimtrainer_redis_password'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  server: {
    port: process.env.PORT || 3001,
    clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
  }
}

// Initialize database connections
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Test Prisma connection
    await prisma.$connect()
    logger.info('✅ SQLite connected successfully')

    // Redis connection (optional for development)
    if (process.env.REDIS_URL) {
      redisClient.on('error', (err) => {
        logger.error('❌ Redis Client Error:', err)
      })

      redisClient.on('connect', () => {
        logger.info('✅ Redis connected successfully')
      })

      try {
        await redisClient.connect()
      } catch (redisError) {
        logger.warn('⚠️ Redis connection failed, continuing without Redis:', redisError)
      }
    } else {
      logger.info('ℹ️ Redis not configured, skipping Redis connection')
    }
  } catch (error) {
    logger.error('❌ Database initialization failed:', error)
    throw error
  }
}

// Close database connections
export const closeDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect()
    
    // Only try to disconnect Redis if it was connected
    if (process.env.REDIS_URL && redisClient.isOpen) {
      await redisClient.quit()
    }
    
    logger.info('✅ Database connections closed')
  } catch (error) {
    logger.error('❌ Error closing database connections:', error)
    throw error
  }
}

// Handle process termination
process.on('beforeExit', closeDatabase)
process.on('SIGTERM', closeDatabase)
process.on('SIGINT', closeDatabase) 