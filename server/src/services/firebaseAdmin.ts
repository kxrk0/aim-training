import * as admin from 'firebase-admin'
import { logger } from '../utils/logger'

// Initialize Firebase Admin SDK
export function initializeFirebaseAdmin() {
  try {
    console.log('🔥 Initializing Firebase Admin SDK...')
    
    // Check for required environment variables
    const requiredEnvVars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL']
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      console.warn('⚠️  Missing Firebase environment variables:', missingVars)
      console.warn('⚠️  Firebase features will be disabled, using guest mode only')
      return
    }

    // Only initialize if not already initialized
    if (admin.apps.length === 0) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      
      if (!privateKey) {
        throw new Error('FIREBASE_PRIVATE_KEY is required')
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        }),
        projectId: process.env.FIREBASE_PROJECT_ID
      })
      
      console.log('✅ Firebase Admin SDK initialized successfully')
    } else {
      console.log('✅ Firebase Admin SDK already initialized')
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error)
    console.warn('⚠️  Continuing without Firebase authentication, guest mode only')
    // Don't throw the error, just log it and continue
  }
}

export class FirebaseAdminService {
  private auth: admin.auth.Auth | null = null

  constructor() {
    // Initialize lazily
  }

  private getAuth(): admin.auth.Auth {
    if (!this.auth) {
      this.auth = admin.auth()
    }
    return this.auth
  }

  /**
   * Verify Firebase ID token
   */
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await this.getAuth().verifyIdToken(idToken)
      return decodedToken
    } catch (error) {
      logger.error('Firebase token verification failed:', error)
      throw new Error('Invalid Firebase ID token')
    }
  }

  /**
   * Get Firebase user by UID
   */
  async getUser(uid: string): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await this.getAuth().getUser(uid)
      return userRecord
    } catch (error) {
      logger.error('Failed to get Firebase user:', error)
      throw new Error('Firebase user not found')
    }
  }

  /**
   * Create Firebase user
   */
  async createUser(userData: {
    email: string
    password?: string
    displayName?: string
    photoURL?: string
  }): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await this.getAuth().createUser(userData)
      logger.info(`Firebase user created: ${userRecord.uid}`)
      return userRecord
    } catch (error) {
      logger.error('Failed to create Firebase user:', error)
      throw error
    }
  }

  /**
   * Update Firebase user
   */
  async updateUser(uid: string, userData: {
    email?: string
    displayName?: string
    photoURL?: string
    disabled?: boolean
  }): Promise<admin.auth.UserRecord> {
    try {
      const userRecord = await this.getAuth().updateUser(uid, userData)
      logger.info(`Firebase user updated: ${uid}`)
      return userRecord
    } catch (error) {
      logger.error('Failed to update Firebase user:', error)
      throw error
    }
  }

  /**
   * Delete Firebase user
   */
  async deleteUser(uid: string): Promise<void> {
    try {
      await this.getAuth().deleteUser(uid)
      logger.info(`Firebase user deleted: ${uid}`)
    } catch (error) {
      logger.error('Failed to delete Firebase user:', error)
      throw error
    }
  }

  /**
   * Generate custom token for a user
   */
  async createCustomToken(uid: string, additionalClaims?: object): Promise<string> {
    try {
      const customToken = await this.getAuth().createCustomToken(uid, additionalClaims)
      return customToken
    } catch (error) {
      logger.error('Failed to create custom token:', error)
      throw error
    }
  }
}

export const firebaseAdminService = new FirebaseAdminService() 