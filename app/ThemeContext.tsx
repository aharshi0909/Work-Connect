import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const lightPalette = {
  accentA: '#4c51bf',
  accentB: '#6366f1',
  accentC: '#10b981',
  accentD: '#f59e0b',
  accentE: '#ef4444',
  surface: '#ffffff',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1f2937',
  textSub: '#6b7280',
  navBg: '#ffffff',
  navBorder: '#e5e7eb',
  shadow: 'rgba(0, 0, 0, 0.1)',
  tip: '#fef3c7',
} as const

const darkPalette = {
  accentA: '#6366f1',
  accentB: '#8b5cf6',
  accentC: '#10b981',
  accentD: '#f59e0b',
  accentE: '#ef4444',
  surface: '#1f2937',
  background: '#111827',
  card: '#374151',
  text: '#ffffff',
  textSub: '#9ca3af',
  navBg: '#1f2937',
  navBorder: '#374151',
  shadow: 'rgba(0, 0, 0, 0.4)',
  tip: '#374151',
} as const

export interface ThemeColors {
  bg: string
  surface: string
  cardBg: string
  text: string
  textSub: string
  gradient: readonly [string, string]
  accentA: string
  accentB: string
  accentC: string
  accentD: string
  accentE: string
  navBg: string
  navBorder: string
  shadow: string
  tip: string
}

const getTheme = (scheme: 'light' | 'dark', override?: 'light' | 'dark' | null): ThemeColors => {
  const actualScheme = override !== null ? override : scheme
  const palette = actualScheme === 'dark' ? darkPalette : lightPalette
  return {
    bg: palette.background,
    surface: palette.surface,
    cardBg: palette.card,
    text: palette.text,
    textSub: palette.textSub,
    gradient: [palette.accentA, palette.accentB] as const,
    accentA: palette.accentA,
    accentB: palette.accentB,
    accentC: palette.accentC,
    accentD: palette.accentD,
    accentE: palette.accentE,
    navBg: palette.navBg,
    navBorder: palette.navBorder,
    shadow: palette.shadow,
    tip: palette.tip,
  }
}

interface ThemeContextType {
  theme: ThemeColors
  currentMode: 'system' | 'light' | 'dark'
  actualTheme: 'light' | 'dark'
  setThemeMode: (mode: 'system' | 'light' | 'dark') => Promise<void>
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemTheme = useColorScheme()
  const [themeOverride, setThemeOverride] = useState<'light' | 'dark' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadThemePreference()
  }, [])

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem('theme_override')
      if (saved === 'light' || saved === 'dark') {
        setThemeOverride(saved)
      }
    } catch (error) {
      console.error('Error loading theme preference:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setThemeMode = async (mode: 'system' | 'light' | 'dark') => {
    try {
      if (mode === 'system') {
        await AsyncStorage.removeItem('theme_override')
        setThemeOverride(null)
      } else {
        await AsyncStorage.setItem('theme_override', mode)
        setThemeOverride(mode)
      }
    } catch (error) {
      console.error('Error saving theme preference:', error)
    }
  }

  const currentMode: 'system' | 'light' | 'dark' = themeOverride || 'system'
  const actualTheme: 'light' | 'dark' = themeOverride || systemTheme || 'light'
  const theme = getTheme(systemTheme === 'dark' ? 'dark' : 'light', themeOverride)

  const contextValue: ThemeContextType = {
    theme,
    currentMode,
    actualTheme,
    setThemeMode,
    isLoading,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}


export { lightPalette, darkPalette, getTheme }
