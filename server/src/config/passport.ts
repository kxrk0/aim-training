import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as SteamStrategy } from 'passport-steam'
import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

const prisma = new PrismaClient()

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id)
})

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        level: true,
        avatar: true,
        provider: true
      }
    })
    done(null, user || undefined)
  } catch (error) {
    done(error, undefined)
  }
})

// Google OAuth Strategy - only if credentials are provided
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

if (googleClientId && googleClientSecret) {
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    logger.info(`Google OAuth attempt for: ${profile.emails?.[0]?.value}`)

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { providerId: profile.id, provider: 'google' },
          { email: profile.emails?.[0]?.value }
        ]
      }
    })

    if (user) {
      // Update existing user with Google info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          provider: 'google',
          providerId: profile.id,
          avatar: profile.photos?.[0]?.value,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: profile.emails?.[0]?.value || `google_${profile.id}@aimtrainer.pro`,
          username: profile.displayName || `GoogleUser${profile.id.slice(-6)}`,
          provider: 'google',
          providerId: profile.id,
          avatar: profile.photos?.[0]?.value,
          level: 1,
          totalScore: 0,
          totalShots: 0,
          totalHits: 0,
          hoursPlayed: 0
        }
      })
    }

    logger.info(`Google OAuth successful for user: ${user.username}`)
    return done(null, user)
  } catch (error) {
    logger.error('Google OAuth error:', error)
    return done(error, undefined)
  }
  }))
} else {
  logger.warn('Google OAuth credentials not found, skipping Google strategy')
}

// Steam OAuth Strategy
passport.use(new SteamStrategy({
  returnURL: process.env.STEAM_RETURN_URL || 'http://localhost:3001/api/auth/steam/return',
  realm: process.env.STEAM_REALM || 'http://localhost:3001',
  apiKey: process.env.STEAM_API_KEY || ''
}, async (identifier, profile, done) => {
  try {
    const steamId = identifier.split('/').pop()
    logger.info(`Steam OAuth attempt for Steam ID: ${steamId}`)

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        providerId: steamId,
        provider: 'steam'
      }
    })

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          avatar: profile.photos?.[2]?.value, // Full size avatar
          updatedAt: new Date()
        }
      })
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: `steam_${steamId}@aimtrainer.pro`,
          username: profile.displayName || `SteamUser${steamId?.slice(-6)}`,
          provider: 'steam',
          providerId: steamId || '',
          avatar: profile.photos?.[2]?.value,
          level: 1,
          totalScore: 0,
          totalShots: 0,
          totalHits: 0,
          hoursPlayed: 0
        }
      })
    }

    logger.info(`Steam OAuth successful for user: ${user.username}`)
    return done(null, user)
  } catch (error) {
    logger.error('Steam OAuth error:', error)
    return done(error, undefined)
  }
}))

export default passport 