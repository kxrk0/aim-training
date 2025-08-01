import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { firebaseAuth } from '../services/firebase'

export const useFirebaseAuth = () => {
  const { syncFirebaseUser } = useAuthStore()

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = firebaseAuth.onAuthStateChange((firebaseUser) => {
      // Sync Firebase user with the store
      syncFirebaseUser(firebaseUser)
    })

    // Cleanup listener on unmount
    return () => unsubscribe()
  }, [syncFirebaseUser])
}

export default useFirebaseAuth 