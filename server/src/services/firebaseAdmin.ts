import * as admin from 'firebase-admin'
import { logger } from '../utils/logger'

// Initialize Firebase Admin SDK
export const initializeFirebaseAdmin = () => {
  try {
    // For production, you would use a service account key file
    // For development, we'll use the project config
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'aimtraining-98ec3',
        // In production, add your service account credentials here
        // credential: admin.credential.cert(serviceAccount),
      })
      logger.info('Firebase Admin SDK initialized successfully')
    }
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error)
    throw error
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