import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth'
import { auth, db } from './firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'

export type Role = 'Buyer' | 'Seller'

interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  name?: string
}

interface AuthState {
  user: UserData | null
  role: Role
  name: string
  loading: boolean
  setRole: (r: Role) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const STORAGE_KEYS = {
  USER: 'workconnect_user',
  ROLE: 'workconnect_role',
} as const

export const usePersistedAuth = (): AuthState => {
  const [user, setUser] = useState<UserData | null>(null)
  const [role, setRoleState] = useState<Role>('Buyer')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)

  
  const persistUser = useCallback(async (userData: UserData | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData))
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER)
      }
    } catch (error) {
      console.error('Error persisting user data:', error)
    }
  }, [])

  const persistRole = useCallback(async (newRole: Role) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ROLE, newRole)
    } catch (error) {
      console.error('Error persisting role:', error)
    }
  }, [])

  const clearStoredData = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.ROLE])
    } catch (error) {
      console.error('Error clearing stored data:', error)
    }
  }, [])

  
  const loadCachedData = useCallback(async () => {
    try {
      const [cachedUser, cachedRole] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.ROLE),
      ])

      if (cachedUser) {
        const userData = JSON.parse(cachedUser) as UserData
        setUser(userData)
        if (userData.name) {
          setName(userData.name)
        }
      }

      if (cachedRole) {
        setRoleState(cachedRole as Role)
      }
    } catch (error) {
      console.error('Error loading cached data:', error)
    }
  }, [])

  
  const fetchUserData = useCallback(async (firebaseUser: User): Promise<UserData> => {
    try {
      const userDoc = doc(db, 'users', firebaseUser.uid)
      const userSnap = await getDoc(userDoc)
      const firestoreData = userSnap.exists() ? userSnap.data() : {}

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        name: firestoreData.name || '',
      }
    } catch (error) {
      console.error('Error fetching user data from Firestore:', error)
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        name: '',
      }
    }
  }, [])

  
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      
      await loadCachedData()

      
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMounted) return

        try {
          if (firebaseUser) {
            
            const userData = await fetchUserData(firebaseUser)
            
            if (isMounted) {
              setUser(userData)
              if (userData.name) {
                setName(userData.name)
              }
              await persistUser(userData)
            }
          } else {
            
            if (isMounted) {
              setUser(null)
              setName('')
              setRoleState('Buyer')
              await clearStoredData()
            }
          }
        } catch (error) {
          console.error('Auth state change error:', error)
        } finally {
          if (isMounted) {
            setLoading(false)
          }
        }
      })

      return unsubscribe
    }

    let unsubscribeAuth: (() => void) | undefined

    initializeAuth().then((unsub) => {
      unsubscribeAuth = unsub
    })

    return () => {
      isMounted = false
      if (unsubscribeAuth) {
        unsubscribeAuth()
      }
    }
  }, [loadCachedData, fetchUserData, persistUser, clearStoredData])

  
  const updateRole = useCallback(async (newRole: Role) => {
    try {
      setRoleState(newRole)
      await persistRole(newRole)
    } catch (error) {
      console.error('Error updating role:', error)
      throw error
    }
  }, [persistRole])

  
  const logout = useCallback(async () => {
    try {
      await signOut(auth)
      
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }, [])

  return {
    user,
    role,
    name,
    loading,
    setRole: updateRole,
    logout,
    isAuthenticated: !!user,
  }
}
