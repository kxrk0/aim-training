import { Request, Response, NextFunction } from 'express'
import { firebaseAdminService } from '../services/firebaseAdmin'
import { logger } from '../utils/logger'

export interface FirebaseAuthRequest extends Request {
  firebaseUser?: {
    uid: string
    email?: string
    email_verified?: boolean
    name?: string
    picture?: string
  }
}

/**
 * Middleware to verify Firebase ID token
 */
export const verifyFirebaseToken = async (
  req: FirebaseAuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No Firebase token provided'
        }
      })
    }

    const idToken = authHeader.split('Bearer ')[1]

    try {
      const decodedToken = await firebaseAdminService.verifyIdToken(idToken)
      
      req.firebaseUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture
      }

      next()
    } catch (error) {
      logger.error('Firebase token verification failed:', error)
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid Firebase token'
        }
      })
    }
  } catch (error) {
    logger.error('Firebase auth middleware error:', error)
    return res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during authentication'
      }
    })
  }
}

/**
 * Optional Firebase auth middleware - doesn't fail if no token provided
 */
export const optionalFirebaseAuth = async (
  req: FirebaseAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next() // Continue without Firebase user
  }

  const idToken = authHeader.split('Bearer ')[1]

  try {
    const decodedToken = await firebaseAdminService.verifyIdToken(idToken)
    
    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture
    }
  } catch (error) {
    logger.warn('Optional Firebase auth failed:', error)
    // Continue without Firebase user
  }

  next()
} 

/**
 * Socket.io middleware for Firebase authentication - AUTHENTICATED USERS ONLY
 */
export const socketFirebaseAuth = async (socket: any, next: any) => {
  try {
    console.log('🔐 Socket auth middleware started for socket:', socket.id)
    
    const token = socket.handshake.auth?.token
    console.log('🔍 Auth token present:', !!token)
    
    if (!token) {
      console.log('⚠️ No Firebase token provided - setting up guest user')
      
      // Guest user setup
      socket.data.userId = `guest_${socket.id}` 
      socket.data.username = `Guest_${socket.id.substring(0, 6)}`
      socket.data.email = null
      socket.data.picture = null
      socket.data.isGuest = true
      
      console.log('✅ Guest user setup completed:', {
        userId: socket.data.userId,
        username: socket.data.username,
        isGuest: true
      })
      
      return next()
    }

    try {
      console.log('🔐 Attempting Firebase token verification...')
      
      // Check if Firebase admin is initialized
      if (!firebaseAdminService) {
        console.error('❌ Firebase admin service not available')
        return next(new Error('Firebase authentication service unavailable'))
      }
      
      const decodedToken = await firebaseAdminService.verifyIdToken(token)
      console.log('✅ Firebase token verified successfully')
      console.log('👤 Firebase user data:', {
        uid: decodedToken.uid,
        name: decodedToken.name,
        email: decodedToken.email,
        picture: decodedToken.picture
      })
      
      // Use the best available name (Google name preferred)
      let displayName = 'Unknown User'
      if (decodedToken.name) {
        displayName = decodedToken.name
      } else if (decodedToken.email) {
        displayName = decodedToken.email.split('@')[0]
      }
      
      socket.data.userId = decodedToken.uid
      socket.data.username = displayName
      socket.data.email = decodedToken.email
      socket.data.picture = decodedToken.picture
      socket.data.isGuest = false
      
      console.log('✅ Authenticated user setup completed:', {
        userId: socket.data.userId,
        username: socket.data.username,
        email: socket.data.email,
        isGuest: socket.data.isGuest
      })
      logger.info(`Authenticated user connected: ${socket.data.username} (${socket.data.userId})`)
      next()
    } catch (firebaseError: any) {
      console.error('❌ Firebase token verification failed:', firebaseError.message || firebaseError)
      return next(new Error('Invalid Firebase token. Please sign in again.'))
    }
  } catch (error: any) {
    console.error('❌ Socket Firebase auth middleware error:', error)
    logger.error('Socket Firebase auth middleware error:', error)
    return next(new Error('Authentication error. Please try again.'))
  }
} 