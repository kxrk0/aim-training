// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithPopup, 
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

  // Google OAuth
  async loginWithGoogle(): Promise<FirebaseUser> {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
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