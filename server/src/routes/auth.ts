import { Router, Request, Response } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import { register, login, getProfile, updateProfile, verifyToken } from '../controllers/authController'
import { asyncHandler } from '../middleware/errorHandler'
import { logger } from '../utils/logger'

const router = Router()

// Traditional auth routes
router.post('/register', asyncHandler(register))
router.post('/login', asyncHandler(login))

// Protected routes
router.get('/profile', verifyToken, asyncHandler(getProfile))
router.put('/profile', verifyToken, asyncHandler(updateProfile))

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const user = req.user as any
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key'
      )

      logger.info(`Google OAuth callback successful for: ${user.username}`)

      // Redirect to frontend with token
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
      res.redirect(`${clientUrl}/auth/callback?token=${token}&provider=google`)
    } catch (error) {
      logger.error('Google OAuth callback error:', error)
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
      res.redirect(`${clientUrl}/auth/error?message=oauth_failed`)
    }
  })
)

// Steam OAuth routes
router.get('/steam',
  passport.authenticate('steam')
)

router.get('/steam/return',
  passport.authenticate('steam', { session: false }),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const user = req.user as any
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key'
      )

      logger.info(`Steam OAuth callback successful for: ${user.username}`)

      // Redirect to frontend with token
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
      res.redirect(`${clientUrl}/auth/callback?token=${token}&provider=steam`)
    } catch (error) {
      logger.error('Steam OAuth callback error:', error)
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'
      res.redirect(`${clientUrl}/auth/error?message=oauth_failed`)
    }
  })
)

// OAuth success endpoint for frontend
router.get('/oauth/success', verifyToken, asyncHandler(async (req: Request, res: Response) => {
  const user = req.user
  res.json({
    message: 'OAuth authentication successful',
    data: {
      user,
      authenticated: true
    }
  })
}))

export default router 