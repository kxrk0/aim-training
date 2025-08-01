import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import passport from 'passport'

import { errorHandler, notFound } from './middleware/errorHandler'
import { initializeDatabase, closeDatabase } from './config/database'
import { initializeFirebaseAdmin } from './services/firebaseAdmin'
import { logger } from './utils/logger'
import './config/passport' // Initialize passport strategies

// Routes
import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import gameRoutes from './routes/games'
import leaderboardRoutes from './routes/leaderboards'

// Socket events
import { setupPartyEvents } from './sockets/partyEvents'
import { setupCompetitionEvents } from './sockets/competitionEvents'

const app: Application = express()
const httpServer = createServer(app)

// Socket.io setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
})

const PORT = process.env.PORT || 3001

// Trust proxy for rate limiting
app.set('trust proxy', 1)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
})

// Basic middleware setup
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}))

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(compression())
app.use(limiter)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Session configuration for OAuth  
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Passport middleware
app.use(passport.initialize() as any)
app.use(passport.session() as any)

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/games', gameRoutes)
app.use('/api/leaderboards', leaderboardRoutes)

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`)

  // Setup socket event handlers
  setupPartyEvents(io, socket)
  setupCompetitionEvents(io, socket)

  // Handle client disconnect
  socket.on('disconnect', (reason) => {
    logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`)
  })

  // Handle errors
  socket.on('error', (error) => {
    logger.error(`Socket error for ${socket.id}:`, error)
  })
})

// Error handling middleware (must be last)
app.use(notFound)
app.use(errorHandler)

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await initializeDatabase()
    logger.info('Database initialized successfully')

    // Initialize Firebase Admin SDK
    initializeFirebaseAdmin()
    logger.info('Firebase Admin SDK initialized successfully')

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`)
      logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`📡 WebSocket server ready`)
      logger.info(`🔐 OAuth providers: Google, Steam`)
      logger.info(`🔥 Firebase Admin SDK ready`)
      logger.info(`🎯 AIM TRAINER API Server is ready!`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}, shutting down gracefully...`)
  
  httpServer.close(async () => {
    logger.info('HTTP server closed')
    
    try {
      await closeDatabase()
      logger.info('Database connection closed')
    } catch (error) {
      logger.error('Error closing database:', error)
    }
    
    process.exit(0)
  })
}

// Handle process termination
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start the server
startServer()

export default app 