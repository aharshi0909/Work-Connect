import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './firebaseConfig'
import { Stack, useRouter, useSegments } from 'expo-router'
import { ThemeProvider, useTheme } from './ThemeContext' 

function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, loading }
}


function LoadingScreen() {
  const { theme, actualTheme } = useTheme()

  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={actualTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
        translucent
      />
      <View style={[styles.loadingIconContainer, { backgroundColor: theme.accentA }]}>
        <View style={styles.loadingIcon}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </View>
    </View>
  )
}


function NavigationStack() {
  const { user, loading } = useAuth()
  const { theme, actualTheme } = useTheme()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (loading) {
      return
    }

    const inAppRoutes = [
      'dashboard', 
      'createGig', 
      'editName', 
      'index', 
      'search', 
      'viewGig', 
      'chats', 
      'settings',
    ]
    const inApp = typeof segments[0] === 'string' && inAppRoutes.includes(segments[0])

    if (user && !inApp) {
      router.replace('/dashboard')
    } else if (!user && inApp) {
      router.replace('/signin')
    }
  }, [user, loading, segments, router])

  useEffect(() => {
    
    StatusBar.setBarStyle(actualTheme === 'dark' ? 'light-content' : 'dark-content')
  }, [actualTheme])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={actualTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg }, 
          animation: 'slide_from_right', 
        }} 
      >
        {}
        <Stack.Screen 
          name="signin" 
          options={{ 
            animation: 'fade',
            contentStyle: { backgroundColor: theme.bg }
          }} 
        />
        <Stack.Screen 
          name="signup" 
          options={{ 
            animation: 'slide_from_bottom',
            contentStyle: { backgroundColor: theme.bg }
          }} 
        />
        
        {}
        <Stack.Screen 
          name="dashboard" 
          options={{ 
            animation: 'fade',
            contentStyle: { backgroundColor: theme.bg }
          }} 
        />
        <Stack.Screen 
          name="chats" 
          options={{ 
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: theme.bg }
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: theme.bg }
          }} 
        />
        <Stack.Screen 
          name="createGig" 
          options={{ 
            animation: 'slide_from_bottom',
            contentStyle: { backgroundColor: theme.bg }
          }} 
        />
        <Stack.Screen 
          name="editName" 
          options={{ 
            animation: 'slide_from_bottom',
            contentStyle: { backgroundColor: theme.bg }
          }} 
        />
        <Stack.Screen 
          name="search" 
          options={{ 
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: theme.bg }
          }} 
        />
        <Stack.Screen 
          name="viewGig" 
          options={{ 
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: theme.bg }
          }} 
        />
        <Stack.Screen 
          name="index" 
          options={{ 
            animation: 'fade',
            contentStyle: { backgroundColor: theme.bg }
          }} 
        />
      </Stack>
    </View>
  )
}


export default function RootLayout() {
  return (
    <ThemeProvider>
      <NavigationStack />
    </ThemeProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  loadingIcon: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
