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