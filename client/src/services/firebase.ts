// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKs5KATg5ECrC26gRBdO9MwNsOeTO69ns",
  authDomain: "aimtraining-98ec3.firebaseapp.com",
  databaseURL: "https://aimtraining-98ec3-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "aimtraining-98ec3",
  storageBucket: "aimtraining-98ec3.firebasestorage.app",
  messagingSenderId: "825161308063",
  appId: "1:825161308063:web:1093435e796f7141ff4faa",
  measurementId: "G-LS3SNTC5JS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Firebase Auth Service
export class FirebaseAuthService {
  // Email/Password Authentication
  async registerWithEmail(email: string, password: string): Promise<FirebaseUser> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  async loginWithEmail(email: string, password: string): Promise<FirebaseUser> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  // Google OAuth - Electron VPS redirect
  async loginWithGoogle(): Promise<FirebaseUser> {
    // Detect if running in Electron
    const isElectron = window.location.protocol === 'file:' || 
                     window.location.origin === 'file://' || 
                     window.location.hostname === '' || 
                     (typeof window !== 'undefined' && (window as any).electronAPI);
    
    if (isElectron) {
      console.log('🖥️ Electron detected - using VPS auth endpoint');
      
      // Use VPS auth endpoint for Google OAuth
      const authUrl = 'https://aim.liorabelleleather.com/api/auth/google?electron=true';
      
      // Open in system browser
      if (window.electronAPI?.openExternal) {
        window.electronAPI.openExternal(authUrl);
      } else {
        window.open(authUrl, '_blank');
      }
      
      // Show message to user
      alert('🔐 Google authentication opened in your browser.\nComplete the login and return to this app.');
      
      // Return pending (app will check auth state)
      throw new Error('AUTH_VPS_REDIRECT'); 
    } else {
      console.log('🌐 Web environment - using popup flow for Google auth');
      // For web, use popup flow
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    }
  }

  // Handle redirect result (for Electron)
  async handleRedirectResult(): Promise<FirebaseUser | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        console.log('✅ Google redirect authentication successful');
        return result.user;
      }
      return null;
    } catch (error) {
      console.error('❌ Redirect result error:', error);
      throw error;
    }
  }

  // Sign out
  async logout(): Promise<void> {
    await signOut(auth);
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get ID token for backend authentication
  async getIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }
}

// Export initialized services
export const firebaseAuth = new FirebaseAuthService();
export { auth, db, storage, analytics };
export default app; 